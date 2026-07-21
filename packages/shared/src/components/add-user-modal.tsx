import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  useChannelList,
  useChannelRoles,
  useRMEmployees,
  useSupervisorUsers,
  useRMLeastTerritories,
  usePincodeSuggest,
  usePincodeDetails,
  useCreateOrUpdateChannelUser,
  useUploadDocument,
  useUploadedDocuments,
} from "../features/child-partner/child-partner-list.api";
import { DocumentUpload } from "./document-upload";
import type { ChildPartnerListItem, UploadedDocument } from "../features/child-partner/child-partner-list.types";

export interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editData: ChildPartnerListItem | null;
  onSuccess: () => void;
  /**
   * "employee" (default) — all fields visible, RM employee selector shown.
   * "partner" — channel_id is locked to the logged-in partner's channel,
   *              RM employee field hidden (partner manages their own sub-users).
   */
  mode?: "employee" | "partner";
  /**
   * Required when mode="partner". The logged-in partner's channel_id
   * pre-fills and locks the channel field.
   */
  partnerChannelId?: string;
  /** When true, form is read-only and submitting approves the record (status → 1). */
  approvalMode?: boolean;
}

// Base schema shared by both modes
const baseSchema = {
  channel_id: zod.string().min(1, "Channel is required"),
  role_id: zod.string().min(1, "Role is required"),
  supervisor_id: zod.string().min(1, "Supervisor is required"),
  name: zod.string().min(3, "Name must be at least 3 characters"),
  email: zod.string().email("Invalid email address").min(1, "Email is required"),
  mobile: zod.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  address: zod.string().optional(),
  pincode: zod.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
  pincode_id: zod.number().min(1, "Please select a pincode option"),
  area: zod.string().min(1, "Area is required"),
  city: zod.string().min(1, "City is required"),
  state: zod.string().min(1, "State/UT is required"),
  country: zod.string().min(1, "Country is required"),
};

// Employee mode adds RM + territory
const employeeFormSchema = zod.object({
  ...baseSchema,
  rm_employee_id: zod.string().min(1, "Relationship Manager is required"),
  territory_id: zod.string().optional(),
});

// Partner mode omits RM + territory
const partnerFormSchema = zod.object({
  ...baseSchema,
  rm_employee_id: zod.string().optional(),
  territory_id: zod.string().optional(),
});

type FormValues = zod.infer<typeof employeeFormSchema>;

