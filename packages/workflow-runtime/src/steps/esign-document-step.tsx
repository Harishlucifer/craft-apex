import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  toast,
} from "@craft-apex/ui";
import {
  Check,
  CheckCheck,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Mail,
  Calendar,
  User,
  X,
} from "lucide-react";
import { getApiClient } from "@craft-apex/api";
import { registerStepComponent, type StepComponentProps } from "../step-component-registry";

// Helper function to format date
const formattedDateWithTime = (dateString: string | number | Date) => {
  if (!dateString) return "N/A";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "N/A";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Helper function to get badge color variant based on status
const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'signed':
      return 'success';
    case 'requested':
      return 'default'; // primary / blue
    case 'expired':
      return 'destructive'; // danger / red
    default:
      return 'secondary';
  }
};

export default function ESignDocumentStep({
  step: _step,
  value: _value,
  onChange: _onChange,
  onNext: _onNext,
  onBack: _onBack,
  context,
}: StepComponentProps) {
  const api = getApiClient();
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const onboardingId = useMemo(() => {
    return (
      context?.onboardingId ??
      context?.sourceId ??
      context?.workflow?.source_id ??
      (context?.workflow?.source as any)?.application?.onboarding_id ??
      (context?.workflow?.source as any)?.onboarding_id
    );
  }, [context]);

  const workflowType = context?.workflowType ?? context?.workflow?.workflow_type ?? "";
  const isFetched = useRef(false);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const fetchDocumentPreview = async () => {
    if (!onboardingId) {
      console.error("No onboarding ID available");
      setStatus("error");
      setIsGenerating(false);
      return;
    }
    if (status === "idle") {
      setIsGenerating(true);
    }
    setDocumentUrl(null);
    setStatus("idle");
    try {
      const response = await api.get<any, any>(`/alpha/v1/cam/${onboardingId}/document-sign`);
      const resData = response?.data?.result ?? response?.result ?? response;

      if (resData?.document_preview_url) {
        setDocumentUrl(resData.document_preview_url);
        setDocumentDetails(resData);
        setStatus("success");
      } else {
        setDocumentUrl(null);
        setStatus("error");
        console.error("No document preview URL found in response");
      }
    } catch (error) {
      console.error("Error fetching document preview:", error);
      setStatus("error");
      toast.error("Failed to generate document preview.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!onboardingId) {
      toast.error("No onboarding ID available");
      return;
    }
    setIsDownloading(true);
    try {
      const response = await api.get<any, any>(`/alpha/v1/cam/${onboardingId}/document-sign/download`);
      const resData = response?.data ?? response;
      if (resData?.status === 1 && resData?.url) {
        window.open(resData.url, "_blank");
      } else {
        toast.error("Invalid response format or missing download URL");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Error downloading document.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendToSign = async () => {
    if (!onboardingId) {
      toast.error("No onboarding ID available");
      return;
    }
    setIsSending(true);
    const sourceId =
      (context?.workflow?.source as any)?.application?.channel_id ??
      (context?.workflow?.source as any)?.application?.application_id ??
      context?.sourceId ??
      "";

    const payload = {
      workflow_type: workflowType,
      source_id: sourceId,
      onboarding_id: onboardingId,
      template: documentDetails?.template || "",
      template_key: documentDetails?.template_key || "",
      participants: documentDetails?.participants || [],
    };

    try {
      setIsGenerating(true);
      const response = await api.post<any, any>(`/alpha/v1/cam/${onboardingId}/document-sign/request`, payload);
      const resData = response?.data ?? response;

      if (resData?.status === 1) {
        toast.success("Document sent for signing successfully!");
        const docResponse = await api.get<any, any>(`/alpha/v1/cam/${onboardingId}/document-sign`);
        const docResData = docResponse?.data?.result ?? docResponse?.result ?? docResponse;
        if (docResData) {
          setDocumentDetails(docResData);
        }
      } else {
        toast.error(resData?.message?.error ?? "Error sending document for signing");
      }
    } catch (error) {
      console.error("Error sending document for signing:", error);
      toast.error("Failed to request E-sign.");
    } finally {
      setIsGenerating(false);
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!onboardingId || isFetched.current) return;
    isFetched.current = true;
    fetchDocumentPreview();
  }, [onboardingId]);

  const signingParties = documentDetails?.response_data?.signing_parties;
  const hasReferenceId = Boolean(documentDetails?.response_data?.reference_id);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Card: Document Generation */}
        <Card className="shadow-lg lg:col-span-8 flex flex-col overflow-hidden border-slate-100 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Document Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-stretch">
            {/* Document Preview Area */}
            <div className="flex-1 min-h-[450px] relative rounded-xl border border-slate-100 bg-slate-50 flex justify-center items-center overflow-hidden shadow-inner">
              {isGenerating ? (
                <div className="flex flex-col justify-center items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-sm font-medium text-slate-500 animate-pulse">
                    Loading document preview...
                  </p>
                </div>
              ) : documentUrl ? (
                <iframe
                  src={documentDetails?.signed_document_url || documentUrl}
                  title={documentDetails?.signed_document_url ? "Signed Document" : "Document Preview"}
                  className="w-full h-full border-0 absolute inset-0"
                  key={documentDetails?.signed_document_url || documentUrl}
                />
              ) : (
                <div className="flex flex-col justify-center items-center text-slate-400 gap-2">
                  <AlertCircle className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-400">No document available</p>
                </div>
              )}
            </div>

            {/* Actions panel */}
            <div className="w-full md:w-56 flex flex-col gap-3 justify-start shrink-0">
              {/* Generate Button */}
              {status === "success" ? (
                <div className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                  <Check className="h-4 w-4" /> Success
                </div>
              ) : (
                <Button
                  onClick={fetchDocumentPreview}
                  disabled={isGenerating}
                  className="w-full justify-center transition-all bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : status === "error" ? (
                    <>
                      <X className="h-4 w-4" /> Failed - Try Again
                    </>
                  ) : (
                    "Generate Document"
                  )}
                </Button>
              )}

              {/* Send to Sign Button */}
              {hasReferenceId ? (
                <div className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                  <CheckCheck className="h-4 w-4" /> Sent for Signing
                </div>
              ) : (
                <Button
                  onClick={handleSendToSign}
                  disabled={!documentUrl || isSending || isGenerating}
                  className="w-full justify-center font-medium bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send to Sign"
                  )}
                </Button>
              )}

              {/* Download Signed Document */}
              <Button
                variant="outline"
                onClick={handleDownloadDocument}
                disabled={!hasReferenceId || isGenerating || isSending || isDownloading}
                className="w-full justify-center gap-2 font-medium border-slate-200 hover:bg-slate-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 text-slate-600" /> Download Signed Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: E-sign Status Accordion */}
        <Card className="shadow-lg lg:col-span-4 flex flex-col overflow-hidden border-slate-100 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-lg font-semibold text-slate-800">
              {signingParties ? "Document E-sign Status" : "Participants"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[500px] space-y-3">
            {signingParties ? (
              signingParties.map((party: any, partyIndex: number) => {
                const targetId = partyIndex.toString();
                const isExpanded = openAccordion === targetId;
                return (
                  <div
                    key={partyIndex}
                    className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/20 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleAccordion(targetId)}
                      className="w-full flex items-center justify-between p-4 text-left transition-colors focus:outline-none"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          {party?.name || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {party?.identifier || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          updated date :{" "}
                          {party?.updated_at ? formattedDateWithTime(party.updated_at) : "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusBadgeVariant(party?.status || "")}>
                          {party?.status?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Body */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-white p-4">
                        <ul className="space-y-4 relative pl-3 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                          {party?.activity_stream?.length > 0 ? (
                            party.activity_stream.map((activity: any, idx: number) => {
                              const isSuccess =
                                activity?.status === "SIGNED" || activity?.status === "COMPLETED";
                              const isPrimary = activity?.status === "INVITATION SENT";

                              return (
                                <li key={idx} className="relative flex gap-3">
                                  {/* Timeline circle */}
                                  <div
                                    className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white -translate-x-[1.5px] ${
                                      isSuccess
                                        ? "bg-emerald-500"
                                        : isPrimary
                                          ? "bg-indigo-500"
                                          : "bg-amber-500"
                                    }`}
                                  />
                                  <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-1 text-xs">
                                    <div
                                      className={`font-semibold ${
                                        isSuccess
                                          ? "text-emerald-700"
                                          : isPrimary
                                            ? "text-indigo-700"
                                            : "text-amber-700"
                                      }`}
                                    >
                                      {activity?.status?.toUpperCase() || "UNKNOWN"}
                                    </div>
                                    {activity?.signature_type && (
                                      <div className="text-slate-500">
                                        Signature Type: {activity.signature_type}
                                      </div>
                                    )}
                                    {activity?.expire_on && (
                                      <div className="text-slate-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Expires: {formattedDateWithTime(activity.expire_on).split(" ")[0]}
                                      </div>
                                    )}
                                    <div className="text-slate-400">
                                      updated date :{" "}
                                      {activity?.updated_at
                                        ? formattedDateWithTime(activity.updated_at)
                                        : "N/A"}
                                    </div>
                                  </div>
                                </li>
                              );
                            })
                          ) : (
                            <li className="text-xs text-slate-400 italic">No activity yet</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            ) : documentDetails?.participants?.map((participant: any, index: number) => {
                const targetId = index.toString();
                const isExpanded = openAccordion === targetId;
                return (
                  <div
                    key={index}
                    className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/20"
                  >
                    <button
                      onClick={() => toggleAccordion(targetId)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          {participant.name || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {participant.email || "N/A"}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-white p-4 text-xs text-slate-400 italic">
                        Details will be available after the document is sent for signing.
                      </div>
                    )}
                  </div>
                );
              })
            }
          </CardContent>
          <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3 px-6 text-xs text-slate-500 flex justify-center">
            Last updated:{" "}
            {documentDetails?.response_data?.updated_at
              ? formattedDateWithTime(documentDetails.response_data.updated_at)
              : "N/A"}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

registerStepComponent("DOCUMENT_WITH_E-SIGN", ESignDocumentStep);
