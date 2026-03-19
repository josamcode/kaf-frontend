import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpLeft,
  Calendar,
  MapPin,
  SlidersHorizontal,
  StickyNote,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  NoteFilterOptions,
  NoteQueryFilters,
  PersonNote,
  StudyYear,
} from "../types";
import { personsAPI } from "../services/api";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  SearchInput,
  Select,
} from "../components/ui";
import { PageLoader } from "../components/ui/Spinner";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const EMPTY_FILTER_OPTIONS: NoteFilterOptions = {
  origins: [],
  authors: [],
};

const parseYearParam = (value: string | null): StudyYear | undefined => {
  if (!value) return undefined;
  if (value === "graduated") return "graduated";

  const parsed = Number.parseInt(value, 10);
  if ([1, 2, 3, 4, 5].includes(parsed)) {
    return parsed as StudyYear;
  }

  return undefined;
};

const parseFiltersFromParams = (
  params: URLSearchParams,
): NoteQueryFilters => {
  const gender = params.get("gender");
  const pageRaw = Number.parseInt(params.get("page") || "", 10);
  const page =
    Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;

  return {
    search: params.get("search")?.trim() || undefined,
    gender: gender === "boy" || gender === "girl" ? gender : undefined,
    year: parseYearParam(params.get("year")),
    origin: params.get("origin")?.trim() || undefined,
    authorId: params.get("authorId")?.trim() || undefined,
    page,
    limit: DEFAULT_LIMIT,
  };
};

const areFiltersEqual = (a: NoteQueryFilters, b: NoteQueryFilters) =>
  a.search === b.search &&
  a.gender === b.gender &&
  a.year === b.year &&
  a.origin === b.origin &&
  a.authorId === b.authorId &&
  (a.page || DEFAULT_PAGE) === (b.page || DEFAULT_PAGE);

const buildParamsFromFilters = (filters: NoteQueryFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.origin) params.set("origin", filters.origin);
  if (filters.authorId) params.set("authorId", filters.authorId);
  if ((filters.page || DEFAULT_PAGE) > 1) {
    params.set("page", String(filters.page));
  }

  return params;
};

const buildPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
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

const getGenderText = (gender: "boy" | "girl") =>
  gender === "boy" ? "ولد" : "بنت";

const formatYearLabel = (year: StudyYear) =>
  year === "graduated" ? "خريج" : String(year);

