import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from './schemas/account.model';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { PostDataService } from '../postData/postData.service';
import { PostDataSchema } from 'src/postData/schemas/postData.model';

@Injectable()
export class AccountService {
    // private account: Account[]=[];
    constructor(
        @InjectModel('Account')
        private readonly accountModel:Model<Account>,
        @Inject(forwardRef(() => PostDataService))
        private readonly postDataService: PostDataService
    ){}

    async findAll():Promise<Account[]> {
        const accounts = await this.accountModel.find().exec()
        return accounts
    }

    async findOne(username: string): Promise<Account | undefined> {
        return this.accountModel.findOne({ username: { $eq: username } }).exec();
    }

    async findById(id: string): Promise<Account | undefined> {
        return this.accountModel.findOne({ _id: { $eq: id } }).exec();
    }

    async create(username: string, password:string, name:string){
        const account = await this.accountModel.findOne({
            $or: [
              { username: { $eq: username } },
              { name: { $eq: name } }
            ]
          }).exec();
        if(account){
            if(account.username === username){
                throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Username or already used in another account' })
            }else{
                throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Name already used in another account' })
            }
        }    
        else{
            const project = new Array()
            const following = new Array()
            const newAccount = new this.accountModel({username:username, password:password, project:project, following:following, name:name});
            const res = await newAccount.save();
            console.log(res)
            return res ;
        }
    }

    async follow(username: string, followingName: string){
        const account = await this.accountModel.findOne({ username: { $eq: username } }).exec();
        const accountFollowing = await this.accountModel.findOne({ name: { $eq: followingName } }).exec();
        if(!account || !accountFollowing){
            throw new NotFoundException('Could not find account to follow')
        }
        if(account.username === accountFollowing.username){
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Can not follow yourself' })
        }
        if(account && accountFollowing){
            if(account.following.includes(accountFollowing.name)){
                throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Already following this account' })
            }
            account.following.push(accountFollowing.name)
            accountFollowing.followers.push(account.name)
            const res = await account.save();
            const res2 = await accountFollowing.save();
            console.log(res)
            console.log(res2)
            return res ;
        }else{
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Does not have this account' })
        }
    }

    async unFollow(username: string, followingName: string){
        const account = await this.accountModel.findOne({ username: { $eq: username } }).exec();
        const accountFollowing = await this.accountModel.findOne({ name: { $eq: followingName } }).exec();
        if(!account || !accountFollowing){
            throw new NotFoundException('Could not find account to follow')
        }
        if(account === accountFollowing){
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Can not unFollow yourself' })
        }
        if(account && accountFollowing){
            if(!account.following.includes(accountFollowing.name)){
                throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Not following this account' })
            }
            account.following = account.following.filter(following => following !== accountFollowing.name)
            accountFollowing.followers = accountFollowing.followers.filter(follower => follower !== account.name)
            const res = await account.save();
            const res2 = await accountFollowing.save();
            console.log(res)
            console.log(res2)
            return res ;
        }else{
            throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Does not have this account' })
        }
    }

    async deleteAccount(username: string){
        const account = await this.accountModel.findOne({ username: { $eq: username } }).exec();
        if(!account){
            throw new NotFoundException('Could not find account to delete')
        }

        await this.postDataService.deleteAllPostData(account.name)
        
        await this.accountModel.updateMany(
            { following: username },
            { $pull: { following: username } }
        ).exec();
    
        await this.accountModel.updateMany(
            { followers: username },
            { $pull: { followers: username } }
        ).exec();
        const result = await this.accountModel.deleteOne({username}).exec()
        
        console.log(result)
        if(result.deletedCount===0) {
            throw new NotFoundException('Could not find account to delete or delete failed')
        }
        else{
            return "deleted account : "+username
        }
    }

}
