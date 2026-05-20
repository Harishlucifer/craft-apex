import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@craft-apex/auth";

export default function LogoutPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return null;
}
