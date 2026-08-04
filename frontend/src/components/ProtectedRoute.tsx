import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/axios";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "authed" | "unauthed">(
    "checking",
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setStatus("unauthed");
      return;
    }
    api
      .get("/auth/verify")
      .then(() => setStatus("authed"))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setStatus("unauthed");
      });
  }, []);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0a0e1a] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthed") return <Navigate to="/login" replace />;
  return <>{children}</>;
}
