import { BaseApiService } from "./base";
import { LeadState, useLeadStore } from "../stores/Lead";


export interface UserModuleResponse {
    data: any;
    status: number;
}

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    status?: number;
}

export class UserModuleAPI extends BaseApiService{
    private static userModuleInstance: UserModuleAPI;

    private constructor() {
        super();
    }

    protected get leadStore(): LeadState {
        return useLeadStore.getState();
    }

    public static getInstance(): UserModuleAPI {
        if (!UserModuleAPI.userModuleInstance) {
            UserModuleAPI.userModuleInstance = new UserModuleAPI();
        }
        return UserModuleAPI.userModuleInstance;
    }

    async fetchUserModuleList(): Promise<UserModuleResponse | undefined> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/v1/channel/channel-user`;
            const response = await this.get<ApiResponse<UserModuleResponse>>(endpoint);

            const responseData = response?.data?.data ?? [];
            const status = response?.data?.status ?? 0;

            return { data: responseData, status };
        } catch (error) {
            console.error("Error fetching user module list:", error);
            this.leadStore.setError(String(error));
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}

export const userModuleAPI = UserModuleAPI.getInstance();