import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Share2,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  toast,
} from "@craft-apex/ui";
import { useBusinessCard, useShortenUrl } from "./business-card.api";

export default function BusinessCardPage() {
  const { data, isLoading, error, refetch } = useBusinessCard();
  const shorten = useShortenUrl();
  const [shareOpen, setShareOpen] = useState(false);

  const imageUrl = data?.imageUrl;
  const downloadUrl = data?.downloadUrl;

  const onShare = async () => {
    if (!imageUrl) {
      toast.error("No business card available to share.");
      return;
    }
    // Match legacy: try Web Share API with file payload first, otherwise modal.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "business-card.png", {
          type: blob.type || "image/png",
        });
        const shareData: ShareData = {
          title: "My Business Card",
          text: "Here's my business card! Save & share my contact",
          files: [file],
        };
        if (
          "canShare" in navigator &&
          (navigator as Navigator).canShare?.(shareData)
        ) {
          await (navigator as Navigator).share(shareData);
          return;
        }
        await (navigator as Navigator).share({
          title: shareData.title,
          text: `${shareData.text}\n\n${imageUrl}`,
        });
        return;
      } catch {
        // Fall through to modal.
      }
    }
    setShareOpen(true);
  };

  const onWhatsAppShare = async () => {
    let shareUrl = imageUrl!;
    try {
      shareUrl = await shorten.mutateAsync(imageUrl!);
    } catch {
      // Legacy falls back to the long URL on shortener failure.
    }
    const message = encodeURIComponent(
      `Here's my business card!\n\n${shareUrl}\n\nSave my contact details!`
    );
    window.open(
      `https://web.whatsapp.com/send?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
    setShareOpen(false);
  };

  const onCopyLink = async () => {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      setShareOpen(false);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const onDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Business Card
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading && (
          <div className="flex h-72 items-center justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div className="flex-1">
              {error instanceof Error
                ? error.message
                : "Error generating business card. Please try again."}
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0 text-rose-700 underline"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {imageUrl && !isLoading && (
          <>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50/40 p-3">
              <img
                src={imageUrl}
                alt="Business Card"
                className="max-h-[500px] rounded-md object-contain shadow-sm"
              />
            </div>
            <Button onClick={onShare} className="mt-4 w-full" size="lg">
              <Share2 className="h-4 w-4" /> Share Card
            </Button>
          </>
        )}
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Business Card</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-slate-600">
            Choose how you'd like to share your business card:
          </p>
          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={onDownload}
              disabled={!downloadUrl}
            >
              <Download className="h-4 w-4" /> Download &amp; Share as Image
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onWhatsAppShare}
              disabled={!imageUrl}
            >
              <MessageCircle className="h-4 w-4" /> Share Link via WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCopyLink}
              disabled={!imageUrl}
            >
              <Copy className="h-4 w-4" /> Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
