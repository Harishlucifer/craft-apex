import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Eye, Trash2, EyeOff } from "lucide-react";
import { Button, Input, Label, Badge } from "@craft-apex/ui";
import type { DocumentConfig, UploadedDocument } from "../features/child-partner/child-partner-list.types";

interface DocumentUploadProps {
  documents: DocumentConfig[];
  uploadedDocuments: Record<string, UploadedDocument>;
  onSelectFile: (doc: DocumentConfig, file: File, meta: { isPasswordProtected: boolean; password?: string }) => void;
  onRemoveFile: (documentId: string) => void;
  disabled?: boolean;
}

export function DocumentUpload({
  documents = [],
  uploadedDocuments = {},
  onSelectFile,
  onRemoveFile,
  disabled = false,
}: DocumentUploadProps) {
  const [passwordState, setPasswordState] = useState<
    Record<string, { isPasswordProtected: boolean; password: string; showPassword?: boolean }>
  >({});

  const handlePasswordProtectionChange = (docId: string, isProtected: boolean) => {
    setPasswordState((prev) => {
      const current = prev[docId] || { isPasswordProtected: false, password: "", showPassword: false };
      return {
        ...prev,
        [docId]: {
          ...current,
          isPasswordProtected: isProtected,
          password: isProtected ? current.password : "",
        },
      };
    });
  };

  const handlePasswordValueChange = (docId: string, value: string) => {
    setPasswordState((prev) => {
      const current = prev[docId] || { isPasswordProtected: true, password: "", showPassword: false };
      return {
        ...prev,
        [docId]: {
          ...current,
          isPasswordProtected: true,
          password: value,
        },
      };
    });
  };

  const toggleShowPassword = (docId: string) => {
    setPasswordState((prev) => {
      const current = prev[docId] || { isPasswordProtected: false, password: "", showPassword: false };
      return {
        ...prev,
        [docId]: {
          ...current,
          showPassword: !current.showPassword,
        },
      };
    });
  };

  const getUploadedDoc = (docId: string): UploadedDocument | undefined => {
    return uploadedDocuments[docId];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, doc: DocumentConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docId = String(doc.document_id);
    const state = passwordState[docId] || { isPasswordProtected: false, password: "" };

    onSelectFile(doc, file, {
      isPasswordProtected: state.isPasswordProtected,
      password: state.password,
    });
  };

  const openFile = (uploaded: UploadedDocument) => {
    if (uploaded.file_url) {
      window.open(uploaded.file_url, "_blank", "noopener,noreferrer");
      return;
    }
    if (uploaded.file) {
      const url = URL.createObjectURL(uploaded.file);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  if (!documents || documents.length === 0) return null;

  return (
    <div className="space-y-4">
      <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
        Verification Documents
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const docId = String(doc.document_id);
          const uploaded = getUploadedDoc(docId);
          const state = passwordState[docId] || {
            isPasswordProtected: uploaded?.is_password_protected ?? false,
            password: uploaded?.password ?? "",
            showPassword: false,
          };

          return (
            <div
              key={docId}
              className={`relative border rounded-lg p-4 flex flex-col justify-between transition-all duration-200 ${
                uploaded
                  ? "border-blue-200 bg-blue-50/20"
                  : "border-dashed border-slate-200 bg-white hover:border-blue-400"
              }`}
              style={{ minHeight: "140px" }}
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      uploaded ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {uploaded ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate" title={doc.document_name}>
                      {doc.document_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {uploaded ? uploaded.file_name : "Click upload button to choose file"}
                    </p>
                  </div>
                </div>
                <Badge variant={doc.is_mandatory ? "destructive" : "secondary"}>
                  {doc.is_mandatory ? "Required" : "Optional"}
                </Badge>
              </div>

              {/* Password controls */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-4 text-xs text-slate-600">
                  <span>Password protected?</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`pwd_protected_${docId}`}
                        disabled={disabled || !!uploaded}
                        checked={state.isPasswordProtected}
                        onChange={() => handlePasswordProtectionChange(docId, true)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`pwd_protected_${docId}`}
                        disabled={disabled || !!uploaded}
                        checked={!state.isPasswordProtected}
                        onChange={() => handlePasswordProtectionChange(docId, false)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {state.isPasswordProtected && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type={state.showPassword ? "text" : "password"}
                      placeholder="PDF password"
                      disabled={disabled || !!uploaded}
                      value={state.password}
                      onChange={(e) => handlePasswordValueChange(docId, e.target.value)}
                      className="h-8 max-w-[200px] text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled || !!uploaded}
                      onClick={() => toggleShowPassword(docId)}
                      className="h-8 w-8 text-slate-500"
                    >
                      {state.showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                {!uploaded && !disabled ? (
                  <Label
                    htmlFor={`file_input_${docId}`}
                    className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
                  >
                    Upload File
                    <input
                      id={`file_input_${docId}`}
                      type="file"
                      disabled={disabled}
                      onChange={(e) => handleFileChange(e, doc)}
                      className="hidden"
                    />
                  </Label>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openFile(uploaded!)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveFile(docId)}
                        className="flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
