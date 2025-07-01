import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bucket } from '../bucket/bucket.entity';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';

@Entity()
export class ToDos {
  @PrimaryGeneratedColumn()
  ToDoId: number;

  @Column({ nullable: true })
  BucketID: number;

  @Column({ nullable: true })
  AssignTo: number;

  @Column({ nullable: true })
  AssgnBy: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  NotificationTo: string;

  @Column({ type: 'datetime', nullable: true })
  DueDateTime: Date;

  @Column({ type: 'char', length: 1, nullable: true })
  Priority: string;

  @Column({ type: 'char', length: 1, nullable: true })
  StatusType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  FilePath: string;

 

  @Column({ type: 'varchar', length: 255, nullable: true })
  Title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Description: string;

  @Column({ type: 'boolean', default: false })
  Repeted: boolean;

  @Column({ nullable: true })
  CID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated: Date;

  @Column({ nullable: true })
  CreatedBy: number;

  @Column({ nullable: true })
  UpdatedBy: number;

  @ManyToOne(() => Bucket)
  @JoinColumn({ name: 'BucketID' })
  bucket: Bucket;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'AssignTo' })
  assignToUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'AssgnBy' })
  assignedByUser: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'CID' })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CreatedBy' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UpdatedBy' })
  updatedBy: User;
}
