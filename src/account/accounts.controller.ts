import { Body, Controller, Get, Post, HttpCode, Patch, Param, Delete, UseGuards, Header, Request } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AccountService } from './accounts.service';
import { Account } from './schemas/account.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class RegisterDto {
    @ApiProperty({
        description: 'The username',
        example: 'username',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'The password',
        example: 'password',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'The name',
        example: 'firstName',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}

class NameParamDto {
    @ApiProperty({
        description: 'The name',
        example: 'firstName',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}


@Controller('accounts')
@ApiTags('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post('/register')
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Register with username, password and name' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async createAccount(
        @Body('username') username: string,
        @Body('password') password: string,
        @Body('name') name: string,
    ): Promise<any> {
        const account = await this.accountService.create(username, password, name)
        return ({
            status: 200,
            message: "register success",
            results: {
                _id: account._id,
                username: account.username,
                password: account.password,
                name: account.name,
                following: account.following
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns username, name and following of user that login' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/me')
    async getProfile(@Request() req) {
        const user = req.user;
        const userAccount = await this.accountService.findOne(user.username)
        return ({
            status: 200,
            message: "get profile success",
            results: {
                _id: userAccount._id,
                username: userAccount.username,
                name: userAccount.name,
                following: userAccount.following,
                followers: userAccount.followers
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Get('/all')
    @ApiResponse({ status: 200, description: 'Returns name all account' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllAccount() {
        const accounts = await this.accountService.findAll();
        return ({
            status: 200,
            message: "there is all account success",
            results: accounts.map(account => ({
                _id: account._id,
                name: account.name,
            }))
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/updateName/:name')
    @ApiParam({ name: 'name', type: String })
    @ApiResponse({ status: 200, description: 'Update name of account' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateName(@Request() req, @Param()param: NameParamDto) {
        const user = req.user;
        const account = await this.accountService.updateName(user.username, param.name)
        return ({
            status: 200,
            message: "update name success",
            results: {
                _id: account._id,
                username: account.username,
                name: account.name,
                following: account.following
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/follow/:name')
    @ApiParam({ name: 'name', type: String })
    @ApiResponse({ status: 200, description: 'Follow the account by name' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async followAccount(@Request() req, @Param()param: NameParamDto) {
        const user = req.user;
        const account = await this.accountService.follow(user.username, param.name)
        return ({
            status: 200,
            message: "follow success",
            results: {
                _id: account._id,
                username: account.username,
                name: account.name,
                following: account.following
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/unfollow/:name')
    @ApiParam({ name: 'name', type: String })
    @ApiResponse({ status: 200, description: 'Unfollow the account by name' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async unFollowAccount(@Request() req, @Param()param: NameParamDto) {
        const user = req.user;
        const account = await this.accountService.unFollow(user.username, param.name)
        return ({
            status: 200,
            message: "unfollow success",
            results: {
                _id: account._id,
                username: account.username,
                name: account.name,
                following: account.following
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Delete('/delete')
    @ApiResponse({ status: 200, description: 'Delete account and delete all follower and following' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteAccount(@Request() req) {
        const user = req.user;
        const account = await this.accountService.deleteAccount(user.username)
        return ({
            status: 200,
            message: "delete success",
        })
    }

}
