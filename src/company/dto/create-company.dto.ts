import { IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  strength: string;

  @IsOptional()
  @IsNumber()
  createdByUser?: number;

  @IsOptional()
  @IsNumber()
  createdBy?: number;
} 