import React, { useEffect, useState } from "react";

interface ApplicationStatusProps {
    applicationData: any;
    onBack: () => void;
    onNext: () => void;
}

const CreditBureauConsumer: React.FC<ApplicationStatusProps> = ({
                                                                    applicationData,
                                                                    onBack,
                                                                    onNext,
                                                                }) => {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [applicantCount, setApplicantCount] = useState(0);

    useEffect(() => {
        getApplicationBureau().then(r => console.log(r));
    }, []);

    const getApplicationBureau = async () => {
        if (applicationData?.application_id) {
            try {
                const url = `/alpha/v1/onboarding/${applicationData.application_id}/cam/APPLICATION_BUREAU`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data?.result) {
                    setApplicants(data.result);
                    setApplicantCount(data.result.length);
                }
            } catch (error) {
                console.error("Error fetching bureau data:", error);
            }
        }
    };

    return (
        <div>
            <h3>Credit Bureau Consumer</h3>
            <p>Total Applicants: {applicantCount}</p>
            <ul>
                {applicants.map((applicant) => (
                    <li key={applicant.applicant_id}>
                        <strong>{applicant.applicant_name}</strong> -{" "}
                        {applicant.bureau_details?.mobile || "N/A"}
                    </li>
                ))}
            </ul>
            <div className="d-flex gap-2 mt-3">
                <button onClick={onBack}>Back</button>
                <button onClick={onNext}>Next</button>
            </div>
        </div>
    );
};

export default CreditBureauConsumer;
