import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Thread } from "../threads/thread.entity";
import { Post } from "../posts/post.entity";
import { User } from "../users/user.entity";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async searchAll(query: string, page: number = 1, limit: number = 20) {
    const threads = await this.searchThreads(query, page, limit);
    const posts = await this.searchPosts(query, page, limit);
    const users = await this.searchUsers(query, page, limit);

    return {
      threads,
      posts,
      users,
    };
  }

  async searchThreads(query: string, page: number = 1, limit: number = 20) {
    const [threads, total] = await this.threadsRepository.findAndCount({
      where: [{ title: ILike(`%${query}%`) }, { content: ILike(`%${query}%`) }],
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: "DESC" },
      relations: ["author", "category"],
    });

    return {
      data: threads,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchPosts(query: string, page: number = 1, limit: number = 20) {
    const [posts, total] = await this.postsRepository.findAndCount({
      where: { content: ILike(`%${query}%`), isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["author", "thread"],
    });

    return {
      data: posts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const [users, total] = await this.usersRepository.findAndCount({
      where: [
        { username: ILike(`%${query}%`) },
        { fullName: ILike(`%${query}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { reputation: "DESC" },
    });

    users.forEach((user) => delete user.password);

    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
