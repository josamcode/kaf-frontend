import React, { useCallback, useEffect, useState } from "react";
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
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") =>
    gender === "boy" ? "Boy" : "Girl";

  const formatYearLabel = (year: Person["year"]) =>
    year === "graduated" ? "\u0645\u062a\u062e\u0631\u062c" : String(year);

  const handleAddNote = async () => {
    if (!person || !newNote.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.addNote(person._id, newNote.trim());
      if (response.success) {
        setSuccessMessage("Note added successfully.");
        setNewNote("");
        await loadPerson();
      } else {
        setError(response.message || "Failed to add note.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error while adding note.");
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
        setSuccessMessage("Note deleted successfully.");
        setDeletingNoteId(null);
        await loadPerson();
      } else {
        setError(response.message || "Failed to delete note.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error while deleting note.");
    } finally {
      setDeleteNoteLoading(false);
    }
  };

  const handleCall = (phone: string) => window.open(`tel:${phone}`, "_self");
  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/[\\s\-()]/g, "");
    window.open(`https://wa.me/+2${clean}`, "_blank");
  };

  if (initialLoading) {
    return <PageLoader text="Loading person details..." />;
  }

  if (!person) {
    return (
      <EmptyState
        icon={<User size={24} />}
        title="Person not found"
        description={error || "This person may have been deleted or is unavailable."}
        action={
          <Button variant="secondary" onClick={() => navigate("/data")}>
            Back to data
          </Button>
        }
      />
    );
  }

  if (!canAccessGender(person.gender)) {
    return (
      <EmptyState
        icon={<User size={24} />}
        title="Access denied"
        description="You do not have permission to view this person's details."
        action={
          <Button variant="secondary" onClick={() => navigate("/data")}>
            Back to data
          </Button>
        }
      />
    );
  }

  const customFieldEntries = Object.entries(person.customFields || {});
  const hasCustomFields = customFieldEntries.length > 0;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4 lg:space-y-5" lang="ar" dir="rtl">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            icon={<ArrowRight size={16} />}
            onClick={() => navigate("/data")}
            size="sm"
          >
            العودة
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-danger-50 border border-danger-200/60 rounded-xl animate-fade-in">
            <span className="text-danger-700 text-[13px] font-semibold flex-1">
              {error}
            </span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-success-50 border border-success-100 rounded-xl animate-fade-in">
            <span className="text-success-700 text-[13px] font-semibold flex-1">
              {successMessage}
            </span>
          </div>
        )}

        <Card padding="none">
          <div className="flex items-center gap-3 p-4 lg:p-5 border-b border-surface-100">
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
              <h1 className="text-base lg:text-lg font-bold text-surface-900 leading-tight truncate">
                {person.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={person.gender === "boy" ? "info" : "danger"} size="xs">
                  {getGenderText(person.gender)}
                </Badge>
                <Badge variant="primary" size="xs">
                  سنة {formatYearLabel(person.year)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={<Calendar size={14} />}
                label="تاريخ الميلاد"
                value={formatDate(person.birthDate)}
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
              <InfoItem icon={<MapPin size={14} />} label="البلد" value={person.origin} />
              <InfoItem
                icon={<MapPin size={14} />}
                label="محل الإقامة"
                value={person.residence || "غير محدد"}
              />
              <InfoItem
                icon={<Phone size={14} />}
                label="الهاتف"
                value={person.phone}
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleCall(person.phone)}
                className="
                  flex items-center justify-center gap-2 py-3
                  bg-emerald-600 text-white rounded-xl text-[13px] font-bold
                  hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.97]
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
                  bg-green-600 text-white rounded-xl text-[13px] font-bold
                  hover:bg-green-700 active:bg-green-800 active:scale-[0.97]
                  transition-all duration-200 shadow-sm
                "
              >
                <MessageCircle size={16} />
                <span>واتساب</span>
              </button>
            </div>
          </div>
        </Card>

        {hasCustomFields && (
          <Card>
            <SectionHeader
              icon={<Tag size={14} className="text-purple-600" />}
              title="البيانات المخصصة"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
              {customFieldEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 bg-purple-50/60 border border-purple-100/80 rounded-xl p-2.5"
                >
                  <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                    <Tag size={11} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider leading-none">
                      {key}
                    </p>
                    <p
                      className="text-[13px] font-semibold text-surface-800 mt-0.5 truncate"
                      dir="auto"
                      style={{ unicodeBidi: "plaintext" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {hasPermission("manage_notes") && (
          <Card>
            <SectionHeader
              icon={<StickyNote size={14} className="text-amber-600" />}
              title="الملاحظات"
              count={person.notes?.length}
            />

            <div className="flex flex-col sm:flex-row gap-2 mt-2.5 mb-3">
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

            <div className="space-y-2 mt-4">
              {person.notes && person.notes.length > 0 ? (
                person.notes.map((note, index) => (
                  <div
                    key={note._id || index}
                    className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-3 group animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] text-surface-800 leading-relaxed font-medium"
                          dir="auto"
                          style={{ unicodeBidi: "plaintext" }}
                        >
                          {note.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
                          <span className="text-[10px] text-surface-400 font-semibold">
                            بواسطة: {note.createdBy.username}
                          </span>
                          <span className="text-[10px] text-surface-400 font-semibold">
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
          </Card>
        )}
      </div>

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

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  dir?: "ltr" | "rtl" | "auto";
}> = ({ icon, label, value, dir }) => (
  <div className="flex items-start gap-2.5">
    <div className="p-1.5 bg-surface-100 rounded-lg shrink-0 mt-0.5 text-surface-500">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider leading-none">
        {label}
      </p>
      <p
        className="text-[13px] font-semibold text-surface-800 mt-1 truncate"
        dir={dir}
        style={{ unicodeBidi: "plaintext" }}
      >
        {value}
      </p>
    </div>
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  count?: number;
}> = ({ icon, title, count }) => (
  <div className="flex items-center gap-2">
    <span className="shrink-0">{icon}</span>
    <h2 className="font-bold text-surface-800 text-[14px]">{title}</h2>
    {count !== undefined && count > 0 && (
      <Badge variant="neutral" size="xs">
        {count}
      </Badge>
    )}
  </div>
);

export default PersonDetailsPage;


