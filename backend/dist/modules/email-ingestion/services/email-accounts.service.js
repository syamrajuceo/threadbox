"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailAccountsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const email_account_entity_1 = require("../entities/email-account.entity");
const encryption_util_1 = require("../../../common/utils/encryption.util");
const email_ingestion_service_1 = require("../email-ingestion.service");
let EmailAccountsService = EmailAccountsService_1 = class EmailAccountsService {
    emailAccountsRepository;
    configService;
    emailIngestionService;
    logger = new common_1.Logger(EmailAccountsService_1.name);
    encryptionSecret;
    constructor(emailAccountsRepository, configService, emailIngestionService) {
        this.emailAccountsRepository = emailAccountsRepository;
        this.configService = configService;
        this.emailIngestionService = emailIngestionService;
        this.encryptionSecret =
            this.configService.get('ENCRYPTION_SECRET') ||
                this.configService.get('JWT_SECRET') ||
                'default-secret-change-in-production';
    }
    async create(createDto, userId) {
        try {
            this.logger.debug(`Creating email account for user ${userId}`);
            this.logger.debug(`Provider: ${createDto.provider}, Account: ${createDto.account}`);
            if (!createDto.credentials || typeof createDto.credentials !== 'object') {
                throw new Error('Credentials must be an object');
            }
            const credentialsJson = JSON.stringify(createDto.credentials);
            this.logger.debug('Encrypting credentials...');
            const encryptedCredentials = encryption_util_1.EncryptionUtil.encrypt(credentialsJson, this.encryptionSecret);
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
        }
        catch (error) {
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
    async findAll(userId) {
        return this.emailAccountsRepository.find({
            where: { createdById: userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const account = await this.emailAccountsRepository.findOne({
            where: { id, createdById: userId },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Email account with ID ${id} not found`);
        }
        return account;
    }
    async update(id, updateDto, userId) {
        const account = await this.findOne(id, userId);
        if (updateDto.credentials) {
            const credentialsJson = JSON.stringify(updateDto.credentials);
            account.credentials = encryption_util_1.EncryptionUtil.encrypt(credentialsJson, this.encryptionSecret);
        }
        if (updateDto.name)
            account.name = updateDto.name;
        if (updateDto.provider)
            account.provider = updateDto.provider;
        if (updateDto.account)
            account.account = updateDto.account;
        if (updateDto.redirectUri !== undefined)
            account.redirectUri = updateDto.redirectUri;
        if (updateDto.isActive !== undefined)
            account.isActive = updateDto.isActive;
        return this.emailAccountsRepository.save(account);
    }
    async remove(id, userId) {
        const account = await this.findOne(id, userId);
        await this.emailAccountsRepository.remove(account);
    }
    async getDecryptedCredentials(id, userId) {
        const account = await this.findOne(id, userId);
        try {
            this.logger.debug(`Decrypting credentials for account ${id}`);
            const decrypted = encryption_util_1.EncryptionUtil.decrypt(account.credentials, this.encryptionSecret);
            const credentials = JSON.parse(decrypted);
            this.logger.debug(`Successfully decrypted credentials for account ${id}`);
            return credentials;
        }
        catch (error) {
            this.logger.error(`Error decrypting credentials for account ${id}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error details: ${errorMessage}`);
            throw new Error(`Failed to decrypt credentials: ${error.message}`);
        }
    }
    async ingestFromAccount(accountId, userId, since) {
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
            account.lastIngestedAt = new Date();
            account.lastIngestedCount = count;
            await this.emailAccountsRepository.save(account);
            this.logger.log(`Successfully ingested ${count} emails from account ${accountId}`);
            return count;
        }
        catch (error) {
            this.logger.error(`Error ingesting from account ${accountId}:`, error);
            if (error.message?.includes('decrypt')) {
                throw new Error(`Invalid credentials: ${error.message}`);
            }
            throw error;
        }
    }
};
exports.EmailAccountsService = EmailAccountsService;
exports.EmailAccountsService = EmailAccountsService = EmailAccountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_account_entity_1.EmailAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        email_ingestion_service_1.EmailIngestionService])
], EmailAccountsService);
//# sourceMappingURL=email-accounts.service.js.map