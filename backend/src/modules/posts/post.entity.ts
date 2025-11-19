import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { User } from "../users/user.entity";
import { Thread } from "../threads/thread.entity";
import { Reaction } from "../reactions/reaction.entity";

@Entity("posts")
@Tree("closure-table")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ nullable: true })
  editedAt: Date;

  @Column({ default: 0 })
  upvoteCount: number;

  @Column({ default: 0 })
  downvoteCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column("simple-array", { nullable: true })
  attachments: string[];

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn()
  author: User;

  @ManyToOne(() => Thread, (thread) => thread.posts)
  @JoinColumn()
  thread: Thread;

  @TreeParent()
  parentPost: Post;

  @TreeChildren()
  replies: Post[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
