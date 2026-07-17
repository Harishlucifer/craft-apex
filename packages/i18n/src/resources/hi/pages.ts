export const pages = {
  profile: {
    title: "प्रोफ़ाइल",
    name: "नाम",
    email: "ईमेल",
    phone: "फ़ोन",
    designation: "पदनाम",
    employeeCode: "कर्मचारी कोड",
    userType: "उपयोगकर्ता प्रकार",
    role: "भूमिका",
    reportsTo: "रिपोर्टिंग प्रबंधक",
    rm: "रिलेशनशिप मैनेजर",
    branch: "शाखा",
    branchTeam: "शाखा टीम",
    changePassword: "पासवर्ड बदलें",
    noTeam: "इस शाखा में कोई अन्य सदस्य नहीं।",
    workSchedule: "कार्य अनुसूची",
    workScheduleHint: "कार्य दिवस, शनिवार अवकाश और छुट्टियाँ",
  },
  notFound: {
    code: "404",
    description: "यह पृष्ठ नहीं मिला।",
    backToDashboard: "डैशबोर्ड पर वापस",
  },
  placeholder: {
    notPorted: "यह पृष्ठ अभी पोर्ट नहीं किया गया है।",
    defaultDescription:
      "इस मार्ग के लिए पुरानी स्क्रीन मौजूद है, लेकिन पूरा UI नए पोर्टल में अभी नहीं आया है।",
    legacyParityNotes: "लीगेसी पैरिटी नोट्स",
  },
} as const;
