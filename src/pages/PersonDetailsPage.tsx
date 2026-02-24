import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  GraduationCap,
  StickyNote,
  MessageCircle,
  BookOpen,
  Tag,
  Info,
  Users,
  School,
  ShieldCheck,
  Contact,
} from "lucide-react";
import { Person } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Button,
  IconButton,
  Input,
  Badge,
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
} from "../components/ui";
import { PageLoader } from "../components/ui/Spinner";

const PersonDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, canAccessGender } = useAuth();

  const [person, setPerson] = useState<Person | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteNoteLoading, setDeleteNoteLoading] = useState(false);

  const loadPerson = useCallback(async () => {
    if (!id) {
      setInitialLoading(false);
      setPerson(null);
      setError("Invalid person id.");
      return;
    }

    try {
      setInitialLoading(true);
      setError(null);
      const response = await personsAPI.getPerson(id);
      if (response.success && response.person) {
        setPerson(response.person);
      } else {
        setPerson(null);
        setError(response.message || "Failed to load person details.");
      }
    } catch (err: any) {
      setPerson(null);
      setError(err.response?.data?.message || "Server error while loading.");
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") =>
    gender === "boy" ? "ولد" : "بنت";

  const formatYearLabel = (year: Person["year"]) =>
    year === "graduated" ? "متخرج" : String(year);

  const handleAddNote = async () => {
    if (!person || !newNote.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.addNote(person._id, newNote.trim());
      if (response.success) {
        setSuccessMessage("تم إضافة الملاحظة بنجاح");
        setNewNote("");
        await loadPerson();
      } else {
        setError(response.message || "فشل في إضافة الملاحظة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNoteConfirm = async () => {
    if (!person || !deletingNoteId) return;

    setDeleteNoteLoading(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.deleteNote(person._id, deletingNoteId);
      if (response.success) {
        setSuccessMessage("تم حذف الملاحظة بنجاح");
        setDeletingNoteId(null);
        await loadPerson();
      } else {
        setError(response.message || "فشل في حذف الملاحظة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setDeleteNoteLoading(false);
    }
  };

  const handleCall = (phone: string) => window.open(`tel:${phone}`, "_self");
  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/[\s\-()]/g, "");
    window.open(`https://wa.me/+2${clean}`, "_blank");
  };

  const customFieldEntries = useMemo(
    () => Object.entries(person?.customFields || {}),
    [person?.customFields],
  );
  const hasCustomFields = customFieldEntries.length > 0;

  if (initialLoading) {
    return <PageLoader text="Loading person details..." />;
  }

  if (!person) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
        <EmptyState
          icon={<User size={24} />}
          title="Person not found"
          description={
            error || "This person may have been deleted or is unavailable."
          }
          action={
            <Button variant="secondary" onClick={() => navigate("/data")}>
              Back to data
            </Button>
          }
        />
      </div>
    );
  }

  if (!canAccessGender(person.gender)) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
        <EmptyState
          icon={<ShieldCheck size={24} />}
          title="Access denied"
          description="You do not have permission to view this person's details."
          action={
            <Button variant="secondary" onClick={() => navigate("/data")}>
              Back to data
            </Button>
          }
        />
      </div>
    );
  }

  const genderText = getGenderText(person.gender);
  const yearText = `سنة ${formatYearLabel(person.year)}`;

  return (
    <>
      <div className="w-full bg-page" lang="ar" dir="rtl">
        {/* =========================
            Minimal sticky header (no actions)
           ========================= */}
        <div className="bg-page/92 backdrop-blur-md border-b border-surface-100">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="py-3 flex items-center gap-3">
              <Button
                variant="ghost"
                icon={<ArrowRight size={16} />}
                onClick={() => navigate("/data")}
                size="sm"
                className="shrink-0"
              >
                العودة
              </Button>

              {/* <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar
                  name={person.name}
                  size="sm"
                  className={
                    person.gender === "boy"
                      ? "!bg-blue-100 !text-blue-700"
                      : "!bg-pink-100 !text-pink-700"
                  }
                  icon={<User size={16} />}
                />
                <div className="min-w-0">
                  <h1 className="text-[14px] sm:text-[16px] font-extrabold text-surface-900 truncate">
                    {person.name}
                  </h1>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* =========================
            Body
           ========================= */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-4">
          {/* Alerts */}
          {(error || successMessage) && (
            <div className="space-y-2">
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

          {/* Main layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="xl:col-span-4 space-y-4">
              {/* Identity / small profile */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4">
                  <SectionTitle
                    icon={<Info size={14} className="text-surface-700" />}
                    title="بطاقة الملف"
                  />
                  <div className="mt-4 rounded-2xl border border-surface-100 bg-surface-50 p-3 flex items-center gap-3">
                    <Avatar
                      name={person.name}
                      size="md"
                      className={
                        person.gender === "boy"
                          ? "!bg-blue-100 !text-blue-700"
                          : "!bg-pink-100 !text-pink-700"
                      }
                      icon={<User size={18} />}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-surface-500 font-bold">
                        الاسم
                      </p>
                      <p className="text-[14px] font-extrabold text-surface-900 truncate">
                        {person.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Badge
                          variant={person.gender === "boy" ? "info" : "danger"}
                          size="xs"
                        >
                          {genderText}
                        </Badge>
                        <Badge variant="primary" size="xs">
                          {yearText}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <KeyValueRow
                      icon={<MapPin size={14} />}
                      label="البلد"
                      value={person.origin || "غير محدد"}
                    />
                    <KeyValueRow
                      icon={<MapPin size={14} />}
                      label="محل الإقامة"
                      value={person.residence || "غير محدد"}
                    />
                  </div>
                </div>
              </Card>

              {/* Actions card */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4">
                  <MiniHeader
                    icon={<Contact size={14} className="text-emerald-700" />}
                    title="إجراءات"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCall(person.phone)}
                      className="
                      flex items-center justify-center gap-2 h-11
                      bg-emerald-600 text-white rounded-2xl text-[13px] font-extrabold
                      hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.98]
                      transition-all duration-200 shadow-sm
                    "
                    >
                      <Phone size={16} />
                      اتصال
                    </button>
                    <button
                      onClick={() => handleWhatsApp(person.phone)}
                      className="
                      flex items-center justify-center gap-2 h-11
                      bg-green-600 text-white rounded-2xl text-[13px] font-extrabold
                      hover:bg-green-700 active:bg-green-800 active:scale-[0.98]
                      transition-all duration-200 shadow-sm
                    "
                    >
                      <MessageCircle size={16} />
                      واتساب
                    </button>
                  </div>

                  <div className="mt-3 rounded-2xl border border-surface-100 bg-surface-50 px-3 py-2">
                    {/* <p className="text-[10px] text-surface-500 font-bold">
                      رقم الهاتف
                    </p> */}
                    <p
                      className="text-[13px] font-extrabold text-surface-900"
                      dir="ltr"
                    >
                      {person.phone}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Custom fields */}
              {hasCustomFields && (
                <Card padding="none" className="overflow-hidden">
                  <div className="p-4">
                    <SectionTitle
                      icon={<Tag size={14} className="text-purple-700" />}
                      title="البيانات المخصصة"
                      right={
                        <Badge variant="neutral" size="xs">
                          {customFieldEntries.length}
                        </Badge>
                      }
                    />

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
                      {customFieldEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start gap-2.5 bg-purple-50/60 border border-purple-100/80 rounded-2xl p-3"
                        >
                          <div className="p-2 bg-purple-100 rounded-xl shrink-0 text-purple-700">
                            <Tag size={12} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider leading-none">
                              {key}
                            </p>
                            <p
                              className="text-[13px] font-semibold text-surface-900 mt-1 break-words"
                              dir="auto"
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {String(value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Main */}
            <div className="xl:col-span-8 space-y-4">
              {/* Details */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4 sm:p-5">
                  <SectionTitle
                    icon={<Info size={14} className="text-surface-700" />}
                    title="البيانات"
                  />

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 text-right">
                    <InfoTile
                      icon={<Calendar size={14} />}
                      title="تاريخ الميلاد"
                      value={formatDate(person.birthDate)}
                    />
                    <InfoTile
                      icon={<Phone size={14} />}
                      title="الهاتف"
                      value={person.phone}
                      valueDir="ltr"
                    />
                    <InfoTile
                      icon={<GraduationCap size={14} />}
                      title="الكلية"
                      value={person.college || "غير محدد"}
                    />
                    <InfoTile
                      icon={<BookOpen size={14} />}
                      title="الجامعة"
                      value={person.university || "غير محدد"}
                    />
                    <InfoTile
                      icon={<MapPin size={14} />}
                      title="البلد"
                      value={person.origin || "غير محدد"}
                    />
                    <InfoTile
                      icon={<MapPin size={14} />}
                      title="محل الإقامة"
                      value={person.residence || "غير محدد"}
                    />
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <SectionTitle
                      icon={<StickyNote size={14} className="text-amber-700" />}
                      title="الملاحظات"
                      right={
                        <Badge variant="neutral" size="xs">
                          {person.notes?.length || 0}
                        </Badge>
                      }
                    />
                    {/* <div className="hidden sm:block text-[12px] text-surface-500 font-semibold">
                      اكتب ملاحظة واضغط Enter للإضافة
                    </div> */}
                  </div>

                  {hasPermission("manage_notes") ? (
                    <>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <Input
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="أضف ملاحظة جديدة..."
                            size="sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newNote.trim()) {
                                e.preventDefault();
                                handleAddNote();
                              }
                            }}
                            maxLength={500}
                            dir="auto"
                          />
                          {newNote.length > 0 && (
                            <span className="absolute start-3 -bottom-4 text-[10px] text-surface-400 font-medium">
                              {newNote.length}/500
                            </span>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus size={15} />}
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          loading={loading}
                          className="shrink-0 sm:!h-9"
                        >
                          إضافة
                        </Button>
                      </div>

                      <div className="mt-6 space-y-2">
                        {person.notes && person.notes.length > 0 ? (
                          person.notes.map((note, index) => (
                            <div
                              key={note._id || index}
                              className="
                                relative bg-amber-50/50 border border-amber-100/80
                                rounded-2xl p-3.5 group animate-fade-in
                              "
                            >
                              <div className="absolute inset-y-3 start-3 w-[3px] rounded-full bg-amber-200/70 hidden sm:block" />
                              <div className="flex items-start justify-between gap-2 sm:ps-4">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-[13px] text-surface-900 leading-relaxed font-semibold break-words"
                                    dir="auto"
                                    style={{ unicodeBidi: "plaintext" }}
                                  >
                                    {note.content}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                    <span className="text-[10px] text-surface-500 font-bold">
                                      بواسطة: {note.createdBy.username}
                                    </span>
                                    <span className="text-[10px] text-surface-500 font-bold">
                                      {formatDateTime(note.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                <IconButton
                                  icon={<Trash2 size={13} />}
                                  label="حذف الملاحظة"
                                  size="xs"
                                  variant="danger"
                                  onClick={() => setDeletingNoteId(note._id!)}
                                  className="opacity-40 group-hover:opacity-100 shrink-0"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <EmptyState
                            icon={<StickyNote size={24} />}
                            title="لا توجد ملاحظات"
                            description="أضف ملاحظة جديدة لتتبع المتابعة"
                            compact
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="pt-2">
                      <EmptyState
                        icon={<StickyNote size={26} />}
                        title="غير مصرح"
                        description="ليس لديك صلاحية إدارة الملاحظات"
                        compact
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleDeleteNoteConfirm}
        variant="danger"
        title="حذف الملاحظة"
        message="هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteNoteLoading}
      />
    </>
  );
};

export default PersonDetailsPage;

/* =========================
   Local UI helpers
   ========================= */

const MiniHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
}> = ({ icon, title }) => (
  <div className="flex items-center gap-2">
    <span className="shrink-0">{icon}</span>
    <h3 className="text-[13px] font-extrabold text-surface-900">{title}</h3>
  </div>
);

const YearBadgeIcon: React.FC<{ year: Person["year"] }> = ({ year }) => {
  // Simple, glanceable: 1–5 show number badge, graduated shows cap
  if (year === "graduated") return <GraduationCap size={18} />;
  return (
    <span className="text-[14px] font-extrabold leading-none tabular-nums">
      {String(year)}
    </span>
  );
};

const yearLabelShort = (year: Person["year"]) =>
  year === "graduated" ? "متخرج" : `${year}`;

const SectionTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}> = ({ icon, title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-2.5 min-w-0">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <h3 className="font-extrabold text-surface-900 text-[14px] truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-surface-500 font-semibold mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {right ? <div className="shrink-0">{right}</div> : null}
  </div>
);

const InfoTile: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  valueDir?: "ltr" | "rtl" | "auto";
}> = ({ icon, title, value, valueDir }) => (
  <div className="flex items-start gap-2.5 rounded-2xl border border-surface-100 bg-surface-50 p-3">
    <div className="p-2 bg-surface-100 rounded-xl shrink-0 mt-0.5 text-surface-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-surface-400 font-extrabold uppercase tracking-wider leading-none">
        {title}
      </p>
      <p
        className="text-[13px] font-semibold text-surface-900 mt-1 break-words"
        dir={valueDir}
        style={{ unicodeBidi: "plaintext" }}
      >
        {value}
      </p>
    </div>
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  valueDir?: "ltr" | "rtl" | "auto";
}> = ({ label, value, valueDir }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-2xl bg-surface-50 border border-surface-100">
    <span className="text-[12px] text-surface-500 font-bold">{label}</span>
    <span
      className="text-[12px] text-surface-900 font-extrabold"
      dir={valueDir}
    >
      {value}
    </span>
  </div>
);

const KeyValueRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-2xl bg-surface-50 border border-surface-100">
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-surface-500 shrink-0">{icon}</span>
      <span className="text-[12px] text-surface-600 font-bold">{label}</span>
    </div>
    <span
      className="text-[12px] text-surface-900 font-extrabold truncate"
      dir="auto"
      style={{ unicodeBidi: "plaintext" }}
    >
      {value}
    </span>
  </div>
);
