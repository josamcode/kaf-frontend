import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Person, FilterOptions } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Button,
  IconButton,
  SearchInput,
  Select,
  Input,
  Badge,
  Card,
  EmptyState,
  ConfirmDialog,
  Avatar,
} from "../components/ui";
import { PageLoader } from "../components/ui/Spinner";

interface DataPageProps {
  onAddPerson: () => void;
  onEditPerson: (person: Person) => void;
}

const DataPage: React.FC<DataPageProps> = ({ onAddPerson, onEditPerson }) => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete confirmation
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    limit: 20,
  });

  const { hasPermission, canAccessGender } = useAuth();

  const sortPersonsAlphabetically = (persons: Person[]): Person[] => {
    return [...persons].sort((a, b) => {
      const normalize = (name: string) =>
        name
          .replace(/أ/g, "ا")
          .replace(/إ/g, "ا")
          .replace(/آ/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/ى/g, "ي")
          .trim();
      return normalize(a.name).localeCompare(normalize(b.name), "ar", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  const loadPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personsAPI.getPersons(filters);
      if (response.success && response.persons) {
        setPersons(sortPersonsAlphabetically(response.persons));
      } else {
        setError(response.message || "فشل في تحميل البيانات");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFilterChange("search", value || undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPerson) return;
    setDeleteLoading(true);
    try {
      const response = await personsAPI.deletePerson(deletingPerson._id);
      if (response.success) {
        setDeletingPerson(null);
        loadPersons();
      } else {
        setError(response.message || "فشل في حذف الشخص");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCall = (phone: string) => window.open(`tel:${phone}`, "_self");
  const handleViewPerson = (personId: string) =>
    navigate(`/persons/${personId}`);

  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/[\\s\-()]/g, "");
    window.open(`https://wa.me/+2${clean}`, "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") =>
    gender === "boy" ? "ولد" : "بنت";

  const formatYearLabel = (year: Person["year"] | FilterOptions["year"]) =>
    year === "graduated" ? "\u062e\u0631\u064a\u062c" : String(year);

  const activeFiltersCount = [
    filters.gender,
    filters.year,
    filters.origin,
    filters.college,
  ].filter(Boolean).length;

  const genderOptions = [
    { value: "", label: "الكل" },
    { value: "boy", label: "أولاد" },
    { value: "girl", label: "بنات" },
  ];

  const yearOptions = [
    { value: "", label: "الكل" },
    { value: "1", label: "السنة الأولى" },
    { value: "2", label: "السنة الثانية" },
    { value: "3", label: "السنة الثالثة" },
    { value: "4", label: "السنة الرابعة" },
    { value: "5", label: "السنة الخامسة" },
    { value: "graduated", label: "\u062e\u0631\u064a\u062c" },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* ===== Page Header ===== */}
      <div className="mb-4 lg:mb-5">
        <div className="flex items-center lg:items-start justify-between gap-3 mb-3 lg:mb-4">
          <div>
            <h1 className="text-lg lg:text-xl font-extrabold text-surface-900">
              بيانات المخدومين
            </h1>
            <p className="text-xs lg:text-sm hidden lg:block text-surface-500 mt-0.5 font-medium">
              إدارة ومتابعة بيانات المخدومين
            </p>
          </div>
          {hasPermission("create_data") && (
            <Button
              onClick={onAddPerson}
              icon={<Plus size={17} />}
              size="md"
              className="shrink-0"
            >
              <span className="hidden sm:inline">إضافة شخص</span>
              <span className="sm:hidden">إضافة</span>
            </Button>
          )}
        </div>

        {/* ===== Search & Filter Bar ===== */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="بحث بالاسم، الكلية، أو البلد..."
            className="flex-1"
          />
          <IconButton
            icon={<SlidersHorizontal size={18} />}
            label="الفلاتر"
            variant={showFilters ? "primary" : "outline"}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative ${showFilters ? "" : ""}`}
          />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {/* ===== Filters Panel ===== */}
        {showFilters && (
          <Card className="mt-3 animate-slide-down" padding="md">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="النوع"
                value={filters.gender || ""}
                onChange={(e) =>
                  handleFilterChange("gender", e.target.value || undefined)
                }
                options={genderOptions}
                size="sm"
              />
              <Select
                label="السنة"
                value={filters.year?.toString() || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "year",
                    e.target.value
                      ? e.target.value === "graduated"
                        ? "graduated"
                        : parseInt(e.target.value)
                      : undefined,
                  )
                }
                options={yearOptions}
                size="sm"
              />
              <Input
                label="البلد"
                placeholder="بحث..."
                value={filters.origin || ""}
                onChange={(e) =>
                  handleFilterChange("origin", e.target.value || undefined)
                }
                size="sm"
              />
              <Input
                label="الكلية"
                placeholder="بحث..."
                value={filters.college || ""}
                onChange={(e) =>
                  handleFilterChange("college", e.target.value || undefined)
                }
                size="sm"
              />
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilters({ page: 1, limit: 20 });
                  setSearchTerm("");
                }}
                className="mt-3 text-xs font-bold text-danger-600 hover:text-danger-700 flex items-center gap-1 transition-colors"
              >
                <X size={12} />
                مسح كل الفلاتر ({activeFiltersCount})
              </button>
            )}
          </Card>
        )}
      </div>

      {/* ===== Error Alert ===== */}
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

      {/* ===== Data Content ===== */}
      <div className="flex-1">
        {loading ? (
          <PageLoader text="جاري تحميل البيانات..." />
        ) : persons.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="لا توجد بيانات متاحة"
            description="جرب تغيير الفلاتر أو أضف شخص جديد"
            action={
              hasPermission("create_data") ? (
                <Button
                  onClick={onAddPerson}
                  icon={<Plus size={16} />}
                  size="sm"
                >
                  إضافة شخص
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* ===== Mobile Cards ===== */}
            <div className="block lg:hidden space-y-2.5">
              {persons.map((person, index) => (
                <Card
                  key={person._id}
                  padding="none"
                  className="animate-fade-in-up"
                  style={
                    {
                      animationDelay: `${Math.min(index * 30, 300)}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="p-3.5">
                    {/* Top row — name + actions */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                        onClick={() => handleViewPerson(person._id)}
                      >
                        <Avatar
                          name={person.name}
                          size="md"
                          className={
                            person.gender === "boy"
                              ? "!bg-blue-100 !text-blue-600"
                              : "!bg-pink-100 !text-pink-600"
                          }
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-surface-900 text-[14px] leading-tight truncate">
                            {person.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge
                              variant={
                                person.gender === "boy" ? "info" : "danger"
                              }
                              size="xs"
                            >
                              {getGenderText(person.gender)}
                            </Badge>
                            <Badge variant="primary" size="xs">
                              سنة {formatYearLabel(person.year)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0 shrink-0">
                        <IconButton
                          icon={<Eye size={15} />}
                          label="عرض"
                          size="sm"
                          onClick={() => handleViewPerson(person._id)}
                        />
                        {hasPermission("edit_data") &&
                          canAccessGender(person.gender) && (
                            <IconButton
                              icon={<Edit size={15} />}
                              label="تعديل"
                              size="sm"
                              variant="ghost"
                              onClick={() => onEditPerson(person)}
                              className="!text-primary-600"
                            />
                          )}
                        {hasPermission("delete_data") &&
                          canAccessGender(person.gender) && (
                            <IconButton
                              icon={<Trash2 size={15} />}
                              label="حذف"
                              size="sm"
                              variant="danger"
                              onClick={() => setDeletingPerson(person)}
                            />
                          )}
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1 mb-3">
                      <InfoRow icon={<GraduationCap size={13} />}>
                        {person.college || "غير محدد"}
                      </InfoRow>
                      <InfoRow icon={<MapPin size={13} />}>
                        {person.origin}
                      </InfoRow>
                      <InfoRow icon={<Phone size={13} />}>
                        <span dir="ltr">{person.phone}</span>
                      </InfoRow>
                    </div>

                    {/* Contact buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCall(person.phone)}
                        className="
                          flex items-center justify-center gap-1.5 py-2.5
                          bg-emerald-600 text-white rounded-xl text-[13px] font-bold
                          hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.97]
                          transition-all duration-200 shadow-sm
                        "
                      >
                        <Phone size={14} />
                        <span>اتصال</span>
                      </button>
                      <button
                        onClick={() => handleWhatsApp(person.phone)}
                        className="
                          flex items-center justify-center gap-1.5 py-2.5
                          bg-green-600 text-white rounded-xl text-[13px] font-bold
                          hover:bg-green-700 active:bg-green-800 active:scale-[0.97]
                          transition-all duration-200 shadow-sm
                        "
                      >
                        <MessageCircle size={14} />
                        <span>واتساب</span>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* ===== Desktop Table ===== */}
            <Card padding="none" className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50/80">
                      {[
                        "الاسم",
                        "النوع",
                        "السنة",
                        "الكلية",
                        "البلد",
                        "الهاتف",
                        "الإجراءات",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-right text-[11px] font-bold text-surface-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {persons.map((person) => (
                      <tr
                        key={person._id}
                        className="hover:bg-surface-50/60 transition-colors group"
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => handleViewPerson(person._id)}
                          >
                            <Avatar
                              name={person.name}
                              size="sm"
                              className={
                                person.gender === "boy"
                                  ? "!bg-blue-100 !text-blue-600"
                                  : "!bg-pink-100 !text-pink-600"
                              }
                            />
                            <div>
                              <p className="font-bold text-surface-900 text-[13px] leading-tight">
                                {person.name}
                              </p>
                              {person.birthDate && (
                                <p className="text-[11px] text-surface-500 mt-0.5 flex items-center gap-1">
                                  <Calendar size={10} />
                                  {formatDate(person.birthDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Gender */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              person.gender === "boy" ? "info" : "danger"
                            }
                            size="xs"
                          >
                            {getGenderText(person.gender)}
                          </Badge>
                        </td>

                        {/* Year */}
                        <td className="px-4 py-3 text-[13px] text-surface-700 font-semibold">
                          سنة {formatYearLabel(person.year)}
                        </td>

                        {/* College */}
                        <td className="px-4 py-3">
                          <p className="text-[13px] text-surface-700 font-medium">
                            {person.college || "—"}
                          </p>
                          {person.university && (
                            <p className="text-[11px] text-surface-500 mt-0.5 flex items-center gap-1">
                              <GraduationCap size={10} />
                              {person.university}
                            </p>
                          )}
                        </td>

                        {/* Origin */}
                        <td className="px-4 py-3">
                          <p className="text-[13px] text-surface-700 font-medium flex items-center gap-1">
                            <MapPin size={11} className="text-surface-400" />
                            {person.origin}
                          </p>
                          {person.residence && (
                            <p className="text-[11px] text-surface-500 mt-0.5">
                              {person.residence}
                            </p>
                          )}
                        </td>

                        {/* Phone */}
                        <td
                          className="px-4 py-3 text-[13px] text-surface-700 font-medium"
                          dir="ltr"
                        >
                          {person.phone}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            <IconButton
                              icon={<Eye size={15} />}
                              label="عرض"
                              size="xs"
                              onClick={() => handleViewPerson(person._id)}
                            />
                            <IconButton
                              icon={<Phone size={15} />}
                              label="اتصال"
                              size="xs"
                              onClick={() => handleCall(person.phone)}
                              className="!text-emerald-600 hover:!bg-emerald-50"
                            />
                            <IconButton
                              icon={<MessageCircle size={15} />}
                              label="واتساب"
                              size="xs"
                              onClick={() => handleWhatsApp(person.phone)}
                              className="!text-green-600 hover:!bg-green-50"
                            />
                            {hasPermission("edit_data") &&
                              canAccessGender(person.gender) && (
                                <IconButton
                                  icon={<Edit size={15} />}
                                  label="تعديل"
                                  size="xs"
                                  onClick={() => onEditPerson(person)}
                                  className="!text-primary-600 hover:!bg-primary-50"
                                />
                              )}
                            {hasPermission("delete_data") &&
                              canAccessGender(person.gender) && (
                                <IconButton
                                  icon={<Trash2 size={15} />}
                                  label="حذف"
                                  size="xs"
                                  variant="danger"
                                  onClick={() => setDeletingPerson(person)}
                                />
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ===== Pagination ===== */}
      {persons.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 lg:mt-5 pb-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={15} />}
            onClick={() =>
              handleFilterChange("page", Math.max(1, (filters.page || 1) - 1))
            }
            disabled={!filters.page || filters.page <= 1}
          >
            السابق
          </Button>
          <span className="px-4 py-2 bg-surface-100 rounded-xl text-xs font-bold text-surface-700 min-w-[5rem] text-center">
            صفحة {filters.page || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={15} />}
            iconPosition="end"
            onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
            disabled={persons.length < (filters.limit || 20)}
          >
            التالي
          </Button>
        </div>
      )}

      {/* ===== Delete Confirmation ===== */}
      <ConfirmDialog
        isOpen={!!deletingPerson}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="حذف الشخص"
        message={`هل أنت متأكد من حذف "${deletingPerson?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteLoading}
      />
    </div>
  );
};

// ===== Helper sub-component =====
const InfoRow: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div className="flex items-center gap-2 text-[12px] text-surface-600 font-medium">
    <span className="text-surface-400 shrink-0">{icon}</span>
    <span className="truncate">{children}</span>
  </div>
);

export default DataPage;
