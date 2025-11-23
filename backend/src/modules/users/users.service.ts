import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Thread } from "../threads/thread.entity";
import { Category } from "../categories/category.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>
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
    const [totalMembers, totalThreads, totalTopics] = await Promise.all([
      this.usersRepository.count(),
      this.threadsRepository.count(),
      this.categoriesRepository.count(),
    ]);
    return { totalMembers, totalThreads, totalTopics };
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

  async addBookmark(userId: string, threadId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["bookmarks"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const thread = await this.threadsRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException("Thread not found");
    }

    // Check if already bookmarked
    const isBookmarked = user.bookmarks.some((b) => b.id === threadId);
    if (!isBookmarked) {
      user.bookmarks.push(thread);
      await this.usersRepository.save(user);
    }

    return { message: "Bookmark added", isBookmarked: true };
  }

  async removeBookmark(userId: string, threadId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["bookmarks"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.bookmarks = user.bookmarks.filter((b) => b.id !== threadId);
    await this.usersRepository.save(user);

    return { message: "Bookmark removed", isBookmarked: false };
  }

  async getBookmarks(userId: string, page: number = 1, limit: number = 20) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["bookmarks", "bookmarks.author", "bookmarks.category"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const total = user.bookmarks.length;
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const bookmarks = user.bookmarks.slice(startIdx, endIdx);

    return {
      data: bookmarks,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async isBookmarked(userId: string, threadId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["bookmarks"],
    });

    if (!user) {
      return { isBookmarked: false };
    }

    const isBookmarked = user.bookmarks.some((b) => b.id === threadId);
    return { isBookmarked };
  }
}
