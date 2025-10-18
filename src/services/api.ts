import axios from "axios";
import {
  AuthResponse,
  ApiResponse,
  Person,
  User,
  Stats,
  LoginForm,
  PersonForm,
  AdminForm,
  FilterOptions,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  createAdmin: async (adminData: AdminForm): Promise<ApiResponse<User>> => {
    const response = await api.post("/auth/create-admin", adminData);
    return response.data;
  },

  getAdmins: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/auth/admins");
    return response.data;
  },

  updateAdmin: async (
    id: string,
    adminData: Partial<AdminForm>
  ): Promise<ApiResponse<User>> => {
    const response = await api.put(`/auth/admins/${id}`, adminData);
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/auth/admins/${id}`);
    return response.data;
  },
};

// Persons API
export const personsAPI = {
  getPersons: async (
    filters: FilterOptions = {}
  ): Promise<ApiResponse<Person[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/persons?${params.toString()}`);
    return response.data;
  },

  getPerson: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },

  createPerson: async (
    personData: PersonForm
  ): Promise<ApiResponse<Person>> => {
    const response = await api.post("/persons", personData);
    return response.data;
  },

  updatePerson: async (
    id: string,
    personData: Partial<PersonForm>
  ): Promise<ApiResponse<Person>> => {
    const response = await api.put(`/persons/${id}`, personData);
    return response.data;
  },

  deletePerson: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/persons/${id}`);
    return response.data;
  },

  getStats: async (
    filters: { gender?: string } = {}
  ): Promise<ApiResponse<Stats>> => {
    const params = new URLSearchParams();
    if (filters.gender) {
      params.append("gender", filters.gender);
    }

    const response = await api.get(
      `/persons/stats/overview?${params.toString()}`
    );
    return response.data;
  },

  addNote: async (personId: string, content: string): Promise<ApiResponse> => {
    const response = await api.post(`/persons/${personId}/notes`, { content });
    return response.data;
  },

  deleteNote: async (
    personId: string,
    noteId: string
  ): Promise<ApiResponse> => {
    const response = await api.delete(`/persons/${personId}/notes/${noteId}`);
    return response.data;
  },
};

export default api;
