import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../src/account/accounts.service';
import { getModelToken } from '@nestjs/mongoose';
import { PostDataService } from '../src/postData/postData.service';
import { Account } from '../src/account/schemas/account.model';
import { Model } from 'mongoose';
import { PostDataSchema } from 'src/postData/schemas/postData.model';
import { PostDataModule } from '../src/postData/postData.module';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
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
    username: 'testuser',
    password: 'testpassword',
    name: 'Test User',
  };

  const testUser2 = {
    username: 'testuser2',
    password: 'testpassword2',
    name: 'Test User2',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PostDataModule],
      providers: [
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
    accountService = moduleFixture.get<AccountService>(AccountService);

    const user = await accountService.create(testUser.username, testUser.password, testUser.name);
    await accountService.create(testUser2.username, testUser2.password, testUser2.name);
    accessToken = await jwtService.signAsync({ sub: user._id, username: user.username });
  });

  afterAll(async () => {
    await accountService.deleteAccount(testUser2.username);
    await accountService.deleteAccount('newuser');
    await app.close();
  });

  describe('/accounts/register (POST)', () => {

    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/accounts/register')
        .send({ username: 'newuser', password: 'newpassword', name: 'NewUser' })
        .expect(201)
        .expect(res => {
          expect(res.body.message).toEqual('register success');
          expect(res.body.results.username).toEqual('newuser');
        });
    });

    it('should return 400 for duplicate username', () => {
      return request(app.getHttpServer())
        .post('/accounts/register')
        .send({ username: 'newuser', password: 'newpassword', name: 'NewUser' })
        .expect(400);
    });

    it('should return 400 for invalid data types', () => {
        return request(app.getHttpServer())
            .post('/accounts/register')
            .send({ username: 123, password: 123, name: 123 })
            .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/accounts/register')
        .send({ username: 'incompleteuser' }) 
        .expect(400);
    });
  });

  describe('/accounts/me (GET)', () => {
    it('should get the profile of the logged-in user', () => {
      return request(app.getHttpServer())
        .get('/accounts/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('get profile success');
          expect(res.body.results.username).toEqual(testUser.username);
        });
    });

    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/accounts/me')
        .expect(401);
    });
  });

  describe('/accounts/all (GET)', () => {
    it('should return a list of all accounts', () => {
      return request(app.getHttpServer())
        .get('/accounts/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('there is all account success');
          expect(Array.isArray(res.body.results)).toBeTruthy();
          expect(res.body.results.length).toBeGreaterThan(0);
        });
    });

    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/accounts/all')
        .expect(401);
    });
  });

  describe('/accounts/find/:name (GET)', () => {
    it('should return the account details by name', () => {
      return request(app.getHttpServer())
        .get(`/accounts/find/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('find account success');
          expect(res.body.results.name).toEqual(testUser2.name);
        });
    });

    it('should return 404 if the account does not exist', () => {
      return request(app.getHttpServer())
        .get('/accounts/find/nonexistentuser')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/accounts/follow/:name (PATCH)', () => {
    it('should follow another user by name', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/follow/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('follow success');
        });
    });

    it('should return 400 if trying to follow the same user again', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/follow/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 400 if trying to follow oneself', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/follow/${testUser.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 404 if trying to follow a non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/accounts/follow/nonexistentuser')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/accounts/unfollow/:name (PATCH)', () => {
    it('should unfollow another user by name', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/unfollow/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('unfollow success');
        });
    });

    it('should return 400 if trying to unfollow the same user again', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/unfollow/${testUser2.name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 404 if trying to unfollow a non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/accounts/unfollow/nonexistentuser')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
    
  });

  describe('/accounts/delete (DELETE)', () => {
    it('should delete the account of the logged-in user', () => {
      return request(app.getHttpServer())
        .delete('/accounts/delete')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('delete success');
        });
    });

    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer())
        .delete('/accounts/delete')
        .expect(401);
    });

  });
});
