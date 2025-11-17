import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Category } from "../categories/category.entity";
import { Post } from "../posts/post.entity";

export enum ThreadStatus {
  OPEN = "open",
  CLOSED = "closed",
  PINNED = "pinned",
  LOCKED = "locked",
}

@Entity("threads")
export class Thread {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "enum", enum: ThreadStatus, default: ThreadStatus.OPEN })
  status: ThreadStatus;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column("simple-array", { nullable: true })
  tags: string[];

  @ManyToOne(() => User, (user) => user.threads, { eager: true })
  @JoinColumn()
  author: User;

  @ManyToOne(() => Category, (category) => category.threads, { eager: true })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Post, (post) => post.thread)
  posts: Post[];

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn()
  lastPost: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
