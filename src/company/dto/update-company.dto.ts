import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsNumber()
  updatedBy?: number;
} 