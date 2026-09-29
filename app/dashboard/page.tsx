"use client";

import React from "react";
import { useApp } from "@/lib/context/app-context";
import { AdminView } from "./AdminView";
import { RespondenView } from "./RespondenView";

export default function DashboardPage() {
  const { currentUser } = useApp();

  if (currentUser?.role === "ADMIN") {
    return <AdminView />;
  }

  return <RespondenView />;
}
