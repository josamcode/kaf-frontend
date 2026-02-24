import React, { useState } from "react";
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
} from "lucide-react";
import { Person } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Modal,
  Button,
  IconButton,
  Input,
  Badge,
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
} from "./ui";

interface ViewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onPersonUpdate: () => void;
  onPersonRefresh?: (person: Person) => void;
}

const ViewPersonModal: React.FC<ViewPersonModalProps> = ({
  isOpen,
  onClose,
  person,
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

  const handleClose = () => {
    setNewNote("");
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const customFieldEntries = Object.entries(person.customFields || {});
  const hasCustomFields = customFieldEntries.length > 0;

  // Build custom header for the modal
  const modalHeader = (
    <div className="flex items-center gap-3 px-5 py-4 lg:px-6 border-b border-surface-100">
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
        <h2 className="text-base lg:text-lg font-bold text-surface-900 leading-tight truncate">
          {person.name}
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge
            variant={person.gender === "boy" ? "info" : "danger"}
            size="xs"
          >
            {getGenderText(person.gender)}
          </Badge>
          <Badge variant="primary" size="xs">
            سنة {person.year}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" showClose={true}>
        {/* Custom header replaces default title */}
        {modalHeader}

        <div className="space-y-4 -mx-5 -mt-4 lg:-mx-6">
          {/* Messages */}
          <div className="px-5 lg:px-6 pt-4 space-y-2">
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
          </div>

          {/* ===== Personal Info ===== */}
          <div className="px-5 lg:px-6">
            <Card padding="none">
              <div className="p-3.5 lg:p-4">
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
                    icon={<Phone size={14} />}
                    label="رقم الهاتف"
                    value={person.phone}
                    dir="ltr"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* ===== Contact Buttons ===== */}
          <div className="px-5 lg:px-6">
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

          {/* ===== Custom Fields ===== */}
          {hasCustomFields && (
            <div className="px-5 lg:px-6">
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
                      <p className="text-[13px] font-semibold text-surface-800 mt-0.5 truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Notes ===== */}
          {hasPermission("manage_notes") && (
            <div className="px-5 lg:px-6 pb-2">
              <SectionHeader
                icon={<StickyNote size={14} className="text-amber-600" />}
                title="الملاحظات"
                count={person.notes?.length}
              />

              {/* Add note */}
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
              <div className="space-y-2 mt-4">
                {person.notes && person.notes.length > 0 ? (
                  person.notes.map((note, index) => (
                    <div
                      key={note._id || index}
                      className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-3 group animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-surface-800 leading-relaxed font-medium">
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
            </div>
          )}
        </div>
      </Modal>

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

// ===== Info Item =====
const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  dir?: string;
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
    <h3 className="font-bold text-surface-800 text-[14px]">{title}</h3>
    {count !== undefined && count > 0 && (
      <Badge variant="neutral" size="xs">
        {count}
      </Badge>
    )}
  </div>
);

export default ViewPersonModal;
