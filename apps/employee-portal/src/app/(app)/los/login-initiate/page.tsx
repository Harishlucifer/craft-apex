"use client";

/* ------------------------------------------------------------------ */
/*  LOS Login Initiate Page                                             */
/*  Route: /los/login-initiate  and  /los/login-initiate/[id]        */
/*                                                                      */
/*  Fetches both V1 and V2 APIs in parallel and keeps them in sync.     */
/*  After a createUpdate call, the response is stored in the matching   */
/*  version's state, and the opposite version's fetch API is called     */
/*  to keep both states up to date.                                     */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@craft-apex/ui/components/button";
import { Card } from "@craft-apex/ui/components/card";
import { DynamicStagesAndSteps } from "@craft-apex/workflow";
import { axiosInstance } from "@craft-apex/auth";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { LeadAPI } from "@/lib/lead-api";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Lead {
  application?: {
    application_id?: string | number;
    name?: string;
    contact_person?: string;
    mobile?: string;
    type?: string;
    loan_type_code?: string;
    [key: string]: any;
  };
  type?: string;
  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function LosLoginInitiatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const queryClient = useQueryClient();

  // ID can come from the dynamic route segment
  const id = params?.id as string | undefined;

  const leadApi = useMemo(() => LeadAPI.getInstance(), []);

  /* ── Separate state for V1 and V2 lead data ── */
  const [leadV1, setLeadV1] = useState<Lead | null>(null);
  const [leadV2, setLeadV2] = useState<Lead | null>(null);

  // Read query params
  const loanType = searchParams.get("loan_type");
  const journeyType = searchParams.get("journey_type");

  // ── Fetch V2 lead if ID exists ───────────────────────────────────────

  const {
    data: apiLeadV2,
    isLoading: isV2Loading,
    isError: isV2Error,
    error: v2Error,
  } = useQuery({
    queryKey: ["lead", id, "V2"],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await leadApi.fetchLead(id, "V2");
      return response?.result ?? response;
    },
    enabled: !!id,
    retry: 1,
  });

  // ── Fetch V1 lead if ID exists (in parallel) ────────────────────────

  const {
    data: apiLeadV1,
    isLoading: isV1Loading,
  } = useQuery({
    queryKey: ["lead", id, "V1"],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await leadApi.fetchLead(id, "V1");
      return response?.result ?? response;
    },
    enabled: !!id,
    retry: 1,
  });

  // ── Handle URL-only params (no ID) ───────────────────────────────────

  useEffect(() => {
    if (!id && loanType && journeyType) {
      const freshLead: Lead = {
        application: {
          loan_type_code: loanType,
          type: journeyType,
        },
      };
      setLeadV1(freshLead);
      setLeadV2(freshLead);
    }
  }, [id, loanType, journeyType]);

  // ── Sync API data to local state ─────────────────────────────────────

  useEffect(() => {
    if (apiLeadV2) setLeadV2(apiLeadV2);
  }, [apiLeadV2]);

  useEffect(() => {
    if (apiLeadV1) setLeadV1(apiLeadV1);
  }, [apiLeadV1]);

  // ── Wrapped LeadAPI that syncs both versions after createUpdate ──────

  const wrappedApi = useMemo(() => {
    // Create a proxy that intercepts createUpdate
    const proxy = Object.create(leadApi);

    proxy.createUpdate = async (data: any, version?: string) => {
      const ver = version || "v2";
      const isV2 = ver.toLowerCase() === "v2";

      // 1. Call the actual createUpdate API
      const response = await leadApi.createUpdate(data, ver);

      // 2. The createUpdate response has same shape as fetch response —
      //    store it in the matching version's state
      const result = response?.result ?? response;
      if (isV2) {
        setLeadV2(result);
      } else {
        setLeadV1(result);
      }

      // 3. Fetch the opposite version to keep both states in sync
      const sourceId =
        result?.source_id ??
        result?.application?.application_id ??
        id;

      if (sourceId) {
        try {
          const oppositeVersion = isV2 ? "V1" : "V2";
          const oppositeResponse = await leadApi.fetchLead(
            String(sourceId),
            oppositeVersion
          );
          const oppositeResult =
            oppositeResponse?.result ?? oppositeResponse;

          if (isV2) {
            setLeadV1(oppositeResult);
          } else {
            setLeadV2(oppositeResult);
          }

          // Also update the react-query cache for the opposite version
          queryClient.setQueryData(
            ["lead", String(sourceId), oppositeVersion],
            oppositeResult
          );
        } catch (err) {
          console.warn(
            `Failed to fetch ${isV2 ? "V1" : "V2"} after createUpdate:`,
            err
          );
        }
      }

      return response;
    };

    return proxy;
  }, [leadApi, id, queryClient]);

  // ── Navigation adapter for DynamicStagesAndSteps ─────────────────────

  const handleNavigate = useCallback(
    (url: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Loading state ────────────────────────────────────────────────────

  const isLeadLoading = isV2Loading;
  const isLeadError = isV2Error;
  const leadError = v2Error;

  // The primary lead data is V2 (used for dataInfo)
  const lead = leadV2;
  const apiLead = apiLeadV2;

  if (isLeadLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">
            Loading details…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────

  if ((isLeadError && id) || (!lead && id && !isLeadLoading)) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Not Found
            </h3>
            <p className="text-sm text-red-600 max-w-sm">
              {leadError instanceof Error
                ? leadError.message
                : "The requested details could not be found."}
            </p>
            <Button
              onClick={() => router.push("/los/login-view")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-1">
      {/* ── Info Header ── */}
      <div className="bg-card border-b border-border p-3 rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="rounded-lg h-8"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back
            </Button>

            {lead?.application && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Name
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {lead.application.name ??
                      lead.application.contact_person ??
                      "—"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Journey
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {lead.type ?? lead.application.type ?? "—"}
                  </span>
                </div>

                {lead.application.mobile && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Mobile
                    </span>
                    <span className="text-sm font-semibold text-foreground font-mono">
                      {lead.application.mobile}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Workflow ── */}
      <DynamicStagesAndSteps
        dataInfo={lead}
        dataInfoV1={leadV1}
        api={wrappedApi}
        sourceId={
          lead?.application?.application_id?.toString() ??
          apiLead?.application?.application_id?.toString()
        }
        workflowType="LOS_LOGIN"
        navigateUrl="/los/login-view"
        navigate={handleNavigate}
        routeId={id}
        searchParams={searchParams as unknown as URLSearchParams}
        axiosInstance={axiosInstance}
      />
    </div>
  );
}
