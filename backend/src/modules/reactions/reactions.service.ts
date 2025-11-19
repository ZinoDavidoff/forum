import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reaction, ReactionType } from "./reaction.entity";
import { Post } from "../posts/post.entity";

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  async addReaction(userId: string, postId: string, type: ReactionType) {
    const existing = await this.reactionsRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (existing) {
      // If changing vote type, update counts
      if (
        existing.type === ReactionType.UPVOTE &&
        type === ReactionType.DOWNVOTE
      ) {
        post.upvoteCount = Math.max(0, post.upvoteCount - 1);
        post.downvoteCount++;
      } else if (
        existing.type === ReactionType.DOWNVOTE &&
        type === ReactionType.UPVOTE
      ) {
        post.downvoteCount = Math.max(0, post.downvoteCount - 1);
        post.upvoteCount++;
      }
      existing.type = type;
      await this.postsRepository.save(post);
      return await this.reactionsRepository.save(existing);
    }

    // New reaction
    const reaction = this.reactionsRepository.create({
      user: { id: userId } as any,
      post: { id: postId } as any,
      type,
    });

    // Update vote counts
    if (type === ReactionType.UPVOTE) {
      post.upvoteCount++;
    } else if (type === ReactionType.DOWNVOTE) {
      post.downvoteCount++;
    }

    await this.postsRepository.save(post);
    return await this.reactionsRepository.save(reaction);
  }

  async removeReaction(userId: string, postId: string) {
    const reaction = await this.reactionsRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (reaction) {
      const post = await this.postsRepository.findOne({
        where: { id: postId },
      });

      if (post) {
        // Update vote counts
        if (reaction.type === ReactionType.UPVOTE) {
          post.upvoteCount = Math.max(0, post.upvoteCount - 1);
        } else if (reaction.type === ReactionType.DOWNVOTE) {
          post.downvoteCount = Math.max(0, post.downvoteCount - 1);
        }
        await this.postsRepository.save(post);
      }

      await this.reactionsRepository.remove(reaction);
    }

    return { message: "Reaction removed" };
  }

  async getPostReactions(postId: string) {
    return await this.reactionsRepository.find({
      where: { post: { id: postId } },
      relations: ["user"],
    });
  }
}
