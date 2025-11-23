import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TreeRepository, Repository, In } from "typeorm";
import { Post } from "./post.entity";
import { Reaction } from "../reactions/reaction.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ThreadsService } from "../threads/threads.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: TreeRepository<Post>,
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    private threadsService: ThreadsService,
    private usersService: UsersService
  ) {}

  async findByThread(
    threadId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = "best"
  ) {
    // Determine sorting order based on sort parameter
    let order: any = {};

    switch (sort) {
      case "new":
        order.createdAt = "DESC";
        break;
      case "top":
        // Sort by upvotes (highest first)
        order.upvoteCount = "DESC";
        order.createdAt = "ASC"; // Secondary sort
        break;
      case "best":
      default:
        // Best: Balance of upvotes and downvotes (net score)
        // We'll sort by upvotes minus downvotes, then by creation date
        order.upvoteCount = "DESC";
        order.downvoteCount = "ASC";
        order.createdAt = "ASC";
        break;
    }

    // Get all posts for this thread first
    const allPosts = await this.postsRepository.find({
      where: {
        thread: { id: threadId },
        isDeleted: false,
      },
      relations: ["author", "reactions"],
    });

    // Filter to get only root posts (using TypeORM's tree methods)
    const rootPosts = [];
    for (const post of allPosts) {
      // Check if this post has a parent by finding its ancestors
      const ancestors = await this.postsRepository.findAncestors(post);
      // If ancestors only contains the post itself, it's a root post
      if (ancestors.length === 1) {
        rootPosts.push(post);
      }
    }

    // Apply sorting
    rootPosts.sort((a, b) => {
      if (sort === "new") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sort === "top") {
        if (b.upvoteCount !== a.upvoteCount) {
          return b.upvoteCount - a.upvoteCount;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        // best
        if (b.upvoteCount !== a.upvoteCount) {
          return b.upvoteCount - a.upvoteCount;
        }
        if (a.downvoteCount !== b.downvoteCount) {
          return a.downvoteCount - b.downvoteCount;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    });

    // Apply pagination
    const total = rootPosts.length;
    const paginatedRootPosts = rootPosts.slice(
      (page - 1) * limit,
      page * limit
    );

    // Add reply count to each post (count all descendants recursively)
    const postsWithReplyCount = await Promise.all(
      paginatedRootPosts.map(async (post) => {
        const replyCount = await this.countAllReplies(post.id);
        return {
          ...post,
          replyCount,
        };
      })
    );

    return {
      data: postsWithReplyCount,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  private async countAllReplies(postId: string): Promise<number> {
    // Get all direct children
    const directChildren = await this.postsRepository.find({
      where: {
        parentPost: { id: postId },
        isDeleted: false,
      },
      select: ["id"],
    });

    let count = directChildren.length;

    // Recursively count children of children
    for (const child of directChildren) {
      count += await this.countAllReplies(child.id);
    }

    return count;
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ["author", "thread", "replies", "parentPost", "reactions"],
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  async findReplies(postId: string) {
    // Verify the post exists
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // Get all direct replies (children) for this post
    const replies = await this.postsRepository.find({
      where: {
        parentPost: { id: postId },
        isDeleted: false,
      },
      relations: ["author", "reactions"],
      order: { createdAt: "ASC" },
    });

    // Add replyCount to each reply (count all descendants recursively)
    const repliesWithCount = await Promise.all(
      replies.map(async (reply) => {
        const replyCount = await this.countAllReplies(reply.id);
        return {
          ...reply,
          replyCount,
        };
      })
    );

    return {
      data: repliesWithCount,
      total: repliesWithCount.length,
    };
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    // For Tree entities, we need to load the parent post if it exists
    let parentPost = null;
    if (createPostDto.parentPostId) {
      parentPost = await this.postsRepository.findOne({
        where: { id: createPostDto.parentPostId },
      });
    }

    const post = this.postsRepository.create({
      content: createPostDto.content,
      attachments: createPostDto.attachments,
      author: { id: userId } as any,
      thread: { id: createPostDto.threadId } as any,
      parentPost: parentPost,
    });

    const savedPost = await this.postsRepository.save(post);

    // Verify the post was saved correctly by re-querying it
    const verifyPost = await this.postsRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.parentPost", "parentPost")
      .where("post.id = :id", { id: savedPost.id })
      .getOne();

    await this.usersService.incrementPostCount(userId);
    await this.threadsService.incrementReplyCount(createPostDto.threadId);

    return savedPost;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const post = await this.findOne(id);

    if (post.author.id !== userId) {
      throw new NotFoundException("Not authorized");
    }

    Object.assign(post, updatePostDto);
    post.isEdited = true;
    post.editedAt = new Date();

    return await this.postsRepository.save(post);
  }

  async remove(id: string, userId: string) {
    const post = await this.findOne(id);

    if (post.author.id !== userId) {
      throw new NotFoundException("Not authorized");
    }

    // Get all descendants (replies and nested replies) - this includes the post itself
    const descendants = await this.postsRepository.findDescendants(post);

    // Load full descendant data with authors to update user counts
    const descendantIds = descendants.map((d) => d.id);
    const descendantsWithAuthors = await this.postsRepository.find({
      where: { id: In(descendantIds) },
      relations: ["author"],
    });

    // Count posts per user to update their post counts correctly (only non-deleted posts)
    const userPostCounts = new Map<string, number>();
    for (const descendant of descendantsWithAuthors) {
      // Only count if not already deleted
      if (!descendant.isDeleted) {
        const authorId = descendant.author.id;
        userPostCounts.set(authorId, (userPostCounts.get(authorId) || 0) + 1);
      }
    }

    // Delete all reactions for this post and all its descendants
    for (const descendant of descendants) {
      await this.reactionsRepository.delete({ post: { id: descendant.id } });
    }

    // Mark all descendants as deleted (soft delete)
    for (const descendant of descendantsWithAuthors) {
      if (!descendant.isDeleted) {
        descendant.isDeleted = true;
        await this.postsRepository.save(descendant);
      }
    }

    // Update thread reply count and get the new count
    let newReplyCount = 0;
    if (post.thread) {
      newReplyCount = await this.threadsService.recalculateReplyCount(
        post.thread.id
      );
    }

    // Update post counts for all affected users
    for (const [authorId, count] of userPostCounts.entries()) {
      for (let i = 0; i < count; i++) {
        await this.usersService.decrementPostCount(authorId);
      }
    }

    // Calculate total posts deleted
    const totalDeleted =
      userPostCounts.size > 0
        ? Array.from(userPostCounts.values()).reduce(
            (sum, count) => sum + count,
            0
          )
        : 0;

    return {
      message: "Post deleted successfully",
      deletedCount: totalDeleted,
      newReplyCount: newReplyCount,
    };
  }
}
