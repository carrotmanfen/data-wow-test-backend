import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PostDataService } from '../src/postData/postData.service';
import { AccountModule } from '../src/account/accounts.module';
import { getModelToken } from '@nestjs/mongoose';
import { AccountService } from '../src/account/accounts.service';

describe('PostDataController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let postDataService: PostDataService;
  let accountService: AccountService;
  let accessToken: string;

  const mockAccountModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockPostDataService = {
    getPostsByUserId: jest.fn(),
  };

  const testUser = {
    username: 'testuserforpost',
    password: 'testpassword',
    name: 'Test User For Post',
  };

  const testUser2 = {
    username: 'testuserforpost2',
    password: 'testpassword2',
    name: 'Test User For Post2',
  };



  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AccountModule],
        providers: [
            PostDataService,
            AccountService,
            {
            provide: getModelToken('Account'),
            useValue: mockAccountModel,
            },
            {
            provide: PostDataService,
            useValue: mockPostDataService,
            },
        ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    postDataService = moduleFixture.get<PostDataService>(PostDataService);
    accountService = moduleFixture.get<AccountService>(AccountService);

    const user = await accountService.create(testUser.username, testUser.password, testUser.name);
    await accountService.create(testUser2.username, testUser2.password, testUser2.name);
    accessToken = await jwtService.signAsync({ sub: user._id, username: user.username, name: user.name });
  });

  afterAll(async () => {
    await accountService.deleteAccount(testUser.username);
    await accountService.deleteAccount(testUser2.username);
    await app.close();
  });

  let post_id: string;
  let comment_id: string;

  describe('/posts/createPost (POST)', () => {
    it('should create a post and return its details', async () => {

      return request(app.getHttpServer())
        .post('/posts/createPost')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'This is a test post' })
        .expect(201)
        .expect((res) => {
          post_id = res.body.results._id.toString();
          expect(res.body.results.text).toEqual(
             'This is a test post'
          );
        });
    });

    it('should return 400 for invalid input', async () => {

      return request(app.getHttpServer())
        .post('/posts/createPost')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 123 }) 
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ['text must be a string'],
            error: 'Bad Request',
          });
        });
    });

    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .post('/posts/createPost')
        .send({ text: 'This is a test post' })
        .expect(401)
    });
  });

  describe('/posts/me (GET)', () => {
    it('should get all posts of the authenticated user', async () => {

      return request(app.getHttpServer())
        .get('/posts/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    });

    it('should return 401 for unauthenticated user', async () => {
      
          return request(app.getHttpServer())
          .get('/posts/me')
          .expect(401)
      });
  });

  describe('/posts/allFollowing (GET)', () => {
    it('should get all posts of the users that the authenticated user is following', async () => {

      return request(app.getHttpServer())
        .get('/posts/allFollowing')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    });

    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .get('/posts/allFollowing')
        .expect(401)
    });
  });

  describe('/posts/:name (GET)', () => {
    it('should get all posts of the user by name', async () => {

      return request(app.getHttpServer())
        .get(`/posts/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    });

    it('should return 404 for invalid username', async () => {
            
        return request(app.getHttpServer())
          .get('/posts/invalidusername')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404)
     });

    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .get(`/posts/${testUser2.username}`)
        .expect(401)
    });
  });

  describe('/posts/editPost/:id (PATCH)', () => {
    it('should edit the post of the authenticated user', async () => {
        console.log(post_id)
      return request(app.getHttpServer())
        .patch(`/posts/editPost/${post_id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'This is an edited post' })
        .expect(200)
    });

    it('should return 400 for invalid input', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/editPost/${post_id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 123 }) 
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ['text must be a string'],
            error: 'Bad Request',
          });
        });
    });

    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/editPost/${post_id}`)
        .send({ text: 'This is an edited post' })
        .expect(401)
    });
  });

  describe('/posts/comment/:id (PATCH)', () => {
    it('should comment on the post', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/comment/${post_id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'This is a comment' })
        .expect(200)
        .expect((res) => {
          comment_id = res.body.results.comments[0]._id;
          expect(res.body.results.comments[0].text).toEqual(
            'This is a comment')});
    });

    it('should return 400 for invalid input', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/comment/${post_id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 123 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: 400,
            message: ['text must be a string'],
            error: 'Bad Request',
          });
        });
    });

    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/comment/${post_id}`)
        .send({ text: 'This is a comment' })
        .expect(401)
    });

    it('should return 404 for invalid post id', async () => {

      return request(app.getHttpServer())
        .patch(`/posts/comment/invalidid`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'This is a comment' })
        .expect(404)
    });
  });
  
  describe('/posts/deleteComment/:id (DELETE)', () => {
      it('should return 400 for invalid input', async () => {
          return request(app.getHttpServer())
          .patch(`/posts/deleteComment/${post_id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400)
        });
        
        it('should return 401 for unauthenticated user', async () => {
            
            return request(app.getHttpServer())
            .patch(`/posts/deleteComment/${post_id}`)
            .send({ comment_id: comment_id })
            .expect(401)
        });
        
        it('should return 404 for invalid post id', async () => {
            
            return request(app.getHttpServer())
            .patch(`/posts/deleteComment/${post_id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ comment_id: '66ba26a1dd243ea4f538e03a' })
            .expect(404)
        });

        it('should delete the comment', async () => {
    
          return request(app.getHttpServer())
            .patch(`/posts/deleteComment/${post_id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ comment_id: comment_id })
            .expect(200)
        });
  });

  describe('/posts/deletePost/:id (DELETE)', () => {
    it('should return 401 for unauthenticated user', async () => {

      return request(app.getHttpServer())
        .delete(`/posts/deletePost/${post_id}`)
        .expect(401)
    });

    it('should return 404 for invalid post id', async () => {

      return request(app.getHttpServer())
        .delete(`/posts/deletePost/66ba26a1dd243ea4f538e03a`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
    });

    it('should delete the post', async () => {

      return request(app.getHttpServer())
        .delete(`/posts/deletePost/${post_id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    });
  });

});
