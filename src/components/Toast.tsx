import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--background)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          borderRadius: "var(--radius-lg)",
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        className: "shadow-md",
      }}
      theme="light"
      richColors
    />
  );
}
