import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, In } from "typeorm";
import { Thread } from "./thread.entity";
import { Post } from "../posts/post.entity";
import { Reaction, TargetType } from "../reactions/reaction.entity";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { UpdateThreadDto } from "./dto/update-thread.dto";
import { UsersService } from "../users/users.service";
import { CategoriesService } from "../categories/categories.service";

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    private usersService: UsersService,
    private categoriesService: CategoriesService
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    search?: string,
    sort: string = "hot",
    userId?: string
  ) {
    const where: any = {};

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    // Determine sorting order based on sort parameter
    let order: any = { isPinned: "DESC" };

    switch (sort) {
      case "new":
        order.createdAt = "DESC";
        break;
      case "top":
        // Sort by upvotes (highest first)
        order.upvoteCount = "DESC";
        order.createdAt = "DESC"; // Secondary sort
        break;
      case "hot":
      default:
        // Hot: Recent activity (updatedAt) + engagement (upvotes + replies)
        order.updatedAt = "DESC";
        order.upvoteCount = "DESC";
        break;
    }

    const [threads, total] = await this.threadsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order,
      relations: ["author", "category", "lastPost"],
    });

    // Get user reactions and bookmarks if userId is provided
    let userReactions = new Map<string, string>();
    let userBookmarks = new Set<string>();

    if (userId) {
      const threadIds = threads.map((t) => t.id);

      // Fetch all user reactions for these threads in one query
      const reactions = await this.reactionsRepository.find({
        where: {
          user: { id: userId },
          thread: { id: In(threadIds) },
          targetType: TargetType.THREAD,
        },
        relations: ["thread"],
      });

      reactions.forEach((reaction) => {
        userReactions.set(reaction.thread.id, reaction.type);
      });

      // Fetch user bookmarks in one query
      const userWithBookmarks = await this.threadsRepository
        .createQueryBuilder("thread")
        .innerJoin("user_bookmarks", "ub", "ub.threadsId = thread.id")
        .where("ub.usersId = :userId", { userId })
        .andWhere("thread.id IN (:...threadIds)", { threadIds })
        .select("thread.id")
        .getMany();

      userWithBookmarks.forEach((thread) => {
        userBookmarks.add(thread.id);
      });
    }

    // Recalculate reply counts for each thread to include nested comments
    const threadsWithCorrectCounts = await Promise.all(
      threads.map(async (thread) => {
        const actualReplyCount = await this.postsRepository.count({
          where: { thread: { id: thread.id }, isDeleted: false },
        });

        // Update the stored count if it differs from actual
        if (thread.replyCount !== actualReplyCount) {
          await this.threadsRepository.update(
            { id: thread.id },
            { replyCount: actualReplyCount }
          );
        }

        thread.replyCount = actualReplyCount;

        // Add user-specific fields
        const threadWithUserData = thread as any;
        if (userId) {
          threadWithUserData.userReaction =
            userReactions.get(thread.id) || null;
          threadWithUserData.isBookmarked = userBookmarks.has(thread.id);
        }

        return threadWithUserData;
      })
    );

    return {
      data: threadsWithCorrectCounts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const thread = await this.threadsRepository.findOne({
      where: { id },
      relations: ["author", "category", "posts", "posts.author"],
    });

    if (!thread) {
      throw new NotFoundException("Thread not found");
    }

    // Recalculate reply count to ensure accuracy (only count non-deleted posts)
    const actualReplyCount = await this.postsRepository.count({
      where: { thread: { id: thread.id }, isDeleted: false },
    });

    // Update the stored count if it differs from actual
    if (thread.replyCount !== actualReplyCount) {
      await this.threadsRepository.update(
        { id },
        { replyCount: actualReplyCount }
      );
    }

    thread.replyCount = actualReplyCount;

    // Add user-specific fields if userId is provided
    const threadWithUserData = thread as any;
    if (userId) {
      // Get user reaction
      const reaction = await this.reactionsRepository.findOne({
        where: {
          user: { id: userId },
          thread: { id },
          targetType: TargetType.THREAD,
        },
      });
      threadWithUserData.userReaction = reaction?.type || null;

      // Check if bookmarked
      const bookmarked = await this.threadsRepository
        .createQueryBuilder("thread")
        .innerJoin("user_bookmarks", "ub", "ub.threadsId = thread.id")
        .where("ub.usersId = :userId", { userId })
        .andWhere("thread.id = :id", { id })
        .getOne();

      threadWithUserData.isBookmarked = !!bookmarked;
    }

    // Increment view count
    await this.threadsRepository.increment({ id }, "viewCount", 1);

    return threadWithUserData;
  }

  async create(createThreadDto: CreateThreadDto, userId: string) {
    // Auto-generate slug if not provided
    const slug =
      createThreadDto.slug || this.generateSlug(createThreadDto.title);

    const thread = this.threadsRepository.create({
      ...createThreadDto,
      slug,
      author: { id: userId } as any,
      category: { id: createThreadDto.categoryId } as any,
    });

    const savedThread = await this.threadsRepository.save(thread);

    await this.usersService.incrementThreadCount(userId);
    await this.categoriesService.incrementThreadCount(
      createThreadDto.categoryId
    );

    return savedThread;
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 100) +
      "-" +
      Date.now()
    );
  }

  async update(id: string, updateThreadDto: UpdateThreadDto, userId: string) {
    const thread = await this.findOne(id);

    if (thread.author.id !== userId) {
      throw new NotFoundException("Not authorized");
    }

    Object.assign(thread, updateThreadDto);
    return await this.threadsRepository.save(thread);
  }

  async remove(id: string, userId: string) {
    const thread = await this.findOne(id);

    if (thread.author.id !== userId) {
      throw new NotFoundException("Not authorized");
    }

    try {
      // Delete all related entities before deleting the thread
      // 1. Find all posts in this thread with their authors
      const posts = await this.postsRepository.find({
        where: { thread: { id } },
        relations: ["author"],
      });

      // 2. Count posts per user to update their post counts correctly (only non-deleted posts)
      const userPostCounts = new Map<string, number>();
      for (const post of posts) {
        // Only count if not already deleted
        if (!post.isDeleted) {
          const authorId = post.author.id;
          userPostCounts.set(authorId, (userPostCounts.get(authorId) || 0) + 1);
        }
      }

      // 3. Delete all reactions for the thread
      await this.reactionsRepository.delete({ thread: { id } });

      // 4. Delete all reactions for each post (even if already soft-deleted)
      for (const post of posts) {
        await this.reactionsRepository.delete({ post: { id: post.id } });
      }

      // 5. Remove thread from all user bookmarks (ManyToMany relationship)
      await this.threadsRepository
        .createQueryBuilder()
        .delete()
        .from("user_bookmarks")
        .where("threadsId = :threadId", { threadId: id })
        .execute();

      // 6. Clear this thread's lastPost reference before deleting posts
      await this.threadsRepository.update({ id }, { lastPost: null });

      // 7. Clear any references to posts as lastPost in OTHER threads
      const postIds = posts.map((p) => p.id);
      if (postIds.length > 0) {
        await this.threadsRepository
          .createQueryBuilder()
          .update()
          .set({ lastPost: null })
          .where("lastPostId IN (:...postIds)", { postIds })
          .execute();
      }

      // 8. Mark all non-deleted posts as deleted (soft delete)
      for (const post of posts) {
        if (!post.isDeleted) {
          post.isDeleted = true;
          await this.postsRepository.save(post);
        }
      }

      // 9. Clear thread reference from all posts before deleting the thread
      if (posts.length > 0) {
        await this.postsRepository
          .createQueryBuilder()
          .update()
          .set({ thread: null })
          .where("threadId = :threadId", { threadId: id })
          .execute();
      }

      // 10. Finally, delete the thread (hard delete)
      await this.threadsRepository.remove(thread);

      // 11. Update user and category counts
      await this.usersService.decrementThreadCount(userId);
      await this.categoriesService.decrementThreadCount(thread.category.id);

      // 12. Update post counts for all affected users
      for (const [authorId, count] of userPostCounts.entries()) {
        for (let i = 0; i < count; i++) {
          await this.usersService.decrementPostCount(authorId);
        }
      }

      return { message: "Thread deleted successfully" };
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  }

  async incrementReplyCount(threadId: string) {
    await this.threadsRepository.increment({ id: threadId }, "replyCount", 1);
  }

  async recalculateReplyCount(threadId: string) {
    // Get all posts for this thread
    const posts = await this.postsRepository.find({
      where: { thread: { id: threadId }, isDeleted: false },
    });

    // Update thread with total count
    await this.threadsRepository.update(
      { id: threadId },
      { replyCount: posts.length }
    );

    return posts.length;
  }
}
