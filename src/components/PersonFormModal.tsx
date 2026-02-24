import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Save, AlertCircle, ChevronDown } from "lucide-react";
import { Person, PersonForm, PersonFormOptions } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Button, Input, Select, IconButton, Badge } from "./ui";

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person | null;
  onSuccess: () => void;
}

const DEFAULT_FORM_DATA: PersonForm = {
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
};

const EMPTY_FORM_OPTIONS: PersonFormOptions = {
  college: [],
  university: [],
  residence: [],
  origin: [],
  customFieldKeys: [],
  customFieldValuesByKey: {},
};

const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  person,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PersonForm>(DEFAULT_FORM_DATA);
  const [formOptions, setFormOptions] =
    useState<PersonFormOptions>(EMPTY_FORM_OPTIONS);

  // Custom field quick-add
  const [customFieldKey, setCustomFieldKey] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingFormOptions, setLoadingFormOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    const nextForm: PersonForm = person
      ? {
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
        }
      : { ...DEFAULT_FORM_DATA };

    setFormData(nextForm);
    setCustomFieldKey("");
    setCustomFieldValue("");
    setError(null);

    const loadFormOptions = async () => {
      try {
        setLoadingFormOptions(true);
        const response = await personsAPI.getFormOptions();
        const options =
          response.success && response.formOptions
            ? response.formOptions
            : EMPTY_FORM_OPTIONS;
        setFormOptions(options);
      } catch {
        setFormOptions(EMPTY_FORM_OPTIONS);
      } finally {
        setLoadingFormOptions(false);
      }
    };

    loadFormOptions();
  }, [isOpen, person]);

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM_DATA });
    setCustomFieldKey("");
    setCustomFieldValue("");
    setError(null);
  };

  const updateField = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "year") {
      if (value === "graduated") {
        updateField(name, "graduated");
      } else {
        updateField(
          name,
          (Number.parseInt(value, 10) || 1) as PersonForm["year"],
        );
      }
    } else {
      updateField(name, value);
    }
  };

  const handleAddCustomField = () => {
    const key = customFieldKey.trim();
    const value = customFieldValue.trim();
    if (!key || !value) return;

    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
    setCustomFieldKey("");
    setCustomFieldValue("");
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
    { value: "graduated", label: "\u062e\u0631\u064a\u062c" },
  ];

  const customValueSuggestions =
    formOptions.customFieldValuesByKey[customFieldKey] || [];

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

        {/* ─── Basic Info ─── */}
        <FormSection label="البيانات الأساسية">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <Input
              label="تاريخ الميلاد"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* ─── Education ─── */}
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
            <ComboInput
              label="الكلية"
              value={formData.college || ""}
              onChange={(v) => updateField("college", v)}
              suggestions={formOptions.college}
              loading={loadingFormOptions}
              placeholder="اكتب أو اختر الكلية"
            />
            <div className="sm:col-span-2">
              <ComboInput
                label="الجامعة"
                value={formData.university || ""}
                onChange={(v) => updateField("university", v)}
                suggestions={formOptions.university}
                loading={loadingFormOptions}
                placeholder="اكتب أو اختر الجامعة"
              />
            </div>
          </div>
        </FormSection>

        {/* ─── Location & Contact ─── */}
        <FormSection label="الموقع والتواصل">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ComboInput
              label="البلد الأصلية"
              value={formData.origin || ""}
              onChange={(v) => updateField("origin", v)}
              suggestions={formOptions.origin}
              loading={loadingFormOptions}
              placeholder="اكتب أو اختر البلد"
              required
            />
            <ComboInput
              label="مكان الإقامة"
              value={formData.residence || ""}
              onChange={(v) => updateField("residence", v)}
              suggestions={formOptions.residence}
              loading={loadingFormOptions}
              placeholder="اكتب أو اختر مكان الإقامة"
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

        {/* ─── Custom Fields ─── */}
        <FormSection label="بيانات مخصصة">
          {/* Quick-add row */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-3">
            <ComboInput
              value={customFieldKey}
              onChange={setCustomFieldKey}
              suggestions={formOptions.customFieldKeys}
              loading={loadingFormOptions}
              placeholder="اسم الحقل"
              size="sm"
              onSelect={(key) => {
                setCustomFieldKey(key);
                // Auto-clear value when key changes
                setCustomFieldValue("");
              }}
            />
            <ComboInput
              value={customFieldValue}
              onChange={setCustomFieldValue}
              suggestions={customValueSuggestions}
              placeholder="القيمة"
              size="sm"
              disabled={!customFieldKey.trim()}
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

          {/* Existing custom fields */}
          {customFieldEntries.length > 0 ? (
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
          ) : (
            <p className="text-[11px] text-surface-400 font-medium text-center py-2">
              لا توجد بيانات مخصصة — أضف حقول إضافية حسب الحاجة
            </p>
          )}
        </FormSection>
      </form>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ComboInput — The key UX improvement.
   A single input that acts as BOTH a text field and a dropdown.
   - Type to filter suggestions
   - Click dropdown arrow to see all options
   - Pick a suggestion or type a new value — no mode switching needed
   ═══════════════════════════════════════════════════════════════════════════ */

interface ComboInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  suggestions: string[];
  loading?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ComboInput: React.FC<ComboInputProps> = ({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  loading,
  placeholder,
  required,
  disabled,
  size = "md",
  onKeyDown,
}) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on typed value
  const filtered = value.trim()
    ? suggestions.filter((s) =>
        s.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase()),
      )
    : suggestions;

  const showDropdown = open && filtered.length > 0 && !disabled;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    onSelect?.(val);
    setOpen(false);
    inputRef.current?.focus();
  };

  const sizeClasses =
    size === "sm" ? "h-9 text-[13px] px-3" : "h-11 text-sm px-3.5";

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-semibold text-surface-700">
          {label}
          {required && <span className="text-danger-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            onKeyDown?.(e);
          }}
          placeholder={loading ? "جارٍ التحميل..." : placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-xl border border-surface-200 bg-white
            placeholder:text-surface-400 text-surface-800 font-medium
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 ${sizeClasses}
            ${suggestions.length > 0 ? "pl-9" : ""}
          `}
        />
        {/* Dropdown toggle button — only shown when suggestions exist */}
        {suggestions.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            disabled={disabled}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-lg
              text-surface-400 hover:text-surface-600 hover:bg-surface-100
              transition-all duration-200 disabled:opacity-50
              ${open ? "rotate-180" : ""}
            `}
          >
            <ChevronDown size={15} />
          </button>
        )}

        {/* Dropdown list */}
        {showDropdown && (
          <div
            className="
              absolute z-50 top-full mt-1 w-full
              bg-white border border-surface-200 rounded-xl shadow-lg
              max-h-44 overflow-y-auto overscroll-contain
              animate-fade-in
            "
          >
            {filtered.map((suggestion) => {
              const isSelected =
                suggestion.toLocaleLowerCase() === value.toLocaleLowerCase();
              return (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    handleSelect(suggestion);
                  }}
                  className={`
                    w-full text-right px-3 py-2 text-[13px] font-medium
                    transition-colors duration-100
                    ${
                      isSelected
                        ? "bg-primary-50 text-primary-700"
                        : "text-surface-700 hover:bg-surface-50"
                    }
                    first:rounded-t-xl last:rounded-b-xl
                  `}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Form Section ─── */
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
