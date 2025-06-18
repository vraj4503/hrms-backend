import { IsOptional, IsString, IsDate, IsNumber, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  Fname?: string;

  @IsOptional()
  @IsString()
  Lname?: string;

  @IsOptional()
  @IsString()
  Mname?: string;

  @IsOptional()
  @IsDate()
  DOB?: Date;

  @IsOptional()
  @IsString()
  StatusType?: string;

  @IsOptional()
  @IsNumber()
  DepartmentID?: number;

  @IsOptional()
  @IsString()
  UserType?: string;

  @IsOptional()
  @IsString()
  Password?: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @IsNumber()
  CID?: number;

  @IsOptional()
  @IsNumber()
  UpdatedBy?: number;
} 