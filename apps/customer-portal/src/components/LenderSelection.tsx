import {forwardRef, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react';
import {Star, CheckCircle, ArrowLeft} from 'lucide-react';
import {StepComponentProps} from "@/components/WorkflowStepComponentLoader.tsx";
import {useQuery} from '@tanstack/react-query';
import {Button} from "@repo/ui/components/ui/button";
import {LenderOfferAPI} from '@repo/shared-state/api';
import {useEnvironmentStore} from '@repo/shared-state/config';
import {useParams} from "react-router-dom";


export interface FormDataRef {
    submitFormExternally: () => void;
}

const LenderSelection = forwardRef((props: StepComponentProps, ref) => {
    console.log(ref)
    const formRef = useRef<FormDataRef>(null);
    const {data, handleBack, onBack} = props;

    const [selectedLender, setSelectedLender] = useState<string | null>(null);
    const [offers, setOffers] = useState<Record<string, any>>({});
    const [loadingOffer, setLoadingOffer] = useState<string | null>(null);
    const [appliedLenders, setAppliedLenders] = useState<Record<string, string>>({});
    const [bookingAmount, setBookingAmount] = useState('');
    const [bookingNumber, setBookingNumber] = useState('');
    const [downPayment, setDownPayment] = useState(50000);

    const vehiclePrice = 150000 ;

    const offerAPI = LenderOfferAPI.getInstance();
    const isEnvReady = useEnvironmentStore((s) => s.isInitialized);

    const triggerSubmit = () => {
        console.log('Form ref', formRef.current);
        props?.handleSubmitSuccess({data: props?.data, isValidForm: true})
    };

    useImperativeHandle(ref, () => ({
        submitStepExternally: () => {
            triggerSubmit();
        }
    }));

    const {id} = useParams<{ id: string }>();
    const applicationId = id || data?.application?.application_id;

    const {
        data: offerResult,
        isLoading,
        isError: isOfferError,
        error: offerError,
        refetch: refetchOffers,
    } = useQuery({
        queryKey: ["application", applicationId],
        queryFn: async () => {
            if (!applicationId) throw new Error("applicationId ID is required");
            const response = await offerAPI?.fetchEligibleOffers(applicationId, "V1");
            console.log("API Response:", response);
            return response.result; // Must match RecommendedOffersResponse
        },
        enabled: isEnvReady && !!applicationId,
    });

    useEffect(() => {
        if (offerResult) {
            // Check for already applied lenders from API response (only applicable lenders)
            const alreadyAppliedLenders: Record<string, string> = {};
            offerResult?.lender
                .filter((lender: { lender_applicable: any; }) => lender.lender_applicable)
                .forEach((lender: { lender_apply_id: string; lender_apply_status: any; lender_code: string | number; }) => {
                    if (lender.lender_apply_id && lender.lender_apply_status) {
                        alreadyAppliedLenders[lender.lender_code] = lender.lender_apply_id;
                    }
                });

            if (Object.keys(alreadyAppliedLenders).length > 0) {
                setAppliedLenders(alreadyAppliedLenders);
            }
        }
    }, [offerResult, isOfferError, offerError]);

    // Check if any lender is already applied
    const hasAnyAppliedLender = Object.keys(appliedLenders).length > 0;
    const handleApplyWithLender = async (lenderId: string) => {
        setLoadingOffer(lenderId);
        try {
            const lender = offerResult?.lender.find((l: { lender_id: string; }) => l.lender_id === lenderId);
            if (!lender) return;
            // Call your new lenderApply API with lender_code
            const response = await offerAPI.lenderApply(applicationId, lender.lender_code);
            console.log("Lender Apply Response:", response);

            // Handle the API response structure
            if (response?.result?.applied_lender) {
                // Update applied lenders state with the response data
                setAppliedLenders(prev => ({
                    ...prev,
                    ...response.result.applied_lender
                }));
            }
            if (lender?.recent_offer) {
                const finalOffer = {
                    ...lender.recent_offer,
                    finalAmount: lender.recent_offer.offer_amount,
                    finalEmi: lender.recent_offer.emi,
                };
                setOffers(prev => ({...prev, [lenderId]: finalOffer}));
            }

            // Refetch the recommendation API to get updated lender data with applied status
            await refetchOffers();
        } catch (error) {
            console.error("Error applying with lender:", error);
        } finally {
            setLoadingOffer(null);
        }
    };

    const handleSelectLender = (lenderId: string) => {
        setSelectedLender(lenderId);
        const lender = offerResult?.lender.find((l: { lender_id: string; }) => l.lender_id === lenderId);
        if (lender && props.data?.updateApplicationData) {
            props.data({selectedLender: lender});
        }
    };
    const handleBackClick = () => {
        if (handleBack) {
            handleBack()
        } else if (onBack) {
            onBack();
        }
    };
    // @ts-ignore
    return (
        <div className="max-w-4xl mx-auto">
            {/* Down Payment Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-black mb-4">Down Payment Selection</h3>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Down Payment</span>
                        <span className="text-lg font-bold text-black">₹{downPayment.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={vehiclePrice}
                        step={5000}
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #000 0%, #000 ${(downPayment / vehiclePrice) * 100}%, #e5e7eb ${(downPayment / vehiclePrice) * 100}%, #e5e7eb 100%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹0</span>
                        <span>₹{vehiclePrice.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex space-x-2 mb-4">
                    {[0, 25000, 50000, 75000, 100000].map(amount => (
                        <button
                            key={amount}
                            onClick={() => setDownPayment(amount)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                downPayment === amount ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {amount === 0 ? 'No Down Payment' : `₹${amount / 1000}k`}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vehicle Price:</span>
                        <span className="font-medium">₹{vehiclePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Down Payment:</span>
                        <span className="font-medium">₹{downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                        <span className="text-black">Your Loan Amount:</span>
                        <span className="text-black">₹{(vehiclePrice - downPayment).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Lender Offers Section */}
            {isLoading && (
                <div className="flex justify-center items-center h-32">
                    <div className="flex space-x-2">
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-0"></span>
                        <span className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-300"></span>
                    </div>
                </div>
            )}
            {!isLoading && (
                <div className="space-y-6">
                    {hasAnyAppliedLender && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-blue-600"/>
                                <div>
                                    <h4 className="text-blue-800 font-semibold">Application Already Submitted</h4>
                                    <p className="text-blue-700 text-sm">
                                        You have already applied to a lender. New applications are disabled until the
                                        current application is processed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {offerResult?.lender?.filter((lender: {
                        lender_applicable: boolean;
                    }) => lender.lender_applicable).map((lender: { computed_offer: any[]; recent_offer: any; lender_id: Key | null | undefined; lender_code: string | number; lender_logo: string | undefined; lender_name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; lender_scheme: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; max_loan_amount: { toLocaleString: () => any; }; min_rate_of_interest: any; max_tenure: any; }; }) => {
                        console.log(lender)
                        const finalOffer = lender?.computed_offer?.find(o => o.formula_type === "FINAL_OFFER");
                        const recentOffer = lender.recent_offer;
                        const isLoading = loadingOffer === lender.lender_id;
                        const hasOffer = lender?.lender_id ? offers[String(lender.lender_id)] : undefined;
                        const isSelected = selectedLender === lender.lender_id;
                        const isApplied = appliedLenders[lender.lender_code];
                        const adjustedLoanAmount = vehiclePrice - downPayment;
                        const adjustedEmi = Math.round((adjustedLoanAmount / vehiclePrice) * (hasOffer?.finalEmi || recentOffer?.emi || 0));
                        return (
                            <div key={lender.lender_id} className={`bg-white rounded-xl shadow-lg p-6 transition-all ${isSelected ? 'ring-2 ring-black' : ''} ${isApplied ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                                {/* Applied Status Banner */}
                                {isApplied && (
                                    <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-5 w-5 text-green-600"/>
                                                <span className="text-sm font-medium text-green-800">Application Applied</span>
                                            </div>
                                            <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                                                ID: {isApplied}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Lender Info */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={lender.lender_logo}
                                            alt={String(lender?.lender_name || "lenderLogo.png")}
                                            className="h-10 w-10 object-contain"
                                        />
                                        <div>
                                            <h4 className="text-lg font-bold text-black">{lender.lender_name}</h4>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < 5 ? 'fill-current text-yellow-400' : ''}`}/>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {!hasOffer && !isLoading && !isApplied && !hasAnyAppliedLender && (
                                        <button onClick={() => handleApplyWithLender(String(lender?.lender_id))} className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                                            Apply
                                        </button>
                                    )}

                                    {!hasOffer && !isLoading && !isApplied && hasAnyAppliedLender && (
                                        <button disabled className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed">
                                            Apply
                                        </button>
                                    )}

                                    {isApplied && (
                                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                                            Applied
                                        </div>
                                    )}
                                </div>

                                {/* Scheme */}
                                {lender?.lender_scheme?.name && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm font-medium text-orange-800">🎯 {lender.lender_scheme.name}</p>
                                    </div>
                                )}

                                {/* Loading */}
                                {isLoading && (
                                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"></div>
                                        <p className="font-medium text-blue-800">Generating Your Personalized Offer...</p>
                                        <p className="text-sm text-blue-600">This may take a few moments</p>
                                    </div>
                                )}
                                {/* Offer Details */}
                                {hasOffer && (
                                    <div className="border-t pt-4">
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <h5 className="font-bold text-black mb-2 flex items-center">
                                                <CheckCircle className="h-5 w-5 mr-2"/>
                                                Your Personalized Offer
                                            </h5>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-black">₹{adjustedLoanAmount.toLocaleString()}</div>
                                                    <div className="text-sm text-gray-600">Approved Amount</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-black">{finalOffer?.interest_rate || 0}%</div>
                                                    <div className="text-sm text-gray-600">Interest Rate</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-black">₹{adjustedEmi.toLocaleString()}</div>
                                                    <div className="text-sm text-gray-600">Monthly EMI</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                <p>Processing Fee: {recentOffer?.processingFee || '-'} | Tenure: {recentOffer?.tenure || '-'} months</p>
                                            </div>
                                            {isApplied ? (
                                                <div className="px-6 py-2 rounded-lg font-semibold bg-green-100 text-green-800 border border-green-300">
                                                    Applied
                                                </div>
                                            ) : hasAnyAppliedLender ? (
                                                <button disabled className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-400 cursor-not-allowed">
                                                    {isSelected ? 'Selected' : 'Select This Offer'}
                                                </button>
                                            ) : (
                                                <button onClick={() => handleSelectLender(String(lender?.lender_id))}
                                                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                                                    {isSelected ? 'Selected' : 'Select This Offer'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!hasOffer && !isLoading && (
                                    <div className="grid md:grid-cols-4 gap-4 text-center text-sm text-gray-600">
                                        <div>
                                            <div className="font-semibold">₹ {finalOffer?.offer_loan_amount || lender.lender_scheme?.max_loan_amount?.toLocaleString() || "0"}</div>
                                            <div>Max Amount</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold">{finalOffer?.interest_rate || lender.lender_scheme?.min_rate_of_interest || 0}%</div>
                                            <div>Interest Rate</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                ₹ {finalOffer?.emi_amount && vehiclePrice
                                                ? Math.round((adjustedLoanAmount / vehiclePrice) * finalOffer.emi_amount).toLocaleString()
                                                : "3,750"}
                                            </div>
                                            <div>Est. EMI</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold">{finalOffer?.tenure || lender.lender_scheme?.max_tenure || 0} months</div>
                                            <div>Tenure</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Complete Application */}
            {selectedLender && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Complete Your Application</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Number (Optional)</label>
                            <input
                                type="text"
                                value={bookingNumber}
                                onChange={(e) => setBookingNumber(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Enter your booking number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Amount (Optional)</label>
                            <input
                                type="number"
                                value={bookingAmount}
                                onChange={(e) => setBookingAmount(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Amount paid for booking"
                            />
                        </div>
                    </div>

                    <button
                        onClick={triggerSubmit}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                    >
                        Proceed to Sanction Letter
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                {/* Back Button - Left Corner */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackClick}
                    className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    disabled={!props.handleBack && !props.onBack}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                {/* Save & Next Button - Right Corner */}
                <Button
                    onClick={triggerSubmit}
                    type="button"
                    className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                >
                    Save & Next
                </Button>
            </div>
        </div>
    );
});

export default LenderSelection;
