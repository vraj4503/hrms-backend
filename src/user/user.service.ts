import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { encrypt, decrypt } from '../utils/encryption';
import { sendMail } from '../utils/email';
import * as crypto from 'crypto';
import { mysqlPool } from '../config/mysql.config';

@Injectable()
export class UserService {
  constructor() {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('Service received:', createUserDto);
    const {
      Fname, Lname, Mname, DOB, StatusType, DepartmentID, UserType,
      Password, Email, Phone, CID, CreatedBy
    } = createUserDto;

   
    const params = [
      Fname ?? null,
      Lname ?? null,
      Mname ?? null,
      DOB ?? null,
      StatusType ?? null,
      DepartmentID ?? null,
      UserType ?? null,
      Password ? encrypt(Password) : null,
      Email ?? null,
      Phone ?? null,
      CID ?? null,
      0 
    ];

    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO user (Fname, Lname, Mname, DOB, StatusType, DepartmentID, UserType, Password, Email, Phone, CID, created, updated, CreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)',
        params
      );

      const insertedId = (result as any).insertId;
      const [rows] = await connection.execute(`SELECT * FROM user WHERE UID = ?`, [insertedId]);
      const newUser: User = (rows as User[])[0];

      
      const [updateResult] = await connection.execute(
        `UPDATE user SET CreatedBy = ? WHERE UID = ?`,
        [newUser.UID, newUser.UID]
      );

      if ((updateResult as any).affectedRows === 0) {
        console.warn(`Could not set CreatedBy for user ${newUser.UID}`);
      }

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user.');
    } finally {
      connection.release();
    }
  }

  async findAll(): Promise<User[]> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user');
      return rows as User[];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new BadRequestException('Failed to fetch users.');
    } finally {
      connection.release();
    }
  }

  async findOne(UID: number): Promise<User> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE UID = ?', [UID]);
      const user = (rows as User[])[0];
      if (!user) {
        throw new NotFoundException(`User with ID ${UID} not found`);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with ID ${UID}:`, error);
      throw new BadRequestException('Failed to fetch user.');
    } finally {
      connection.release();
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE Email = ?', [email]);
      return (rows as User[])[0] || null;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw new BadRequestException('Failed to fetch user by email.');
    } finally {
      connection.release();
    }
  }

  async update(UID: number, updateUserDto: UpdateUserDto): Promise<User> {
    const connection = await mysqlPool.getConnection();
    try {
      const existingUser = await this.findOne(UID);
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${UID} not found`);
      }

      let encryptedPassword = existingUser.Password;
      if (updateUserDto.Password) {
        encryptedPassword = encrypt(updateUserDto.Password);
      }

      const fieldsToUpdate = Object.keys(updateUserDto).filter(key => updateUserDto[key] !== undefined && key !== 'Password');
      const setClauses = fieldsToUpdate.map(key => `\`${key}\` = ?`).join(', ');
      const values = fieldsToUpdate.map(key => (updateUserDto as any)[key]);
      values.push(encryptedPassword);
      values.push(UID);

      const [result] = await connection.execute(
        `UPDATE user SET ${setClauses ? `${setClauses}, ` : ''}\`Password\` = ?, \`updated\` = NOW(), \`UpdatedBy\` = ? WHERE UID = ?`,
        values
      );

      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`User with ID ${UID} not found`);
      }
      const [rows] = await connection.execute(`SELECT * FROM user WHERE UID = ?`, [UID]);
      return (rows as User[])[0];
    } catch (error) {
      console.error(`Error updating user with ID ${UID}:`, error);
      throw new BadRequestException('Failed to update user.');
    } finally {
      connection.release();
    }
  }

  async remove(UID: number): Promise<void> {
    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM user WHERE UID = ?', [UID]);
      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`User with ID ${UID} not found`);
      }
    } catch (error) {
      console.error(`Error removing user with ID ${UID}:`, error);
      throw new BadRequestException('Failed to remove user.');
    } finally {
      connection.release();
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const connection = await mysqlPool.getConnection();
    try {
      const user = await this.findOneByEmail(loginUserDto.email);
      if (!user) {
        throw new UnauthorizedException('Email not found');
      }

      const decryptedPassword = decrypt(user.Password);
      if (loginUserDto.password !== decryptedPassword) {
        throw new UnauthorizedException('Incorrect password');
      }

      return user;
    } catch (error) {
      console.error('Error during user login:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByCompany(companyId: number): Promise<User[]> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE CID = ?', [companyId]);
      return rows as User[];
    } catch (error) {
      console.error(`Error fetching users for company ID ${companyId}:`, error);
      throw new BadRequestException('Failed to fetch users by company.');
    } finally {
      connection.release();
    }
  }

  async addTeamMember(createUserDto: CreateUserDto): Promise<User> {
    const { Fname, Lname, Mname, DOB, StatusType, DepartmentID, UserType, Password, Email, Phone, CID, CreatedBy } = createUserDto;
    const encryptedPassword = encrypt(Password);
    const connection = await mysqlPool.getConnection();
    try {

      const [result] = await connection.execute(

        'INSERT INTO user (Fname, Lname, Mname, DOB, StatusType, DepartmentID, UserType, Password, Email, Phone, CID, created, updated, CreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)',
        [Fname, Lname, Mname, DOB, StatusType, DepartmentID, UserType, encryptedPassword, Email, Phone, CID, CreatedBy]
      );
      const insertedId = (result as any).insertId;
      const [rows] = await connection.execute(`SELECT * FROM user WHERE UID = ?`, [insertedId]);
      const newUser: User = (rows as User[])[0];
      await connection.execute(
        `UPDATE user SET CreatedBy = ? WHERE UID = ?`,
        [newUser.UID, newUser.UID]
      );
      return newUser;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new BadRequestException('Failed to add team member.');
    } finally {
      connection.release();
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE Email = ?', [email]);
      const user = (rows as User[])[0];
      if (!user) return;

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      const expiryTime = new Date(Date.now() + 3 * 60 * 1000); // 3 min expiry

      await connection.execute(
        'UPDATE user SET resetOtp = ?, resetOtpExpiry = ? WHERE UID = ?',
        [hashedOtp, expiryTime, user.UID]
      );

      console.log('Preparing to send OTP email to:', user.Email, 'OTP:', otp);
      const mailResult = await sendMail(
        user.Email,
        'Your OTP for Password Reset',
        `Your OTP is: ${otp}`,
      );
      console.log('sendMail result:', mailResult);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw new BadRequestException('Failed to request password reset.');
    } finally {
      connection.release();
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE Email = ?', [email]);
      const user = (rows as User[])[0];
      if (!user || !user.resetOtp || !user.resetOtpExpiry) return false;
      if (user.resetOtpExpiry < new Date()) return false;

      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      return user.resetOtp === hashedOtp;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    } finally {
      connection.release();
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE Email = ?', [email]);
      const user = (rows as User[])[0];
      if (!user || !user.resetOtp || !user.resetOtpExpiry) return false;
      if (user.resetOtpExpiry < new Date()) return false;

      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      if (user.resetOtp !== hashedOtp) return false;

      const encryptedPassword = encrypt(newPassword);
      await connection.execute(
        'UPDATE user SET Password = ?, resetOtp = NULL, resetOtpExpiry = NULL WHERE UID = ?',
        [encryptedPassword, user.UID]
      );
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    } finally {
      connection.release();
    }
  }

  async isEmailExists(email: string): Promise<boolean> {
    const connection = await mysqlPool.getConnection();
    const [rows]: any = await connection.execute('SELECT 1 FROM user WHERE Email = ?', [email]);
    return rows.length > 0;
  }
} 
