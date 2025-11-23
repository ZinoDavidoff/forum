import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reaction, ReactionType, TargetType } from "./reaction.entity";
import { Post } from "../posts/post.entity";
import { Thread } from "../threads/thread.entity";

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>
  ) {}

  async addReaction(
    userId: string,
    targetId: string,
    type: ReactionType,
    targetType: TargetType = TargetType.POST
  ) {
    const whereClause =
      targetType === TargetType.POST
        ? { user: { id: userId }, post: { id: targetId }, targetType }
        : { user: { id: userId }, thread: { id: targetId }, targetType };

    const existing = await this.reactionsRepository.findOne({
      where: whereClause,
    });

    // Get the target (post or thread)
    const target =
      targetType === TargetType.POST
        ? await this.postsRepository.findOne({ where: { id: targetId } })
        : await this.threadsRepository.findOne({ where: { id: targetId } });

    if (!target) {
      throw new NotFoundException(
        `${targetType === TargetType.POST ? "Post" : "Thread"} not found`
      );
    }

    if (existing) {
      // If same reaction type, remove it (toggle behavior)
      if (existing.type === type) {
        return this.removeReaction(userId, targetId, targetType);
      }

      // If changing vote type, update counts
      if (
        existing.type === ReactionType.UPVOTE &&
        type === ReactionType.DOWNVOTE
      ) {
        target.upvoteCount = Math.max(0, target.upvoteCount - 1);
        target.downvoteCount++;
      } else if (
        existing.type === ReactionType.DOWNVOTE &&
        type === ReactionType.UPVOTE
      ) {
        target.downvoteCount = Math.max(0, target.downvoteCount - 1);
        target.upvoteCount++;
      }
      existing.type = type;

      if (targetType === TargetType.POST) {
        await this.postsRepository.save(target as Post);
      } else {
        await this.threadsRepository.save(target as Thread);
      }

      return await this.reactionsRepository.save(existing);
    }

    // New reaction
    const reactionData: any = {
      user: { id: userId },
      type,
      targetType,
    };

    if (targetType === TargetType.POST) {
      reactionData.post = { id: targetId };
    } else {
      reactionData.thread = { id: targetId };
    }

    const reaction = this.reactionsRepository.create(reactionData);

    // Update vote counts
    if (type === ReactionType.UPVOTE) {
      target.upvoteCount++;
    } else if (type === ReactionType.DOWNVOTE) {
      target.downvoteCount++;
    }

    if (targetType === TargetType.POST) {
      await this.postsRepository.save(target as Post);
    } else {
      await this.threadsRepository.save(target as Thread);
    }

    return await this.reactionsRepository.save(reaction);
  }

  async removeReaction(
    userId: string,
    targetId: string,
    targetType: TargetType = TargetType.POST
  ) {
    const whereClause =
      targetType === TargetType.POST
        ? { user: { id: userId }, post: { id: targetId }, targetType }
        : { user: { id: userId }, thread: { id: targetId }, targetType };

    const reaction = await this.reactionsRepository.findOne({
      where: whereClause,
    });

    if (reaction) {
      const target =
        targetType === TargetType.POST
          ? await this.postsRepository.findOne({ where: { id: targetId } })
          : await this.threadsRepository.findOne({ where: { id: targetId } });

      if (target) {
        // Update vote counts
        if (reaction.type === ReactionType.UPVOTE) {
          target.upvoteCount = Math.max(0, target.upvoteCount - 1);
        } else if (reaction.type === ReactionType.DOWNVOTE) {
          target.downvoteCount = Math.max(0, target.downvoteCount - 1);
        }

        if (targetType === TargetType.POST) {
          await this.postsRepository.save(target as Post);
        } else {
          await this.threadsRepository.save(target as Thread);
        }
      }

      await this.reactionsRepository.remove(reaction);
    }

    return { message: "Reaction removed" };
  }

  async getUserReaction(
    userId: string,
    targetId: string,
    targetType: TargetType = TargetType.POST
  ) {
    const whereClause =
      targetType === TargetType.POST
        ? { user: { id: userId }, post: { id: targetId }, targetType }
        : { user: { id: userId }, thread: { id: targetId }, targetType };

    const reaction = await this.reactionsRepository.findOne({
      where: whereClause,
    });

    return reaction ? { type: reaction.type } : null;
  }

  async getPostReactions(postId: string) {
    return await this.reactionsRepository.find({
      where: { post: { id: postId }, targetType: TargetType.POST },
      relations: ["user"],
    });
  }

  async getThreadReactions(threadId: string) {
    return await this.reactionsRepository.find({
      where: { thread: { id: threadId }, targetType: TargetType.THREAD },
      relations: ["user"],
    });
  }
}
