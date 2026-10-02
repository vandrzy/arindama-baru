"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Scrollable container */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div 
          className={
            className ||
            "flex min-h-full items-center justify-center p-4 text-center sm:p-0"
          }
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) {
              onClose();
            }
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
