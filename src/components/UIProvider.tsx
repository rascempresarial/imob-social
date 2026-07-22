"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Modal from "./Modal";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState {
  opts: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);
const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de UIProvider");
  return ctx;
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm precisa estar dentro de UIProvider");
  return ctx;
}

let toastId = 0;

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const confirmFn = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setConfirmState({ opts, resolve }));
  }, []);

  function resolveConfirm(result: boolean) {
    confirmState?.resolve(result);
    setConfirmState(null);
  }

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirmFn}>
        {children}

        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type} pointer-events-auto`}>
              {t.message}
            </div>
          ))}
        </div>

        {confirmState && (
          <Modal title={confirmState.opts.title ?? "Confirmar ação"} onClose={() => resolveConfirm(false)} width="max-w-sm">
            <p className="text-sm text-navy-700 mb-5">{confirmState.opts.message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => resolveConfirm(false)} className="px-4 py-2 text-sm rounded-lg text-navy-700 hover:bg-navy-100">
                Cancelar
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  confirmState.opts.danger ? "bg-red-600 hover:bg-red-700" : "bg-navy-800 hover:bg-navy-700"
                }`}
              >
                {confirmState.opts.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </Modal>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}
