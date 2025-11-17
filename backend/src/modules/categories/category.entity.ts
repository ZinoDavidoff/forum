import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { Thread } from "../threads/thread.entity";

@Entity("categories")
@Tree("closure-table")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: "#FFB6C1" })
  color: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  threadCount: number;

  @Column({ default: 0 })
  postCount: number;

  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];

  @OneToMany(() => Thread, (thread) => thread.category)
  threads: Thread[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
