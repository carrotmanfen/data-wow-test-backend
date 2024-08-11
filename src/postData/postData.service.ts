import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PostData } from './schemas/postData.model';
import { Model } from 'mongoose';


@Injectable()
export class PostDataService {
    constructor(
        @InjectModel('PostData')
        private readonly postDataModel:Model<PostData>
    ){}

    async findAll():Promise<PostData[]> {
        const postData = await this.postDataModel.find().exec()
        return postData
    }

    async findById(post_data_id: string) {
        console.log(post_data_id)
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        if(postData)
            return {post_data_id:postData._id, text:postData.text, date:postData.date, postBy:postData.postBy};
        else
            throw new NotFoundException('Could not find post data')
    }

    async create(text:string, postBy:string){
        const date = new Date()
        const newPostData = new this.postDataModel({ text:text, postBy: postBy, date:date})
        const res = await newPostData.save();
        console.log(res)
        if(res){
            return res ;
        }else{
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Does not have this account' })
        }
    }

    async deletePostData(post_data_id : string){
        console.log(post_data_id)
        const result = await this.postDataModel.deleteOne({_id:post_data_id}).exec()
        console.log(result)
        if(result.deletedCount===0) {
            throw new NotFoundException('Could not find post to delete or delete failed')
        }else{
            return "deleted post : "+post_data_id
        }
    }

    async changePostData(post_data_id : string, text:string){
        console.log(post_data_id)
        const postData = await this.postDataModel.findOne({ _id: { $eq: post_data_id } }).exec();
        console.log(postData)
        if(postData){
            postData.text = text
            const result = await postData.save()
            console.log(result)
        }else{
            throw new NotFoundException('Could not find post')
        }
    }


}
