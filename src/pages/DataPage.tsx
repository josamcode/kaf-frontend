import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { Person, FilterOptions, PersonFormOptions } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Button,
  IconButton,
  SearchInput,
  Select,
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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const EMPTY_FILTER_OPTIONS: Pick<
  PersonFormOptions,
  "origin" | "college" | "university"
> = {
  origin: [],
  college: [],
  university: [],
};

const parseYearParam = (
  value: string | null,
): FilterOptions["year"] | undefined => {
  if (!value) return undefined;
  if (value === "graduated") return "graduated";

  const parsed = Number.parseInt(value, 10);
  if ([1, 2, 3, 4, 5].includes(parsed)) {
    return parsed as FilterOptions["year"];
  }

  return undefined;
};

const parseFiltersFromParams = (params: URLSearchParams): FilterOptions => {
  const gender = params.get("gender");
  const origin = params.get("origin")?.trim() || undefined;
  const college = params.get("college")?.trim() || undefined;
  const university = params.get("university")?.trim() || undefined;
  const search = params.get("search")?.trim() || undefined;
  const year = parseYearParam(params.get("year"));

  const pageRaw = Number.parseInt(params.get("page") || "", 10);
  const page =
    Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;

  return {
    gender: gender === "boy" || gender === "girl" ? gender : undefined,
    year,
    origin,
    college,
    university,
    search,
    page,
    limit: DEFAULT_LIMIT,
  };
};

const areFiltersEqual = (a: FilterOptions, b: FilterOptions) =>
  a.gender === b.gender &&
  a.year === b.year &&
  a.origin === b.origin &&
  a.college === b.college &&
  a.university === b.university &&
  a.search === b.search &&
  (a.page || DEFAULT_PAGE) === (b.page || DEFAULT_PAGE);

const buildParamsFromFilters = (filters: FilterOptions): URLSearchParams => {
  const params = new URLSearchParams();
  const hasQueryFilters = Boolean(
    filters.search ||
    filters.gender ||
    filters.year !== undefined ||
    filters.origin ||
    filters.college ||
    filters.university,
  );

  if (filters.search) params.set("search", filters.search);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.origin) params.set("origin", filters.origin);
  if (filters.college) params.set("college", filters.college);
  if (filters.university) params.set("university", filters.university);

  const currentPage = filters.page || DEFAULT_PAGE;
  if (!hasQueryFilters && currentPage > 1) {
    params.set("page", String(currentPage));
  }

  return params;
};

