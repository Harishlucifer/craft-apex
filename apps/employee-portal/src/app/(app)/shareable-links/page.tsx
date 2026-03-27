"use client";

import { useState } from "react";
import { useSetupStore } from "@craft-apex/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@craft-apex/ui/components/card";
import { Link2, Copy, Check, AlertCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shareable Links Page                                               */
/* ------------------------------------------------------------------ */

interface LinkCardProps {
  title: string;
  link: string | null;
  onCopy: (text: string, type: string) => void;
  copiedLink: string;
}

function LinkCard({ title, link, onCopy, copiedLink }: LinkCardProps) {
  const isCopied = copiedLink === link;

  if (!link) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Link2 className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Please contact IT admin to get this link</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Link display */}
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            readOnly
            value={link}
            className="flex-1 bg-transparent text-sm text-slate-600 outline-none truncate"
          />
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={() => onCopy(link, title)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
            isCopied
              ? "border-green-200 bg-green-50 text-green-600"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title={isCopied ? "Copied!" : "Copy to clipboard"}
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ShareableLinksPage() {
  const { user } = useSetupStore();
  const [copiedLink, setCopiedLink] = useState("");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(text);
      // Reset after 2 seconds
      setTimeout(() => setCopiedLink(""), 2000);
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shareable Links</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share onboarding and lead creation links with partners and customers
        </p>
      </div>

      {/* Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <LinkCard
              title="Partner Onboarding"
              link={user?.partner_sharable_link ?? null}
              onCopy={copyToClipboard}
              copiedLink={copiedLink}
            />
            <LinkCard
              title="Lead Creation"
              link={user?.application_sharable_link ?? null}
              onCopy={copyToClipboard}
              copiedLink={copiedLink}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toast notification */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="h-4 w-4 text-green-400" />
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