const formatDateTime = (value: string) => new Date(value).toLocaleString("ar-EG");

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const [filters, setFilters] = useState<NoteQueryFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const [notes, setNotes] = useState<PersonNote[]>([]);
  const [filterOptions, setFilterOptions] =
    useState<NoteFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [pagination, setPagination] = useState({
    current: DEFAULT_PAGE,
    pages: 1,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState<PersonNote | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const requestFilters = useMemo<NoteQueryFilters>(
    () => ({
      ...filters,
      page: filters.page || DEFAULT_PAGE,
      limit: filters.limit || DEFAULT_LIMIT,
    }),
    [filters],
  );

  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters((prev) => (areFiltersEqual(prev, parsed) ? prev : parsed));
    setSearchTerm(parsed.search || "");
  }, [searchParams]);

  useEffect(() => {
    const nextParams = buildParamsFromFilters(filters);
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await personsAPI.getNoteFilterOptions();
        if (response.success && response.filterOptions) {
          setFilterOptions(response.filterOptions);
          return;
        }
      } catch {
        // Ignore filter option errors so the list still loads.
      }

      setFilterOptions(EMPTY_FILTER_OPTIONS);
    };

    loadFilterOptions();
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await personsAPI.getNotes(requestFilters);
      if (response.success && response.notes) {
        setNotes(response.notes);
        setPagination({
          current: response.pagination?.current || requestFilters.page || 1,
          pages: Math.max(response.pagination?.pages || 1, 1),
          total: response.pagination?.total || 0,
        });
      } else {
        setNotes([]);
        setPagination({ current: DEFAULT_PAGE, pages: 1, total: 0 });
        setError(response.message || "فشل في تحميل الملاحظات");
      }
    } catch (err: any) {
      setNotes([]);
      setPagination({ current: DEFAULT_PAGE, pages: 1, total: 0 });
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [requestFilters]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const authorOptions = useMemo(
    () => [
      { value: "", label: "الكل" },
      ...filterOptions.authors.map((author) => ({
        value: author.value,
        label: author.label,
      })),
    ],
    [filterOptions.authors],
  );

  const originOptions = useMemo(
    () => [
      { value: "", label: "الكل" },
      ...filterOptions.origins.map((origin) => ({
        value: origin,
        label: origin,
      })),
    ],
    [filterOptions.origins],
  );

  const yearOptions = [
    { value: "", label: "الكل" },
    { value: "1", label: "السنة الأولى" },
    { value: "2", label: "السنة الثانية" },
    { value: "3", label: "السنة الثالثة" },
    { value: "4", label: "السنة الرابعة" },
    { value: "5", label: "السنة الخامسة" },
    { value: "graduated", label: "خريج" },
  ];

  const genderOptions = [
    { value: "", label: "الكل" },
    { value: "boy", label: "أولاد" },
    { value: "girl", label: "بنات" },
  ];

  const activeFiltersCount = [
    filters.gender,
    filters.year,
    filters.origin,
    filters.authorId,
  ].filter(Boolean).length;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: DEFAULT_PAGE,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
    });
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    setDeleteLoading(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.deleteNote(
        deletingNote.person._id,
        deletingNote._id,
      );

      if (!response.success) {
        setError(response.message || "فشل في حذف الملاحظة");
        return;
      }

      setDeletingNote(null);
      setSuccessMessage("تم حذف الملاحظة بنجاح");

      if (notes.length === 1 && (filters.page || DEFAULT_PAGE) > DEFAULT_PAGE) {
        setFilters((prev) => ({
          ...prev,
          page: Math.max((prev.page || DEFAULT_PAGE) - 1, DEFAULT_PAGE),
        }));
      } else {
        await loadNotes();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!initialized && loading) {
    return <PageLoader text="جاري تحميل الملاحظات..." />;
  }

  return (
    <>
      <div className="flex flex-col min-h-full">
        <div className="mb-4 lg:mb-5">
          <div className="flex items-start justify-between gap-3 mb-3 lg:mb-4">
            <div>
              <h1 className="text-lg lg:text-xl font-extrabold text-surface-900">
                ملاحظات المخدومين
              </h1>
              <p className="text-xs lg:text-sm text-surface-500 mt-0.5 font-medium">
                جميع الملاحظات في مكان واحد مع اسم المخدوم وكاتب الملاحظة.
              </p>
            </div>

            <Badge variant="warning" size="sm" className="shrink-0">
              {pagination.total} ملاحظة
            </Badge>
          </div>

          <div className="flex items-center gap-2 relative">
            <SearchInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="ابحث بالملاحظة، اسم المخدوم، أو اسم الخادم..."
              className="flex-1"
            />

            <div className="relative">
              <IconButton
                icon={<SlidersHorizontal size={18} />}
                label="الفلاتر"
                variant={showFilters ? "primary" : "outline"}
                size="md"
                onClick={() => setShowFilters((prev) => !prev)}
              />

              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {activeFiltersCount}
                </span>
              )}
            </div>
          </div>

          {showFilters && (
            <Card className="mt-3 animate-slide-down" padding="md">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Select
                  label="الخادم"
                  value={filters.authorId || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      authorId: event.target.value || undefined,
                      page: DEFAULT_PAGE,
                    }))
                  }
                  options={authorOptions}
                  size="sm"
                />

                <Select
                  label="النوع"
                  value={filters.gender || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      gender:
                        event.target.value === "boy" ||
                        event.target.value === "girl"
                          ? event.target.value
                          : undefined,
                      page: DEFAULT_PAGE,
                    }))
                  }
                  options={genderOptions}
                  size="sm"
                />

                <Select
                  label="السنة"
                  value={filters.year?.toString() || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      year: parseYearParam(event.target.value),
                      page: DEFAULT_PAGE,
                    }))
                  }
                  options={yearOptions}
                  size="sm"
                />

                <Select
                  label="البلد"
                  value={filters.origin || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      origin: event.target.value || undefined,
                      page: DEFAULT_PAGE,
                    }))
                  }
                  options={originOptions}
                  size="sm"
                />
              </div>

              {(activeFiltersCount > 0 || filters.search) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-3 text-xs font-bold text-danger-600 hover:text-danger-700 flex items-center gap-1 transition-colors"
                >
                  <X size={12} />
                  مسح البحث والفلاتر
                </button>
              )}
            </Card>
          )}
        </div>

        {(error || successMessage) && (
          <div className="space-y-2 mb-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-danger-50 border border-danger-200/60 rounded-2xl animate-fade-in">
                <span className="text-danger-700 text-[13px] font-semibold flex-1">
                  {error}
                </span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2.5 p-3 bg-success-50 border border-success-100 rounded-2xl animate-fade-in">
                <span className="text-success-700 text-[13px] font-semibold flex-1">
                  {successMessage}
                </span>
              </div>
            )}
          </div>
        )}

        {loading && initialized ? (
          <Card padding="md" className="mb-4">
            <div className="text-sm font-semibold text-surface-500 text-center">
              جاري تحديث الملاحظات...
            </div>
          </Card>
        ) : null}

        {notes.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={<StickyNote size={24} />}
              title="لا توجد ملاحظات"
              description="جرّب تغيير الفلاتر أو البحث لعرض نتائج أخرى."
            />
          </Card>
        ) : (
          <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card
                key={note._id}
                padding="none"
                className="overflow-hidden animate-fade-in"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar
                        name={note.person.name}
                        size="md"
                        className={
                          note.person.gender === "boy"
                            ? "!bg-blue-100 !text-blue-700"
                            : "!bg-pink-100 !text-pink-700"
                        }
                      />

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/persons/${note.person._id}`)}
                          className="text-right font-extrabold text-surface-900 text-[15px] leading-tight hover:text-primary-700 transition-colors"
                        >
                          {note.person.name}
                        </button>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge
                            variant={
                              note.person.gender === "boy" ? "info" : "danger"
                            }
                            size="xs"
                          >
                            {getGenderText(note.person.gender)}
                          </Badge>

                          <Badge variant="primary" size="xs">
                            {note.person.year === "graduated"
                              ? formatYearLabel(note.person.year)
                              : `سنة ${formatYearLabel(note.person.year)}`}
                          </Badge>

                          <Badge
                            variant="neutral"
                            size="xs"
                            icon={<MapPin size={10} />}
                          >
                            {note.person.origin}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton
                        icon={<ArrowUpLeft size={14} />}
                        label="فتح الملف"
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/persons/${note.person._id}`)}
                      />

                      <IconButton
                        icon={<Trash2 size={14} />}
                        label="حذف الملاحظة"
                        size="sm"
                        variant="danger"
                        onClick={() => setDeletingNote(note)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-amber-100/80 bg-amber-50/60 p-4">
                    <p
                      className="text-[14px] text-surface-900 leading-relaxed font-semibold break-words"
                      dir="auto"
                      style={{ unicodeBidi: "plaintext" }}
                    >
                      {note.content}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-surface-500 font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <User size={12} />
                      بواسطة: {note.createdBy.username}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pagination.total > 0 && pagination.pages > 1 && (
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
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: item,
                      }))
                    }
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
      </div>

      <ConfirmDialog
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        variant="danger"
        title="حذف الملاحظة"
        message={`هل أنت متأكد من حذف هذه الملاحظة من ملف "${deletingNote?.person.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteLoading}
      />
    </>
  );
};

export default NotesPage;
