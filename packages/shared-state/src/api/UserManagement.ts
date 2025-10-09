import { BaseApiService } from "./base";
import { LeadState, useLeadStore } from "../stores/Lead";


export interface UserModuleResponse {
    data: any;
    status: number;
}

export class UserAPIModule extends BaseApiService{
    private static userModuleInstance: UserAPIModule;

    private constructor() {
        super();
    }

    protected get leadStore(): LeadState {
        return useLeadStore.getState();
    }

    public static getInstance(): UserAPIModule {
        if (!UserAPIModule.userModuleInstance) {
            UserAPIModule.userModuleInstance = new UserAPIModule();
        }
        return UserAPIModule.userModuleInstance;
    }

    async fetchUserModuleList(): Promise<UserModuleResponse | undefined> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/v1/channel/channel-user`;
            const response = await this.get<UserModuleResponse>(endpoint);

            const responseData = response?.data?.data ?? [];
            const status = response?.data?.status ?? 0;

            return { data: responseData, status:status };
        } catch (error) {
            console.error("Error fetching user module list:", error);
            this.leadStore.setError(String(error));
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
