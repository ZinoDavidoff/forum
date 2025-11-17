import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Thread } from "./thread.entity";
import { Post } from "../posts/post.entity";
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
    private usersService: UsersService,
    private categoriesService: CategoriesService
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    search?: string
  ) {
    const where: any = {};

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [threads, total] = await this.threadsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { isPinned: "DESC", updatedAt: "DESC" },
      relations: ["author", "category", "lastPost"],
    });

    // Recalculate reply counts for each thread to include nested comments
    const threadsWithCorrectCounts = await Promise.all(
      threads.map(async (thread) => {
        const posts = await this.postsRepository.count({
          where: { thread: { id: thread.id }, isDeleted: false },
        });
        thread.replyCount = posts;
        return thread;
      })
    );

    return {
      data: threadsWithCorrectCounts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const thread = await this.threadsRepository.findOne({
      where: { id },
      relations: ["author", "category", "posts", "posts.author"],
    });

    if (!thread) {
      throw new NotFoundException("Thread not found");
    }

    // Increment view count
    await this.threadsRepository.increment({ id }, "viewCount", 1);

    return thread;
  }

  async create(createThreadDto: CreateThreadDto, userId: string) {
    const thread = this.threadsRepository.create({
      ...createThreadDto,
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

    await this.threadsRepository.remove(thread);
    return { message: "Thread deleted successfully" };
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
