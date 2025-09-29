import {
    forwardRef,
    useEffect,
    useState,
} from "react";
import {
    CheckCircle,
    Star,
    TrendingUp,
    Clock,
    Shield,
    ArrowLeft,
} from "lucide-react";
import { StepComponentProps } from "@/components/WorkflowStepComponentLoader.tsx";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LenderOfferAPI, CreditBureauAPI } from '@repo/shared-state/api';
import { useEnvironmentStore } from '@repo/shared-state/config';


// Interfaces
interface RecentOffer {
    offer_id: string;
    application_id: string;
    lender_id: string;
    scheme_id: string;
    offer_type: string;
    offer_amount: number;
    tenure: number;
    interest_rate: number;
    emi: number;
    date: string;
    charges: any | null;
}

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

interface LenderLinks {
    apply_link: string;
    e_kyc: string;
    e_mandate: string;
    e_sign: string;
}

interface LenderContact {
    id: string;
    name: string;
    mobile: string;
    email: string;
    apply_method: string;
    address: string;
    link: string;
    link_type: string;
}
interface SchemeDetail {
    lender_scheme_id: string;
    code: string;
    name: string;
    loan_type_id: string;
    loan_type_name: string;
    sub_loan_type_id: string;
    sub_loan_type_name: string;
    lender_id: string;
    lender_name: string;
    emi_date: number;
    cutoff_date: number;
    min_loan_amount: number;
    max_loan_amount: number;
    min_tenure: number;
    max_tenure: number;
    min_rate_of_interest: number;
    max_rate_of_interest: number;
    interest_type: string;
    terms_and_condition: string;
    sequence: number;
    configuration: any;
    status: number;
    created_at: string;
}

interface LenderScheme {
    lender_scheme_id: string;
    lender_id: string;
    code: string;
    name: string;
    executed_rule: ExecutedRule[];
    computed_offer: ComputedOffer[];
    scheme_detail: SchemeDetail;
    sequence: number;
    scheme_applicable: boolean;
    documents_required: boolean;
    journey_type: string;
}


interface ExecutedRule {
    status: string;
    rule_type: string;
    message: string;
}

interface Lender {
    lender_id: string;
    lender_name: string;
    lender_code: string;
    lender_logo: string;
    loan_type_id: string;
    lender_apply_id: string | null;
    recent_offer: RecentOffer | null;
    lender_links: LenderLinks;
    sequence: number;
    lender_contact: LenderContact;
    lender_scheme: LenderScheme[];
    lender_applicable: boolean;
    lender_apply_status: string;
    rejected_reason: string | null;
    executed_rule: ExecutedRule[];
    computed_offer: ComputedOffer[];
}

interface Viable {
    applicable: boolean;
    executed_rule: ExecutedRule | null;
}

interface RecommendedOffersResponse {
    lender: Lender[];
    viable: Viable;
}

export interface Address {
    line_1: string;
    area: string;
    city: string;
    state: string;
    pincode: number;
}

export interface BureauData {
    bureau_analysis_id: string;
    application_id: string;
    cam_application_id: string;
    person_id: string;
    entity_id: string;
    request_data: any | null;
    response_data: any | null;
    computed_data: any | null;
    questionnaire_data: any | null;
    bureau_stage: number;
    credit_score: number;
    total_active_accounts: number;
    total_closed_accounts: number;
    total_outstanding_amount: number;
    external_id: string;
    expiry_date: string;
    work_order_id: string;
    status: number;
    skip_status: number;
    bureau_analysis_status: string;
}

export interface BureauDetails {
    first_name: string;
    last_name: string;
    dob: string;
    mobile: string;
    email: string;
    address: Address;
    bureau_data: BureauData;
}

export interface ResultItem {
    product_code: string;
    applicant_category: string;
    applicant_type: string;
    applicant_id: string;
    applicant_name: string;
    bank_accounts: any | null;
    bureau_details: BureauDetails;
}

export interface CamResponse {
    cam_status: number;
    result: ResultItem[];
    status: number;
}



