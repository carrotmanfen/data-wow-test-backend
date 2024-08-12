import * as mongoose from 'mongoose';
import { PostDataSchema, PostData } from './postData.model';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Post Model', () => {
    const PostModel = mongoose.model<PostData>('Post', PostDataSchema);

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL.toString());
    });
    afterEach(async () => {
        await PostModel.deleteMany({});
    });

    it('should create an post with valid data', async () => {
        const postData = {
            _id: '66ba26a1dd143ea4f536e04a',
            text: 'this is new post text',
            date: new Date(),
            postBy: 'testuser',
            comments: [],
        };

        const post = await PostModel.create(postData);

        expect(post._id).toBeDefined();
        expect(post.text).toEqual(postData.text);
        expect(post.date).toEqual(postData.date);
        expect(post.postBy).toEqual(postData.postBy);
        expect(post.comments).toEqual(postData.comments);
    });

    it('should fail to create an post without text', async () => {
        const postData = {
            date: new Date(),
            postBy: 'testuser',
            comments: [],
        };

        await expect(PostModel.create(postData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to create an post without postBy', async () => {
        const postData = {
            text: 'this is new post text',
            date: new Date(),
            comments: [],
        };

        await expect(PostModel.create(postData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to create an post without date', async () => {
        const postData = {
            text: 'this is new post text',
            postBy: 'testuser',
            comments: [],
        };

        await expect(PostModel.create(postData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create an post without comments', async () => {
        const postData = {
            text: 'this is new post text',
            date: new Date(),
            postBy: 'testuser',
        };
        const post = await PostModel.create(postData);
        expect(post._id).toBeDefined();
        expect(post.text).toEqual(postData.text);
        expect(post.date).toEqual(postData.date);
        expect(post.postBy).toEqual(postData.postBy);
        expect(post.comments).toEqual([]);
    });

    it('should create an post with invalid _id mongo will auto create it', async () => {
        const postData = {
            text: 'this is new post text',
            date: new Date(),
            postBy: 'testuser',
            comments: [],
        };
        const post = await PostModel.create(postData);
        expect(post._id).toBeDefined();
        expect(post.text).toEqual(postData.text);
        expect(post.date).toEqual(postData.date);
        expect(post.postBy).toEqual(postData.postBy);
        expect(post.comments).toEqual([]);
    });

    it('should fail to create an post with invalid date', async () => {
        const postData = {
            _id: '66ba26a1dd143ea4f536e04a',
            text: 'this is new post text',
            postBy: 'testuser',
            comments: [],
        };
        await expect(PostModel.create(postData)).rejects.toThrow(mongoose.Error.ValidationError);
    });


    it('should fail to create an post with invalid postBy', async () => {
        const postData = {
            _id: '66ba26a1dd143ea4f536e04a',
            text: 'this is new post text',
            date: new Date(),
            comments: [],
        };
        await expect(PostModel.create(postData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

});

