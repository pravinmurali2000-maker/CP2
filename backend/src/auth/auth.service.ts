import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('--- Validating User ---');
    console.log('Email:', email);
    console.log('Password:', pass);
    
    const user = await this.usersRepository.findOneBy({ email });
    console.log('User found in DB:', user);

    if (user) {
      const isPasswordMatching = await bcrypt.compare(pass, user.password_hash);
      console.log('Password comparison result:', isPasswordMatching);
      if (isPasswordMatching) {
        const { password_hash, ...result } = user;
        console.log('Validation successful:', result);
        return result;
      }
    }
    
    console.log('Validation failed.');
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}
