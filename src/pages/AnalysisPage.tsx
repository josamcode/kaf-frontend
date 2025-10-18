import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { Stats } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AnalysisPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("");

  const { canAccessGender } = useAuth();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = genderFilter ? { gender: genderFilter } : {};
      const response = await personsAPI.getStats(filters);

      if (response.success && response.stats) {
        setStats(response.stats);
      } else {
        setError(response.message || "فشل في تحميل الإحصائيات");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [genderFilter]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const yearChartData =
    stats?.byYear.map((item) => ({
      year: `السنة ${item._id}`,
      count: item.count,
    })) || [];

  const originChartData =
    stats?.topOrigins.slice(0, 5).map((item) => ({
      name: item._id,
      count: item.count,
    })) || [];

  const genderChartData = [
    { name: "أولاد", value: stats?.boys || 0, color: "#3B82F6" },
    { name: "بنات", value: stats?.girls || 0, color: "#EC4899" },
  ];

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              التحليلات والإحصائيات
            </h1>
            <p className="text-gray-600 mt-1">
              نظرة شاملة على بيانات المخدومين
            </p>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 ml-2">
              فلتر:
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              <option value="boy">أولاد فقط</option>
              <option value="girl">بنات فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 mr-3">جاري تحميل الإحصائيات...</span>
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي المخدومين"
              value={stats.total}
              icon={<Users className="text-white" size={24} />}
              color="bg-primary-500"
            />
            <StatCard
              title="عدد الأولاد"
              value={stats.boys}
              icon={<UserCheck className="text-white" size={24} />}
              color="bg-blue-500"
            />
            <StatCard
              title="عدد البنات"
              value={stats.girls}
              icon={<UserX className="text-white" size={24} />}
              color="bg-pink-500"
            />
            <StatCard
              title="أكثر البلدان"
              value={stats.topOrigins[0]?.count || 0}
              icon={<MapPin className="text-white" size={24} />}
              color="bg-green-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gender Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                توزيع حسب النوع
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {genderChartData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                توزيع حسب السنة الدراسية
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Origins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                أكثر البلدان الأصلية
              </h3>
              <div className="space-y-3">
                {stats.topOrigins.slice(0, 5).map((origin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium ml-2">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{origin._id}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {origin.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                تفاصيل السنوات الدراسية
              </h3>
              <div className="space-y-3">
                {stats.byYear.map((year, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="text-gray-400 ml-2" size={20} />
                      <span className="text-gray-700">سنة {year._id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (year.count /
                                Math.max(...stats.byYear.map((y) => y.count))) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-left">
                        {year.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">لا توجد بيانات متاحة للعرض</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
