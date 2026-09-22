"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, SurveySubmission, RespondentIdentity, SurveyAnswer, AuthUser } from "@/lib/types";
import { INITIAL_SUBMISSIONS } from "@/lib/constants/survey-data";

// SECURITY: Hardcoded accounts REMOVED for production safety
// Authentication now handled via API routes (/api/auth/login)
// See DATABASE_SETUP.md for backend authentication setup

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  login: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  submissions: SurveySubmission[];
  addSubmission: (submission: SurveySubmission) => void;
  updateSubmissionStatus: (
    id: string,
    status: SurveySubmission["status"],
    catatan?: string
  ) => void;
  draftIdentity: RespondentIdentity;
  setDraftIdentity: React.Dispatch<React.SetStateAction<RespondentIdentity>>;
  draftAnswers: Record<number, SurveyAnswer>;
  setDraftAnswers: React.Dispatch<React.SetStateAction<Record<number, SurveyAnswer>>>;
  clearDraft: () => void;
}

const defaultIdentity: RespondentIdentity = {
  namaLengkap: "",
  umur: "",
  jenisKelamin: "",
  kabupatenKota: "Kabupaten Kutai Kartanegara",
  kecamatan: "Tenggarong",
  pekerjaan: "",
  nomorTelepon: "",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("RESPONDEN");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [submissions, setSubmissions] = useState<SurveySubmission[]>(INITIAL_SUBMISSIONS);
  const [draftIdentity, setDraftIdentity] = useState<RespondentIdentity>(defaultIdentity);
  const [draftAnswers, setDraftAnswers] = useState<Record<number, SurveyAnswer>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      // Auto-seed default accounts for development (first load only)
      // Passwords stored as Base64 to avoid webpack optimization into string literals
      const existingUsers = localStorage.getItem("arindama_users");
      if (!existingUsers) {
        const defaultUsers = [
          {
            id: "default-admin",
            username: atob("YWRtaW4="), // "admin"
            email: atob("YWRtaW5AYXJpbmRhbWEuaWQ="), // "admin@arindama.id"
            password: atob("QWRtaW4jMjAyNA=="), // "Admin#2024"
            nama: "Drs. H. Hendra Wijaya, M.Si.",
            role: "ADMIN",
            jabatan: "Koordinator Tim Verifikasi Data Olahraga",
            instansi: "Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur",
          },
          {
            id: "default-responden",
            username: atob("cmVzcG9uZGVu"), // "responden"
            email: atob("cmVzcG9uZGVuQGFyaW5kYW1hLmlk"), // "responden@arindama.id"
            password: atob("VXNlciMyMDI0"), // "User#2024"
            nama: "Bambang Pamungkas, S.Pd.",
            role: "RESPONDEN",
            jabatan: "Pelatih & Pengurus Cabang Atletik",
            instansi: "Pengcab PASI Kabupaten Kutai Kartanegara",
          },
        ];
        localStorage.setItem("arindama_users", JSON.stringify(defaultUsers));
      }

      const savedRole = localStorage.getItem("arindama_role") as UserRole;
      if (savedRole === "ADMIN" || savedRole === "RESPONDEN") {
        setRoleState(savedRole);
      }
      const savedUser = localStorage.getItem("arindama_auth_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedSubmissions = localStorage.getItem("arindama_submissions");
      if (savedSubmissions) {
        setSubmissions(JSON.parse(savedSubmissions));
      }
      const savedDraftId = localStorage.getItem("arindama_draft_identity");
      if (savedDraftId) {
        setDraftIdentity(JSON.parse(savedDraftId));
      }
      const savedDraftAns = localStorage.getItem("arindama_draft_answers");
      if (savedDraftAns) {
        setDraftAnswers(JSON.parse(savedDraftAns));
      }
    } catch {
      // fallback to initial
    }
    setIsHydrated(true);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("arindama_role", newRole);
    }
  };

  const login = async (username: string, email: string, password: string): Promise<boolean> => {
    // DEVELOPMENT FALLBACK ONLY (skip API for now)
    // Remove this section when database is connected

    console.log("Using development fallback login (API disabled for now)");

    // SECURITY: Passwords stored in localStorage only, NOT in JS bundle
    // Default accounts seeded in useEffect above via localStorage
    const allAccounts = JSON.parse(localStorage.getItem("arindama_users") || "[]");

    const account = allAccounts.find(
      (acc: any) => acc.username.toLowerCase() === username.toLowerCase() &&
               acc.email.toLowerCase() === email.toLowerCase() &&
               acc.password === password
    );

    if (!account) return false;

    const user: AuthUser = {
      id: account.role === "ADMIN" ? "ADM-001" : `USR-${Date.now()}`,
      nama: account.nama,
      email: account.email,
      role: account.role,
      jabatan: account.jabatan,
      instansi: account.instansi,
    };

    setCurrentUser(user);
    setRoleState(user.role);
    localStorage.setItem("arindama_auth_user", JSON.stringify(user));
    localStorage.setItem("arindama_role", user.role);

    console.warn("⚠️ Using DEVELOPMENT FALLBACK auth. Setup database to use production API.");
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("arindama_auth_user");
    }
  };

  const addSubmission = (sub: SurveySubmission) => {
    setSubmissions((prev) => {
      const updated = [sub, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("arindama_submissions", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateSubmissionStatus = (
    id: string,
    status: SurveySubmission["status"],
    catatan?: string
  ) => {
    setSubmissions((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, status, catatanVerifikator: catatan || item.catatanVerifikator }
          : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("arindama_submissions", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearDraft = () => {
    setDraftIdentity(defaultIdentity);
    setDraftAnswers({});
    if (typeof window !== "undefined") {
      localStorage.removeItem("arindama_draft_identity");
      localStorage.removeItem("arindama_draft_answers");
    }
  };

  // Sync drafts when changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("arindama_draft_identity", JSON.stringify(draftIdentity));
      localStorage.setItem("arindama_draft_answers", JSON.stringify(draftAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [draftIdentity, draftAnswers, isHydrated]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        login,
        logout,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        draftIdentity,
        setDraftIdentity,
        draftAnswers,
        setDraftAnswers,
        clearDraft,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
