import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { CreateUserDto, UpdateUserDto } from 'src/features/users/dtos/user.dto';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiBearerAuth()
//@Modules('users')
//@UseGuards(JwtAuthGuard, ModulesGuard) 
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService){}

    @Get()
    getUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ) {
        return this.usersService.findAll({ page, limit });
    }

    @Get(':userId')
    getOne(@Param('userId', ParseIntPipe) userId: number){
        return this.usersService.findOne(userId);
    }

    @Post()
    createUser(@Body() payload: CreateUserDto){
        return this.usersService.create(payload);
    }

    @Put(':userId')
    updateUser(@Param('userId', ParseIntPipe) userId: number, @Body() payloadUpdated: UpdateUserDto){
        return this.usersService.updateUser(userId, payloadUpdated);
    }

    @Delete(':userId')
    deleteUser(@Param('userId', ParseIntPipe) userId: number){
        this.usersService.deleteUser(userId);
    }

}
