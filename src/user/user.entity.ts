import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  UID: number;

  @Column({ length: 50 })
  Fname: string;

  @Column({ length: 50 })
  Lname: string;

  @Column({ length: 50, nullable: true })
  Mname: string;

  @Column({ type: 'datetime' })
  DOB: Date;

  @Column({ length: 1 })
  StatusType: string;

  @Column({ type: 'int', width: 11 })
  DepartmentID: number;

  @Column({ length: 11 })
  UserType: string;

  @Column({ length: 255 })
  Password: string;

  @Column({ length: 100 })
  Email: string;

  @Column({ length: 20 })
  Phone: string;

  @Column({ type: 'int', width: 10, unsigned: true })
  CID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated: Date;

  @Column({ type: 'int', width: 11, nullable: false })
  CreatedBy: number;

  @Column({ type: 'int', width: 11, nullable: true })
  UpdatedBy: number;
} 