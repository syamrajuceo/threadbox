import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
export declare class MembershipsController {
    private readonly membershipsService;
    constructor(membershipsService: MembershipsService);
    create(createMembershipDto: CreateMembershipDto): Promise<import("./entities/membership.entity").Membership>;
    findAll(projectId?: string, userId?: string): Promise<import("./entities/membership.entity").Membership[]>;
    findOne(id: string): Promise<import("./entities/membership.entity").Membership>;
    remove(id: string): Promise<void>;
}
