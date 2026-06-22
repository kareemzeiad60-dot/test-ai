import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "Dashboard": { en: "Dashboard", ar: "لوحة القيادة" },
  "Analyze": { en: "Analyze", ar: "تحليل الماشية" },
  "History": { en: "History", ar: "السجل" },
  "Login": { en: "Log in", ar: "تسجيل الدخول" },
  "Logout": { en: "Log out", ar: "تسجيل الخروج" },
  "Total Analyses": { en: "Total Analyses", ar: "إجمالي التحليلات" },
  "This Month": { en: "This Month", ar: "هذا الشهر" },
  "Most Common Breed": { en: "Most Common Breed", ar: "أكثر السلالات شيوعاً" },
  "Upload Image": { en: "Upload Image", ar: "رفع صورة" },
  "Open Camera": { en: "Open Camera", ar: "فتح الكاميرا" },
  "Analyze Button": { en: "Analyze", ar: "تحليل" },
  "Export PDF": { en: "Export PDF", ar: "تصدير PDF" },
  "Confidence": { en: "Confidence", ar: "الثقة" },
  "Top Breed": { en: "Top Breed", ar: "أعلى سلالة" },
  "Delete": { en: "Delete", ar: "حذف" },
  "Date": { en: "Date", ar: "التاريخ" },
  "Platform Name": { en: "Domestic Cattle AI", ar: "الذكاء الاصطناعي للماشية المحلية" },
  "Welcome Message": { en: "Precision AI platform for livestock professionals", ar: "منصة ذكاء اصطناعي دقيقة لمتخصصي الثروة الحيوانية" },
  "Take Photo": { en: "Take Photo", ar: "التقاط صورة" },
  "Close Camera": { en: "Close Camera", ar: "إغلاق الكاميرا" },
  "Drag and drop an image here": { en: "Drag and drop an image here", ar: "اسحب وأفلت صورة هنا" },
  "or click to select": { en: "or click to select", ar: "أو انقر للاختيار" },
  "Cancel": { en: "Cancel", ar: "إلغاء" },
  "Recent Analyses": { en: "Recent Analyses", ar: "التحليلات الحديثة" },
  "Avg Confidence": { en: "Avg Confidence", ar: "متوسط الثقة" },
  "Breed Distribution": { en: "Breed Distribution", ar: "توزيع السلالات" },
  "Analyzed Image": { en: "Analyzed Image", ar: "الصورة المحللة" },
  "Top Predictions": { en: "Top Predictions", ar: "أفضل التوقعات" },
  
  // Breeds
  "Angus": { en: "Angus", ar: "أنغوس" },
  "Ayrshire": { en: "Ayrshire", ar: "إيرشاير" },
  "Brown Swiss": { en: "Brown Swiss", ar: "براون سويس" },
  "Hereford": { en: "Hereford", ar: "هيرفورد" },
  "Holstein-Friesian": { en: "Holstein-Friesian", ar: "هولشتاين فريزيان" },
  "Jaffarabadi": { en: "Jaffarabadi", ar: "جعفرآبادي" },
  "Jersey": { en: "Jersey", ar: "جيرسي" },
  "Red Dane": { en: "Red Dane", ar: "ريد داين" },
  "Simmental": { en: "Simmental", ar: "سيمنتال" }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
