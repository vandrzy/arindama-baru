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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  const [submissions, setSubmissions] = useState<SurveySubmission[]>(INITIAL_SUBMISSIONS);
  const [draftIdentity, setDraftIdentity] = useState<RespondentIdentity>(defaultIdentity);
  const [draftAnswers, setDraftAnswers] = useState<Record<number, SurveyAnswer>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate session from HTTP-Only Cookie via /api/auth/me
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setRoleState(data.user.role as UserRole);
          }
        }
      } catch (err) {
        console.error("Session rehydration error:", err);
      } finally {
        setIsLoading(false);
      }

      // Hydrate non-auth survey drafts & submissions from localStorage
      try {
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
        // fallback
      }

      setIsHydrated(true);
    }

    initSession();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const login = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        const user: AuthUser = {
          id: data.user.id,
          nama: data.user.nama,
          email: data.user.email,
          role: data.user.role,
          jabatan: data.user.jabatan,
          instansi: data.user.instansi,
        };

        setCurrentUser(user);
        setRoleState(user.role);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Login API error:", err);
      return false;
    }
  };

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch((err) =>
      console.error("Logout API error:", err)
    );
    setCurrentUser(null);
    setRoleState("RESPONDEN");
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
        isLoading,
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
