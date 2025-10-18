import React, { useState, useEffect } from "react";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user && state.token) {
      navigate("/");
    }
  }, [state.user, state.token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate("/");
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-3">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-3xl lg:text-4xl px-6 py-4 rounded-2xl inline-block mb-4 shadow-lg">
            KAF
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
            نظام إدارة الافتقاد
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            تسجيل الدخول للوصول إلى النظام
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            {/* Error Message */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-reverse space-x-3">
                <span className="text-red-700 text-sm">{state.error}</span>
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base"
                placeholder="أدخل اسم المستخدم"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base"
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.username || !formData.password}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-reverse space-x-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <span>جاري تسجيل الدخول...</span>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
