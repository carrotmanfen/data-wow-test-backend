import { AccountSchema, Account } from './account.model';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Account Model', () => {
  const AccountModel = mongoose.model<Account>('Account', AccountSchema);

  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL.toString());
});
  afterEach(async () => {
    await AccountModel.deleteMany({});
  });

  it('should create an account with valid data', async () => {
    const accountData = {
      username: 'testuser',
      password: 'password123',
      name: 'Test User',
      following: [],
      followers: [],
    };
    
    const account = await AccountModel.create(accountData);
    
    expect(account._id).toBeDefined();
    expect(account.username).toEqual(accountData.username);
    expect(account.name).toEqual(accountData.name);
    expect(account.following).toEqual(accountData.following);
    expect(account.followers).toEqual(accountData.followers);
  });

  it('should fail to create an account without a username', async () => {
    const accountData = {
      password: 'password123',
      name: 'Test User',
      following: [],
      followers: [],
    };

    await expect(AccountModel.create(accountData)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create an account without a password', async () => {
    const accountData = {
      username: 'testuser',
      name: 'Test User',
      following: [],
      followers: [],
    };

    await expect(AccountModel.create(accountData)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create an account without a name', async () => {
    const accountData = {
      username: 'testuser',
      password: 'password123',
      following: [],
      followers: [],
    };

    await expect(AccountModel.create(accountData)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should create an account with following and followers as empty arrays', async () => {
    const accountData = {
      username: 'testuser',
      password: 'password123',
      name: 'Test User',
      following: [],
      followers: [],
    };
    
    const account = await AccountModel.create(accountData);
    
    expect(account.following).toEqual([]);
    expect(account.followers).toEqual([]);
  });
});
