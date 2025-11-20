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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
let RolesService = class RolesService {
    rolesRepository;
    permissionsRepository;
    constructor(rolesRepository, permissionsRepository) {
        this.rolesRepository = rolesRepository;
        this.permissionsRepository = permissionsRepository;
    }
    async create(createRoleDto) {
        const role = this.rolesRepository.create({
            name: createRoleDto.name,
            description: createRoleDto.description,
            type: createRoleDto.type,
            projectId: createRoleDto.projectId,
        });
        const savedRole = await this.rolesRepository.save(role);
        if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
            const permissions = createRoleDto.permissions.map((permissionType) => this.permissionsRepository.create({
                type: permissionType,
                roleId: savedRole.id,
            }));
            await this.permissionsRepository.save(permissions);
        }
        return this.findOne(savedRole.id);
    }
    async findAll(projectId) {
        const where = projectId ? { projectId } : {};
        return this.rolesRepository.find({
            where,
            relations: ['permissions'],
        });
    }
    async findOne(id) {
        const role = await this.rolesRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async update(id, updateRoleDto) {
        const role = await this.findOne(id);
        Object.assign(role, updateRoleDto);
        if (updateRoleDto.permissions) {
            await this.permissionsRepository.delete({ roleId: id });
            const permissions = updateRoleDto.permissions.map((permissionType) => this.permissionsRepository.create({
                type: permissionType,
                roleId: id,
            }));
            await this.permissionsRepository.save(permissions);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const role = await this.findOne(id);
        await this.rolesRepository.remove(role);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map