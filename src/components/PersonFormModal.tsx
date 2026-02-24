import React, { useState, useEffect } from "react";
import { X, Plus, Save, AlertCircle } from "lucide-react";
import { Person, PersonForm } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Button, Input, Select, IconButton, Badge } from "./ui";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      return { ...prev, customFields: newCustomFields };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hasPermission(person ? "edit_data" : "create_data")) {
      setError("ليس لديك صلاحية لهذا الإجراء");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cleanedCustomFields = Object.fromEntries(
        Object.entries(formData.customFields || {}).filter(
          ([_, value]) => value !== undefined && value !== null && value !== "",
        ),
      );

      const submitData = {
        ...formData,
        customFields:
          Object.keys(cleanedCustomFields).length > 0
            ? cleanedCustomFields
            : undefined,
      };

      const response = person
        ? await personsAPI.updatePerson(person._id, submitData)
        : await personsAPI.createPerson(submitData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setError(
          response.message ||
            (person ? "فشل في تحديث البيانات" : "فشل في إضافة البيانات"),
        );
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

  const customFieldEntries = Object.entries(formData.customFields || {}).filter(
    ([_, value]) => value !== undefined,
  );

  const yearOptions = [
    { value: "1", label: "السنة الأولى" },
    { value: "2", label: "السنة الثانية" },
    { value: "3", label: "السنة الثالثة" },
    { value: "4", label: "السنة الرابعة" },
    { value: "5", label: "السنة الخامسة" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={person ? "تعديل البيانات" : "إضافة شخص جديد"}
      description={
        person ? `تعديل بيانات ${person.name}` : "أدخل بيانات الشخص الجديد"
      }
      size="lg"
      footer={
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            icon={<Save size={16} />}
            loading={loading}
            className="flex-1"
            size="lg"
          >
            {person ? "حفظ التغييرات" : "إضافة الشخص"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            size="lg"
          >
            إلغاء
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-danger-50 border border-danger-200/60 rounded-xl animate-fade-in">
            <AlertCircle
              className="text-danger-500 shrink-0 mt-0.5"
              size={17}
            />
            <span className="text-danger-700 text-[13px] font-semibold leading-relaxed flex-1">
              {error}
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 p-0.5 hover:bg-danger-100 rounded-lg transition-colors"
            >
              <X size={13} className="text-danger-400" />
            </button>
          </div>
        )}

        {/* ===== Basic Info ===== */}
        <FormSection label="البيانات الأساسية">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name — full width */}
            <div className="sm:col-span-2">
              <Input
                label="الاسم"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="الاسم الكامل"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                النوع <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "boy",
                    label: "ولد",
                    emoji: "👦",
                    activeClass: "border-blue-500 bg-blue-50 text-blue-700",
                  },
                  {
                    value: "girl",
                    label: "بنت",
                    emoji: "👧",
                    activeClass: "border-pink-500 bg-pink-50 text-pink-700",
                  },
                ].map((opt) => {
                  const selected = formData.gender === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`
                        flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 text-sm font-bold active:scale-[0.97]
                        ${selected ? opt.activeClass : "border-surface-200 text-surface-500 hover:border-surface-300"}
                      `}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={opt.value}
                        checked={selected}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Birth Date */}
            <Input
              label="تاريخ الميلاد"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* ===== Education ===== */}
        <FormSection label="التعليم">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="السنة الدراسية"
              name="year"
              value={formData.year.toString()}
              onChange={handleInputChange}
              options={yearOptions}
              required
            />
            <Input
              label="الكلية"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              placeholder="اسم الكلية"
            />
            <div className="sm:col-span-2">
              <Input
                label="الجامعة"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                placeholder="اسم الجامعة"
              />
            </div>
          </div>
        </FormSection>

        {/* ===== Location & Contact ===== */}
        <FormSection label="الموقع والتواصل">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="البلد الأصلية"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              required
              placeholder="البلد الأصلية"
            />
            <Input
              label="مكان الإقامة"
              name="residence"
              value={formData.residence}
              onChange={handleInputChange}
              placeholder="مكان الإقامة"
            />
            <div className="sm:col-span-2">
              <Input
                label="رقم الهاتف"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="01xxxxxxxxx"
                className="text-left"
                dir="ltr"
              />
            </div>
          </div>
        </FormSection>

        {/* ===== Custom Fields ===== */}
        <FormSection label="بيانات مخصصة">
          {/* Add custom field row */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input
              value={customFieldKey}
              onChange={(e) => setCustomFieldKey(e.target.value)}
              placeholder="اسم الحقل"
              size="sm"
              containerClassName="flex-1"
            />
            <Input
              value={customFieldValue}
              onChange={(e) => setCustomFieldValue(e.target.value)}
              placeholder="القيمة"
              size="sm"
              containerClassName="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomField();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={handleAddCustomField}
              disabled={!customFieldKey.trim() || !customFieldValue.trim()}
              className="shrink-0 sm:!h-9"
            >
              إضافة
            </Button>
          </div>

          {/* Added fields */}
          {customFieldEntries.length > 0 && (
            <div className="space-y-1.5">
              {customFieldEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 bg-surface-50 border border-surface-200/80 p-2.5 rounded-xl group"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <Badge variant="neutral" size="xs">
                      {key}
                    </Badge>
                    <span className="text-[13px] text-surface-700 font-medium truncate">
                      {value}
                    </span>
                  </div>
                  <IconButton
                    icon={<X size={13} />}
                    label={`حذف ${key}`}
                    size="xs"
                    variant="danger"
                    onClick={() => handleRemoveCustomField(key)}
                    className="opacity-50 group-hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          )}

          {customFieldEntries.length === 0 && (
            <p className="text-[11px] text-surface-400 font-medium text-center py-2">
              لا توجد بيانات مخصصة — أضف حقول إضافية حسب الحاجة
            </p>
          )}
        </FormSection>
      </form>
    </Modal>
  );
};

// ===== Form Section =====
const FormSection: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <fieldset>
    <legend className="text-[12px] font-bold text-surface-400 uppercase tracking-wider mb-2.5">
      {label}
    </legend>
    {children}
  </fieldset>
);

export default PersonFormModal;
