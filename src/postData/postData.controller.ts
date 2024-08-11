import { Body, Controller, Get, Post, HttpCode, Patch, Param, Delete, UseGuards, Header, Request } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PostDataService } from './postData.service';
import { PostData } from './schemas/postData.model';
import { AuthGuard } from 'src/auth/auth.guard';

class CreatePostDataDto {

    @ApiProperty()
    text: string;

}

class UpdatePostDataNameDto {

    @ApiProperty()
    text: string;

    @ApiProperty()
    id: string;

}

@Controller('posts')
@ApiTags('posts')
export class PostDataController {
    constructor(private readonly postDataService: PostDataService) { }

    @Get('/all')
    @ApiResponse({ status: 200, description: 'Returns the greeting message' })
    async getAllPostData() {
        const posts = await this.postDataService.findAll();
        return ({
            status: 200,
            message: "there is all post success",
            results: posts.map(post => ({
                _id: post._id,
                text: post.text,
                date: post.date,
                postBy: post.postBy
            })
            )
        })
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'The project_id parameter' })
    @ApiResponse({ status: 200, description: 'Returns the greeting message' })
    async getPostData(
        @Param('id') id: string
    ) {
        const postData = await this.postDataService.findById(id);
        if (postData)
            return ({
                status: 200,
                message: "this is that post",
                results: postData
            });
        else
            return "don't have post"
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post('/createPost')
    @ApiBody({ type: CreatePostDataDto })
    @ApiResponse({ status: 201, description: 'Register' })
    async createPost(
        @Body('text') text: string,
        @Request() req
    ): Promise<any> {
        const user = req.user;
        console.log(user)
        const postData = await this.postDataService.create(text, user.name);
        return ({
            status: 200,
            message: "register success",
            results: {
                _id: postData._id,
                text: postData.text,
                date: postData.date,
                postBy: postData.postBy
            }
        })
    }

    @Delete('/deletePost/:id')
    @ApiParam({ name: 'id', description: 'The post_data_id parameter' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'delete' })
    async deletePost(
        @Param('id') post_data_id: string
    ) {
        const postData = await this.postDataService.deletePostData(post_data_id)
        return ({
            status: 200,
            message: "register success",
            results: {
                message: postData
            }
        })
    }

    @Patch('/changePost')
    @ApiBody({ type: UpdatePostDataNameDto })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'change' })
    async changePost(
        @Body('id') post_data_id: string,
        @Body('text') text: string
    ) {
        const postData = await this.postDataService.changePostData(post_data_id, text)
        return ({
            status: 200,
            message: "change success",
            results: {
                message: postData
            }
        })
    }

}
