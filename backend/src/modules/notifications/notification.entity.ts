import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";

export enum NotificationType {
  REPLY = "reply",
  MENTION = "mention",
  REACTION = "reaction",
  FOLLOW = "follow",
  BADGE = "badge",
  MESSAGE = "message",
  SYSTEM = "system",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  senderId: string;

  @CreateDateColumn()
  createdAt: Date;
}
