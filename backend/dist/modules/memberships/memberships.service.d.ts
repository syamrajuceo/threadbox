import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
export declare class MembershipsService {
    private membershipsRepository;
    constructor(membershipsRepository: Repository<Membership>);
    create(createMembershipDto: CreateMembershipDto): Promise<Membership>;
    findAll(projectId?: string, userId?: string): Promise<Membership[]>;
    findOne(id: string): Promise<Membership>;
    remove(id: string): Promise<void>;
}
