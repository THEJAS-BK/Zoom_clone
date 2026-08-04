import React, { useState, type JSX } from "react";
import type { Formdata } from "../../types/Auth";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

export default function Register(): JSX.Element {
  const [formData, setFormData] = useState<Formdata>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {login} = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof Formdata;
    const fieldValue = e.target.value;

    setFormData((curData) => ({ ...curData, [fieldName]: fieldValue }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      if (res.status === 200 || res.status === 201) {
       login(res.data.accessToken,res.data.refreshToken)
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Could not create account. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#0a0e1a] px-8 py-4 flex items-center">
        <Link to="/" className="text-white font-bold text-xl tracking-tight">
          Syncvas
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-extrabold text-center text-[#0a0e1a] mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-center text-gray-500 mb-10">
            Start collaborating on a shared canvas in seconds.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0a0e1a] transition"
              onChange={handleChange}
              placeholder="Name"
              type="text"
              name="name"
              value={formData.name}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0a0e1a] transition"
              onChange={handleChange}
              placeholder="Email"
              type="email"
              name="email"
              value={formData.email}
              required
            />

            <div className="relative">
              <input
                className="border border-gray-300 rounded-lg px-4 py-3 pr-11 w-full focus:outline-none focus:ring-2 focus:ring-[#0a0e1a] transition"
                onChange={handleChange}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {!showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.35 19.35 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.4 19.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-[#0a0e1a] text-white font-semibold rounded-full py-3 hover:bg-[#1a1f2e] transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0a0e1a] font-medium underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}