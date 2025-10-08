import { forwardRef } from "react";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Shield,
    Star,
    TrendingUp,
} from "lucide-react";
import { StepComponentProps } from "@/components/WorkflowStepComponentLoader.tsx";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CreditBureauAPI, LenderOfferAPI } from "@repo/shared-state/api";
import { useEnvironmentStore } from "@repo/shared-state/config";
import { toast } from "react-toastify";

interface ComputedOffer {
    computed_offer_id: string;
    formula_type: string;
    formula_value: number;
    min_tenure: number;
    max_tenure: number;
    tenure: number;
    emi_amount: number;
    interest_rate: number;
    min_loan_amount: number;
    max_loan_amount: number;
    offer_loan_amount: number;
    down_payment: number;
    computed_by: string;
    offer_type: string;
}

const EligibilityResults = forwardRef<any, StepComponentProps>((props) => {
    const { data, handleSubmitSuccess, handleBack } = props;

    const offerAPI = LenderOfferAPI.getInstance();
    const CreditAPI = CreditBureauAPI.getInstance();

    const { id } = useParams<{ id: string }>();
    const applicationId = id || data?.application?.application_id;
    const onBoardingId = data.application.onboarding_id;
    const isEnvReady = useEnvironmentStore((s) => s.isInitialized);

    // fetch recommended lenders details
    const {
        data: offerResult,
        isLoading,
        isError: isOfferError,
        error: offerError,
    } = useQuery({
        queryKey: ["eligibleOffers", applicationId],
        queryFn: async () => {
            if (!applicationId) throw new Error("Onboarding ID is required");
            const response = await offerAPI.fetchEligibleOffers(applicationId, "V1");
            return response.result;
        },
        enabled: isEnvReady && !!applicationId,
    });

    // fetch credit bureau details
    const {
        data: bureauResult,
        isLoading: isBureauLoading,
        isError: isBureauError,
        error: bureauError,
    } = useQuery({
        queryKey: ["creditBureau", onBoardingId],
        queryFn: async () => {
            if (!onBoardingId) throw new Error("Onboarding ID is required");
            return await CreditAPI.fetchCreditResponse(onBoardingId);
        },
        enabled: isEnvReady && !!onBoardingId,
    });

    // error handling with toast
    if (isOfferError) {
        toast.error(offerError?.message || "Failed to fetch eligible offers");
    }
    if (isBureauError) {
        toast.error(bureauError?.message || "Failed to fetch credit bureau details");
    }

    const finalOffers =
        offerResult?.lender
            ?.filter((lender: { lender_applicable: any }) => lender.lender_applicable)
            ?.map((lender: { computed_offer: any[] }) =>
                lender.computed_offer?.find((o) => o.formula_type === "FINAL_OFFER")
            )
            .filter((offer: any): offer is ComputedOffer => !!offer) || [];

    const maxLoanAmount =
        finalOffers.length > 0
            ? Math.max(...finalOffers.map((o: { offer_loan_amount: any; }) => o.offer_loan_amount))
            : 0;

    const lowestEmi =
        finalOffers.length > 0
            ? Math.min(...finalOffers.map((o: { emi_amount: any; }) => o.emi_amount))
            : 0;

    const bestInterestRate =
        finalOffers.length > 0
            ? Math.min(...finalOffers.map((o: { interest_rate: any; }) => o.interest_rate))
            : 0;

    // get bureau data
    const getScoreStyle = (score: number) => {
        if (score <= 0) return "text-red-500";
        if (score < 500) return "text-red-500";
        if (score < 650) return "text-yellow-500";
        if (score < 750) return "text-blue-500";
        return "text-green-500";
    };

    const handleSubmit = async () => {
        try {
            if (typeof handleSubmitSuccess === "function") {
                await handleSubmitSuccess({
                    isValidForm: true,
                    data: props.data,
                });
            }
        } catch (error) {
            console.error("Error submitting documents:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Bureau Loader */}
            {isBureauLoading && (
                <div className="flex justify-center items-center h-32">
                    <div className="flex space-x-2">
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce"></span>
                        <span className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-300"></span>
                    </div>
                </div>
            )}

            {/* Offer Loader */}
            {(isLoading || isOfferError) && (
                <div className="flex justify-center items-center h-32">
                    <div className="flex space-x-2">
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce"></span>
                        <span className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-300"></span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!isLoading &&
                !isOfferError &&
                offerResult?.lender?.filter((l: { lender_applicable: any; }) => l.lender_applicable).length > 0 && (
                    <div className="mb-8">
                        {!isBureauLoading && !isBureauError && (
                            <div className="bg-black text-white rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg text-gray-200 font-semibold mb-2">
                                            Your Credit Score
                                        </h3>
                                        <div className="flex flex-col items-start space-y-1">
                                            <div className="flex items-baseline space-x-2 mb-2">
                                                <span
                                                    className={`text-3xl font-bold ${getScoreStyle(
                                                        bureauResult?.result[0]?.bureau_details?.bureau_data
                                                            ?.credit_score ?? 0
                                                    )}`}
                                                >
                                                    {bureauResult?.result[0]?.bureau_details
                                                        ?.bureau_data?.credit_score ?? 0}
                                                </span>
                                                <span className="text-white text-2xl font-bold">
                                                    / 900
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-200 text-sm mt-1">
                                            Excellent Credit Profile
                                        </p>
                                    </div>
                                    <div className="bg-white text-black  p-3 rounded-[5px]">
                                        <TrendingUp className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Eligibility Summary */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="text-center mb-6">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-black" />
                                </div>
                                <h2 className="text-2xl font-bold text-black mb-2">
                                    Great News!
                                </h2>
                                <p className="text-gray-600">
                                    You're eligible for loans from{" "}
                                    {
                                        offerResult?.lender?.filter(
                                            (lender: { lender_applicable: any }) =>
                                                lender.lender_applicable
                                        ).length
                                    }{" "}
                                    lenders
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-black">
                                        ₹{maxLoanAmount.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Max Loan Amount
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-black">
                                        {bestInterestRate}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Best Interest Rate
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-black">
                                        ₹{lowestEmi.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Lowest EMI
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lender Cards */}
                        <div className="space-y-4">
                            <div className="bg-white shadow rounded-xl overflow-hidden">
                                <div className="bg-white px-4 py-3 border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Available Loan Offers
                                    </h3>
                                </div>
                            </div>
                            {offerResult?.lender
                                ?.filter((lender: { lender_applicable: boolean }) => lender.lender_applicable)
                                .map((lender: any) => {
                                    const finalOffer = lender.computed_offer?.find(
                                        (offer: any) => offer.formula_type === "FINAL_OFFER"
                                    );
                                    const recentOffer = lender.recent_offer;
                                    return (
                                        <div
                                            key={lender.lender_id}
                                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                        >
                                            {/* Lender Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <img
                                                        src={lender?.lender_logo}
                                                        alt={lender?.lender_name || "lenderLogo.png"}
                                                        className="h-10 w-10 object-contain"
                                                    />
                                                    <div>
                                                        <h4 className="text-lg font-bold text-black">
                                                            {lender.lender_name}
                                                        </h4>
                                                        <div className="flex items-center space-x-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < 5
                                                                            ? "fill-current text-yellow-400"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 px-3 py-1 rounded-full">
                                                    <span className="text-sm font-medium text-black">
                                                        ✓ {lender.lender_apply_status || "Approved"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Loan Details */}
                                            <div className="grid md:grid-cols-4 gap-4 mb-5 text-center ">
                                                <div>
                                                    <div className="text-xl font-bold text-black">
                                                        ₹
                                                        {finalOffer?.offer_loan_amount?.toLocaleString() ||
                                                            0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Offer Loan Amount
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-black">
                                                        {finalOffer?.interest_rate?.toLocaleString() ||
                                                            0}
                                                        %
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Interest Rate
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-black">
                                                        ₹
                                                        {finalOffer?.emi_amount?.toLocaleString() ||
                                                            0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Monthly EMI
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-black">
                                                        {finalOffer?.tenure?.toLocaleString() || 0}{" "}
                                                        months
                                                    </div>
                                                    <div className="text-sm text-gray-600">Tenure</div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {lender?.lender_scheme?.[0]?.scheme_detail
                                                    ?.interest_type && (
                                                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                                        {
                                                            lender.lender_scheme[0].scheme_detail
                                                                .interest_type
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            {/* Processing Info */}
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>
                                                    Processing Fee:{" "}
                                                    {recentOffer?.charges ?? "N/A"}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Quick Approval</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Next Steps */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                            <div className="flex items-start space-x-3">
                                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">
                                        Next Steps
                                    </h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        To proceed with any lender, we'll need to
                                        verify your documents and collect additional
                                        information as required by each lender.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-4 mt-6">
                            <button
                                onClick={() => handleBack && handleBack()}
                                className="flex items-center gap-2 justify-center text-white bg-black font-medium rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors w-1/6 disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>

                            <button
                                onClick={handleSubmit}
                                className="bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 w-5/6"
                            >
                                Continue to Document Verification
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
});

export default EligibilityResults;
