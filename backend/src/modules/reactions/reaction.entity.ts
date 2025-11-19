import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "../users/user.entity";
import { Post } from "../posts/post.entity";

export enum ReactionType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
  LOVE = "love",
  HELPFUL = "helpful",
  FUNNY = "funny",
  SAD = "sad",
}

@Entity("reactions")
@Unique(["user", "post"])
export class Reaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: ReactionType })
  type: ReactionType;

  @ManyToOne(() => User, (user) => user.reactions)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.reactions)
  @JoinColumn()
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
