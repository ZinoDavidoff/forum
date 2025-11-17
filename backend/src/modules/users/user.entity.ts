import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Thread } from "../threads/thread.entity";
import { Post } from "../posts/post.entity";
import { Reaction } from "../reactions/reaction.entity";
import { Notification } from "../notifications/notification.entity";
import { Message } from "../messages/message.entity";
import { Badge } from "../reputation/badge.entity";

export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ default: 0 })
  reputation: number;

  @Column({ default: 0 })
  postCount: number;

  @Column({ default: 0 })
  threadCount: number;

  @Column({ nullable: true })
  lastSeenAt: Date;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Thread, (thread) => thread.author)
  threads: Thread[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @ManyToMany(() => Thread)
  @JoinTable({ name: "user_bookmarks" })
  bookmarks: Thread[];

  @ManyToMany(() => User)
  @JoinTable({ name: "user_followers" })
  followers: User[];

  @ManyToMany(() => User)
  @JoinTable({ name: "user_following" })
  following: User[];

  @ManyToMany(() => Badge)
  @JoinTable({ name: "user_badges" })
  badges: Badge[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];
}
