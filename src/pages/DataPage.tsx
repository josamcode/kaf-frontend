import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Eye,
} from "lucide-react";
import { Person, FilterOptions } from "../types";
import { personsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ViewPersonModal from "../components/ViewPersonModal";

interface DataPageProps {
  onAddPerson: () => void;
  onEditPerson: (person: Person) => void;
}

const DataPage: React.FC<DataPageProps> = ({ onAddPerson, onEditPerson }) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    limit: 20,
  });

  const { hasPermission, canAccessGender } = useAuth();

  // Function to sort persons alphabetically by name
  const sortPersonsAlphabetically = (persons: Person[]): Person[] => {
    return persons.sort((a, b) => {
      // Normalize Arabic names for proper sorting
      const normalizeArabicName = (name: string) => {
        return name
          .replace(/أ/g, "ا") // Convert أ to ا
          .replace(/إ/g, "ا") // Convert إ to ا
          .replace(/آ/g, "ا") // Convert آ to ا
          .replace(/ة/g, "ه") // Convert ة to ه
          .replace(/ى/g, "ي") // Convert ى to ي
          .trim();
      };

      const nameA = normalizeArabicName(a.name);
      const nameB = normalizeArabicName(b.name);

      return nameA.localeCompare(nameB, "ar", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  // Load persons
  const loadPersons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personsAPI.getPersons(filters);

      if (response.success && response.persons) {
        const sortedPersons = sortPersonsAlphabetically(response.persons);
        setPersons(sortedPersons);
      } else {
        setError(response.message || "فشل في تحميل البيانات");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm: string) => {
    handleFilterChange("search", searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الشخص؟")) return;

    try {
      const response = await personsAPI.deletePerson(id);
      if (response.success) {
        loadPersons(); // Reload data
      } else {
        setError(response.message || "فشل في حذف الشخص");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في الخادم");
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const getGenderText = (gender: "boy" | "girl") => {
    return gender === "boy" ? "ولد" : "بنت";
  };

  const getYearText = (year: number) => {
    return `سنة ${year}`;
  };

  return (
    <div className="p-3 lg:p-6 h-full flex flex-col w-full">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              بيانات المخدومين
            </h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              إدارة ومتابعة بيانات المخدومين
            </p>
          </div>

          {hasPermission("create_data") && (
            <button
              onClick={onAddPerson}
              className="flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm"
            >
              <span className="font-medium">إضافة شخص جديد</span>
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="البحث بالاسم، الكلية، الجامعة، أو البلد..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">فلاتر</span>
            <Filter size={20} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النوع
                </label>
                <select
                  value={filters.gender || ""}
                  onChange={(e) =>
                    handleFilterChange("gender", e.target.value || undefined)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                >
                  <option value="">الكل</option>
                  <option value="boy">أولاد</option>
                  <option value="girl">بنات</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السنة الدراسية
                </label>
                <select
                  value={filters.year || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "year",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                >
                  <option value="">الكل</option>
                  <option value="1">السنة الأولى</option>
                  <option value="2">السنة الثانية</option>
                  <option value="3">السنة الثالثة</option>
                  <option value="4">السنة الرابعة</option>
                  <option value="5">السنة الخامسة</option>
                </select>
              </div>

              {/* Origin Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البلد الأصلية
                </label>
                <input
                  type="text"
                  placeholder="البحث بالبلد..."
                  value={filters.origin || ""}
                  onChange={(e) =>
                    handleFilterChange("origin", e.target.value || undefined)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>

              {/* College Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الكلية
                </label>
                <input
                  type="text"
                  placeholder="البحث بالكلية..."
                  value={filters.college || ""}
                  onChange={(e) =>
                    handleFilterChange("college", e.target.value || undefined)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Data Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل البيانات...</p>
          </div>
        ) : persons.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">لا توجد بيانات متاحة</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {persons.map((person) => (
                  <div
                    key={person._id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {person.name}
                        </h3>
                        <div className="flex items-center space-x-reverse space-x-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              person.gender === "boy"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {getGenderText(person.gender)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {getYearText(person.year)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-1">
                        <button
                          onClick={() => setViewingPerson(person)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="عرض"
                        >
                          <Eye size={18} />
                        </button>
                        {hasPermission("edit_data") &&
                          canAccessGender(person.gender) && (
                            <button
                              onClick={() => onEditPerson(person)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                        {hasPermission("delete_data") &&
                          canAccessGender(person.gender) && (
                            <button
                              onClick={() => handleDelete(person._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <GraduationCap size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {person.college || "غير محدد"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {person.origin}
                        </span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {person.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-reverse space-x-2">
                      <button
                        onClick={() => handleCall(person.phone)}
                        className="flex-1 flex items-center justify-center space-x-reverse space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <span className="text-sm">اتصال</span>
                        <Phone size={16} />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(person.phone)}
                        className="flex-1 flex items-center justify-center space-x-reverse space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <span className="text-sm">واتساب</span>
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الاسم
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      النوع
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      السنة
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الكلية
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      البلد الأصلية
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      رقم الهاتف
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {persons.map((person) => (
                    <tr key={person._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {person.name}
                        </div>
                        {person.birthDate && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(person.birthDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            person.gender === "boy"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {getGenderText(person.gender)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getYearText(person.year)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {person.college || "غير محدد"}
                        </div>
                        {person.university && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <GraduationCap size={12} className="mr-1" />
                            {person.university}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {person.origin}
                        </div>
                        {person.residence && (
                          <div className="text-xs text-gray-500 mt-1">
                            {person.residence}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {person.phone}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-reverse space-x-2">
                          {/* View Button */}
                          <button
                            onClick={() => setViewingPerson(person)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="عرض"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Call Button */}
                          <button
                            onClick={() => handleCall(person.phone)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="اتصال"
                          >
                            <Phone size={16} />
                          </button>

                          {/* WhatsApp Button */}
                          <button
                            onClick={() => handleWhatsApp(person.phone)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="واتساب"
                          >
                            <MessageCircle size={16} />
                          </button>

                          {/* Edit Button */}
                          {hasPermission("edit_data") &&
                            canAccessGender(person.gender) && (
                              <button
                                onClick={() => onEditPerson(person)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                          {/* Delete Button */}
                          {hasPermission("delete_data") &&
                            canAccessGender(person.gender) && (
                              <button
                                onClick={() => handleDelete(person._id)}
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

      {/* Pagination */}
      {persons.length > 0 && (
        <div className="mt-4 lg:mt-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                handleFilterChange("page", Math.max(1, (filters.page || 1) - 1))
              }
              disabled={!filters.page || filters.page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              السابق
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 font-medium">
              صفحة {filters.page || 1}
            </span>
            <button
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) + 1)
              }
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* View Person Modal */}
      <ViewPersonModal
        isOpen={!!viewingPerson}
        onClose={() => setViewingPerson(null)}
        person={viewingPerson}
        onPersonUpdate={loadPersons}
        onPersonRefresh={(updatedPerson) => setViewingPerson(updatedPerson)}
      />
    </div>
  );
};

export default DataPage;
