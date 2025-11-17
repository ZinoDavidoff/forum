import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("badges")
export class Badge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string;

  @Column({ default: "#FFD700" })
  color: string;

  @Column()
  requirement: string;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;
}
