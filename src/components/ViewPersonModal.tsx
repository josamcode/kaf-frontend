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
  onBack?: () => void; // optional: navigate back
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
    year === "graduated" ? "\u0645\u062a\u062e\u0631\u062c" : String(year);

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

  return (
    <>
      <div className="w-full">
        {/* ===== Sticky Page Header ===== */}
        <div className="sticky top-0 z-30 bg-page/95 backdrop-blur-md border-b border-surface-100">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-4 flex items-center gap-3">
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

              <Avatar
                name={person.name}
                size="md"
                className={
                  person.gender === "boy"
                    ? "!bg-blue-100 !text-blue-600"
                    : "!bg-pink-100 !text-pink-600"
                }
                icon={<User size={18} />}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-extrabold text-surface-900 truncate">
                    {person.name}
                  </h1>
                  <Badge
                    variant={person.gender === "boy" ? "info" : "danger"}
                    size="xs"
                  >
                    {getGenderText(person.gender)}
                  </Badge>
                  <Badge variant="primary" size="xs">
                    سنة {formatYearLabel(person.year)}
                  </Badge>
                </div>
                <p className="text-[12px] text-surface-500 font-semibold mt-0.5">
                  ملف التفاصيل والمتابعة
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCall(person.phone)}
                  className="
                    hidden sm:flex items-center justify-center gap-2 px-3 h-9
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
                    hidden sm:flex items-center justify-center gap-2 px-3 h-9
                    bg-green-600 text-white rounded-xl text-[13px] font-bold
                    hover:bg-green-700 active:bg-green-800 active:scale-[0.98]
                    transition-all duration-200 shadow-sm
                  "
                >
                  <MessageCircle size={16} />
                  <span>واتساب</span>
                </button>

                {/* Mobile quick actions */}
                <div className="sm:hidden flex items-center gap-2">
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
        </div>

        {/* ===== Page Body ===== */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Messages */}
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

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card padding="none" className="lg:col-span-2">
                <div className="p-4">
                  <SectionHeader
                    icon={<User size={14} className="text-surface-700" />}
                    title="البيانات الأساسية"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <InfoItem
                      icon={<Calendar size={14} />}
                      label="تاريخ الميلاد"
                      value={formatDate(person.birthDate)}
                    />
                    <InfoItem
                      icon={<Phone size={14} />}
                      label="رقم الهاتف"
                      value={person.phone}
                      dir="ltr"
                    />
                    <InfoItem
                      icon={<MapPin size={14} />}
                      label="البلد الأصلية"
                      value={person.origin}
                    />
                    <InfoItem
                      icon={<MapPin size={14} />}
                      label="مكان الإقامة"
                      value={person.residence || "غير محدد"}
                    />
                    <InfoItem
                      icon={<GraduationCap size={14} />}
                      label="الكلية"
                      value={person.college || "غير محدد"}
                    />
                    <InfoItem
                      icon={<BookOpen size={14} />}
                      label="الجامعة"
                      value={person.university || "غير محدد"}
                    />
                  </div>
                </div>
              </Card>

              <Card padding="none">
                <div className="p-4">
                  <SectionHeader
                    icon={<StickyNote size={14} className="text-amber-700" />}
                    title="ملخص المتابعة"
                  />
                  <div className="mt-3 space-y-2">
                    <SummaryRow
                      label="عدد الملاحظات"
                      value={`${person.notes?.length || 0}`}
                    />
                    <SummaryRow label="السنة" value={`سنة ${formatYearLabel(person.year)}`} />
                    <SummaryRow
                      label="النوع"
                      value={getGenderText(person.gender)}
                    />
                  </div>

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
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left column */}
              <div className="lg:col-span-1 space-y-4">
                {hasCustomFields && (
                  <Card padding="none">
                    <div className="p-4">
                      <SectionHeader
                        icon={<Tag size={14} className="text-purple-700" />}
                        title="البيانات المخصصة"
                        count={customFieldEntries.length}
                      />
                      <div className="grid grid-cols-1 gap-2.5 mt-3">
                        {customFieldEntries.map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2.5 bg-purple-50/60 border border-purple-100/80 rounded-2xl p-3"
                          >
                            <div className="p-2 bg-purple-100 rounded-xl shrink-0">
                              <Tag size={12} className="text-purple-700" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider leading-none">
                                {key}
                              </p>
                              <p className="text-[13px] font-semibold text-surface-800 mt-1 truncate">
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

              {/* Right column (Notes) */}
              <div className="lg:col-span-2">
                {hasPermission("manage_notes") ? (
                  <Card padding="none">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <SectionHeader
                          icon={
                            <StickyNote size={14} className="text-amber-700" />
                          }
                          title="الملاحظات"
                          count={person.notes?.length}
                        />

                        {/* Add note (desktop quick) */}
                        <div className="hidden sm:block text-[12px] text-surface-500 font-semibold">
                          اكتب ملاحظة واضغط Enter للإضافة
                        </div>
                      </div>

                      {/* Add note */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
                            <span className="absolute left-3 -bottom-4 text-[10px] text-surface-400 font-medium">
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
                              className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-3.5 group animate-fade-in"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-surface-900 leading-relaxed font-semibold">
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
                    </div>
                  </Card>
                ) : (
                  <Card padding="none">
                    <div className="p-6">
                      <EmptyState
                        icon={<StickyNote size={26} />}
                        title="غير مصرح"
                        description="ليس لديك صلاحية إدارة الملاحظات"
                        compact
                      />
                    </div>
                  </Card>
                )}
              </div>
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

// ===== Info Item =====
const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  dir?: string;
}> = ({ icon, label, value, dir }) => (
  <div className="flex items-start gap-2.5">
    <div className="p-2 bg-surface-100 rounded-xl shrink-0 mt-0.5 text-surface-600">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-surface-400 font-extrabold uppercase tracking-wider leading-none">
        {label}
      </p>
      <p
        className="text-[13px] font-semibold text-surface-900 mt-1 truncate"
        dir={dir}
      >
        {value}
      </p>
    </div>
  </div>
);

// ===== Section Header =====
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  count?: number;
}> = ({ icon, title, count }) => (
  <div className="flex items-center gap-2">
    <span className="shrink-0">{icon}</span>
    <h3 className="font-extrabold text-surface-900 text-[14px]">{title}</h3>
    {count !== undefined && count > 0 && (
      <Badge variant="neutral" size="xs">
        {count}
      </Badge>
    )}
  </div>
);

const SummaryRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-2xl bg-surface-50 border border-surface-100">
    <span className="text-[12px] text-surface-500 font-bold">{label}</span>
    <span className="text-[12px] text-surface-900 font-extrabold">{value}</span>
  </div>
);


