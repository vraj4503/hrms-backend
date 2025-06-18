import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';

@Entity()
export class Bucket {
  @PrimaryGeneratedColumn()
  BucketId: number;

  @Column({ nullable: true })
  CID: number;

  @Column({ length: 255 })
  BucketName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  BucketDescription: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated: Date;

  @Column({ nullable: true })
  CreatedBy: number;

  @Column({ nullable: true })
  UpdatedBy: number;

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
