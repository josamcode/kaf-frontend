import React, { useState, useEffect } from "react";
import { LogIn, Eye, EyeOff, AlertCircle, Church, Cross } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Input, Button } from "../components/ui";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { state, login, clearError } = useAuth();

  // Staggered mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.user && state.token) {
      // Already logged in — handled by parent
    }
  }, [state.user, state.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (state.error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
    } catch {
      // handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-surface-50 flex flex-col relative overflow-hidden"
      dir="rtl"
    >
      {/* ===== Background layers ===== */}

      {/* Main gradient — taller on mobile for immersion */}
      <div className="absolute inset-x-0 top-0 h-[22rem] sm:h-80 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-x-0 top-0 h-[22rem] sm:h-80 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-12 right-8 w-24 h-24 bg-white/[0.04] rounded-full blur-sm" />
      <div className="absolute top-32 left-12 w-16 h-16 bg-white/[0.06] rounded-2xl rotate-12 blur-sm" />
      <div className="absolute top-6 left-1/3 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute top-20 right-1/4 w-1.5 h-1.5 bg-white/15 rounded-full" />

      {/* Bottom curve */}
      <div className="absolute top-[20rem] sm:top-[18rem] inset-x-0 h-16">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0C360 56 1080 56 1440 0V64H0V0Z"
            fill="currentColor"
            className="text-surface-50"
          />
        </svg>
      </div>

      {/* ===== Content ===== */}
      <div className="relative flex-1 flex flex-col items-center px-5 pt-12 sm:pt-14 pb-8">
        {/* Logo + branding */}
        <div
          className={`
            text-center mb-8 transition-all duration-700 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 bg-white/15 backdrop-blur-md rounded-[1.5rem] mb-5 shadow-lg border border-white/[0.12] relative">
            <span className="text-white font-extrabold text-[1.6rem] sm:text-3xl tracking-tight">
              KAF
            </span>
            {/* Small cross accent */}
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-accent-400 rounded-md flex items-center justify-center shadow-sm">
              <Cross size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-[1.5rem] sm:text-2xl font-extrabold text-white mb-1.5 leading-tight">
            نظام الافتقاد
          </h1>
          <p className="text-primary-100/90 text-sm font-medium">
            إدارة ومتابعة بيانات أعضاء الكنيسة
          </p>
        </div>

        {/* ===== Login card ===== */}
        <div
          className={`
            w-full max-w-[26rem] transition-all duration-700 ease-out delay-150
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
        >
          <div className="bg-white rounded-3xl shadow-modal border border-surface-200/40 overflow-hidden">
            {/* Card header accent line */}
            <div className="h-1 bg-gradient-to-l from-primary-400 via-primary-500 to-primary-600" />

            <div className="p-6 sm:p-8">
              {/* Welcome text */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-surface-900">
                  مرحباً بك 👋
                </h2>
                <p className="text-sm text-surface-500 mt-1">
                  سجّل دخولك للوصول إلى النظام
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error alert */}
                {state.error && (
                  <div
                    className="
                      flex items-center gap-3 p-3.5
                      bg-danger-50 border border-danger-200 rounded-xl
                      animate-fade-in
                    "
                    role="alert"
                  >
                    <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center shrink-0">
                      <AlertCircle className="text-danger-600" size={16} />
                    </div>
                    <span className="text-danger-700 text-sm font-semibold">
                      {state.error}
                    </span>
                  </div>
                )}

                {/* Username field — using design system Input */}
                <Input
                  label="اسم المستخدم"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  size="lg"
                />

                {/* Password field — using Input with endIcon */}
                <Input
                  label="كلمة المرور"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  size="lg"
                  endIcon={
                    showPassword ? <EyeOff size={18} /> : <Eye size={18} />
                  }
                  onEndIconClick={() => setShowPassword(!showPassword)}
                />

                {/* Submit button — using design system Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={!formData.username || !formData.password}
                  icon={<LogIn size={18} />}
                  className="!h-[3.25rem] !text-base !rounded-xl mt-2"
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
            mt-auto pt-8 text-center transition-all duration-700 ease-out delay-300
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <p className="text-xs text-surface-400 font-medium">
            نظام KAF — الإصدار 1.0.0
          </p>
          <p className="text-[11px] text-surface-400/70 mt-1">
            إدارة الافتقاد والمتابعة الرعوية
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
