import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../src/account/accounts.service';
import { PostDataService } from '../src/postData/postData.service';
import { getModelToken } from '@nestjs/mongoose';
import { PostDataModule } from '../src/postData/postData.module';

describe('AuthController (e2e)', () => {
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
      username: 'testuserauth',
      password: 'testpasswordauth',
      name: 'Test User auth',
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
      accessToken = await jwtService.signAsync({ sub: user._id, username: user.username });
    });
  
    afterAll(async () => {
      await accountService.deleteAccount('testuserauth');
      await app.close();
    });
  

  describe('/auth/login (POST)', () => {
    
    it('should login a user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUser.username, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.results.access_token).toBeDefined();
          expect(res.body.results.refresh_token).toBeDefined();
        });
    });

    it('should not login a user with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUser.username, password: 'wrongpassword' })
        .expect(401)
    });

    it('should not login a user with wrong username', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'wrongusername', password: testUser.password })
        .expect(401)
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'incompleteuser' })
        .expect(400);
    });

    it('should return 400 for invalid data types', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 123, password: 123 })
        .expect(400);
    });


  });
});
