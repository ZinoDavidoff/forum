import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../users/user.entity";
import { Post } from "../posts/post.entity";
import { Thread } from "../threads/thread.entity";

export enum ReactionType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
  LOVE = "love",
  HELPFUL = "helpful",
  FUNNY = "funny",
  SAD = "sad",
}

export enum TargetType {
  POST = "post",
  THREAD = "thread",
}

@Entity("reactions")
@Index(["user", "post"], { unique: true, where: '"postId" IS NOT NULL' })
@Index(["user", "thread"], { unique: true, where: '"threadId" IS NOT NULL' })
export class Reaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: ReactionType })
  type: ReactionType;

  @Column({ type: "enum", enum: TargetType, default: TargetType.POST })
  targetType: TargetType;

  @ManyToOne(() => User, (user) => user.reactions)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.reactions, { nullable: true })
  @JoinColumn()
  post: Post;

  @ManyToOne(() => Thread, { nullable: true })
  @JoinColumn()
  thread: Thread;

  @CreateDateColumn()
  createdAt: Date;
}
