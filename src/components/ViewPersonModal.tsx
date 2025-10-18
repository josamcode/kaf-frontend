import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  GraduationCap,
  StickyNote,
  MessageCircle,
} from "lucide-react";
import { Person, Note } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

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

  const { hasPermission } = useAuth();

  if (!isOpen || !person) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") => {
    return gender === "boy" ? "ولد" : "بنت";
  };

  const getYearText = (year: number) => {
    return `السنة ${year}`;
  };

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

        // Refresh person data
        if (onPersonRefresh && person) {
          try {
            const updatedPerson = await personsAPI.getPerson(person._id);
            if (updatedPerson.success && (updatedPerson as any).person) {
              onPersonRefresh((updatedPerson as any).person);
            }
          } catch (err) {
            console.error("Error refreshing person:", err);
          }
        }

        onPersonUpdate(); // Also refresh the main list
      } else {
        setError(response.message || "فشل في إضافة الملاحظة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await personsAPI.deleteNote(person._id, noteId);

      if (response.success) {
        setSuccessMessage("تم حذف الملاحظة بنجاح");

        // Refresh person data
        if (onPersonRefresh && person) {
          try {
            const updatedPerson = await personsAPI.getPerson(person._id);
            if (updatedPerson.success && (updatedPerson as any).person) {
              onPersonRefresh((updatedPerson as any).person);
            }
          } catch (err) {
            console.error("Error refreshing person:", err);
          }
        }

        onPersonUpdate(); // Also refresh the main list
      } else {
        setError(response.message || "فشل في حذف الملاحظة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 lg:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            عرض بيانات الشخص
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="text-red-700">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">الاسم</span>
                  <p className="font-medium text-gray-900">{person.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">تاريخ الميلاد</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(person.birthDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    person.gender === "boy" ? "bg-blue-500" : "bg-pink-500"
                  }`}
                ></div>
                <div>
                  <span className="text-sm text-gray-500">النوع</span>
                  <p className="font-medium text-gray-900">
                    {getGenderText(person.gender)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <GraduationCap className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">السنة الدراسية</span>
                  <p className="font-medium text-gray-900">
                    {getYearText(person.year)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <GraduationCap className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">الكلية</span>
                  <p className="font-medium text-gray-900">
                    {person.college || "غير محدد"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <GraduationCap className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">الجامعة</span>
                  <p className="font-medium text-gray-900">
                    {person.university || "غير محدد"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">البلد الأصلية</span>
                  <p className="font-medium text-gray-900">{person.origin}</p>
                </div>
              </div>

              <div className="flex items-center space-x-reverse space-x-3">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <span className="text-sm text-gray-500">مكان الإقامة</span>
                  <p className="font-medium text-gray-900">
                    {person.residence || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-reverse space-x-3 mb-4">
              <Phone className="text-gray-400" size={20} />
              <div>
                <span className="text-sm text-gray-500">رقم الهاتف</span>
                <p className="font-medium text-gray-900">{person.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-reverse space-x-3">
              <button
                onClick={() => handleCall(person.phone)}
                className="flex-1 flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <span>اتصال</span>
                <Phone size={18} />
              </button>
              <button
                onClick={() => handleWhatsApp(person.phone)}
                className="flex-1 flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <span>واتساب</span>
                <MessageCircle size={18} />
              </button>
            </div>
          </div>

          {/* Custom Fields */}
          {person.customFields &&
            Object.keys(person.customFields).length > 0 && (
              <div className="border-t border-gray-200 pt-4 lg:pt-6">
                <div className="flex items-center space-x-2 mb-4 lg:mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg ml-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
                    البيانات المخصصة
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                  {Object.entries(person.customFields).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0 ml-2">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-purple-700 mb-1">
                            {key}
                          </div>
                          <div className="text-gray-800 text-base leading-relaxed">
                            {value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Notes Section */}
          {hasPermission("manage_notes") && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <StickyNote size={20} className="ml-2" />
                  <span>الملاحظات</span>
                </h3>
              </div>

              {/* Add Note Form */}
              <div className="mb-4 lg:mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="أضف ملاحظة جديدة..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    maxLength={500}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={loading || !newNote.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                  >
                    <Plus size={18} />
                    <span>إضافة</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newNote.length}/500 حرف
                </p>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {person.notes && person.notes.length > 0 ? (
                  person.notes.map((note, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 mb-2 text-base">
                            {note.content}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 space-y-1 sm:space-y-0">
                            <span>بواسطة: {note.createdBy.username}</span>
                            <span>في: {formatDateTime(note.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note._id!)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          title="حذف الملاحظة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <StickyNote
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>لا توجد ملاحظات</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPersonModal;
