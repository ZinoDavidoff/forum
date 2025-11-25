import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Thread } from "../threads/thread.entity";
import { Post } from "../posts/post.entity";
import { User } from "../users/user.entity";
import { Category } from "../categories/category.entity";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>
  ) {}

  /**
   * Extract words from query (language-agnostic)
   * Only filters out very short words (1-2 characters) to avoid noise
   */
  private extractSearchWords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2); // Only filter very short words
  }

  /**
   * Build word-based search conditions
   */
  private buildWordSearchConditions(fields: string[], words: string[]) {
    const conditions: any[] = [];
    words.forEach((word) => {
      fields.forEach((field) => {
        conditions.push({ [field]: ILike(`%${word}%`) });
      });
    });
    return conditions;
  }

  async searchAll(query: string, page: number = 1, limit: number = 20) {
    const threads = await this.searchThreads(query, page, limit);
    const categories = await this.searchCategories(query, page, limit);
    const posts = await this.searchPosts(query, page, limit);
    const users = await this.searchUsers(query, page, limit);

    return {
      threads,
      categories,
      posts,
      users,
    };
  }

  async searchThreads(query: string, page: number = 1, limit: number = 20) {
    // First try exact phrase matching
    let [threads, total] = await this.threadsRepository.findAndCount({
      where: [{ title: ILike(`%${query}%`) }, { content: ILike(`%${query}%`) }],
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: "DESC" },
      relations: ["author", "category"],
    });

    // If no results, fall back to word-by-word search
    if (total === 0) {
      const words = this.extractSearchWords(query);
      if (words.length > 0) {
        const wordConditions = this.buildWordSearchConditions(
          ["title", "content"],
          words
        );
        [threads, total] = await this.threadsRepository.findAndCount({
          where: wordConditions,
          skip: (page - 1) * limit,
          take: limit,
          order: { updatedAt: "DESC" },
          relations: ["author", "category"],
        });
      }
    }

    return {
      data: threads,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchPosts(query: string, page: number = 1, limit: number = 20) {
    // First try exact phrase matching
    let [posts, total] = await this.postsRepository.findAndCount({
      where: { content: ILike(`%${query}%`), isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["author", "thread"],
    });

    // If no results, fall back to word-by-word search
    if (total === 0) {
      const words = this.extractSearchWords(query);
      if (words.length > 0) {
        // Build conditions for word-by-word search
        // Each word should match in the content (OR condition)
        const wordConditions = this.buildWordSearchConditions(
          ["content"],
          words
        );
        // Add isDeleted: false to each condition
        const conditionsWithDeleted = wordConditions.map((condition) => ({
          ...condition,
          isDeleted: false,
        }));
        [posts, total] = await this.postsRepository.findAndCount({
          where: conditionsWithDeleted,
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: "DESC" },
          relations: ["author", "thread"],
        });
      }
    }

    return {
      data: posts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchCategories(query: string, page: number = 1, limit: number = 20) {
    // First try exact phrase matching
    let [categories, total] = await this.categoriesRepository.findAndCount({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { description: ILike(`%${query}%`), isActive: true },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { order: "ASC" },
    });

    // If no results, fall back to word-by-word search
    if (total === 0) {
      const words = this.extractSearchWords(query);
      if (words.length > 0) {
        const wordConditions = this.buildWordSearchConditions(
          ["name", "description"],
          words
        ).map((condition) => ({ ...condition, isActive: true }));
        [categories, total] = await this.categoriesRepository.findAndCount({
          where: wordConditions,
          skip: (page - 1) * limit,
          take: limit,
          order: { order: "ASC" },
        });
      }
    }

    return {
      data: categories,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    // First try exact phrase matching
    let [users, total] = await this.usersRepository.findAndCount({
      where: [
        { username: ILike(`%${query}%`) },
        { fullName: ILike(`%${query}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { reputation: "DESC" },
    });

    // If no results, fall back to word-by-word search
    if (total === 0) {
      const words = this.extractSearchWords(query);
      if (words.length > 0) {
        const wordConditions = this.buildWordSearchConditions(
          ["username", "fullName"],
          words
        );
        [users, total] = await this.usersRepository.findAndCount({
          where: wordConditions,
          skip: (page - 1) * limit,
          take: limit,
          order: { reputation: "DESC" },
        });
      }
    }

    users.forEach((user) => delete user.password);

    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
