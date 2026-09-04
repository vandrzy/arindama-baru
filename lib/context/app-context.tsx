"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, SurveySubmission, RespondentIdentity, SurveyAnswer, AuthUser } from "@/lib/types";
import { INITIAL_SUBMISSIONS } from "@/lib/constants/survey-data";

export const ACCOUNTS = {
  admin: {
    email: "admin@arindama.id",
    password: "Admin#2024",
    nama: "Drs. H. Hendra Wijaya, M.Si.",
    role: "ADMIN" as UserRole,
    jabatan: "Koordinator Tim Verifikasi Data Olahraga",
    instansi: "Dinas Pemuda dan Olahraga",
  },
  responden: {
    email: "responden@arindama.id",
    password: "User#2024",
    nama: "Bambang Pamungkas, S.Pd.",
    role: "RESPONDEN" as UserRole,
    jabatan: "Pelatih & Pengurus Cabang Atletik",
    instansi: "Pengcab PASI Kabupaten Sleman",
  },
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  login: (email: string, password: string) => boolean;
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
  kabupatenKota: "Kabupaten Sleman",
  kecamatan: "",
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

  const login = (email: string, password: string): boolean => {
    // Find matching account
    const account = Object.values(ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (!account) return false;

    const user: AuthUser = {
      id: account.role === "ADMIN" ? "ADM-001" : "USR-001",
      nama: account.nama,
      email: account.email,
      role: account.role,
      jabatan: account.jabatan,
      instansi: account.instansi,
    };

    setCurrentUser(user);
    setRoleState(user.role);
    if (typeof window !== "undefined") {
      localStorage.setItem("arindama_auth_user", JSON.stringify(user));
      localStorage.setItem("arindama_role", user.role);
    }
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
