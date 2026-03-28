import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      const endpoint = isSignIn ? "/auth/login" : "/auth/register";
      const { data } = await axios.post(`${API}${endpoint}`, {
        email,
        password,
      });
      toast.success(data.response);
      localStorage.setItem("token", data.access_token);
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) toast.error("Email already taken");
      else if (status === 401) toast.error("Invalid credentials");
      else toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080f] px-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-3xl p-10 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 mb-3 drop-shadow-[0_0_14px_rgba(99,102,241,0.55)]">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="18"
                cy="18"
                r="17"
                stroke="url(#lg1)"
                strokeWidth="2"
              />
              <path d="M11 18 Q18 9 25 18 Q18 27 11 18Z" fill="url(#lg1)" />
              <defs>
                <linearGradient
                  id="lg1"
                  x1="0"
                  y1="0"
                  x2="36"
                  y2="36"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-[1.6rem] font-semibold text-white tracking-tight leading-none">
            MidsterBot
          </h1>
          <p className="mt-1.5 text-sm text-white/40 font-light text-center">
            {isSignIn
              ? "Welcome back — sign in to continue"
              : "Create your account to get started"}
          </p>
        </div>

        {/* Toggle pill */}
        <div className="flex bg-white/[0.05] rounded-xl p-1 mb-7 gap-1">
          {["Sign In", "Sign Up"].map((label, i) => {
            const active = (i === 0) === isSignIn;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setIsSignIn(i === 0)}
                className={`flex-1 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white shadow"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isSignIn ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPassword ? <IoEye size={17} /> : <IoEyeOff size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center min-h-[46px]"
          >
            {loading ? (
              <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
