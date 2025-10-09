import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    TerritoryApiService,
    Territory,
    EstimateApiService,
    type Estimate as ApiEstimate,
    type EstimateResponse,
} from "@repo/shared-state/api";
import { ModuleLayout } from "@repo/ui/module";
import { Card, CardHeader, CardContent, CardTitle } from "@repo/ui/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";

// --------------------
// Counter Hook for Animation
// --------------------
const useAnimatedNumber = (target: number, duration: number = 1000) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let start: number | null = null;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setValue(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);

    return value;
};

// --------------------
// Component
// --------------------
interface FilterState {
    territoryType: string;
    territory: string;
    employee: string;
    month: string;
}

interface EstimateItem {
    lead_code: string;
    application_name: string;
    loan_type: string;
    user_type: string;
    partner_name: string;
    employee_name: string;
    lender_name: string;
    disbursement_date: string;
    disbursement_amount: number;
    over_due_amount: number;
    payout_rate: number;
    payout_amount: number;
    scheme_name: string;
}

const Estimate = () => {
    const [filters, setFilters] = useState<FilterState>({
        territoryType: "",
        territory: "",
        employee: "",
        month: "",
    });

    const territoryApi = TerritoryApiService.getInstance();
    const estimateApi = EstimateApiService.getInstance();

    // --------------------
    // Fetch Territory Data
    // --------------------
    const { data: territoryData, isLoading: territoryLoading } = useQuery<Territory[]>({
        queryKey: ["territories"],
        queryFn: () => territoryApi.fetchTerritories({ status: 1 }),
    });

    // --------------------
    // Fetch Estimate Data
    // --------------------
    const { data: estimateResponse, isLoading: estimatesLoading } = useQuery<EstimateResponse>({
        queryKey: ["estimates", filters],
        queryFn: () =>
            estimateApi.fetchEstimates({
                mode: "PAYABLE",
                category: "PAYABLE_SALES_PARTNER",
                employee_id: filters.employee,
                territory_id: filters.territory,
                month: filters.month,
            }),
    });

    // --------------------
    // Map API response to UI model
    // --------------------
    const estimates: EstimateItem[] = (estimateResponse?.data ?? []).map((e: ApiEstimate) => ({
        lead_code: e.lead_code || "",
        application_name: e.application_name || "",
        loan_type: e.loan_type || "",
        user_type: e.user_type || "",
        partner_name: e.partner_name || "",
        employee_name: e.employee_name || "",
        lender_name: e.lender_name || "",
        disbursement_date: e.disbursement_date || "",
        disbursement_amount: e.disbursement_amount || 0,
        over_due_amount: e.over_due_amount || 0,
        payout_rate: e.payout_rate || 0,
        payout_amount: e.payout_amount || 0,
        scheme_name: e.scheme_name || "",
    }));

    const summary = estimateResponse?.summary;

    const totalEarnings = useAnimatedNumber(summary?.TotalEarnings ?? 0);
    const dueAmount = useAnimatedNumber(summary?.DueAmount ?? 0);
    const invoicedAmount = useAnimatedNumber(summary?.InvoicedAmount ?? 0);

    // --------------------
    // Filter change handler
    // --------------------
    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <ModuleLayout>
            <div className="flex flex-col gap-4">
                {/* Filters */}
                <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Territory Type */}
                            <Select
                                value={filters.territoryType}
                                onValueChange={(value) => handleFilterChange("territoryType", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Territory Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {territoryData &&
                                        Array.from(new Set(territoryData.map((t) => t.territory_type_name))).map(
                                            (type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            )
                                        )}
                                </SelectContent>
                            </Select>

                            {/* Territory */}
                            <Select
                                value={filters.territory}
                                onValueChange={(value) => handleFilterChange("territory", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Territory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {territoryLoading && <SelectItem value="loading">Loading...</SelectItem>}
                                    {territoryData
                                        ?.filter(
                                            (t) =>
                                                !filters.territoryType || t.territory_type_name === filters.territoryType
                                        )
                                        .map((t: Territory) => (
                                            <SelectItem key={t.territory_id} value={t.territory_id}>
                                                {t.territory_name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Employee */}
                            <Input
                                placeholder="Enter Employee Name"
                                value={filters.employee}
                                onChange={(e) => handleFilterChange("employee", e.target.value)}
                            />

                            {/* Month */}
                            <Input
                                type="month"
                                value={filters.month}
                                onChange={(e) => handleFilterChange("month", e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    setFilters({
                                        territoryType: "",
                                        territory: "",
                                        employee: "",
                                        month: "",
                                    })
                                }
                            >
                                Clear
                            </Button>
                            <Button variant="default">Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        <Card className="border border-gray-200 shadow-sm bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-base text-gray-700">Total Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold text-green-700">
                                    ₹{totalEarnings.toLocaleString("en-IN")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-base text-gray-700">Due Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold text-blue-700">
                                    ₹{dueAmount.toLocaleString("en-IN")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm bg-orange-50">
                            <CardHeader>
                                <CardTitle className="text-base text-gray-700">Invoiced Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold text-orange-700">
                                    ₹{invoicedAmount.toLocaleString("en-IN")}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Results Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 mt-2">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold border-r">S.No</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Partner Name</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Loan Code</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Lender Name</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Loan Type</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Scheme Name / Type</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Disbursement Date</th>
                            <th className="px-4 py-3 text-left font-semibold border-r">Applicant Name</th>
                            <th className="px-4 py-3 text-right font-semibold border-r">Disbursed Amount</th>
                            <th className="px-4 py-3 text-right font-semibold border-r">Payout Rate</th>
                            <th className="px-4 py-3 text-right font-semibold">Payout Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {estimatesLoading ? (
                            <tr>
                                <td colSpan={11} className="text-center py-4 text-gray-500">
                                    Loading data...
                                </td>
                            </tr>
                        ) : estimates.length > 0 ? (
                            estimates.map((item, index) => (
                                <tr key={`${item.lead_code}-${index}`} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 border-r">{index + 1}</td>
                                    <td className="px-4 py-2 border-r">{item.partner_name || "—"}</td>
                                    <td className="px-4 py-2 border-r">{item.lead_code}</td>
                                    <td className="px-4 py-2 border-r">{item.lender_name}</td>
                                    <td className="px-4 py-2 border-r">{item.loan_type}</td>
                                    <td className="px-4 py-2 border-r text-xs">{item.scheme_name}</td>
                                    <td className="px-4 py-2 border-r">{item.disbursement_date}</td>
                                    <td className="px-4 py-2 border-r">{item.application_name}</td>
                                    <td className="px-4 py-2 text-right border-r">
                                        ₹{item.disbursement_amount.toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-2 text-right border-r">{item.payout_rate}%</td>
                                    <td className="px-4 py-2 text-right font-medium text-green-600">
                                        ₹{item.payout_amount.toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="text-center py-4 text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ModuleLayout>
    );
};

export default Estimate;