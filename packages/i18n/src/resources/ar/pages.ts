export const pages = {
  profile: {
    title: "الملف الشخصي",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    designation: "المسمى الوظيفي",
    employeeCode: "رمز الموظف",
    userType: "نوع المستخدم",
    role: "الدور",
    reportsTo: "يتبع إلى",
    rm: "مدير العلاقة",
    branch: "الفرع",
    branchTeam: "فريق الفرع",
    changePassword: "تغيير كلمة المرور",
    noTeam: "لا يوجد أعضاء آخرون في هذا الفرع.",
    workSchedule: "جدول العمل",
    workScheduleHint: "أيام العمل وإجازات السبت والعطلات",
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
