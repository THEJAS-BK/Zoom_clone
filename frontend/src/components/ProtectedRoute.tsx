import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/axios";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "authed" | "unauthed">("checking");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setStatus("unauthed");
      return;
    }
    api.get("/auth/verify")
      .then(() => setStatus("authed"))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setStatus("unauthed");
      });
  }, []);

  if (status === "checking") return <div>Loading...</div>;
  if (status === "unauthed") return <Navigate to="/login" replace />;
  return <>{children}</>;
}