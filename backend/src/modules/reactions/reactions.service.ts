import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reaction, ReactionType } from "./reaction.entity";

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>
  ) {}

  async addReaction(userId: string, postId: string, type: ReactionType) {
    const existing = await this.reactionsRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existing) {
      existing.type = type;
      return await this.reactionsRepository.save(existing);
    }

    const reaction = this.reactionsRepository.create({
      user: { id: userId } as any,
      post: { id: postId } as any,
      type,
    });

    return await this.reactionsRepository.save(reaction);
  }

  async removeReaction(userId: string, postId: string) {
    const reaction = await this.reactionsRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (reaction) {
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
