export interface User {
  id: string;
  username: string;
  role: "super_admin" | "admin";
  permissions: Permission[];
  genderAccess: "boys" | "girls" | "both";
}

export type Permission =
  | "view_boys"
  | "view_girls"
  | "edit_data"
  | "create_data"
  | "delete_data"
  | "manage_admins"
  | "manage_notes";

export interface Person {
  _id: string;
  name: string;
  gender: "boy" | "girl";
  birthDate?: string;
  college?: string;
  university?: string;
  residence?: string;
  origin: string;
  year: 1 | 2 | 3 | 4 | 5;
  phone: string;
  customFields?: Record<string, string>;
  notes?: Note[];
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id?: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  person?: Person;
  persons?: Person[];
  admins?: User[];
  stats?: Stats;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface Stats {
  total: number;
  boys: number;
  girls: number;
  byYear: Array<{ _id: number; count: number }>;
  topOrigins: Array<{ _id: string; count: number }>;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface PersonForm {
  name: string;
  gender: "boy" | "girl";
  birthDate?: string;
  college?: string;
  university?: string;
  residence?: string;
  origin: string;
  year: 1 | 2 | 3 | 4 | 5;
  phone: string;
  customFields?: Record<string, string>;
}

export interface AdminForm {
  username: string;
  password: string;
  permissions: Permission[];
  genderAccess: "boys" | "girls" | "both";
}

export interface FilterOptions {
  gender?: "boy" | "girl";
  year?: number;
  origin?: string;
  college?: string;
  university?: string;
  search?: string;
  page?: number;
  limit?: number;
}
