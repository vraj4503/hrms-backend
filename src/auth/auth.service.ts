import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { decrypt } from '../utils/encryption';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthService {
  private readonly SECRET_KEY = 'Vraj123';
  private readonly TOKEN_EXPIRATION = 60 * 1000; 

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        console.error(`Authentication failed: User not found with email ${email}`);
        return null;
      }
      
      if (pass !== decrypt(user.Password)) {
        console.error(`Authentication failed: Invalid password for user ${email}`);
        return null;
      }

      const { Password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async login(user: any) {
    try {
      const payload = { 
        email: user.Email,
        sub: user.UID,
        uid: user.UID,
        cid: user.CID,
        firstName: user.Fname,
        lastName: user.Lname
      };
      
      const jwtToken = this.jwtService.sign(payload);
      const timestamp = Date.now();
      const tokenString = `${jwtToken}_${timestamp}`;
      
      const encryptedToken = CryptoJS.AES.encrypt(tokenString, this.SECRET_KEY).toString();
      
      return {
        access_token: encryptedToken,
        user: {
          uid: user.UID,
          cid: user.CID,
          firstName: user.Fname,
          lastName: user.Lname,
          email: user.Email
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Failed to generate authentication token');
    }
  }

  async validateToken(encryptedToken: string) { 
    try {
      if (!encryptedToken) {
        console.error('Token validation failed: No token provided');
        throw new UnauthorizedException('No authentication token provided');
      }

      
      let decryptedString: string;
      try {
        const decrypted = CryptoJS.AES.decrypt(encryptedToken, this.SECRET_KEY);
        decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) {
          console.error('Token validation failed: Failed to decrypt token');
          throw new UnauthorizedException('Invalid token encryption');
        }
      } catch (decryptError) {
        console.error('Token decryption failed:', decryptError);
        throw new UnauthorizedException('Invalid token encryption');
      }

      
      if (!decryptedString.includes('_')) {
        console.error('Token validation failed: Invalid token format - missing separator');
        throw new UnauthorizedException('Invalid token format');
      }

      const [jwtToken, timestamp] = decryptedString.split('_');
      if (!jwtToken || !timestamp) {
        console.error('Token validation failed: Invalid token structure - missing parts');
        throw new UnauthorizedException('Invalid token structure');
      }

      
      const currentTime = Date.now();
      const tokenTime = parseInt(timestamp);
      if (isNaN(tokenTime)) {
        console.error('Token validation failed: Invalid timestamp format');
        throw new UnauthorizedException('Invalid token timestamp');
      }

      
      const timeDiff = currentTime - tokenTime;
      if (timeDiff > this.TOKEN_EXPIRATION) {
        console.error(`Token validation failed: Token expired (${timeDiff}ms old)`);
        throw new UnauthorizedException('Token has expired. Please login again.');
      }

     
      try {
        const payload = this.jwtService.verify(jwtToken);
        if (!payload || !payload.email || !payload.sub) {
          console.error('Token validation failed: Invalid JWT payload');
          throw new UnauthorizedException('Invalid token payload');
        }
        
        const result = {
          statusCode: 201,
          message: 'Token validated successfully',
          user: payload
        };
        
        return result;
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        if (jwtError.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token signature');
        } else if (jwtError.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        } else {
          throw new UnauthorizedException('Invalid token');
        }
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
} 