import * as mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    following: {type:Array, required:false},
    followers: {type:Array, required:false}
});

export interface Account extends mongoose.Document{
    _id: string;
    username: string;
    password: string;
    name: string;
    following: Array<any>;
    followers: Array<any>;
}