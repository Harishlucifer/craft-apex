import * as React from "react";
import { cn } from "../lib/utils";

/* ------------------------------------------------------------------ */
/*  Dialog — smooth, centered modal with CSS transitions              */
/*  Matches the shadcn/ui Dialog interface used by workflow components */
/* ------------------------------------------------------------------ */

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
}

/* ---- Overlay ---- */

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn("fixed inset-0 z-50", className)}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        animation: "dialogOverlayIn 0.2s ease-out",
      }}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

/* ---- Content ---- */

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, style, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <>
      <DialogOverlay />
      {/* Centering wrapper — flexbox is more reliable than translate */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-lg bg-white border shadow-2xl rounded-2xl p-6",
            className
          )}
          style={{
            pointerEvents: "auto",
            animation: "dialogContentIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            ...style,
          }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full opacity-60 transition-all duration-200 hover:opacity-100 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
            style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes dialogOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dialogContentIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
});
DialogContent.displayName = "DialogContent";

/* ---- Title ---- */

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

/* ---- Description ---- */

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription };
