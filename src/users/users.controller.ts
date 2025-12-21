import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { type UserDto } from 'src/share/types/users.dto';
import { UpdateUserDto } from './dto/user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: UserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put()
  update(@Body() body: { userCode: string; userDto: UpdateUserDto }) {
    return this.usersService.updateUser(body.userCode, body.userDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
