import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TreeRepository } from "typeorm";
import { Post } from "./post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ThreadsService } from "../threads/threads.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: TreeRepository<Post>,
    private threadsService: ThreadsService,
    private usersService: UsersService
  ) {}

  async findByThread(threadId: string, page: number = 1, limit: number = 20) {
    // Get only root posts (posts with no parent) for this thread
    const [rootPosts, total] = await this.postsRepository.findAndCount({
      where: {
        thread: { id: threadId },
        parentPost: null,
        isDeleted: false,
      },
      order: { createdAt: "ASC" },
      relations: ["author", "reactions"],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add reply count to each post (count all descendants recursively)
    const postsWithReplyCount = await Promise.all(
      rootPosts.map(async (post) => {
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
    const post = this.postsRepository.create({
      ...createPostDto,
      author: { id: userId } as any,
      thread: { id: createPostDto.threadId } as any,
      parentPost: createPostDto.parentPostId
        ? ({ id: createPostDto.parentPostId } as any)
        : null,
    });

    const savedPost = await this.postsRepository.save(post);

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

    post.isDeleted = true;
    await this.postsRepository.save(post);

    return { message: "Post deleted successfully" };
  }
}
