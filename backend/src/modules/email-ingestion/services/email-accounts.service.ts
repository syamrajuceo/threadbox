import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailAccount } from '../entities/email-account.entity';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';
import { UpdateEmailAccountDto } from '../dto/update-email-account.dto';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { EmailIngestionService } from '../email-ingestion.service';

@Injectable()
export class EmailAccountsService {
  private readonly logger = new Logger(EmailAccountsService.name);
  private readonly encryptionSecret: string;

  constructor(
    @InjectRepository(EmailAccount)
    private emailAccountsRepository: Repository<EmailAccount>,
    private configService: ConfigService,
    private emailIngestionService: EmailIngestionService,
  ) {
    this.encryptionSecret =
      this.configService.get<string>('ENCRYPTION_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'default-secret-change-in-production';
  }

  async create(
    createDto: CreateEmailAccountDto,
    userId: string,
  ): Promise<EmailAccount> {
    try {
      this.logger.debug(`Creating email account for user ${userId}`);
      this.logger.debug(`Provider: ${createDto.provider}, Account: ${createDto.account}`);
      
      // Validate credentials object
      if (!createDto.credentials || typeof createDto.credentials !== 'object') {
        throw new Error('Credentials must be an object');
      }

      // Encrypt credentials
      const credentialsJson = JSON.stringify(createDto.credentials);
      this.logger.debug('Encrypting credentials...');
      const encryptedCredentials = EncryptionUtil.encrypt(
        credentialsJson,
        this.encryptionSecret,
      );
      this.logger.debug('Credentials encrypted successfully');

      const account = this.emailAccountsRepository.create({
        name: createDto.name,
        provider: createDto.provider,
        account: createDto.account,
        credentials: encryptedCredentials,
        redirectUri: createDto.redirectUri,
        isActive: createDto.isActive !== false,
        createdById: userId,
      });

      this.logger.debug('Saving email account to database...');
      const savedAccount = await this.emailAccountsRepository.save(account);
      this.logger.log(`Email account created successfully with ID: ${savedAccount.id}`);
      
      return savedAccount;
    } catch (error: unknown) {
      this.logger.error('Error in create method:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error message:', errorMessage);
      const errorStack = error instanceof Error ? error.stack : undefined;
      if (errorStack) {
        this.logger.error('Error stack:', errorStack);
      }
      throw error;
    }
  }

  async findAll(userId: string): Promise<EmailAccount[]> {
    return this.emailAccountsRepository.find({
      where: { createdById: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<EmailAccount> {
    const account = await this.emailAccountsRepository.findOne({
      where: { id, createdById: userId },
    });

    if (!account) {
      throw new NotFoundException(`Email account with ID ${id} not found`);
    }

    return account;
  }

  async update(
    id: string,
    updateDto: UpdateEmailAccountDto,
    userId: string,
  ): Promise<EmailAccount> {
    const account = await this.findOne(id, userId);

    if (updateDto.credentials) {
      // Encrypt new credentials
      const credentialsJson = JSON.stringify(updateDto.credentials);
      account.credentials = EncryptionUtil.encrypt(
        credentialsJson,
        this.encryptionSecret,
      );
    }

    if (updateDto.name) account.name = updateDto.name;
    if (updateDto.provider) account.provider = updateDto.provider;
    if (updateDto.account) account.account = updateDto.account;
    if (updateDto.redirectUri !== undefined) account.redirectUri = updateDto.redirectUri;
    if (updateDto.isActive !== undefined) account.isActive = updateDto.isActive;

    return this.emailAccountsRepository.save(account);
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.emailAccountsRepository.remove(account);
  }

  async getDecryptedCredentials(
    id: string,
    userId: string,
  ): Promise<any> {
    const account = await this.findOne(id, userId);
    
    try {
      this.logger.debug(`Decrypting credentials for account ${id}`);
      const decrypted = EncryptionUtil.decrypt(
        account.credentials,
        this.encryptionSecret,
      );
      const credentials = JSON.parse(decrypted);
      this.logger.debug(`Successfully decrypted credentials for account ${id}`);
      return credentials;
    } catch (error: unknown) {
      this.logger.error(`Error decrypting credentials for account ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error details: ${errorMessage}`);
      throw new Error(`Failed to decrypt credentials: ${error.message}`);
    }
  }

  async ingestFromAccount(
    accountId: string,
    userId: string,
    since?: Date,
  ): Promise<number> {
    const account = await this.findOne(accountId, userId);
    
    if (!account.isActive) {
      throw new Error('Email account is not active');
    }

    this.logger.log(`Starting ingestion for account ${accountId} (${account.provider}: ${account.account})`);

    try {
      const credentials = await this.getDecryptedCredentials(accountId, userId);
      
      this.logger.debug(`Decrypted credentials for ${account.provider} account`);

      const config = {
        provider: account.provider,
        account: account.account,
        credentials,
      };

      const count = await this.emailIngestionService.ingestEmails(config, since);

      // Update last ingested info
      account.lastIngestedAt = new Date();
      account.lastIngestedCount = count;
      await this.emailAccountsRepository.save(account);

      this.logger.log(`Successfully ingested ${count} emails from account ${accountId}`);
      return count;
    } catch (error: unknown) {
      this.logger.error(`Error ingesting from account ${accountId}:`, error);
      // Re-throw with more context
      if (error.message?.includes('decrypt')) {
        throw new Error(`Invalid credentials: ${error.message}`);
      }
      throw error;
    }
  }
}

