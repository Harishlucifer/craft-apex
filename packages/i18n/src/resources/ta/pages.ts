export const pages = {
  profile: {
    title: "சுயவிவரம்",
    name: "பெயர்",
    email: "மின்னஞ்சல்",
  },
  notFound: {
    code: "404",
    description: "இந்தப் பக்கத்தைக் கண்டுபிடிக்க முடியவில்லை.",
    backToDashboard: "டாஷ்போர்டுக்குத் திரும்பு",
  },
  placeholder: {
    notPorted: "இந்தப் பக்கம் இன்னும் போர்ட் செய்யப்படவில்லை.",
    defaultDescription:
      "இந்த வழியின் பழைய திரை உள்ளது, ஆனால் முழு UI புதிய போர்ட்டலில் இன்னும் வரவில்லை.",
    legacyParityNotes: "Legacy parity குறிப்புகள்",
  },
} as const;
