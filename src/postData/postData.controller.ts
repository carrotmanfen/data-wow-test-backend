import { Body, Controller, Get, Post, HttpCode, Patch, Param, Delete, UseGuards, Header, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PostDataService } from './postData.service';
import { PostData } from './schemas/postData.model';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class CreatePostDataDto {

    @ApiProperty({
        description: 'The text of post',
        example: 'this_is_my_post',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

}

class UpdatePostDataNameDto {

    @ApiProperty({
        description: 'The text of post',
        example: 'this_is_my_new_edit_post',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

}

class CommentPostDataDto {

    @ApiProperty({
        description: 'The text of comment',
        example: 'this_is_my_comment',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

}

class DeleteCommentDataDto{

    @ApiProperty({
        description: 'The objectId of comment',
        example: 'comment_id',
    })
    @IsString()
    @IsNotEmpty()
    comment_id: string;
    
}

class PostNameParamDto {
    @ApiProperty({
        description: 'The name of postBy',
        example: 'postByName',
    })
    @IsString()
    @IsNotEmpty()
    postBy: string;
}

class PostIdParamDto {
    @ApiProperty({
        description: 'The objectId of post',
        example: 'post-id',
    })
    @IsString()
    @IsNotEmpty()
    id: string;
}

@Controller('posts')
@ApiTags('posts')
export class PostDataController {
    constructor(private readonly postDataService: PostDataService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post('/createPost')
    @ApiBody({ type: CreatePostDataDto })
    @ApiResponse({ status: 201, description: 'Create new post' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createPost(
        @Body() createPostDataDto: CreatePostDataDto,
        @Request() req
    ): Promise<any> {
        const user = req.user;
        console.log(user)
        if (!user || !user.name) {
            throw new BadRequestException('User is not authenticated or missing name');
        }
    
        const postData = await this.postDataService.create(createPostDataDto.text, user.name);
        return ({
            status: 201,
            message: "register success",
            results: {
                _id: postData._id,
                text: postData.text,
                date: postData.date,
                postBy: postData.postBy
            }
        })
    }

    @Get('/me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Get all owner posts' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyPost(@Request() req) {
        const user = req.user;
        console.log("hello"+user)
        const postData = await this.postDataService.findByPostBy(user.name);
        if (postData)
        return ({
                status: 200,
                message: "return your post",
                results: postData
            });
        else
            return "don't have post"
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Get('/allFollowing')
    @ApiResponse({ status: 200, description: 'Returns all post that following' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllPostData(@Request() req) {
        const user = req.user;
        const posts = await this.postDataService.findFollowingPostData(user.username);
        return ({
            status: 200,
            message: "there is all post success",
            results: posts.map(post => ({
                _id: post._id,
                text: post.text,
                date: post.date,
                postBy: post.postBy,
                comments: post.comments
            }))
        })
    }

    @Get('/:postBy')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'postBy', type: String })
    @ApiResponse({ status: 200, description: 'Get post of user that we look' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUserPost(@Param()param: PostNameParamDto) {
        const postData = await this.postDataService.findByPostBy(param.postBy);
        return ({
                status: 200,
                message: "return all post of user",
                results: postData
            });
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Delete('/deletePost/:id')
    @ApiParam({ name: 'id', description: 'The objectId of post' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'delete' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deletePost(
        @Param('id') post_data_id: string,
        @Request() req
    ) {
        const user = req.user;
        const postData = await this.postDataService.deletePostData(post_data_id, user.name)
        return ({
            status: 200,
            message: "register success",
            results: {
                message: postData
            }
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/editPost/:id')
    @ApiParam({ name: 'id', description: 'The objectId of post' })
    @ApiBody({ type: UpdatePostDataNameDto })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'change text in post' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async changePost(
        @Param()param: PostIdParamDto,
        @Body() updatePostDataNameDto: UpdatePostDataNameDto,
        @Request () req
    ) {
        const user = req.user;
        const postData = await this.postDataService.changePostData(param.id, updatePostDataNameDto.text, user.name)
        return ({
            status: 200,
            message: "change success",
            results: postData
            
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/comment/:id')
    @ApiBody({ type: CommentPostDataDto })
    @ApiParam({ name: 'id', description: 'The objectId of post' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'comment in post' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async commentPost(
        @Param()param: PostIdParamDto,
        @Body() commentPostDataDto: CommentPostDataDto,
        @Request () req
    ) {
        const user = req.user;
        const postData = await this.postDataService.commentPostData(param.id, commentPostDataDto.text, user.name)
        return ({
            status: 200,
            message: "comment success",
            results: postData
            
        })
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Patch('/deleteComment/:id')
    @ApiParam({ name: 'id', description: 'The objectId of post' })
    @ApiBody({ type: DeleteCommentDataDto })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'delete comment in post' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteCommentPost(
        @Param()param: PostIdParamDto,
        @Body() deleteCommentDataDto: DeleteCommentDataDto,
        @Request () req
    ) {
        const user = req.user;
        const postData = await this.postDataService.deleteCommentPostData(param.id, deleteCommentDataDto.comment_id, user.name)
        return ({
            status: 200,
            message: "delete success",
            results: postData
            
        })
    }

}
