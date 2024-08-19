import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { TokenSender } from './utils/send_token';

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
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user && (await this.comparePassword(password, user.password))) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      return tokenSender.sendToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password',
        },
      };
    }
  }

  // compare with hashed password
  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // get logged in user
  async getLoggedInUser(req: any) {
    const user = req.user;
    const refreshToken = req.headers.refreshtoken;
    const accessToken = req.headers.accesstoken;

    console.log({ user, refreshToken, accessToken });
    return { user, refreshToken, accessToken };
  }

  // logout user
  async logout(req: any) {
    req.user = null;
    req.headers.accesstoken = null;
    req.headers.refreshtoken = null;
    return { message: 'Logged out successfully!' };
  }

  // get all users
  async getUsers() {
    return this.prisma.user.findMany({});
  }
}
