import React, { useMemo, useState } from "react";
import {
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
  ArrowRight,
  ShieldCheck,
  Info,
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
} from "./ui";

interface PersonDetailsPageProps {
  person: Person | null;
  onBack?: () => void;
  onPersonUpdate: () => void;
  onPersonRefresh?: (person: Person) => void;
}

const PersonDetailsPage: React.FC<PersonDetailsPageProps> = ({
  person,
  onBack,
  onPersonUpdate,
  onPersonRefresh,
}) => {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteNoteLoading, setDeleteNoteLoading] = useState(false);

  const { hasPermission } = useAuth();

  if (!person) return null;

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
    if (!newNote.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.addNote(person._id, newNote.trim());
      if (response.success) {
        setSuccessMessage("تم إضافة الملاحظة بنجاح");
        setNewNote("");
        setTimeout(() => setSuccessMessage(null), 3000);

        if (onPersonRefresh) {
          try {
            const updatedPerson = await personsAPI.getPerson(person._id);
            if (updatedPerson.success && (updatedPerson as any).person) {
              onPersonRefresh((updatedPerson as any).person);
            }
          } catch {}
        }
        onPersonUpdate();
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
    if (!deletingNoteId) return;
    setDeleteNoteLoading(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.deleteNote(person._id, deletingNoteId);
      if (response.success) {
        setSuccessMessage("تم حذف الملاحظة بنجاح");
        setDeletingNoteId(null);
        setTimeout(() => setSuccessMessage(null), 3000);

        if (onPersonRefresh) {
          try {
            const updatedPerson = await personsAPI.getPerson(person._id);
            if (updatedPerson.success && (updatedPerson as any).person) {
              onPersonRefresh((updatedPerson as any).person);
            }
          } catch {}
        }
        onPersonUpdate();
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
    const clean = phone.replace(/[\s\-\(\)]/g, "");
    window.open(`https://wa.me/+2${clean}`, "_blank");
  };

  const customFieldEntries = useMemo(
    () => Object.entries(person.customFields || {}),
    [person.customFields],
  );
  const hasCustomFields = customFieldEntries.length > 0;

  const genderBadgeVariant = person.gender === "boy" ? "info" : "danger";
  const yearLabel = `سنة ${formatYearLabel(person.year)}`;

  return (
    <>
      <div className="w-full min-h-[calc(100vh-0px)] bg-page">
        {/* ===== Sticky Header (full width) ===== */}
        <div className="sticky top-0 z-40 bg-page/85 backdrop-blur-md border-b border-surface-100">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="py-4 flex items-center gap-3">
              {/* Back */}
              <div className="shrink-0">
                {onBack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight size={16} />}
                    onClick={onBack}
                    className="shrink-0"
                  >
                    رجوع
                  </Button>
                ) : (
                  <div className="w-2" />
                )}
              </div>

              {/* Identity */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-[1.25rem] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-sm" />
                  <Avatar
                    name={person.name}
                    size="md"
                    className={`relative ${
                      person.gender === "boy"
                        ? "!bg-blue-100 !text-blue-700"
                        : "!bg-pink-100 !text-pink-700"
                    }`}
                    icon={<User size={18} />}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[15px] sm:text-[18px] font-extrabold text-surface-900 truncate">
                      {person.name}
                    </h1>
                    <Badge variant={genderBadgeVariant} size="xs">
                      {getGenderText(person.gender)}
                    </Badge>
                    <Badge variant="primary" size="xs">
                      {yearLabel}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-surface-500 font-semibold mt-0.5">
                    صفحة التفاصيل والمتابعة
                  </p>
                </div>
              </div>

              {/* Actions (desktop) */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCall(person.phone)}
                  className="
                    flex items-center justify-center gap-2 px-3 h-9
                    bg-emerald-600 text-white rounded-xl text-[13px] font-bold
                    hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.98]
                    transition-all duration-200 shadow-sm
                  "
                >
                  <Phone size={16} />
                  <span>اتصال</span>
                </button>

                <button
                  onClick={() => handleWhatsApp(person.phone)}
                  className="
                    flex items-center justify-center gap-2 px-3 h-9
                    bg-green-600 text-white rounded-xl text-[13px] font-bold
                    hover:bg-green-700 active:bg-green-800 active:scale-[0.98]
                    transition-all duration-200 shadow-sm
                  "
                >
                  <MessageCircle size={16} />
                  <span>واتساب</span>
                </button>
              </div>

              {/* Actions (mobile) */}
              <div className="md:hidden flex items-center gap-2 shrink-0">
                <IconButton
                  icon={<Phone size={16} />}
                  label="اتصال"
                  size="sm"
                  variant="primary"
                  onClick={() => handleCall(person.phone)}
                />
                <IconButton
                  icon={<MessageCircle size={16} />}
                  label="واتساب"
                  size="sm"
                  variant="primary"
                  onClick={() => handleWhatsApp(person.phone)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Hero / Context strip ===== */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pt-6">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-surface-100 bg-surface">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/10" />
            <div className="relative p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="neutral" size="xs">
                    <span className="inline-flex items-center gap-1">
                      <Info size={12} />
                      ملف شخصي
                    </span>
                  </Badge>
                  <Badge variant="neutral" size="xs">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={12} />
                      متابعة
                    </span>
                  </Badge>
                </div>
                <p className="mt-2 text-[13px] text-surface-700 font-semibold">
                  اعرض البيانات الأساسية، التعليم، المكان، والبيانات المخصصة —
                  وأضف ملاحظات المتابعة بشكل مرتب.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto">
                <StatPill
                  label="عدد الملاحظات"
                  value={`${person.notes?.length || 0}`}
                />
                <StatPill label="النوع" value={getGenderText(person.gender)} />
                <StatPill
                  label="السنة"
                  value={formatYearLabel(person.year)}
                  className="sm:col-span-1 col-span-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Alerts ===== */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 mt-4">
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
        </div>

        {/* ===== Main Layout (full width, professional sections) ===== */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* ===== Sidebar ===== */}
            <div className="xl:col-span-4 space-y-4">
              {/* Quick Actions */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4">
                  <SectionTitle
                    icon={<Phone size={14} className="text-emerald-700" />}
                    title="تواصل سريع"
                    subtitle="اتصال أو واتساب مباشرة"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCall(person.phone)}
                      className="
                        flex items-center justify-center gap-2 py-3
                        bg-emerald-600 text-white rounded-2xl text-[13px] font-bold
                        hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.98]
                        transition-all duration-200 shadow-sm
                      "
                    >
                      <Phone size={16} />
                      <span>اتصال</span>
                    </button>
                    <button
                      onClick={() => handleWhatsApp(person.phone)}
                      className="
                        flex items-center justify-center gap-2 py-3
                        bg-green-600 text-white rounded-2xl text-[13px] font-bold
                        hover:bg-green-700 active:bg-green-800 active:scale-[0.98]
                        transition-all duration-200 shadow-sm
                      "
                    >
                      <MessageCircle size={16} />
                      <span>واتساب</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Basic snapshot */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4">
                  <SectionTitle
                    icon={<User size={14} className="text-surface-700" />}
                    title="ملخص البيانات"
                    subtitle="نظرة سريعة قبل التفاصيل"
                  />

                  <div className="mt-4 space-y-2">
                    <SummaryRow label="الاسم" value={person.name} />
                    <SummaryRow
                      label="النوع"
                      value={getGenderText(person.gender)}
                    />
                    <SummaryRow
                      label="السنة"
                      value={formatYearLabel(person.year)}
                    />
                    <SummaryRow
                      label="رقم الهاتف"
                      value={person.phone}
                      valueDir="ltr"
                    />
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
                      subtitle="حقول إضافية حسب احتياجك"
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
                            <p className="text-[13px] font-semibold text-surface-900 mt-1 break-words">
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

            {/* ===== Main content ===== */}
            <div className="xl:col-span-8 space-y-4">
              {/* Details */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4 sm:p-5">
                  <SectionTitle
                    icon={<Info size={14} className="text-surface-700" />}
                    title="التفاصيل"
                    subtitle="بيانات أساسية، تعليم، ومكان"
                  />

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <InfoTile
                      icon={<Calendar size={14} />}
                      title="تاريخ الميلاد"
                      value={formatDate(person.birthDate)}
                    />
                    <InfoTile
                      icon={<Phone size={14} />}
                      title="رقم الهاتف"
                      value={person.phone}
                      valueDir="ltr"
                    />
                    <InfoTile
                      icon={<MapPin size={14} />}
                      title="البلد الأصلية"
                      value={person.origin}
                    />
                    <InfoTile
                      icon={<MapPin size={14} />}
                      title="مكان الإقامة"
                      value={person.residence || "غير محدد"}
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
                      subtitle="سجل متابعة مرتب"
                      right={
                        <Badge variant="neutral" size="xs">
                          {person.notes?.length || 0}
                        </Badge>
                      }
                    />

                    <div className="hidden sm:block text-[12px] text-surface-500 font-semibold">
                      اكتب ملاحظة واضغط Enter للإضافة
                    </div>
                  </div>

                  {hasPermission("manage_notes") ? (
                    <>
                      {/* Add note */}
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

                      {/* Notes list */}
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
                              {/* Timeline accent */}
                              <div className="absolute inset-y-3 start-3 w-[3px] rounded-full bg-amber-200/70 hidden sm:block" />

                              <div className="flex items-start justify-between gap-2 sm:ps-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-surface-900 leading-relaxed font-semibold break-words">
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
                          <div className="pt-2">
                            <EmptyState
                              icon={<StickyNote size={24} />}
                              title="لا توجد ملاحظات"
                              description="أضف ملاحظة جديدة لتتبع المتابعة"
                              compact
                            />
                          </div>
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

      {/* Delete Note Confirmation */}
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
   Small UI helpers (local)
   ========================= */

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
  valueDir?: string;
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
      >
        {value}
      </p>
    </div>
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  valueDir?: string;
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

const StatPill: React.FC<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={`rounded-2xl border border-surface-100 bg-surface/80 px-3 py-2 ${className || ""}`}
  >
    <p className="text-[10px] text-surface-500 font-bold">{label}</p>
    <p className="text-[13px] text-surface-900 font-extrabold mt-0.5 truncate">
      {value}
    </p>
  </div>
);
