import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(req: {
        user: {
            id: string;
            globalRole: string;
        };
    }): Promise<import("./dashboard.service").DashboardProject[]>;
}
