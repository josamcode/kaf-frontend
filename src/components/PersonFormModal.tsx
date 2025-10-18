import React, { useState, useEffect } from "react";
import { X, Plus, Save, AlertCircle } from "lucide-react";
import { Person, PersonForm } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person | null;
  onSuccess: () => void;
}

const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  person,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PersonForm>({
    name: "",
    gender: "boy",
    birthDate: "",
    college: "",
    university: "",
    residence: "",
    origin: "",
    year: 1,
    phone: "",
    customFields: {},
  });

  const [customFieldKey, setCustomFieldKey] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission } = useAuth();

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        gender: person.gender,
        birthDate: person.birthDate || "",
        college: person.college || "",
        university: person.university || "",
        residence: person.residence || "",
        origin: person.origin,
        year: person.year,
        phone: person.phone,
        customFields: person.customFields || {},
      });
    } else {
      resetForm();
    }
  }, [person]);

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "boy",
      birthDate: "",
      college: "",
      university: "",
      residence: "",
      origin: "",
      year: 1,
      phone: "",
      customFields: {},
    });
    setCustomFieldKey("");
    setCustomFieldValue("");
    setError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey]: customFieldValue,
        },
      }));
      setCustomFieldKey("");
      setCustomFieldValue("");
    }
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData((prev) => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[key];
      return {
        ...prev,
        customFields: newCustomFields,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission(person ? "edit_data" : "create_data")) {
      setError("ليس لديك صلاحية لهذا الإجراء");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean custom fields (remove undefined values)
      const cleanedCustomFields = Object.fromEntries(
        Object.entries(formData.customFields || {}).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      const submitData = {
        ...formData,
        customFields:
          Object.keys(cleanedCustomFields).length > 0
            ? cleanedCustomFields
            : undefined,
      };

      if (person) {
        // Update existing person
        const response = await personsAPI.updatePerson(person._id, submitData);
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          setError(response.message || "فشل في تحديث البيانات");
        }
      } else {
        // Create new person
        const response = await personsAPI.createPerson(submitData);
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          setError(response.message || "فشل في إضافة البيانات");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {person ? "تعديل البيانات" : "إضافة شخص جديد"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-reverse space-x-3">
              <span className="text-red-700">{error}</span>
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="boy">ولد</option>
                <option value="girl">بنت</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السنة الدراسية <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>السنة الأولى</option>
                <option value={2}>السنة الثانية</option>
                <option value={3}>السنة الثالثة</option>
                <option value={4}>السنة الرابعة</option>
                <option value={5}>السنة الخامسة</option>
              </select>
            </div>
          </div>

          {/* Education Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكلية
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل اسم الكلية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجامعة
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل اسم الجامعة"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البلد الأصلية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل البلد الأصلية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مكان الإقامة
              </label>
              <input
                type="text"
                name="residence"
                value={formData.residence}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل مكان الإقامة"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          {/* Custom Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بيانات مخصصة
            </label>

            {/* Add Custom Field */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-y-0 space-y-2 mb-4">
              <input
                type="text"
                value={customFieldKey}
                onChange={(e) => setCustomFieldKey(e.target.value)}
                placeholder="اسم الحقل"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                placeholder="القيمة"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إضافة
              </button>
            </div>

            {/* Display Custom Fields */}
            {Object.entries(formData.customFields || {}).filter(
              ([_, value]) => value !== undefined
            ).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.customFields || {})
                  .filter(([_, value]) => value !== undefined)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">
                          {key}:
                        </span>
                        <span className="text-gray-600 mr-2">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(key)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-start space-x-reverse space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
            >
              {loading ? (
                <>
                  <span>جاري الحفظ...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  <span>{person ? "حفظ التغييرات" : "إضافة الشخص"}</span>
                  <Save size={16} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonFormModal;
