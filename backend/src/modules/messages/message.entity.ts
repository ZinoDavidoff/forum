import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn()
  recipient: User;

  @CreateDateColumn()
  createdAt: Date;
}
