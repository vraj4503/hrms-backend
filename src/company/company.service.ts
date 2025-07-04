import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { mysqlPool } from '../config/mysql.config';

@Injectable()
export class CompanyService {
  constructor() {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { companyName, location, strength } = createCompanyDto;
    const connection = await mysqlPool.getConnection();
    try {
      // Check for unique company name
      const [existing] = await connection.execute('SELECT * FROM Company WHERE CompanyName = ?', [companyName]);
      if ((existing as Company[]).length > 0) {
        throw new BadRequestException('Company name already exists. Please choose a different name.');
      }
      const [result] = await connection.execute(
        'INSERT INTO Company (CompanyName, Location, Strength, created, updated) VALUES (?, ?, ?, NOW(), NOW())',
        [companyName, location, strength]
      );
      const insertedId = (result as any).insertId;
      const [rows] = await connection.execute('SELECT * FROM Company WHERE CID = ?', [insertedId]);
      return (rows as Company[])[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw new BadRequestException('Failed to create company.');
    } finally {
      connection.release();
    }
  }

  async findAll(): Promise<Company[]> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM Company');
      return rows as Company[];
    } catch (error) {
      console.error('Error fetching all companies:', error);
      throw new BadRequestException('Failed to fetch companies.');
    } finally {
      connection.release();
    }
  }

  async findOne(id: number): Promise<Company> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM Company WHERE CID = ?', [id]);
      const company = (rows as Company[])[0];
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error);
      throw new BadRequestException('Failed to fetch company.');
    } finally {
      connection.release();
    }
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const connection = await mysqlPool.getConnection();
    try {
      const fieldsToUpdate = Object.keys(updateCompanyDto);
      if (fieldsToUpdate.length === 0) {
        throw new BadRequestException('No fields to update.');
      }

      const setClauses = fieldsToUpdate.map(key => `\`${key}\` = ?`).join(', ');
      const values = fieldsToUpdate.map(key => (updateCompanyDto as any)[key]);
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE Company SET ${setClauses}, \`updated\` = NOW() WHERE CID = ?`,
        values
      );

      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      const [rows] = await connection.execute('SELECT * FROM Company WHERE CID = ?', [id]);
      return (rows as Company[])[0];
    } catch (error) {
      console.error(`Error updating company with ID ${id}:`, error);
      throw new BadRequestException('Failed to update company.');
    } finally {
      connection.release();
    }
  }

  async remove(id: number): Promise<void> {
    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM Company WHERE CID = ?', [id]);
      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error removing company with ID ${id}:`, error);
      throw new BadRequestException('Failed to remove company.');
    } finally {
      connection.release();
    }
  }
}

