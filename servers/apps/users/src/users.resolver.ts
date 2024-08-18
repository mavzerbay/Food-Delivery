import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ActivationResponse, RegisterResponse } from './types/user.types';
import { ActivationDto, RegisterDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerDto') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (!registerDto.email || !registerDto.password || !registerDto.name) {
      throw new BadRequestException('Please fill the all fields');
    }
    const { activationToken } = await this.usersService.register(
      registerDto,
      context.res,
    );

    return { activationToken };
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationDto') activationDto: ActivationDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {
    return await this.usersService.activateUser(activationDto, context.res);
  }

  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }
}
