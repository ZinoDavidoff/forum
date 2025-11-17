import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    delete user.password;
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    delete user.password;
    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
