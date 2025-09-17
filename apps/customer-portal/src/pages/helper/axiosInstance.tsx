import axios from "axios";
import { useAuthStore } from "@repo/shared-state/stores";

export const useAxios = () => {
    const { user } = useAuthStore();

    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_ENDPOINT,
        timeout: 5000000,
        headers: {
            "Content-Type": "application/json",
            ...(user?.access_token && {
                Authorization: `Bearer ${user.access_token}`,
            }),
        },
    });

    return instance;
};
