import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
          borderRadius: "12px",
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
