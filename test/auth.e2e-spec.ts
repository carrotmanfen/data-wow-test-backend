import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../src/account/accounts.service';
import { PostDataService } from '../src/postData/postData.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let accountService: AccountService;

  const mockAccountService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPostDataService = {
    getPostsByUserId: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
    })
      .overrideProvider(AccountService)
      .useValue(mockAccountService)
      .overrideProvider(PostDataService)
      .useValue(mockPostDataService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    accountService = moduleFixture.get<AccountService>(AccountService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login and return access and refresh tokens', async () => {
      const loginDto = { username: 'testuser', password: 'testpassword' };

      jest.spyOn(authService, 'signIn').mockResolvedValue({
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Login successful',
        data: {
          access_token: 'mockAccessToken',
          refresh_token: 'mockRefreshToken',
        },
      });
    });

    it('should return 400 for invalid data types', async () => {
      const invalidDto = { username: 123, password: 123 };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: ['username must be a string', 'password must be a string'],
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const invalidLoginDto = { username: 'invaliduser', password: 'wrongpassword' };

      jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Unauthorized'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: 'Invalid credentials',
      });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh the token', async () => {
      const refreshTokenDto = { refresh_token: 'mockRefreshToken' };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue({
        access_token: 'newMockAccessToken',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenDto)
        .expect(200);

      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          access_token: 'newMockAccessToken',
        },
      });
    });

    it('should return 400 for invalid refresh token type', async () => {
      const invalidRefreshTokenDto = { refresh_token: 123 };

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(invalidRefreshTokenDto)
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: ['refresh_token must be a string'],
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      const invalidRefreshTokenDto = { refresh_token: 'invalidToken' };

      jest.spyOn(authService, 'refreshToken').mockRejectedValue(new Error('Unauthorized'));

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(invalidRefreshTokenDto)
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: 'Invalid or expired refresh token',
      });
    });
  });
});
