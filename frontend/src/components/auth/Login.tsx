import React, { useState, type JSX } from "react";
import type { LoginFormData } from "../../types/Auth";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

export default function Login(): JSX.Element {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {login} = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof LoginFormData;
    const fieldValue = e.target.value;

    setFormData((curData) => ({ ...curData, [fieldName]: fieldValue }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(`/auth/login`, formData);
      if (res.status === 200) {
         login(res.data.accessToken, res.data.refreshToken);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav bar, matches landing page header */}
      <header className="bg-[#0a0e1a] px-8 py-4 flex items-center">
        <Link to="/" className="text-white font-bold text-xl tracking-tight">
          Syncvas
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-extrabold text-center text-[#0a0e1a] mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-center text-gray-500 mb-10">
            Log in to get back to your boards.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0a0e1a] transition"
              onChange={handleChange}
              placeholder="Email"
              type="text"
              name="email"
              value={formData.email}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0a0e1a] transition"
              onChange={handleChange}
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-[#0a0e1a] text-white font-semibold rounded-full py-3 hover:bg-[#1a1f2e] transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            No account?{" "}
            <Link to="/register" className="text-[#0a0e1a] font-medium underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}