"use client";

import React from "react";

interface ErrorModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({
  title,
  message,
  onClose
}: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in">
        
        <h3 className="text-sm font-bold uppercase tracking-widest text-red-600">
          {title}
        </h3>

        <p className="mt-4 text-xs text-zinc-400 uppercase tracking-wide">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-white text-black text-[10px] font-bold uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
