import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  Save,
  X,
  Eye,
  EyeOff,
  MapPin,
  Globe2,
} from "lucide-react";
import { User, AdminForm, Permission } from "../types";
import { authAPI, personsAPI } from "../services/api";
import {
  Button,
  IconButton,
  Input,
  Card,
  Badge,
  Avatar,
  Modal,
  Checkbox,
  EmptyState,
  ConfirmDialog,
} from "../components/ui";
import { PageLoader } from "../components/ui/Spinner";

const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<AdminForm>({
    username: "",
    password: "",
    permissions: [],
    genderAccess: "both",
    allowedOrigins: [],
  });
  const [originInput, setOriginInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [loadingOrigins, setLoadingOrigins] = useState(false);

  // Delete state
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sortAdminsAlphabetically = (admins: User[]): User[] => {
    return [...admins].sort((a, b) => {
      const normalize = (name: string) =>
        name
          .replace(/أ/g, "ا")
          .replace(/إ/g, "ا")
          .replace(/آ/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/ى/g, "ي")
          .trim();
      return normalize(a.username).localeCompare(normalize(b.username), "ar", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const permissionLabels: Record<Permission, string> = {
    view_boys: "عرض الأولاد",
    view_girls: "عرض البنات",
    edit_data: "تعديل البيانات",
    create_data: "إضافة بيانات",
    delete_data: "حذف البيانات",
    manage_admins: "إدارة الخدام",
    manage_notes: "إدارة الملاحظات",
  };

  const permissionIcons: Record<Permission, string> = {
    view_boys: "👦",
    view_girls: "👧",
    edit_data: "✏️",
    create_data: "➕",
    delete_data: "🗑️",
    manage_admins: "🛡️",
    manage_notes: "📝",
  };

  const selectablePermissions = (
    Object.keys(permissionLabels) as Permission[]
  ).filter(
    (permission) => permission !== "view_boys" && permission !== "view_girls",
  );

  const genderAccessLabels: Record<string, string> = {
    boys: "أولاد فقط",
    girls: "بنات فقط",
    both: "الكل",
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      clearMessages();
      const response = await authAPI.getAdmins();
      if (response.success && response.admins) {
        setAdmins(sortAdminsAlphabetically(response.admins));
      } else {
        setError(response.message || "فشل في تحميل الخدام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    if (!showAddForm) return;

    const loadOrigins = async () => {
      try {
        setLoadingOrigins(true);
        const response = await personsAPI.getFormOptions();
        if (response.success && response.formOptions) {
          setOriginSuggestions(response.formOptions.origin || []);
        } else {
          setOriginSuggestions([]);
        }
      } catch {
        setOriginSuggestions([]);
      } finally {
        setLoadingOrigins(false);
      }
    };

    loadOrigins();
  }, [showAddForm]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const normalizeOrigin = (value: string) => value.trim().toLocaleLowerCase();

  const addAllowedOrigin = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    setFormData((prev) => {
      const exists = prev.allowedOrigins.some(
        (origin) => normalizeOrigin(origin) === normalizeOrigin(cleaned),
      );
      if (exists) return prev;
      return {
        ...prev,
        allowedOrigins: [...prev.allowedOrigins, cleaned],
      };
    });
    setOriginInput("");
  };

  const removeAllowedOrigin = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedOrigins: prev.allowedOrigins.filter(
        (origin) => normalizeOrigin(origin) !== normalizeOrigin(value),
      ),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission),
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormLoading(true);
    try {
      clearMessages();
      if (editingAdmin) {
        if (!editingAdmin.id) {
          setError("معرف الخادم غير صحيح");
          setFormLoading(false);
          return;
        }
        const response = await authAPI.updateAdmin(editingAdmin.id, {
          permissions: formData.permissions,
          genderAccess: formData.genderAccess,
          allowedOrigins: formData.allowedOrigins,
        });
        if (response.success) {
          setSuccessMessage("تم تحديث الخادم بنجاح");
          loadAdmins();
          closeForm();
        } else {
          setError(response.message || "فشل في تحديث الخادم");
        }
      } else {
        const response = await authAPI.createAdmin(formData);
        if (response.success) {
          setSuccessMessage("تم إنشاء الخادم بنجاح");
          loadAdmins();
          closeForm();
        } else {
          setError(response.message || "فشل في إنشاء الخادم");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin?.id) return;
    setDeleteLoading(true);
    try {
      clearMessages();
      const response = await authAPI.deleteAdmin(deletingAdmin.id);
      if (response.success) {
        setSuccessMessage("تم حذف الخادم بنجاح");
        setDeletingAdmin(null);
        loadAdmins();
      } else {
        setError(response.message || "فشل في حذف الخادم");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: "",
      permissions: admin.permissions,
      genderAccess: admin.genderAccess,
      allowedOrigins: admin.allowedOrigins || [],
    });
    setOriginInput("");
    setShowAddForm(true);
    setShowPassword(false);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      permissions: [],
      genderAccess: "both",
      allowedOrigins: [],
    });
    setOriginInput("");
    setEditingAdmin(null);
    setShowPassword(false);
  };

  const closeForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  const getRoleText = (role: string) =>
    role === "super_admin" ? "أمين الخدمة" : "خادم";

  const getRoleVariant = (role: string): "primary" | "info" =>
    role === "super_admin" ? "primary" : "info";

  const getGenderVariant = (access: string): "info" | "danger" | "neutral" =>
    access === "boys" ? "info" : access === "girls" ? "danger" : "neutral";

  const getOriginAccessText = (origins?: string[]) => {
    if (!origins || origins.length === 0) return "كل البلاد";
    if (origins.length === 1) return origins[0];
    return `${origins[0]} +${origins.length - 1}`;
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ===== Page Header ===== */}
      <div className="flex items-start justify-between gap-3 mb-4 lg:mb-5">
        <div>
          <h1 className="text-sm lg:text-xl font-extrabold text-surface-900">
            إدارة الخدام
          </h1>
          <p className="text-xs lg:text-sm text-surface-500 mt-0.5 font-medium">
            إدارة حسابات وصلاحيات الخدام
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          icon={<Plus size={17} />}
          size="md"
          className="shrink-0"
        >
          <span className="hidden sm:inline">إضافة خادم</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {/* ===== Messages ===== */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-danger-50 border border-danger-200/60 rounded-xl mb-4 animate-fade-in">
          <span className="text-danger-700 text-[13px] font-semibold flex-1">
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 p-0.5 hover:bg-danger-100 rounded-lg transition-colors"
          >
            <X size={14} className="text-danger-400" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-3 bg-success-50 border border-success-100 rounded-xl mb-4 animate-fade-in">
          <span className="text-success-700 text-[13px] font-semibold flex-1">
            {successMessage}
          </span>
        </div>
      )}

      {/* ===== Add/Edit Modal ===== */}
      <Modal
        isOpen={showAddForm}
        onClose={closeForm}
        title={editingAdmin ? "تعديل الخادم" : "إضافة خادم جديد"}
        description={
          editingAdmin
            ? `تعديل صلاحيات ${editingAdmin.username}`
            : "أنشئ حساب خادم جديد وحدد صلاحياته"
        }
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              icon={<Save size={16} />}
              loading={formLoading}
              className="flex-1"
              size="lg"
            >
              {editingAdmin ? "حفظ التغييرات" : "إضافة الخادم"}
            </Button>
            <Button
              variant="secondary"
              onClick={closeForm}
              disabled={formLoading}
              size="lg"
            >
              إلغاء
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5" id="admin-form">
          {/* Account Info */}
          <div>
            <SectionLabel>بيانات الحساب</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
              <Input
                label="اسم المستخدم"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!editingAdmin}
                disabled={!!editingAdmin}
                placeholder="أدخل اسم المستخدم"
              />
              <Input
                label={editingAdmin ? "كلمة المرور (اختياري)" : "كلمة المرور"}
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required={!editingAdmin}
                placeholder="أدخل كلمة المرور"
                endIcon={
                  showPassword ? <EyeOff size={16} /> : <Eye size={16} />
                }
                onEndIconClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {/* Gender Access */}
          <div>
            <SectionLabel>صلاحية الوصول للبيانات</SectionLabel>
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              {[
                { value: "both", label: "الكل", emoji: "👥" },
                { value: "boys", label: "أولاد", emoji: "👦" },
                { value: "girls", label: "بنات", emoji: "👧" },
              ].map((opt) => {
                const selected = formData.genderAccess === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`
                      flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 cursor-pointer
                      transition-all duration-200 text-sm font-bold
                      active:scale-[0.97]
                      ${
                        selected
                          ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                          : "border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="genderAccess"
                      value={opt.value}
                      checked={selected}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-[13px]">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Origin Access (Redesigned) */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionLabel>صلاحيات الوصول من البلاد</SectionLabel>
                <p className="text-[12px] text-surface-500 font-medium mt-1">
                  اتركها فارغة للسماح بالوصول من جميع البلاد.
                </p>
              </div>

              {/* count pill */}
              <div className="shrink-0">
                <span
                  className={`
          inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border
          ${
            formData.allowedOrigins.length > 0
              ? "bg-primary-50 border-primary-100 text-primary-700"
              : "bg-surface-50 border-surface-200 text-surface-500"
          }
        `}
                >
                  {formData.allowedOrigins.length > 0
                    ? `${formData.allowedOrigins.length} بلد`
                    : "الكل"}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-surface-200 bg-surface-50/70 p-3 sm:p-4">
              {/* Add row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-500">
                      <MapPin size={16} />
                    </span>

                    <Input
                      name="originInput"
                      value={originInput}
                      onChange={(e) => setOriginInput(e.target.value)}
                      placeholder="أضف بلد... (مثال: Cairo)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAllowedOrigin(originInput);
                        }
                      }}
                      className="ps-10"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => addAllowedOrigin(originInput)}
                  className="sm:w-auto w-full"
                >
                  إضافة
                </Button>
              </div>

              {/* Selected chips */}
              <div className="mt-3">
                {formData.allowedOrigins.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.allowedOrigins.map((origin) => (
                      <span
                        key={origin}
                        className="
                inline-flex items-center gap-2
                px-2.5 py-1.5 rounded-2xl
                bg-white border border-surface-200
                shadow-sm
              "
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-primary-50 border border-primary-100 text-primary-700">
                          <MapPin size={12} />
                        </span>

                        <span className="text-[12px] font-extrabold text-surface-800">
                          {origin}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeAllowedOrigin(origin)}
                          className="
                  inline-flex items-center justify-center
                  w-7 h-7 rounded-xl
                  text-surface-500 hover:text-danger-600
                  hover:bg-danger-50
                  transition-colors
                "
                          aria-label={`إزالة ${origin}`}
                          title="إزالة"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-surface-200">
                    <div className="w-9 h-9 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-600">
                      <Globe2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-extrabold text-surface-900">
                        السماح للجميع
                      </p>
                      <p className="text-[12px] text-surface-500 font-medium">
                        لا توجد بلاد محددة حالياً.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {(originSuggestions.length > 0 || loadingOrigins) && (
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-extrabold text-surface-700">
                      اقتراحات سريعة
                    </p>
                    {loadingOrigins && (
                      <p className="text-[11px] text-surface-400 font-medium">
                        جاري التحميل...
                      </p>
                    )}
                  </div>

                  {originSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {originSuggestions
                        .filter(
                          (origin) =>
                            !formData.allowedOrigins.some(
                              (selected) =>
                                selected.toLocaleLowerCase() ===
                                origin.toLocaleLowerCase(),
                            ),
                        )
                        .slice(0, 12)
                        .map((origin) => (
                          <button
                            key={origin}
                            type="button"
                            onClick={() => addAllowedOrigin(origin)}
                            className="
                    inline-flex items-center gap-2
                    px-2.5 py-1.5 rounded-2xl
                    border border-surface-200 bg-white
                    text-[12px] font-bold text-surface-700
                    hover:bg-surface-50 hover:border-surface-300
                    active:scale-[0.98]
                    transition-all
                  "
                            title="إضافة"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-surface-100 border border-surface-200 text-surface-600">
                              <Plus size={12} />
                            </span>
                            {origin}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <SectionLabel>الصلاحيات</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
              {selectablePermissions.map((permission) => {
                const label = permissionLabels[permission];
                const isChecked = formData.permissions.includes(permission);
                return (
                  <label
                    key={permission}
                    className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 active:scale-[0.98]
                        ${
                          isChecked
                            ? "border-primary-400 bg-primary-50"
                            : "border-surface-200 hover:border-surface-300 hover:bg-surface-50"
                        }
                      `}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) =>
                        handlePermissionChange(
                          permission,
                          (e.target as HTMLInputElement).checked,
                        )
                      }
                      size="sm"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">
                        {permissionIcons[permission]}
                      </span>
                      <span
                        className={`text-[13px] font-semibold truncate ${
                          isChecked ? "text-primary-700" : "text-surface-700"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ===== Admin List ===== */}
      {loading ? (
        <PageLoader text="جاري تحميل الخدام..." />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="لا يوجد خدام"
          description="أضف خادم جديد للبدء في إدارة الصلاحيات"
          action={
            <Button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              icon={<Plus size={16} />}
              size="sm"
            >
              إضافة خادم
            </Button>
          }
        />
      ) : (
        <>
          {/* ===== Mobile Cards ===== */}
          <div className="block lg:hidden space-y-3">
            {admins.map((admin, index) => {
              const isSuper = admin.role === "super_admin";
              const permsCount = admin.permissions?.length || 0;

              return (
                <Card
                  key={admin.id}
                  padding="none"
                  className="overflow-hidden animate-fade-in-up"
                  style={
                    {
                      animationDelay: `${Math.min(index * 30, 300)}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={admin.username}
                          size="md"
                          icon={
                            isSuper ? (
                              <ShieldCheck size={18} />
                            ) : (
                              <Shield size={18} />
                            )
                          }
                        />

                        <div className="min-w-0">
                          <h3 className="text-[14px] font-extrabold text-surface-900 truncate">
                            {admin.username}
                          </h3>

                          {/* compact meta line */}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant={getRoleVariant(admin.role)}
                              size="xs"
                              dot
                            >
                              {getRoleText(admin.role)}
                            </Badge>

                            <Badge
                              variant={getGenderVariant(admin.genderAccess)}
                              size="xs"
                            >
                              {genderAccessLabels[admin.genderAccess]}
                            </Badge>

                            <Badge variant="neutral" size="xs">
                              {getOriginAccessText(admin.allowedOrigins)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          icon={<Edit size={15} />}
                          label="تعديل"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                          className="!text-primary-600"
                        />
                        {!isSuper && (
                          <IconButton
                            icon={<Trash2 size={15} />}
                            label="حذف"
                            size="sm"
                            variant="danger"
                            onClick={() => setDeletingAdmin(admin)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-3 border-t border-surface-100" />

                    {/* Bottom row: permissions count + preview chips */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12px] font-bold text-surface-500">
                        {permsCount} صلاحية
                      </div>

                      {/* show up to 2 permissions only (clean) */}
                      <div className="flex flex-wrap justify-end gap-1.5 min-w-0">
                        {admin.permissions?.length ? (
                          <>
                            {admin.permissions.slice(0, 2).map((permission) => (
                              <Badge
                                key={permission}
                                variant="success"
                                size="xs"
                              >
                                {permissionLabels[permission]}
                              </Badge>
                            ))}

                            {admin.permissions.length > 2 && (
                              <span className="text-[11px] font-bold text-surface-500">
                                +{admin.permissions.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-surface-400">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ===== Desktop Table ===== */}
          <Card padding="none" className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    {[
                      "الخادم",
                      "الدور",
                      "الصلاحيات",
                      "الوصول",
                      "الإجراءات",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-right text-[11px] font-bold text-surface-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-surface-50/60 transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={admin.username}
                            size="sm"
                            icon={
                              admin.role === "super_admin" ? (
                                <ShieldCheck size={14} />
                              ) : (
                                <Shield size={14} />
                              )
                            }
                          />
                          <span className="font-bold text-surface-900 text-[13px]">
                            {admin.username}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={getRoleVariant(admin.role)}
                          size="xs"
                          dot
                        >
                          {getRoleText(admin.role)}
                        </Badge>
                      </td>

                      {/* Permissions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission) => (
                            <Badge key={permission} variant="success" size="xs">
                              {permissionLabels[permission]}
                            </Badge>
                          ))}
                          {admin.permissions.length === 0 && (
                            <span className="text-[11px] text-surface-400">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Access */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant={getGenderVariant(admin.genderAccess)}
                            size="xs"
                          >
                            {genderAccessLabels[admin.genderAccess]}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-surface-500 font-medium">
                            <MapPin size={12} />
                            {getOriginAccessText(admin.allowedOrigins)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <IconButton
                            icon={<Edit size={15} />}
                            label="تعديل"
                            size="xs"
                            onClick={() => handleEdit(admin)}
                            className="!text-primary-600 hover:!bg-primary-50"
                          />
                          {admin.role !== "super_admin" && (
                            <IconButton
                              icon={<Trash2 size={15} />}
                              label="حذف"
                              size="xs"
                              variant="danger"
                              onClick={() => setDeletingAdmin(admin)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ===== Delete Confirmation ===== */}
      <ConfirmDialog
        isOpen={!!deletingAdmin}
        onClose={() => setDeletingAdmin(null)}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="حذف الخادم"
        message={`هل أنت متأكد من حذف "${deletingAdmin?.username}"؟ سيتم إزالة جميع صلاحياته.`}
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteLoading}
      />
    </div>
  );
};

// ===== Section Label =====
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="text-[12px] font-bold text-surface-400 uppercase tracking-wider">
    {children}
  </p>
);

export default AdminManagementPage;