const DataPage: React.FC<DataPageProps> = ({ onAddPerson, onEditPerson }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");

  // Delete confirmation
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [filterOptions, setFilterOptions] = useState(EMPTY_FILTER_OPTIONS);

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

  const hasQueryFilters = Boolean(
    filters.search ||
    filters.gender ||
    filters.year !== undefined ||
    filters.origin ||
    filters.college ||
    filters.university,
  );

  const requestFilters = useMemo<FilterOptions>(
    () => ({
      ...filters,
      page: hasQueryFilters ? 1 : filters.page || DEFAULT_PAGE,
      limit: hasQueryFilters ? undefined : DEFAULT_LIMIT,
      noLimit: hasQueryFilters || undefined,
    }),
    [filters, hasQueryFilters],
  );

  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters((prev) => (areFiltersEqual(prev, parsed) ? prev : parsed));
    setSearchTerm(parsed.search || "");
  }, [searchParams]);

  useEffect(() => {
    const nextParams = buildParamsFromFilters(filters);
    const nextQuery = nextParams.toString();
    const currentQuery = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;

    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, location.search, setSearchParams]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await personsAPI.getFormOptions();
        if (response.success && response.formOptions) {
          setFilterOptions({
            origin: response.formOptions.origin || [],
            college: response.formOptions.college || [],
            university: response.formOptions.university || [],
          });
        } else {
          setFilterOptions(EMPTY_FILTER_OPTIONS);
        }
      } catch {
        setFilterOptions(EMPTY_FILTER_OPTIONS);
      }
    };

    loadFilterOptions();
  }, []);

  const loadPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await personsAPI.getPersons(requestFilters);

      if (response.success && response.persons) {
        const sortedPersons = sortPersonsAlphabetically(response.persons);
        const currentPage =
          response.pagination?.current || filters.page || DEFAULT_PAGE;
        const totalPages = Math.max(response.pagination?.pages || 1, 1);
        const totalPersons = response.pagination?.total ?? sortedPersons.length;

        setPagination({
          current: currentPage,
          pages: totalPages,
          total: totalPersons,
        });

        if (!hasQueryFilters && currentPage > totalPages) {
          setPersons([]);
          setFilters((prev) => ({ ...prev, page: totalPages }));
          return;
        }

        setPersons(sortedPersons);
      } else {
        setError(response.message || "فشل في تحميل البيانات");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  }, [filters.page, hasQueryFilters, requestFilters]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) =>
      key === "page"
        ? { ...prev, [key]: value }
        : { ...prev, [key]: value, page: 1 },
    );
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
    const clean = phone.replace(/[\s\-()]/g, "");
    window.open(`https://wa.me/+2${clean}`, "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") =>
    gender === "boy" ? "ولد" : "بنت";

  const formatYearLabel = (year: Person["year"] | FilterOptions["year"]) =>
    year === "graduated" ? "خريج" : String(year);

  const buildPaginationItems = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-end", totalPages] as const;
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-start",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      1,
      "ellipsis-start",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-end",
      totalPages,
    ] as const;
  };

  const activeFiltersCount = [
    filters.gender,
    filters.year,
    filters.origin,
    filters.college,
    filters.university,
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
    { value: "graduated", label: "خريج" },
  ];

  const buildFilterSelectOptions = useCallback(
    (values: string[], selectedValue?: string): SmartSelectOption[] => {
      const uniqueValues = Array.from(
        new Set(values.map((item) => item.trim())),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ar", { sensitivity: "base" }));

      if (
        selectedValue &&
        !uniqueValues.some(
          (option) =>
            option.toLocaleLowerCase() === selectedValue.toLocaleLowerCase(),
        )
      ) {
        uniqueValues.unshift(selectedValue);
      }

      return [
        { value: "", label: "\u0627\u0644\u0643\u0644" },
        ...uniqueValues.map((value) => ({ value, label: value })),
      ];
    },
    [],
  );

  const originOptions = useMemo(
    () => buildFilterSelectOptions(filterOptions.origin, filters.origin),
    [buildFilterSelectOptions, filterOptions.origin, filters.origin],
  );

  const collegeOptions = useMemo(
    () => buildFilterSelectOptions(filterOptions.college, filters.college),
    [buildFilterSelectOptions, filterOptions.college, filters.college],
  );

  const universityOptions = useMemo(
    () => buildFilterSelectOptions(filterOptions.university, filters.university),
    [buildFilterSelectOptions, filterOptions.university, filters.university],
  );

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
        <div className="flex items-center gap-2 relative">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="بحث بالاسم، الكلية، أو البلد..."
            className="flex-1"
          />

          <div className="relative">
            <IconButton
              icon={<SlidersHorizontal size={18} />}
              label="الفلاتر"
              variant={showFilters ? "primary" : "outline"}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            />

            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </div>

        {/* ===== Filters Panel ===== */}
        {showFilters && (
          <Card className="mt-3 animate-slide-down" padding="md">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
              <SmartSelect
                label="البلد"
                value={filters.origin || ""}
                options={originOptions}
                onChange={(value) => handleFilterChange("origin", value)}
                placeholder="اختر"
              />
              <SmartSelect
                label="الكلية"
                value={filters.college || ""}
                options={collegeOptions}
                onChange={(value) => handleFilterChange("college", value)}
                placeholder="اختر"
              />
              <SmartSelect
                label="�������"
                value={filters.university || ""}
                options={universityOptions}
                onChange={(value) => handleFilterChange("university", value)}
                placeholder="����"
              />
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilters({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT });
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
            description="جرّب تغيير الفلاتر أو أضف شخص جديد"
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
                              {person.year === "graduated"
                                ? formatYearLabel(person.year)
                                : `سنة ${formatYearLabel(person.year)}`}
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
                          {person.year === "graduated"
                            ? formatYearLabel(person.year)
                            : `سنة ${formatYearLabel(person.year)}`}
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
      {!hasQueryFilters && pagination.total > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 lg:mt-5 pb-2 flex-wrap">
          <span className="px-4 py-2 bg-surface-100 rounded-xl text-xs font-bold text-surface-700 min-w-[5rem] text-center">
            {pagination.current} / {pagination.pages}
          </span>

          {buildPaginationItems(pagination.current, pagination.pages).map(
            (item, index) =>
              typeof item === "number" ? (
                <Button
                  key={item}
                  variant={item === pagination.current ? "primary" : "ghost"}
                  size="xs"
                  onClick={() => handleFilterChange("page", item)}
                  className="min-w-8 px-2"
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Button>
              ) : (
                <span
                  key={`${item}-${index}`}
                  className="px-1 text-surface-400 font-bold text-sm"
                >
                  ...
                </span>
              ),
          )}
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

interface SmartSelectOption {
  value: string;
  label: string;
}

interface SmartSelectProps {
  label: string;
  value: string;
  options: SmartSelectOption[];
  placeholder?: string;
  onChange: (value: string | undefined) => void;
}

const SmartSelect: React.FC<SmartSelectProps> = ({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-surface-700">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`
            w-full h-9 px-3 rounded-xl border border-surface-300 bg-white
            flex items-center justify-between gap-2
            hover:border-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/12 focus:border-primary-500
            transition-all duration-200
          `}
        >
          <span
            className={`truncate text-sm font-medium ${
              selectedOption ? "text-surface-900" : "text-surface-400"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-surface-400 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-30 top-full mt-1 w-full bg-white border border-surface-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value || "__all"}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.value || undefined);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-right text-sm font-medium flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? "bg-primary-50 text-primary-700"
                      : "text-surface-700 hover:bg-surface-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPage;
