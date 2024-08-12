import * as mongoose from 'mongoose';

export const PostDataSchema = new mongoose.Schema({
    text: {type: String, required: true},
    date: {type: Date, required: true},
    postBy: {type: String, required: true},
    comments: {type: Array, required: false},
});

export interface PostData{
    _id: string;
    text: string;
    date: Date;
    postBy: string;
    comments: Array<any>;
}