export function AddUserModal({
  isOpen,
  onOpenChange,
  editData,
  onSuccess,
  mode = "employee",
  partnerChannelId = "",
  approvalMode = false,
}: AddUserModalProps) {
  const isEdit = !!editData;
  const isPartnerMode = mode === "partner";

  const [pincodeQuery, setPincodeQuery] = useState("");
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocument>>({});

  const schema = isPartnerMode ? partnerFormSchema : employeeFormSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      channel_id: isPartnerMode ? partnerChannelId : "",
      role_id: "",
      supervisor_id: "",
      rm_employee_id: "",
      territory_id: "",
      name: "",
      email: "",
      mobile: "",
      address: "",
      pincode: "",
      pincode_id: 0,
      area: "",
      city: "",
      state: "",
      country: "",
    },
  });

  const selectedChannelId = isPartnerMode ? partnerChannelId : watch("channel_id");
  const selectedRoleId = watch("role_id");
  const selectedRmEmployeeId = watch("rm_employee_id");
  const pincodeVal = watch("pincode");

  // Fetch lookups
  const { data: channelsData, isLoading: isLoadingChannels } = useChannelList(
    { status: "3", ignoreSubordinates: "true" },
  );
  
  const { data: rolesData } = useChannelRoles();
  const { data: rmData } = useRMEmployees();
  const { data: supervisorsData } = useSupervisorUsers(selectedRoleId, selectedChannelId);

  // Extract RM options early so we can use it for selectedRMUser calculation
  const rmOptions = (() => {
    let employees = null;
    
    if (rmData) {
      // Try different possible structures
      if (Array.isArray(rmData.data?.data)) {
        employees = rmData.data.data;
      } else if (Array.isArray(rmData.data)) {
        employees = rmData.data;
      } else if (Array.isArray(rmData)) {
        employees = rmData;
      }
    }
    
    if (!Array.isArray(employees)) {
      return [];
    }
    
    return employees.map((emp: any) => ({
      ...emp,
      employee_id: emp.employee_id || emp.id,
    }));
  })();

  // Territory (employee mode only — depends on selected RM user's user_id)
  const selectedRMUser = (() => {
    if (!selectedRmEmployeeId) return undefined;
    
    return rmOptions.find(
      (item) => String(item.employee_id) === String(selectedRmEmployeeId)
    );
  })();
  
  const { data: territoriesData } = useRMLeastTerritories(
    isPartnerMode ? undefined : selectedRMUser?.user_id
  );

  // Pincode suggest & details
  const { data: pincodeSuggestions } = usePincodeSuggest(pincodeQuery);
  const { data: pincodeDetailsList } = usePincodeDetails(pincodeVal);

  const createUpdateUserMutation = useCreateOrUpdateChannelUser();
  const uploadDocMutation = useUploadDocument();
  const { data: dbDocs } = useUploadedDocuments(editData?.channel_user_id);

  const documentConfig = [
    { document_id: 1, document_name: "PAN Card", is_mandatory: true },
    { document_id: 2, document_name: "Aadhaar Card", is_mandatory: true },
  ];

  // Keep channel_id locked in partner mode
  useEffect(() => {
    if (isPartnerMode && partnerChannelId) {
      setValue("channel_id", partnerChannelId);
    }
  }, [isPartnerMode, partnerChannelId, setValue]);

  // Prepopulate form on edit / reset on add
  useEffect(() => {
    if (editData && isOpen) {
      setValue("name", editData.name ?? "");
      setValue("email", editData.email ?? "");
      setValue("mobile", editData.mobile ?? "");
      setValue("address", editData.address ?? "");
      setValue("pincode", editData.pincode ?? "");
      setValue("pincode_id", editData.pincode_id ?? 0);
      setValue("channel_id", isPartnerMode ? partnerChannelId : String(editData.channel_id ?? ""));
      setValue("role_id", String(editData.role_id ?? ""));
      setValue("supervisor_id", String(editData.supervisor_user_id ?? ""));
      if (!isPartnerMode) {
        setValue("rm_employee_id", String(editData.employee_id ?? ""));
        setValue("territory_id", String(editData.territory_id ?? ""));
      }
      if (editData.pincode) setPincodeQuery(editData.pincode);
    } else if (!isEdit && isOpen) {
      setValue("name", "");
      setValue("email", "");
      setValue("mobile", "");
      setValue("address", "");
      setValue("pincode", "");
      setValue("pincode_id", 0);
      setValue("area", "");
      setValue("city", "");
      setValue("state", "");
      setValue("country", "");
      setValue("channel_id", isPartnerMode ? partnerChannelId : "");
      setValue("role_id", "");
      setValue("supervisor_id", "");
      setValue("rm_employee_id", "");
      setValue("territory_id", "");
      setPincodeQuery("");
      setUploadedDocs({});
    }
  }, [editData, isOpen, isPartnerMode, partnerChannelId, setValue]);

  // Auto-fill city/state/country from pincode detail
  useEffect(() => {
    if (pincodeDetailsList && pincodeDetailsList.length > 0) {
      const activePincodeId = watch("pincode_id");
      const matched =
        pincodeDetailsList.find((p) => p.id === activePincodeId) ||
        pincodeDetailsList[0];
      if (matched) {
        setValue("pincode_id", matched.id);
        setValue("area", matched.area);
        setValue("city", matched.coreCityList?.name ?? "");
        setValue("state", matched.coreStateList?.name ?? "");
        setValue("country", matched.coreCountryList?.name ?? "");
      }
    }
  }, [pincodeDetailsList, watch("pincode_id"), setValue]);

  // Load uploaded docs from DB for edit mode
  useEffect(() => {
    if (dbDocs?.data?.result) {
      const mapped: Record<string, UploadedDocument> = {};
      (dbDocs.data.result as any[]).forEach((doc) => {
        const docId = String(doc.document_id);
        const fileUrl =
          doc.files?.[doc.files.length - 1]?.url || doc.url || "";
        mapped[docId] = {
          document_id: docId,
          document_name: doc.document_name || "",
          file_name: doc.file_name || "Uploaded Document",
          file_url: fileUrl,
          is_password_protected:
            doc.files?.[doc.files.length - 1]?.password != null,
          password: doc.files?.[doc.files.length - 1]?.password || "",
        };
      });
      setUploadedDocs(mapped);
    }
  }, [dbDocs]);

  const handleSelectFile = (
    doc: any,
    file: File,
    meta: { isPasswordProtected: boolean; password?: string }
  ) => {
    const docId = String(doc.document_id);
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        document_id: docId,
        document_name: doc.document_name,
        file_name: file.name,
        is_password_protected: meta.isPasswordProtected,
        password: meta.password,
        file,
      },
    }));
  };

  const handleRemoveFile = (documentId: string) => {
    setUploadedDocs((prev) => {
      const updated = { ...prev };
      delete updated[documentId];
      return updated;
    });
  };

  const onSubmit = async (values: FormValues) => {
    const missingDocs = documentConfig.filter(
      (d) => d.is_mandatory && !uploadedDocs[String(d.document_id)]
    );
    if (missingDocs.length > 0 && !approvalMode) {
      toast.error(
        `Please upload mandatory documents: ${missingDocs.map((d) => d.document_name).join(", ")}`
      );
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        role_id: values.role_id,
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        address: values.address,
        pincode_id: values.pincode_id,
        channel_id: isPartnerMode ? partnerChannelId : values.channel_id,
        supervisor_user_id: values.supervisor_id,
        status: approvalMode ? 1 : 2,
      };

      if (!isPartnerMode) {
        payload.employee_id = values.rm_employee_id;
        payload.territory_id = values.territory_id || null;
      }

      if (isEdit && editData?.channel_user_id) {
        payload.channel_user_id = String(editData.channel_user_id);
        payload.status = editData.status;
      }

      const res = await createUpdateUserMutation.mutateAsync(payload);
      if (res.status === 1) {
        const userChannelId =
          res.result?.channel_user_id || editData?.channel_user_id;

        if (userChannelId && !approvalMode) {
          for (const docId of Object.keys(uploadedDocs)) {
            const docObj = uploadedDocs[docId];
            if (docObj && docObj.file) {
              await uploadDocMutation.mutateAsync({
                channelUserId: String(userChannelId),
                documentId: docId,
                file: docObj.file,
                password: docObj.password,
              });
            }
          }
        }

        toast.success(
          approvalMode
            ? "Child partner approved successfully!"
            : isEdit
            ? "Child partner updated successfully!"
            : "Child partner created successfully!"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to save child partner.");
      }
    } catch (e: any) {
      toast.error(e?.message || "An error occurred.");
    }
  };

  const channelOptions = (() => {
    // Handle different possible API response structures
    let channels = null;
    
    if (channelsData) {
      // Try different possible structures
      if (Array.isArray(channelsData.data?.data)) {
        channels = channelsData.data.data;
      } else if (Array.isArray(channelsData.data)) {
        channels = channelsData.data;
      } else if (Array.isArray(channelsData)) {
        channels = channelsData;
      }
    }
    
    if (!Array.isArray(channels)) {
      return [];
    }
    
    return channels.map((ch: any) => ({
      ...ch,
      channel_id: ch.channel_id || ch.id,
    }));
  })();null
  
  const rolesOptions = rolesData ?? [];
  const supervisorOptions = supervisorsData ?? [];
  
  const territoryOptions = (() => {
    let territories = null;
    
    if (territoriesData) {
      // Try different possible structures
      if (Array.isArray(territoriesData.data?.data)) {
        territories = territoriesData.data.data;
      } else if (Array.isArray(territoriesData.data)) {
        territories = territoriesData.data;
      } else if (Array.isArray(territoriesData)) {
        territories = territoriesData;
      }
    }
    
    if (!Array.isArray(territories)) {
      return [];
    }
    
    return territories;
  })();

  const selectClass =
    "w-full h-10 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {approvalMode
              ? "Approve Child Partner"
              : isEdit
              ? "Edit Child Partner"
              : "Add Child Partner"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel — shown in employee mode only; hidden in partner mode */}
            {!isPartnerMode && (
              <div className="space-y-2">
                <Label htmlFor="channel_id">Channel *</Label>
                <select
                  id="channel_id"
                  disabled={isEdit || approvalMode}
                  className={selectClass}
                  {...register("channel_id")}
                >
                  <option value="">Select Channel</option>
                  {channelOptions.map((opt) => (
                    <option key={opt.channel_id} value={String(opt.channel_id)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                {errors.channel_id && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.channel_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role_id">Role *</Label>
              <select
                id="role_id"
                disabled={isEdit || approvalMode}
                className={selectClass}
                {...register("role_id")}
              >
                <option value="">Select Type</option>
                {rolesOptions.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.role_id.message}
                </p>
              )}
            </div>

            {/* RM Employee — employee mode only */}
            {!isPartnerMode && (
              <div className="space-y-2">
                <Label htmlFor="rm_employee_id">Relationship Manager *</Label>
                <select
                  id="rm_employee_id"
                  disabled={approvalMode}
                  className={selectClass}
                  {...register("rm_employee_id")}
                >
                  <option value="">Select RM</option>
                  {rmOptions.map((opt) => (
                    <option key={opt.employee_id} value={String(opt.employee_id)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                {errors.rm_employee_id && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.rm_employee_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Supervisor */}
            <div className="space-y-2">
              <Label htmlFor="supervisor_id">Supervisor *</Label>
              <select
                id="supervisor_id"
                disabled={approvalMode}
                className={selectClass}
                {...register("supervisor_id")}
              >
                <option value="">Select Supervisor</option>
                {supervisorOptions.map((opt) => (
                  <option
                    key={opt.channel_user_id}
                    value={String(opt.channel_user_id)}
                  >
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.supervisor_id && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.supervisor_id.message}
                </p>
              )}
            </div>

            {/* Territory — employee mode only */}
            {!isPartnerMode && (
              <div className="space-y-2">
                <Label htmlFor="territory_id">Territory</Label>
                <select
                  id="territory_id"
                  disabled={approvalMode}
                  className={selectClass}
                  {...register("territory_id")}
                >
                  <option value="">Select Territory</option>
                  {territoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                disabled={approvalMode}
                placeholder="Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                disabled={isEdit || approvalMode}
                placeholder="Email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile No *</Label>
              <Input
                id="mobile"
                disabled={isEdit || approvalMode}
                placeholder="Mobile number"
                {...register("mobile")}
              />
              {errors.mobile && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Pincode with suggestion dropdown */}
            <div className="space-y-2 relative">
              <Label htmlFor="pincode">Pin code *</Label>
              <Input
                id="pincode"
                disabled={approvalMode}
                placeholder="Pincode"
                value={pincodeQuery}
                onChange={(e) => {
                  setPincodeQuery(e.target.value);
                  setValue("pincode", e.target.value);
                  setShowPincodeSuggestions(true);
                }}
                onFocus={() => setShowPincodeSuggestions(true)}
              />
              {errors.pincode && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.pincode.message}
                </p>
              )}
              {showPincodeSuggestions &&
                pincodeSuggestions &&
                pincodeSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {pincodeSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setValue("pincode", item.pincode);
                          setValue("pincode_id", item.id);
                          setValue("area", item.area);
                          setValue("city", item.coreCityList?.name ?? "");
                          setValue("state", item.coreStateList?.name ?? "");
                          setValue("country", item.coreCountryList?.name ?? "");
                          setPincodeQuery(item.pincode);
                          setShowPincodeSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 focus:outline-none"
                      >
                        {item.pincode} - {item.area}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input id="area" placeholder="Area" disabled {...register("area")} />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="City" disabled {...register("city")} />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State/UT *</Label>
              <Input id="state" placeholder="State" disabled {...register("state")} />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" placeholder="Country" disabled {...register("country")} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              disabled={approvalMode}
              placeholder="Address"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("address")}
            />
          </div>

          {/* Document Upload */}
          <DocumentUpload
            documents={documentConfig}
            uploadedDocuments={uploadedDocs}
            onSelectFile={handleSelectFile}
            onRemoveFile={handleRemoveFile}
            disabled={approvalMode}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createUpdateUserMutation.isPending || uploadDocMutation.isPending
              }
            >
              {createUpdateUserMutation.isPending || uploadDocMutation.isPending
                ? "Submitting..."
                : approvalMode
                ? "Approve"
                : isEdit
                ? "Update"
                : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
