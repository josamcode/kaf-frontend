import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  MapPin,
  GraduationCap,
  X,
  MessageCircle,
  KeySquare,
  Shield,
} from "lucide-react";
import { Stats, StudyYear } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Select, Card, EmptyState, Badge } from "../components/ui";
import { PageLoader } from "../components/ui/Spinner";

const clampPct = (n: number) => Math.max(0, Math.min(100, n));
const maxBy = (arr: Array<{ count: number }>) =>
  arr.length ? Math.max(...arr.map((x) => x.count || 0)) : 0;

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("");

  const { canAccessGender } = useAuth();

  const navigateToDataWithFilter = (filters: {
    origin?: string;
    college?: string;
    university?: string;
    year?: StudyYear;
  }) => {
    const params = new URLSearchParams();
    if (filters.origin) params.set("origin", filters.origin);
    if (filters.college) params.set("college", filters.college);
    if (filters.university) params.set("university", filters.university);
    if (filters.year !== undefined) params.set("year", String(filters.year));
    navigate(`/data?${params.toString()}`);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter]);

  const formatYearLabel = (year: Stats["byYear"][number]["_id"]) =>
    year === "graduated" ? "\u062e\u0631\u064a\u062c" : `سنة ${year}`;

  const yearChartData =
    stats?.byYear.map((item) => ({
      year: formatYearLabel(item._id),
      count: item.count,
    })) || [];

  const genderChartData = [
    { name: "أولاد", value: stats?.boys || 0, color: "#3B82F6" },
    { name: "بنات", value: stats?.girls || 0, color: "#EC4899" },
  ];

  const genderOptions = useMemo(() => {
    // if auth exposes gender access, hide unavailable options without breaking backend
    // fallback: show all
    const canBoy =
      typeof canAccessGender === "function" ? canAccessGender("boy") : true;
    const canGirl =
      typeof canAccessGender === "function" ? canAccessGender("girl") : true;

    const opts = [{ value: "", label: "الكل" }];

    if (canBoy) opts.push({ value: "boy", label: "أولاد فقط" });
    if (canGirl) opts.push({ value: "girl", label: "بنات فقط" });

    // if user only has one gender access, default to it (but keep UX stable)
    if (opts.length === 2 && genderFilter === "") {
      // do nothing here; avoid auto-changing user selection
    }

    return opts;
  }, [canAccessGender, genderFilter]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-900 text-white px-3.5 py-2.5 rounded-xl text-sm shadow-elevated border border-surface-800">
          <p className="font-bold text-[13px]">{label}</p>
          <p className="text-surface-300 text-xs mt-0.5">
            {payload[0].value} شخص
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Pie Tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-900 text-white px-3.5 py-2.5 rounded-xl text-sm shadow-elevated border border-surface-800">
          <p className="font-bold text-[13px]">{payload[0].name}</p>
          <p className="text-surface-300 text-xs mt-0.5">
            {payload[0].value} شخص
          </p>
        </div>
      );
    }
    return null;
  };

  const NotesSummary = () => {
    if (!stats) return null;

    const total = stats.total || 0;
    const notesTotal = stats.notesTotal || 0;
    const personsWithNotes = stats.personsWithNotes || 0;

    const pctPersonsWithNotes =
      total > 0 ? Math.round((personsWithNotes / total) * 100) : 0;

    const avgNotesPerPerson = total > 0 ? notesTotal / total : 0;
    const avgNotesPerNotedPerson =
      personsWithNotes > 0 ? notesTotal / personsWithNotes : 0;

    return (
      <Card padding="none">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <MessageCircle size={15} className="text-surface-700" />
            </div>
            <div>
              <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                ملخص الملاحظات
              </h3>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                نشاط كتابة الملاحظات على المخدومين
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat
              label="إجمالي الملاحظات"
              value={notesTotal}
              hint="كل الملاحظات المسجلة"
            />
            <MiniStat
              label="مخدومين عليهم ملاحظات"
              value={personsWithNotes}
              hint={`${pctPersonsWithNotes}% من الإجمالي`}
            />
          </div>
        </div>
      </Card>
    );
  };

  const CustomFieldsSummary = () => {
    if (!stats) return null;

    const total = stats.total || 0;
    const personsWithCustomFields = stats.personsWithCustomFields || 0;
    const customFieldsTotalEntries = stats.customFieldsTotalEntries || 0;
    const customFieldKeysCount = stats.customFieldKeysCount || 0;

    const pctWithCustom =
      total > 0 ? Math.round((personsWithCustomFields / total) * 100) : 0;

    return (
      <Card padding="none">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <KeySquare size={15} className="text-surface-700" />
            </div>
            <div>
              <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                الحقول المخصصة
              </h3>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                نظرة على البيانات الإضافية
              </p>
            </div>
          </div>

          {/* Key details */}
          {Array.isArray(stats.customFieldDetails) &&
            stats.customFieldDetails.length > 0 && (
              <div className="mt-4">
                <p className="text-[12px] font-extrabold text-surface-700 mb-2">
                  تفاصيل أهم المفاتيح
                </p>
                <div className="space-y-2.5">
                  {stats.customFieldDetails
                    .slice(0, 6)
                    .map((d: any, idx: number) => (
                      <div
                        key={`${d._id}-${idx}`}
                        className="rounded-xl border border-surface-100 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-extrabold text-surface-900 truncate">
                            {d._id}
                          </span>
                        </div>

                        {Array.isArray(d.topValues) &&
                          d.topValues.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1.5">
                                {d.topValues
                                  .slice(0, 5)
                                  .map((v: any, i: number) => (
                                    <span
                                      key={`${d._id}-${i}`}
                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-100 text-surface-700 text-[11px] font-semibold"
                                    >
                                      <span className="max-w-[140px] truncate">
                                        {v.value}
                                      </span>
                                      <Badge variant="neutral" size="xs">
                                        {v.count}
                                      </Badge>
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </Card>
    );
  };

  const TopSimpleList = ({
    title,
    subtitle,
    icon,
    items,
    topN = 5,
    accent = "primary",
    onItemClick,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: Array<{ _id: any; count: number }>;
    topN?: number;
    accent?: "primary" | "indigo" | "emerald" | "amber" | "surface";
    onItemClick?: (value: string) => void;
  }) => {
    const sliced = (items || []).slice(0, topN);
    const maxCount = maxBy(items || []);

    const accentStyles: Record<
      string,
      { iconBg: string; iconColor: string; bar: string }
    > = {
      primary: {
        iconBg: "bg-primary-100",
        iconColor: "text-primary-700",
        bar: "bg-gradient-to-r from-primary-400 to-primary-600",
      },
      indigo: {
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-700",
        bar: "bg-gradient-to-r from-indigo-400 to-indigo-600",
      },
      emerald: {
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-700",
        bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      },
      amber: {
        iconBg: "bg-amber-100",
        iconColor: "text-amber-700",
        bar: "bg-gradient-to-r from-amber-400 to-amber-500",
      },
      surface: {
        iconBg: "bg-surface-100",
        iconColor: "text-surface-700",
        bar: "bg-gradient-to-r from-surface-700 to-surface-900",
      },
    };

    const st = accentStyles[accent];

    return (
      <Card padding="none">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${st.iconBg}`}
            >
              <span className={st.iconColor}>{icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                {title}
              </h3>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {sliced.length === 0 ? (
            <div className="text-[12px] font-semibold text-surface-500">
              لا توجد بيانات
            </div>
          ) : (
            <div className="space-y-3">
              {sliced.map((it, index) => {
                const percentage =
                  maxCount > 0 ? (it.count / maxCount) * 100 : 0;
                const rawValue = String(it._id ?? "").trim();
                const isClickable = Boolean(onItemClick && rawValue);
                return (
                  <div
                    key={`${it._id}-${index}`}
                    className={`flex items-center gap-2.5 ${
                      isClickable ? "cursor-pointer" : ""
                    }`}
                    onClick={
                      isClickable && onItemClick
                        ? () => onItemClick(rawValue)
                        : undefined
                    }
                  >
                    <div
                      className={`
                        w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0
                        ${
                          index === 0
                            ? "bg-surface-900 text-white"
                            : index === 1
                              ? "bg-surface-100 text-surface-700"
                              : "bg-surface-100 text-surface-500"
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-surface-800 truncate">
                          {String(it._id ?? "").trim() || "—"}
                        </span>
                        <span className="text-[13px] font-bold text-surface-900 shrink-0">
                          {it.count}
                        </span>
                      </div>
                      <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`${st.bar} h-full rounded-full transition-all duration-700 ease-spring`}
                          style={{ width: `${clampPct(percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const ContributorsCards = () => {
    if (!stats) return null;

    const unique = stats.uniqueServantsContributed || 0;
    const topServants = (stats.topServants || []).slice(0, 5);
    const topNoteAuthors = (stats.topNoteAuthors || []).slice(0, 5);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <Card padding="none">
          <div className="p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                  <Shield size={15} className="text-surface-700" />
                </div>
                <div>
                  <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                    المساهمون
                  </h3>
                  <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                    نشاط إضافة البيانات
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="xs">
                {unique} خادم
              </Badge>
            </div>

            {topServants.length === 0 ? (
              <div className="text-[12px] font-semibold text-surface-500">
                لا توجد بيانات
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                {topServants.map((s: any, idx: number) => {
                  const maxCount = maxBy(stats.topServants || []);
                  const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                  return (
                    <div
                      key={`${s._id}-${idx}`}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-surface-100 text-surface-600 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-surface-800 truncate">
                            {String(s._id ?? "").trim() || "—"}
                          </span>
                          <span className="text-[13px] font-bold text-surface-900 shrink-0">
                            {s.count}
                          </span>
                        </div>
                        <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-surface-700 to-surface-900 h-full rounded-full transition-all duration-700 ease-spring"
                            style={{ width: `${clampPct(pct)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card padding="none">
          <div className="p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                <MessageCircle size={15} className="text-surface-700" />
              </div>
              <div>
                <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                  أكثر من كتب ملاحظات
                </h3>
                <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                  Top {Math.min(5, topNoteAuthors.length || 0)}
                </p>
              </div>
            </div>

            {topNoteAuthors.length === 0 ? (
              <div className="text-[12px] font-semibold text-surface-500">
                لا توجد بيانات
              </div>
            ) : (
              <div className="space-y-2.5">
                {topNoteAuthors.map((s: any, idx: number) => {
                  const maxCount = maxBy(stats.topNoteAuthors || []);
                  const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                  return (
                    <div
                      key={`${s._id}-${idx}`}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-surface-100 text-surface-600 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-surface-800 truncate">
                            {String(s._id ?? "").trim() || "—"}
                          </span>
                          <span className="text-[13px] font-bold text-surface-900 shrink-0">
                            {s.count}
                          </span>
                        </div>
                        <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-surface-700 to-surface-900 h-full rounded-full transition-all duration-700 ease-spring"
                            style={{ width: `${clampPct(pct)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ===== Page Header ===== */}
      <div className="flex items-center lg:items-start justify-between gap-3 mb-4 lg:mb-5">
        <div>
          <h1 className="text-sm lg:text-xl font-extrabold text-surface-900">
            التحليلات
          </h1>
          <p className="text-xs hidden lg:block lg:text-sm text-surface-500 mt-0.5 font-medium">
            نظرة شاملة على البيانات والإحصائيات
          </p>
        </div>
        <Select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          options={genderOptions}
          size="sm"
          fullWidth={false}
          containerClassName="w-32 lg:w-36"
        />
      </div>

      {/* ===== Error ===== */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-danger-50 border border-danger-200/60 rounded-xl text-danger-700 text-sm font-semibold mb-4 animate-fade-in">
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 p-0.5 hover:bg-danger-100 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <PageLoader text="جاري تحميل الإحصائيات..." />
      ) : stats ? (
        <div className="space-y-4 lg:space-y-5">
          {/* ===== Stat Cards ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
            <StatCard
              title="إجمالي المخدومين"
              value={stats.total}
              icon={<Users size={19} className="text-white" />}
              iconBg="bg-gradient-to-br from-primary-500 to-primary-700"
              trend={stats.total > 0 ? "active" : undefined}
            />
            <StatCard
              title="الأولاد"
              value={stats.boys}
              icon={<UserCheck size={19} className="text-white" />}
              iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
              percentage={
                stats.total > 0
                  ? Math.round((stats.boys / stats.total) * 100)
                  : 0
              }
            />
            <StatCard
              title="البنات"
              value={stats.girls}
              icon={<UserX size={19} className="text-white" />}
              iconBg="bg-gradient-to-br from-pink-400 to-pink-600"
              percentage={
                stats.total > 0
                  ? Math.round((stats.girls / stats.total) * 100)
                  : 0
              }
            />
            <StatCard
              title="أكثر البلدان"
              value={stats.topOrigins?.[0]?.count || 0}
              subtitle={stats.topOrigins?.[0]?._id}
              icon={<MapPin size={19} className="text-white" />}
              iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
            />
          </div>

          {/* ===== Charts Row ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {/* Gender Distribution */}
            <Card padding="none">
              <div className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-surface-800 text-[14px] lg:text-[15px]">
                    توزيع حسب النوع
                  </h3>
                </div>
                <p className="text-[11px] text-surface-400 font-medium mb-3">
                  نسبة الأولاد والبنات من إجمالي المخدومين
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex justify-center gap-5 mt-1">
                  {genderChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-bold text-surface-600">
                        {item.name}
                      </span>
                      <Badge variant="neutral" size="xs">
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Year Distribution */}
            <Card padding="none">
              <div className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-surface-800 text-[14px] lg:text-[15px]">
                    توزيع حسب السنة الدراسية
                  </h3>
                </div>
                <p className="text-[11px] text-surface-400 font-medium mb-3">
                  عدد المخدومين في كل سنة دراسية
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={yearChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e7e5e4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "#78716c", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ===== Lists Row ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            <TopSimpleList
              title="أكثر البلدان الأصلية"
              subtitle="أعلى 5 بلدان"
              icon={<MapPin size={15} />}
              items={stats.topOrigins || []}
              topN={5}
              accent="primary"
              onItemClick={(origin) => navigateToDataWithFilter({ origin })}
            />

            {/* Year Details */}
            <Card padding="none">
              <div className="p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <GraduationCap size={15} className="text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-800 text-[14px] leading-none">
                      تفاصيل السنوات الدراسية
                    </h3>
                    <p className="text-[11px] text-surface-400 font-medium mt-0.5">
                      توزيع المخدومين حسب السنة
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.byYear.map((year, index) => {
                    const maxCount = maxBy(stats.byYear);
                    const percentage =
                      maxCount > 0 ? (year.count / maxCount) * 100 : 0;
                    const pctOfTotal =
                      stats.total > 0
                        ? Math.round((year.count / stats.total) * 100)
                        : 0;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() =>
                          navigateToDataWithFilter({ year: year._id })
                        }
                      >
                        <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center shrink-0">
                          <GraduationCap size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-surface-800">
                              {formatYearLabel(year._id)}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="neutral" size="xs">
                                {pctOfTotal}%
                              </Badge>
                              <span className="text-[13px] font-bold text-surface-900">
                                {year.count}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-700 ease-spring"
                              style={{ width: `${clampPct(percentage)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* ===== More Analytics ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            <TopSimpleList
              title="أكثر الكليات"
              subtitle="أعلى 5 كليات"
              icon={<GraduationCap size={15} />}
              items={(stats.topColleges as any) || []}
              topN={5}
              accent="amber"
              onItemClick={(college) => navigateToDataWithFilter({ college })}
            />
            <TopSimpleList
              title="أكثر الجامعات"
              subtitle="أعلى 5 جامعات"
              icon={<GraduationCap size={15} />}
              items={(stats.topUniversities as any) || []}
              topN={5}
              accent="indigo"
              onItemClick={(university) =>
                navigateToDataWithFilter({ university })
              }
            />
          </div>

          <ContributorsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            <NotesSummary />
            <CustomFieldsSummary />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="لا توجد بيانات متاحة"
          description="لا يوجد بيانات كافية لعرض الإحصائيات"
        />
      )}
    </div>
  );
};

// ===== Stat Card Component =====
interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  percentage?: number;
  trend?: "active";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  percentage,
  trend,
}) => (
  <Card padding="none" className="overflow-hidden">
    <div className="p-3.5 lg:p-4">
      <div className="flex items-start gap-2.5">
        <div
          className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] lg:text-xs font-bold text-surface-500 leading-none">
            {title}
          </p>
          <p className="text-xl lg:text-2xl font-extrabold text-surface-900 mt-1 leading-none tracking-tight">
            {Number(value || 0).toLocaleString("ar-EG")}
          </p>
          {subtitle && (
            <p className="text-[10px] text-surface-400 font-semibold mt-1 truncate">
              {subtitle}
            </p>
          )}
          {percentage !== undefined && percentage > 0 && (
            <div className="mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-surface-100 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${iconBg}`}
                    style={{ width: `${clampPct(percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-surface-500 shrink-0">
                  {percentage}%
                </span>
              </div>
            </div>
          )}
          {trend === "active" && (
            <div className="mt-1.5">
              <span className="text-[10px] font-bold text-surface-400">
                نشط
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const MiniStat = ({
  label,
  value,
  hint,
  isFloat,
}: {
  label: string;
  value: number;
  hint?: string;
  isFloat?: boolean;
}) => {
  const display =
    isFloat === true
      ? (Number.isFinite(value) ? value : 0).toFixed(2)
      : Math.round(Number.isFinite(value) ? value : 0).toLocaleString("ar-EG");

  return (
    <div className="rounded-xl border border-surface-100 bg-white p-3">
      <p className="text-[11px] font-extrabold text-surface-600">{label}</p>
      <p className="text-[16px] font-extrabold text-surface-900 mt-1 leading-none">
        {display}
      </p>
      {hint && (
        <p className="text-[10px] text-surface-400 font-semibold mt-1 truncate">
          {hint}
        </p>
      )}
    </div>
  );
};

export default AnalysisPage;
