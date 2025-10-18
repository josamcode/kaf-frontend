import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { User, AdminForm, Permission } from "../types";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [formData, setFormData] = useState<AdminForm>({
    username: "",
    password: "",
    permissions: [],
    genderAccess: "both",
  });

  const { hasPermission } = useAuth();

  // Function to sort admins alphabetically by username
  const sortAdminsAlphabetically = (admins: User[]): User[] => {
    return admins.sort((a, b) => {
      // Normalize Arabic usernames for proper sorting
      const normalizeArabicName = (name: string) => {
        return name
          .replace(/أ/g, "ا") // Convert أ to ا
          .replace(/إ/g, "ا") // Convert إ to ا
          .replace(/آ/g, "ا") // Convert آ to ا
          .replace(/ة/g, "ه") // Convert ة to ه
          .replace(/ى/g, "ي") // Convert ى to ي
          .trim();
      };

      const nameA = normalizeArabicName(a.username);
      const nameB = normalizeArabicName(b.username);

      return nameA.localeCompare(nameB, "ar", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  // Clear all messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const permissionLabels: Record<Permission, string> = {
    view_boys: "عرض بيانات الأولاد",
    view_girls: "عرض بيانات البنات",
    edit_data: "تعديل البيانات",
    create_data: "إضافة بيانات جديدة",
    delete_data: "حذف البيانات",
    manage_admins: "إدارة الخدام",
    manage_notes: "إدارة الملاحظات",
  };

  const genderAccessLabels = {
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
        const sortedAdmins = sortAdminsAlphabetically(response.admins);
        setAdmins(sortedAdmins);
        setInfoMessage(`تم تحميل ${response.admins.length} خادم بنجاح`);
      } else {
        setError(response.message || "فشل في تحميل الخدام");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في السيرفر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage || infoMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setInfoMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, infoMessage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      clearMessages();

      if (editingAdmin) {
        // Update existing admin
        if (!editingAdmin.id) {
          setError("معرف الخادم غير صحيح");
          return;
        }

        const response = await authAPI.updateAdmin(editingAdmin.id, {
          permissions: formData.permissions,
          genderAccess: formData.genderAccess,
        });

        if (response.success) {
          setSuccessMessage("تم تحديث الخادم بنجاح");
          loadAdmins();
          setEditingAdmin(null);
          resetForm();
          setShowAddForm(false); // Close the form
        } else {
          setError(response.message || "فشل في تحديث الخادم");
        }
      } else {
        // Create new admin
        const response = await authAPI.createAdmin(formData);

        if (response.success) {
          setSuccessMessage("تم إنشاء الخادم بنجاح");
          loadAdmins();
          setShowAddForm(false);
          resetForm();
        } else {
          setError(response.message || "فشل في إنشاء الخادم");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الخادم؟")) return;

    try {
      clearMessages();

      if (!id) {
        setError("معرف الخادم غير صحيح");
        return;
      }

      const response = await authAPI.deleteAdmin(id);
      if (response.success) {
        setSuccessMessage("تم حذف الخادم بنجاح");
        loadAdmins();
      } else {
        setError(response.message || "فشل في حذف الخادم");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    }
  };

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: "",
      permissions: admin.permissions,
      genderAccess: admin.genderAccess,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      permissions: [],
      genderAccess: "both",
    });
    setEditingAdmin(null);
    clearMessages();
  };

  const getRoleText = (role: string) => {
    return role === "super_admin" ? "أمين الخدمة" : "خادم";
  };

  const getRoleBadge = (role: string) => {
    return role === "super_admin" ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        أمين الخدمة
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        خادم
      </span>
    );
  };

  return (
    <div className="p-3 lg:p-6">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              إدارة الخدام
            </h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              إدارة صلاحيات الخدام والمخدومين
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm"
          >
            <span className="font-medium">إضافة خادم جديد</span>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 lg:mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="text-red-700">{error}</span>
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 lg:mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="text-green-700">{successMessage}</span>
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
          </div>
        </div>
      )}

      {/* Info Message */}
      {infoMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 lg:mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="text-blue-700">{infoMessage}</span>
            <Eye className="text-blue-500 flex-shrink-0" size={20} />
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
              {editingAdmin ? "تعديل الخادم" : "إضافة خادم جديد"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!editingAdmin}
                  disabled={!!editingAdmin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 text-base"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور{" "}
                  {editingAdmin && (
                    <span className="text-gray-500 text-sm">
                      (اتركها فارغة للحفاظ على الكلمة الحالية)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingAdmin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
            </div>

            {/* Gender Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                صلاحية الوصول للبيانات
              </label>
              <select
                name="genderAccess"
                value={formData.genderAccess}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              >
                <option value="both">الكل (أولاد وبنات)</option>
                <option value="boys">أولاد فقط</option>
                <option value="girls">بنات فقط</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                الصلاحيات
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <label
                    key={permission}
                    className="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(
                        permission as Permission
                      )}
                      onChange={(e) =>
                        handlePermissionChange(
                          permission as Permission,
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium shadow-sm flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>{editingAdmin ? "حفظ التغييرات" : "إضافة الخادم"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Display */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل الخدام...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">لا يوجد خدام</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {admin.username}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                              admin.role === "super_admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {getRoleText(admin.role)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {admin.genderAccess === "both"
                              ? "الكل"
                              : admin.genderAccess === "boys"
                              ? "أولاد"
                              : "بنات"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        {admin.role !== "super_admin" && (
                          <button
                            onClick={() => handleDelete(admin.id!)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">الصلاحيات:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg"
                          >
                            {permissionLabels[permission]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      اسم المستخدم
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      النوع
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الصلاحيات
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الوصول للبيانات
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Shield className="text-gray-400" size={20} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {admin.username}
                            </div>
                            {admin.role === "super_admin" && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                أمين الخدمة
                              </span>
                            )}
                            {admin.role === "admin" && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                خادم
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(admin.role)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                            >
                              {permissionLabels[permission]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {genderAccessLabels[admin.genderAccess]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit size={16} />
                          </button>
                          {admin.role !== "super_admin" && (
                            <button
                              onClick={() => handleDelete(admin.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManagementPage;