const EligibilityResults = forwardRef((props: StepComponentProps) => {
    const { data,handleSubmitSuccess ,handleBack} = props;
    const [offerData, setOfferData] = useState<RecommendedOffersResponse>({
        lender: [],
        viable: { applicable: false, executed_rule: null },
    });
    const [bureauData, setBureauData] = useState<CamResponse | null>(null);

    const offerAPI = LenderOfferAPI.getInstance();
    const CreditAPI = CreditBureauAPI.getInstance();

    const { id } = useParams<{ id: string }>();
    const applicationId = id || data?.application?.application_id;

    const onBoardingId = data.application.onboarding_id;
    console.log(onBoardingId)

    const isEnvReady = useEnvironmentStore((s) => s.isInitialized);


    // fetch recommended lenders details
    const { data: offerResult, isLoading, isError: isOfferError, error: offerError } = useQuery({
        queryKey: ['eligibleOffers', applicationId],
        queryFn: async () => {
            if (!applicationId) throw new Error('Onboarding ID is required');
            const response = await offerAPI.fetchEligibleOffers(applicationId, 'V1');
            return response.result;
        },
        enabled: isEnvReady && !!applicationId,
    });
    // fetch credit bureau details
    const { data: bureauResult, isLoading: isBureauLoading, isError: isBureauError, error: bureauError } = useQuery({
        queryKey: ['creditBureau', onBoardingId],
        queryFn: async () => {
            if (!onBoardingId) throw new Error('Onboarding ID is required');
            const response = await CreditAPI.fetchCreditResponse(onBoardingId);
            return response;
        },
        enabled: isEnvReady && !!onBoardingId,
    });

    console.log(bureauResult,isBureauLoading,isBureauError,bureauError)

    useEffect(() => {
        if (offerResult) {
            setOfferData(offerResult as RecommendedOffersResponse);
        } else if (isOfferError) {
            setOfferData({
                lender: [],
                viable: { applicable: false, executed_rule: null },
            });
        }else {
            setOfferData({
                lender: [],
                viable: { applicable: false, executed_rule: null },
            })
        }
    }, [offerResult, isOfferError, offerError]);

    useEffect(() => {
        if (bureauResult){
            setBureauData(bureauResult);
        }else if (isBureauError){
            console.log(bureauError)
        }else {
            console.log(bureauError)
        }
    }, []);

    const finalOffers =
        offerData.lender
            ?.filter(lender => lender.lender_applicable === true)
            ?.map((lender) =>
                lender.computed_offer?.find((o) => o.formula_type === "FINAL_OFFER")
            )
            .filter((offer): offer is ComputedOffer => !!offer) || [];

    const maxLoanAmount =
        finalOffers.length > 0
            ? Math.max(...finalOffers.map((o) => o.offer_loan_amount))
            : 0;

    const lowestEmi =
        finalOffers.length > 0
            ? Math.min(...finalOffers.map((o) => o.emi_amount))
            : 0;

    const bestInterestRate =
        finalOffers.length > 0
            ? Math.min(...finalOffers.map((o) => o.interest_rate))
            : 0;

    const creditScore = bureauData?.result[0]?.bureau_details?.bureau_data?.credit_score ?? 0;
    const getScoreStyle = (score: number) => {
        if (score <= 0) return { color: "text-red-500"};
        if (score < 500) return { color: "text-red-500"};
        if (score < 650) return { color: "text-yellow-500"};
        if (score < 750) return { color: "text-blue-500"};
        return { color: "text-green-500"};
    };
    const { color} = getScoreStyle(creditScore);

    const handleSubmit = async () => {
        try {
            if (typeof handleSubmitSuccess === 'function') {
                await handleSubmitSuccess({
                    isValidForm: true,
                    data: props.data
                });
            }
        } catch (error) {
            console.error('Error submitting documents:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {isLoading && (
                <div className="flex justify-center items-center h-32">
                    <div className="flex space-x-2">
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce"></span>
                        <span className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-300"></span>
                    </div>
                </div>
            )}

            {!isLoading && offerData.lender.filter(lender => lender.lender_applicable === true).length > 0 && (
                <div className="mb-8">
                    {/* Credit Score Card */}
                    <div className="bg-black text-white rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg text-gray-200 font-semibold mb-2">Your Credit Score</h3>
                                <div className="flex flex-col items-start space-y-1">
                                    <div className="flex items-baseline space-x-2 mb-2">
                                        <span className={`text-3xl font-bold ${color} transition-all duration-500 animate-pulse`}
                                        >{creditScore || "0"}</span>
                                        <span className="text-white text-2xl font-bold">/ 900</span>
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

                    {/* Eligibility Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="text-center mb-6">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-black" />
                            </div>
                            <h2 className="text-2xl font-bold text-black mb-2">Great News!</h2>
                            <p className="text-gray-600">
                                You're eligible for loans from {offerData.lender.filter(lender => lender.lender_applicable === true).length} lenders
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black">
                                    ₹{maxLoanAmount.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Max Loan Amount</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black">
                                    {bestInterestRate}%
                                </div>
                                <div className="text-sm text-gray-600">Best Interest Rate</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black">
                                    ₹{lowestEmi.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Lowest EMI</div>
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

                        {offerData.lender.filter(lender => lender.lender_applicable === true).map((lender) => {
                            const finalOffer = lender.computed_offer?.find(
                                (offer) => offer.formula_type === "FINAL_OFFER"
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
                                                src={lender.lender_logo}
                                                alt={lender.lender_name}
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
                                                                i < 5 ? "fill-current text-yellow-400" : ""
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
                                                ₹{finalOffer?.offer_loan_amount?.toLocaleString() || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Max Loan Amount
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-black">
                                                {finalOffer?.interest_rate || 0}%
                                            </div>
                                            <div className="text-sm text-gray-600">Interest Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-black">
                                                ₹{finalOffer?.emi_amount?.toLocaleString() || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Monthly EMI</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-black">
                                                {finalOffer?.tenure || 0} months
                                            </div>
                                            <div className="text-sm text-gray-600">Tenure</div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {lender?.lender_scheme?.[0]?.scheme_detail?.interest_type && (
                                            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                                {lender.lender_scheme[0].scheme_detail.interest_type}
                                            </span>
                                        )}
                                    </div>

                                    {/* Processing Info */}
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Processing Fee: {recentOffer?.charges ?? "N/A"}
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
                                <h4 className="font-medium text-yellow-800">Next Steps</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    To proceed with any lender, we'll need to verify your documents
                                    and collect additional information as required by each lender.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 mt-6">
                        <button
                            onClick={() => handleBack && handleBack()}
                            className="flex items-center gap-2 justify-center text-white bg-black font-medium rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors w-1/6 disabled:opacity-50"
                            // disabled={!props.handleBack && !props.onBack}
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
