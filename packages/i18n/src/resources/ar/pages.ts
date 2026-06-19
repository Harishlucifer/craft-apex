export const pages = {
  profile: {
    title: "الملف الشخصي",
    name: "الاسم",
    email: "البريد الإلكتروني",
  },
  notFound: {
    code: "404",
    description: "تعذّر العثور على هذه الصفحة.",
    backToDashboard: "العودة إلى لوحة التحكم",
  },
  placeholder: {
    notPorted: "لم يتم نقل هذه الصفحة بعد.",
    defaultDescription:
      "الشاشة القديمة لهذا المسار موجودة، ولكن واجهة المستخدم الكاملة لم تصل بعد إلى البوابة الجديدة.",
    legacyParityNotes: "ملاحظات تطابق الإصدار القديم",
  },
} as const;
