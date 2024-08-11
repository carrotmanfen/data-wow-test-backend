import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let jwtService: JwtService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], // Import the whole AppModule or only necessary modules like AuthModule
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        authService = moduleFixture.get<AuthService>(AuthService);
        jwtService = moduleFixture.get<JwtService>(JwtService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/login (POST)', () => {
        it('should login and return access and refresh tokens', async () => {
            const loginDto = { username: 'testuser', password: 'testpassword' };

            // Mock the AuthService to avoid using real database in the test
            jest.spyOn(authService, 'signIn').mockResolvedValue({
                access_token: 'mockAccessToken',
                refresh_token: 'mockRefreshToken',
            });

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(200)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 200,
                        message: 'Login successful',
                        data: {
                            access_token: 'mockAccessToken',
                            refresh_token: 'mockRefreshToken',
                        },
                    });
                });
        });

        it('should return 400 for bad request', async () => {
            const loginDto = { username: 123, password: 123 };

            // Mock the AuthService to return Unauthorized error
            jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Bad Request'));

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(400)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 400,
                        error: "Bad Request",
                        message: ['username must be a string', 'password must be a string'],
                    });
                });
        });

        it('should return 400 for bad request', async () => {
            const loginDto = { username: "invalid username", password: 123 };

            // Mock the AuthService to return Unauthorized error
            jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Bad Request'));

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(400)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 400,
                        error: "Bad Request",
                        message: [ 'password must be a string'],
                    });
                });
        });

        it('should return 400 for bad request', async () => {
            const loginDto = { username: 123, password: "invalid password" };
      
            // Mock the AuthService to return Unauthorized error
            jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Bad Request'));
      
            return request(app.getHttpServer())
              .post('/auth/login')
              .send(loginDto)
              .expect(400)
              .expect(res => {
                expect(res.body).toEqual({
                  statusCode: 400,
                  error: "Bad Request",
                  message: ['username must be a string'],
                });
              });
          });

        it('should return 401 for invalid credentials', async () => {
            const loginDto = { username: 'invaliduser', password: 'wrongpassword' };

            // Mock the AuthService to return Unauthorized error
            jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Unauthorized'));

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 401,
                        error: "Unauthorized",
                        message: 'Invalid credentials',
                    });
                });
        });
    });

    describe('/auth/refresh (POST)', () => {
        it('should refresh the token', async () => {
            const refreshTokenDto = { refresh_token: 'mockRefreshToken' };

            // Mock the AuthService to return a new access token
            jest.spyOn(authService, 'refreshToken').mockResolvedValue({
                access_token: 'newMockAccessToken',
            });

            return request(app.getHttpServer())
                .post('/auth/refresh')
                .send(refreshTokenDto)
                .expect(200)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 200,
                        message: 'Token refreshed successfully',
                        data: {
                            access_token: 'newMockAccessToken',
                        },
                    });
                });
        });

        it('should return 400 for bad request', async () => {
            const refreshTokenDto = { refresh_token: 123 };

            // Mock the AuthService to throw an Unauthorized error
            jest.spyOn(authService, 'refreshToken').mockRejectedValue(new Error('Bad Request'));

            return request(app.getHttpServer())
                .post('/auth/refresh')
                .send(refreshTokenDto)
                .expect(400)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 400,
                        error: "Bad Request",
                        message: ['refresh_token must be a string'],
                    });
                });
        });

        it('should return 401 for invalid refresh token', async () => {
            const refreshTokenDto = { refresh_token: 'invalidToken' };

            // Mock the AuthService to throw an Unauthorized error
            jest.spyOn(authService, 'refreshToken').mockRejectedValue(new Error('Unauthorized'));

            return request(app.getHttpServer())
                .post('/auth/refresh')
                .send(refreshTokenDto)
                .expect(401)
                .expect(res => {
                    expect(res.body).toEqual({
                        statusCode: 401,
                        error: "Unauthorized",
                        message: 'Invalid or expired refresh token',
                    });
                });
        });
    });


});
