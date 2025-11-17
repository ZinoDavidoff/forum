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
    // Get all posts for this thread with their relations
    const allPosts = await this.postsRepository.find({
      where: {
        thread: { id: threadId },
        isDeleted: false,
      },
      order: { createdAt: "ASC" },
      relations: ["author", "reactions", "parentPost"],
    });

    // Build tree structure manually
    const postMap = new Map<string, any>();
    const rootPosts: any[] = [];

    // First pass: create map of all posts
    allPosts.forEach((post) => {
      postMap.set(post.id, { ...post, replies: [] });
    });

    // Second pass: build tree structure
    allPosts.forEach((post) => {
      const postWithReplies = postMap.get(post.id);
      if (post.parentPost) {
        const parent = postMap.get(post.parentPost.id);
        if (parent) {
          parent.replies.push(postWithReplies);
        }
      } else {
        rootPosts.push(postWithReplies);
      }
    });

    // Apply pagination to root posts only
    const start = (page - 1) * limit;
    const paginatedRootPosts = rootPosts.slice(start, start + limit);

    return {
      data: paginatedRootPosts,
      total: rootPosts.length,
      page,
      lastPage: Math.ceil(rootPosts.length / limit),
    };
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
