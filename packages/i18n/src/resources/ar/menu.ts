// Arabic menu labels keyed off the English label returned by the backend
// `module` tree (which IS the t() key when label is passed as the key).
// Add entries as new menu labels appear in the backend response.
export const menu = {
  // Top-level
  "Dashboard": "لوحة التحكم",
  "Lead Management": "إدارة العملاء المحتملين",
  "LOS": "إدارة الإقراض",
  "LMS": "إدارة القروض",
  "Collection": "التحصيل",
  "Finance": "المالية",
  "Operations": "العمليات",
  "Reports": "التقارير",
  "Settings": "الإعدادات",
  "Verification": "التحقق",
  "Partner": "الشريك",
  "Sales": "المبيعات",
  "Marketing": "التسويق",
  "Workflow": "سير العمل",
  "Channel": "القناة",
  "Enquiry": "الاستفسار",
  // Common children
  "Lead List": "قائمة العملاء المحتملين",
  "Login Queue": "قائمة تسجيل الدخول",
  "Tracking Queue": "قائمة المتابعة",
  "Disbursed Queue": "قائمة المصروفات",
  "Rejected Queue": "قائمة المرفوضات",
  "Employee": "الموظف",
  "Module": "الوحدة",
  "Lender": "المُقرض",
  "Loan Type": "نوع القرض",
  "Territory Management": "إدارة المناطق",
  "Service Provider": "مقدم الخدمة",
  "Document Checklist": "قائمة المستندات",
  "CAM Configuration": "إعداد CAM",
  "Rule": "القاعدة",
  "Notification Template": "قالب الإشعار",
  "Parameter": "المعامل",
} as const;
