import { createContext, ReactNode, useContext, useState } from "react";

type Language = "English" | "Gujrati";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  English: {
    // Profile
    "hi_moon": "Hi Moon!",
    "edit": "Edit",
    "purchase_premium": "Purchase Premium",
    "export_data_pdf": "Export data to PDF without ads",
    "change_language": "Change Language",
    "change": "Change",
    "terms_of_service": "Terms of Service",
    "delete_account": "Delete Account",
    "contact_us": "Contact Us",
    "connect_instagram": "Connect on Instagram",
    "log_out": "Log out",
    "cancel": "Cancel",
    "save": "Save",
    "english": "English",
    "gujrati": "Gujrati",

    // Dashboard
    "shagun": "Shagun",
    "no_wedding_created": "No Wedding Created",
    "start_planning": "Let's Start Your Wedding Planing Now",
    "create_wedding": "Create Wedding",
    "shagun_book": "Shagun Book",
    "expense": "Expense",
    "invitation": "Invitation",
    "people": "People",
    "total_chandlo": "Total Chandlo",
    "remaining": "Remaining",
    "spent": "Spent",
    "invitation_sent": "Invitation Sent",
    "total_guest": "Total Guest",
    "total_budget": "Total Budget",
    "budget_required": "Budget Required",
    "set_budget_msg": "Please set a total budget before managing expenses.",
    "set_budget": "Set Budget",
    "save_budget": "Save Budget",
    "enter_budget_amount": "Enter Budget Amount",

    // Shagun Book
    "search_placeholder": "Search Name...",
    "filter_amount": "Filter by Amount",
    "add_shagun": "Add Shagun",
    "no_shagun_added": "No Shagun Added",
    "add_first_shagun": "Add your first Shagun entry",

    // Premium
    "upgrade_premium": "Upgrade to Premium",
    "unlock_features": "Unlock all premium features and enjoy an ad-free experience with PDF export capabilities.",
    "ads_free": "Ads Free",
    "export_shagun_pdf": "Export Shagun Book to PDF",
    "export_guest_pdf": "Export Guest List to PDF",
    "export_expense_pdf": "Export Expense Book to PDF",
    "support": "Support",
    "per_month": "month",
    "pay_apple": "Pay with Apple",
    "purchase_terms": "By purchasing, you agree to our Terms of Service and Privacy Policy. Subscription will auto-renew unless cancelled.",
  },
  Gujrati: {
    // Profile
    "hi_moon": "હાય મૂન!",
    "edit": "સંપાદન",
    "purchase_premium": "પ્રીમિયમ ખરીદો",
    "export_data_pdf": "વિજ્ઞાપનો વગર PDF માં ડેટા એક્સપોર્ટ કરો",
    "change_language": "ભાષા બદલો",
    "change": "બદલો",
    "terms_of_service": "સેવાની શરતો",
    "delete_account": "એકાઉન્ટ કાઢી નાખો",
    "contact_us": "અમારો સંપર્ક કરો",
    "connect_instagram": "ઇન્સ્ટાગ્રામ પર કનેક્ટ કરો",
    "log_out": "લૉગ આઉટ",
    "cancel": "રદ કરો",
    "save": "સાચવો",
    "english": "ઇંગ્લિશ",
    "gujrati": "ગુજરાતી",

    // Dashboard
    "shagun": "શગુન",
    "no_wedding_created": "કોઈ લગ્ન બનાવેલ નથી",
    "start_planning": "ચાલો હવે તમારા લગ્નનું આયોજન શરૂ કરીએ",
    "create_wedding": "લગ્ન બનાવો",
    "shagun_book": "શગુન બુક",
    "expense": "ખર્ચ",
    "invitation": "આમંત્રણ",
    "people": "લોકો",
    "total_chandlo": "કુલ ચાંદલો",
    "remaining": "બાકી",
    "spent": "ખર્ચાયેલ",
    "invitation_sent": "આમંત્રણ મોકલ્યું",
    "total_guest": "કુલ મહેમાન",
    "total_budget": "કુલ બજેટ",
    "budget_required": "બજેટ જરૂરી છે",
    "set_budget_msg": "ખર્ચનું સંચાલન કરતા પહેલા કૃપા કરીને કુલ બજેટ સેટ કરો.",
    "set_budget": "બજેટ સેટ કરો",
    "save_budget": "બજેટ સાચવો",
    "enter_budget_amount": "બજેટ રકમ દાખલ કરો",

    // Shagun Book
    "search_placeholder": "નામ શોધો...",
    "filter_amount": "રકમ દ્વારા ફિલ્ટર કરો",
    "add_shagun": "શગુન ઉમેરો",
    "no_shagun_added": "કોઈ શગુન ઉમેર્યું નથી",
    "add_first_shagun": "તમારું પ્રથમ શગુન એન્ટ્રી ઉમેરો",

    // Premium
    "upgrade_premium": "પ્રીમિયમમાં અપગ્રેડ કરો",
    "unlock_features": "બધી પ્રીમિયમ સુવિધાઓ અનલૉક કરો અને PDF એક્સપોર્ટ ક્ષમતાઓ સાથે વિજ્ઞાપન-મુક્ત અનુભવ માણો.",
    "ads_free": "વિજ્ઞાપન મુક્ત",
    "export_shagun_pdf": "શગુન બુક PDF માં એક્સપોર્ટ કરો",
    "export_guest_pdf": "મહેમાન યાદી PDF માં એક્સપોર્ટ કરો",
    "export_expense_pdf": "ખર્ચ બુક PDF માં એક્સપોર્ટ કરો",
    "support": "સહાય",
    "per_month": "મહિના",
    "pay_apple": "Apple સાથે ચૂકવણી કરો",
    "purchase_terms": "ખરીદી કરીને, તમે અમારી સેવાની શરતો અને ગોપનીયતા નીતિ સાથે સંમત થાઓ છો. રદ કર્યા સિવાય સબ્સ્ક્રિપ્શન આપમેળે નવીન થશે.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("English");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.English] || key;
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

