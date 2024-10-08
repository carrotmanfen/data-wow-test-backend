import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PostData } from './schemas/postData.model';
import { Model } from 'mongoose';
import { AccountService } from '../account/accounts.service';
import { Types } from 'mongoose';

@Injectable()
export class PostDataService {
    constructor(
        @InjectModel('PostData')
        private readonly postDataModel:Model<PostData>,
        @Inject(forwardRef(() => AccountService))
        private readonly accountService: AccountService
    ){}

    async findAll():Promise<PostData[]> {
        const postData = await this.postDataModel.find().exec()
        return postData
    }

    async findFollowingPostData(username: string) {
        const user = await this.accountService.findOne(username)
        if(!user){
            throw new NotFoundException('Could not find account')
        }
        const following = user.following
        console.log(following)
        const postData = await this.postDataModel.find({ postBy: { $in: following } }).sort({date:-1}).exec();
        if(postData)
            return postData;
        else
            throw new NotFoundException('Could not find postData')
    }

    async findById(post_data_id: string) {
        console.log(post_data_id)
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if(postData)
            return {post_data_id:postData._id, text:postData.text, date:postData.date, postBy:postData.postBy};
        else
            throw new NotFoundException('Could not find post data')
    }

    async findByPostBy(postBy: string) {
        console.log(postBy)
        const account = await this.accountService.findByName(postBy)
        if(!account){
            throw new NotFoundException('Could not find account')
        }
        const postData = await this.postDataModel.find({ postBy: { $eq: postBy } }).sort({date:-1}).exec();
        return postData;
    }

    async create(text: string, postBy: string) {
        try {
            const date = new Date();
            const newPostData = new this.postDataModel({ text, postBy, date });
            const res = await newPostData.save();
            console.log("Saved Post Data:", res);
            if (res) {
                return res;
            } else {
                throw new BadRequestException('Failed to create post', { cause: new Error(), description: 'Could not save post data' });
            }
        } catch (error) {
            console.error("Error in create method:", error);
            throw new BadRequestException('An error occurred while creating the post', { cause: error, description: 'Unexpected error' });
        }
    }

    async deletePostData(post_data_id : string, name: string){
        console.log(post_data_id)
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if(!postData){
            throw new NotFoundException('Could not find post to delete')
        }
        if(postData.postBy!==name){
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Can not delete post that not belong to you' })
        }
        const result = await this.postDataModel.deleteOne({_id:post_data_id}).exec()
        console.log(result)
        
        if(result.deletedCount===0) {
            throw new NotFoundException('Could not find post to delete or delete failed')
        }else{
            return "deleted post : "+post_data_id
        }
    }

    async deleteAllPostData(name: string){
        const result = await this.postDataModel.deleteMany({postBy:name}).exec()
        console.log(result)
        return result.deletedCount
        
    }

    async changePostData(post_data_id : string, text:string, name: string){
        console.log(post_data_id)
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if(!postData){
            throw new NotFoundException('Could not find post to edit')
        }
        if(postData.postBy!==name){
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Can not edit post that not belong to you' })
        }
        console.log(postData)
        if(postData){
            postData.text = text
            const result = await postData.save()
            console.log(result)
            return result
        }else{
            throw new NotFoundException('Could not find post')
        }
    }

    async commentPostData(post_data_id : string, text:string, name: string){
        console.log(post_data_id)
        if (!mongoose.Types.ObjectId.isValid(post_data_id)) {
            throw new NotFoundException('Invalid post ID format');
        }
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if(!postData){
            throw new NotFoundException('Could not find post to comment')
        }
        const date = new Date()
        const id = new mongoose.Types.ObjectId()
        const newComment = {_id:id  ,text:text, commentBy:name, date:date}
        postData.comments.push(newComment)
        const result = await postData.save()
        console.log(result)
        return result
    }

    async deleteCommentPostData(post_data_id: string, comment_id: string, name: string) {
        console.log(post_data_id);
        console.log(comment_id);
        try{
            if (!Types.ObjectId.isValid(post_data_id)) {
                throw new NotFoundException('Invalid post ID format');
            }
            if (!Types.ObjectId.isValid(comment_id)) {
                throw new NotFoundException('Invalid comment ID format');
            }
        } catch (error) {
            throw new NotFoundException('Invalid post ID format or comment ID format');

        }
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if (!postData) {
            throw new NotFoundException('Could not find post to delete comment');
        }
        
        const comment = postData.comments.find(comment => comment._id.toString() === comment_id);
        if (!comment) {
            throw new NotFoundException('Could not find comment to delete');
        }
        
        if (comment.commentBy !== name) {
            throw new BadRequestException('Can not delete comment that does not belong to you');
        }
        
        postData.comments = postData.comments.filter(comment => comment._id.toString() !== comment_id);
        const result = await postData.save();
        
        return result;
    }


}
