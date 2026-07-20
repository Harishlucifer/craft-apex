import React, { useState, useEffect, useRef } from "react";
import { registerStepComponent, type StepComponentProps } from "../step-component-registry";
import { Card, CardContent, Button, Label, toast } from "@craft-apex/ui";
import { getApiClient } from "@craft-apex/api";

const DocumentUploadStep = ({ step, context, value, onChange, onNext }: StepComponentProps) => {
    const source = context?.workflow?.source as any;
    const application = source?.application || {};
    const onboardingID = application?.onboarding_id || 0;
    const statusID = application?.status;
    const isCompleted = statusID === 2; // Assuming 2 is completed based on context

    const [documentData, setDocumentData] = useState<any>(null);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [activeChecklistTitle, setActiveChecklistTitle] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Password states
    const [isPasswordProtected, setIsPasswordProtected] = useState<Record<string, boolean>>({});
    const [passwords, setPasswords] = useState<Record<string, string>>({});
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const loadDocumentChecklist = async () => {
        if (!onboardingID) return;
        setIsLoading(true);
        try {
            // Using assumed endpoint based on standard pattern
            const response = await getApiClient().get(`/alpha/v1/onboarding/${onboardingID}/document-checklist`);
            const data = (response as any)?.data || (response as any)?.result || response;
            setDocumentData(data);

            if (data?.checklist?.length > 0) {
                const firstApp = data.checklist[0];
                setSelectedApplicant(firstApp);
                if (firstApp.checklists?.length > 0) {
                    setActiveChecklistTitle(firstApp.checklists[0].title);
                }
            }
        } catch (error) {
            console.error("Error loading document checklist:", error);
            // toast.error("Failed to load document checklist");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocumentChecklist();
    }, [onboardingID]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, item: any) => {
        const file = event.target.files?.[0];
        if (!file || !selectedApplicant) return;

        if (item.allowed_count > 0 && item.files?.length >= item.allowed_count) {
            toast.error(`You can only upload ${item.allowed_count} file(s) for this document.`);
            return;
        }

        const password = passwords[item.document_id] || "";
        if (isPasswordProtected[item.document_id] && !password) {
            toast.error("Password is required for protected documents.");
            return;
        }

        const formData = new FormData();
        formData.append("document", file);
        formData.append("applicant_id", selectedApplicant.applicant_id);
        formData.append("document_id", item.document_id);
        formData.append("checklist_item_id", item.checklist_item_id);
        formData.append("applicant_category", selectedApplicant.applicant_category);
        if (password) formData.append("password", password);

        setIsUploading(true);
        try {
            // Adjust endpoint if needed
            await getApiClient().post(`/alpha/v1/onboarding/${onboardingID}/document`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("File uploaded successfully");
            // Clear password and reload
            setPasswords(prev => ({ ...prev, [item.document_id]: "" }));
            setIsPasswordProtected(prev => ({ ...prev, [item.document_id]: false }));
            loadDocumentChecklist();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "File upload failed");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        try {
            // Adjust endpoint to match your actual delete API
            await getApiClient().delete(`/alpha/v1/onboarding/document/${fileId}`);
            toast.success("File deleted");
            loadDocumentChecklist();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete file");
        }
    };

    // Derived active data
    const activeChecklist = selectedApplicant?.checklists?.find((c: any) => c.title === activeChecklistTitle);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-inner">
                            <i className="ri-folder-upload-fill"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Upload Documents</h3>
                            <p className="text-slate-500 text-sm">Please provide the required documentation for processing.</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-0">
                    {/* Applicant Tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/50">
                        {documentData?.checklist?.map((app: any) => (
                            <button
                                key={app.applicant_id}
                                onClick={() => {
                                    setSelectedApplicant(app);
                                    if (app.checklists?.length) setActiveChecklistTitle(app.checklists[0].title);
                                }}
                                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${selectedApplicant?.applicant_id === app.applicant_id
                                    ? "border-blue-600 text-blue-600 bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {app.applicant_name} ({app.applicant_type?.replace(/_/g, " ")})
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
                        {/* Sidebar Checklists */}
                        <div className="border-r border-slate-200 bg-slate-50 p-4 space-y-2">
                            {selectedApplicant?.checklists?.map((cl: any) => {
                                const isActive = activeChecklistTitle === cl.title;
                                return (
                                    <button
                                        key={cl.title}
                                        onClick={() => setActiveChecklistTitle(cl.title)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-600 hover:bg-slate-200/50"
                                            }`}
                                    >
                                        {cl.title}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="md:col-span-3 p-6 sm:p-8 bg-white">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                    <i className="ri-loader-4-line animate-spin text-4xl"></i>
                                    <p>Loading documents...</p>
                                </div>
                            ) : activeChecklist ? (
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2">{activeChecklist.title}</h4>
                                        <hr className="border-slate-100" />
                                    </div>

                                    {/* Render Required Documents */}
                                    {activeChecklist.required?.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Required</span>
                                            </div>
                                            {activeChecklist.required.map((item: any) => (
                                                <DocumentItem
                                                    key={item.document_id}
                                                    item={item}
                                                    isCompleted={isCompleted}
                                                    isPasswordProtected={isPasswordProtected}
                                                    setIsPasswordProtected={setIsPasswordProtected}
                                                    passwords={passwords}
                                                    setPasswords={setPasswords}
                                                    handleFileUpload={handleFileUpload}
                                                    handleDeleteFile={handleDeleteFile}
                                                    isUploading={isUploading}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Render Optional Documents */}
                                    {activeChecklist.optional?.length > 0 && (
                                        <div className="space-y-4 mt-8">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Optional</span>
                                            </div>
                                            {activeChecklist.optional.map((item: any) => (
                                                <DocumentItem
                                                    key={item.document_id}
                                                    item={item}
                                                    isCompleted={isCompleted}
                                                    isPasswordProtected={isPasswordProtected}
                                                    setIsPasswordProtected={setIsPasswordProtected}
                                                    passwords={passwords}
                                                    setPasswords={setPasswords}
                                                    handleFileUpload={handleFileUpload}
                                                    handleDeleteFile={handleDeleteFile}
                                                    isUploading={isUploading}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <p>Select a checklist from the left menu.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Sub-component for rendering an individual document requirement
const DocumentItem = ({
    item, isCompleted, isPasswordProtected, setIsPasswordProtected,
    passwords, setPasswords, handleFileUpload, handleDeleteFile, isUploading
}: any) => {
    return (
        <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <i className="ri-file-text-line text-lg"></i>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-800">{item.document_name}</h5>

                        {/* Password Protection Toggle */}
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                            <span className="font-medium">Password Protected?</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`pw_${item.document_id}`}
                                        checked={isPasswordProtected[item.document_id] === true}
                                        onChange={() => setIsPasswordProtected((p: any) => ({ ...p, [item.document_id]: true }))}
                                        className="text-blue-600 focus:ring-blue-500"
                                    /> Yes
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`pw_${item.document_id}`}
                                        checked={!isPasswordProtected[item.document_id]}
                                        onChange={() => setIsPasswordProtected((p: any) => ({ ...p, [item.document_id]: false }))}
                                        className="text-blue-600 focus:ring-blue-500"
                                    /> No
                                </label>
                            </div>
                        </div>

                        {/* Password Input */}
                        {isPasswordProtected[item.document_id] && (
                            <div className="mt-2">
                                <input
                                    type="password"
                                    placeholder="Enter document password"
                                    value={passwords[item.document_id] || ""}
                                    onChange={(e) => setPasswords((p: any) => ({ ...p, [item.document_id]: e.target.value }))}
                                    className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {!isCompleted && (
                    <div className="shrink-0 relative">
                        <input
                            type="file"
                            accept=".pdf, .jpg, .jpeg, .png"
                            id={`upload_${item.document_id}`}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, item)}
                            disabled={isUploading}
                        />
                        <label
                            htmlFor={`upload_${item.document_id}`}
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors text-sm"
                        >
                            <i className="ri-upload-cloud-2-line text-lg"></i> Upload
                        </label>
                    </div>
                )}
            </div>

            {/* Uploaded Files Display */}
            {item.files?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                    {item.files.map((file: any, idx: number) => (
                        <div key={idx} className="relative group w-32 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                            {file.url?.includes('.pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-rose-500">
                                    <i className="ri-file-pdf-fill text-3xl"></i>
                                    <span className="text-xs font-bold mt-1 text-slate-500">PDF Document</span>
                                </div>
                            ) : (
                                <img src={file.url} alt="Uploaded" className="w-full h-full object-cover" />
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <a href={file.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                                    <i className="ri-eye-line"></i>
                                </a>
                                {!isCompleted && (
                                    <button
                                        onClick={() => handleDeleteFile(file.file_id)}
                                        className="w-8 h-8 rounded-full bg-white text-rose-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentUploadStep;

registerStepComponent("LEAD_DOCUMENT_CHECKLIST", DocumentUploadStep);
