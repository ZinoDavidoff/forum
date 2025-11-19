import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Thread } from "../threads/thread.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    users.forEach((user) => delete user.password);

    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["badges", "followers", "following"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    delete user.password;
    return user;
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async getCommunityStats() {
    const [totalMembers, totalThreads] = await Promise.all([
      this.usersRepository.count(),
      this.threadsRepository.count(),
    ]);
    return { totalMembers, totalThreads };
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      delete user.password;
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async incrementPostCount(userId: string) {
    await this.usersRepository.increment({ id: userId }, "postCount", 1);
  }

  async incrementThreadCount(userId: string) {
    await this.usersRepository.increment({ id: userId }, "threadCount", 1);
  }

  async updateReputation(userId: string, points: number) {
    await this.usersRepository.increment({ id: userId }, "reputation", points);
  }

  async updateLastSeen(userId: string) {
    await this.usersRepository.update(userId, { lastSeenAt: new Date() });
  }
}
