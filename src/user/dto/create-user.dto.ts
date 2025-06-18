import { IsString, IsDate, IsNumber, IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  Fname: string;

  @IsString()
  @IsNotEmpty()
  Lname: string;

  @IsString()
  @IsOptional()
  Mname?: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  DOB: Date;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1)
  StatusType: string;

  @IsNumber()
  @IsNotEmpty()
  DepartmentID: number;

  @IsString()
  @IsNotEmpty()
  UserType: string;

  @IsString()
  @IsNotEmpty()
  Password: string;

  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @IsString()
  @IsNotEmpty()
  Phone: string;

  @IsNumber()
  @IsNotEmpty()
  CID: number;

  @IsNumber()
  @IsOptional()
  CreatedBy?: number;
} 