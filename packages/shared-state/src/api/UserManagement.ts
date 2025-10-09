import { BaseApiService } from "./base";
import { LeadState, useLeadStore } from "../stores/Lead";

export interface UserModuleResponse {
    data:[];
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
            const responseData = response?.data || response;
            return responseData as UserModuleResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch offers";
            this.leadStore.setError(errorMessage);
            console.error('LenderOfferAPI.fetchEligibleOffers error:', errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
