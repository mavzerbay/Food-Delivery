import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';

interface UserData {
  name: string;
  email: string;
  password: string;
  phoneNumber: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto, response: Response) {
    const { email, password, name, phoneNumber } = registerDto;

    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExist) {
      throw new BadRequestException('Email already exist');
    }

    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (isPhoneNumberExist) {
      throw new BadRequestException('Phone number already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      phoneNumber,
    };

    const activationTokenResponse = await this.createActivationCode(user);

    const activationCode = activationTokenResponse.activationCode;
    const activationToken = activationTokenResponse.token;

    await this.emailService.sendMail({
      subject: 'Activate your account',
      email,
      name,
      activationCode,
      template: './activation-mail',
    });

    console.log(activationTokenResponse);

    return { activationToken, response };
  }

  async createActivationCode(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );

    return { token, activationCode };
  }

  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationToken, activationCode } = activationDto;

    const newUser: { user: UserData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get('ACTIVATION_SECRET'),
      });

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException('Invalid activation code');
    }

    const { email, password, name, phoneNumber } = newUser.user;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new BadRequestException('User already exist with this email');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        name,
        phoneNumber,
      },
    });

    return { user, response };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = {
      email,
      password,
    };

    return user;
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }
}
