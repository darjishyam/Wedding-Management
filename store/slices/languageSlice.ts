import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = "English" | "Gujrati";

interface LanguageState {
    language: Language;
}

const initialState: LanguageState = {
    language: "English",
};

export const gujaratiNumerals: { [key: string]: string } = {
    "0": "૦", "1": "૧", "2": "૨", "3": "૩", "4": "૪",
    "5": "૫", "6": "૬", "7": "૭", "8": "૮", "9": "૯"
};

export const translations = {
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
        "start_planning": "Let's Start Your Wedding Planning Now",
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

        // Expense List
        "no_expenses_added": "No Expenses Added",
        "track_spending": "Track your wedding spending here.",

        // Guest List
        "invitation_list": "Invitation List",
        "no_guests_added": "No Guests Added",
        "start_preparing_guest_list": "Let's Start Preparing guests list.",
        "pending": "Pending",

        // Shagun Book
        "search_placeholder": "Search Name...",
        "filter_amount": "Filter by Amount",
        "add_shagun": "Add Shagun",
        "no_shagun_added": "No Shagun Added",
        "add_first_shagun": "Add your first Shagun entry",

        // Add Shagun
        "add_new_shagun": "Add New Shagun",
        "name": "Name",
        "shagun_amount": "Shagun Amount",
        "city_village": "City/Village",
        "gift": "Gift",
        "contact_number": "Contact Number",
        "wishes_message": "Wishes/Message",
        "wishes": "Wishes",
        "save_and_add_another": "Save And Add Another",
        "happy_marriage_life": "Happy Marriage Life",
        "error": "Error",
        "success": "Success",
        "all_fields_mandatory": "All fields are mandatory.",
        "mobile_invalid": "Mobile number must be valid 10 digits.",

        // Add Guest
        "add_new_guest": "Add New Guest",
        "total_family_count": "Total Family Count",
        "guest_added_success": "Guest added successfully",
        "failed_add_guest": "Failed to add guest",

        // Add Expense
        "add_new_expense": "Add New Expense",
        "expense_for": "Expense For",
        "paid_deposit_amount": "Paid Deposit Amount",
        "pending_amount": "Pending Amount",
        "enter_title_amount": "Please enter title and amount",
        "enter_valid_amount": "Please enter a valid amount",
        "paid_amount_error": "Paid amount cannot be greater than total amount",
        "expense_added_success": "Expense added successfully",
        "failed_add_expense": "Failed to add expense",

        // Footer
        "my_wedding": "My Wedding",
        "my_shagun": "My Shagun",
        "profile": "Profile",

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

        // Login
        "log_in": "Log In",
        "log_in_subtitle": "Log in with Email and Password",
        "email_address": "Email Address",
        "password": "Password",
        "logging_in": "Logging in...",
        "dont_have_account": "Don't have an account?",
        "sign_up": "Sign Up",
        "enter_email_password": "Please enter both email and password",
        "invalid_email": "Invalid Email",
        "invalid_credentials": "Invalid credentials",
        "login_failed": "Login Failed",

        // Signup
        "create_account": "Create a New Account",
        "fill_details": "Fill full all the details.",
        "phone_number": "Phone Number",
        "signing_up": "Signing Up...",
        "continue_apple": "Continue with Apple",
        "continue_google": "Continue with Google",
        "continue_facebook": "Continue with Facebook",
        "already_have_account": "Already have an account?",
        "login": "Login",
        "invalid_name": "Invalid Name",
        "name_alphabets_only": "Name must contain only alphabets",
        "invalid_mobile": "Invalid Mobile",
        "mobile_10_digits": "Mobile number must be exactly 10 digits",
        "weak_password": "Weak Password",
        "password_requirements": "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
        "signup_failed": "Signup Failed",

        // Create Wedding
        "add_new_wedding": "Add New Wedding",
        "groom_name": "Groom's Name",
        "bride_name": "Bride's Name",
        "marriage_date": "Marriage Date",
        "select_date": "Select Date",
        "saving": "Saving...",
        "failed_create_wedding": "Failed to create wedding",

        // Delete Account
        "delete_account_warning": "Are you sure you want to delete your account? This action is irreversible. Once deleted, you will lose access to your account permanently, and all associated data will be erased.",

        // Terms of Service
        "last_updated": "Last updated: January 1, 2025",
        "terms_1_title": "1. Acceptance of Terms",
        "terms_1_text": "By accessing and using the Shagun application, you accept and agree to be bound by the terms and provision of this agreement.",
        "terms_2_title": "2. Use License",
        "terms_2_text": "Permission is granted to temporarily use Shagun for personal, non-commercial transitory viewing only.",
        "terms_3_title": "3. User Account",
        "terms_3_text": "You are responsible for maintaining the confidentiality of your account and password.",
        "terms_4_title": "4. Premium Subscription",
        "terms_4_text": "Premium subscriptions are billed on a monthly basis and will automatically renew unless cancelled.",
        "terms_5_title": "5. Data Export",
        "terms_5_text": "Premium users can export their data to PDF format. The exported data is for personal use only.",
        "terms_6_title": "6. Privacy",
        "terms_6_text": "Your use of Shagun is also governed by our Privacy Policy.",
        "terms_7_title": "7. Limitation of Liability",
        "terms_7_text": "In no event shall Shagun or its suppliers be liable for any damages arising out of the use or inability to use the materials.",
        "terms_8_title": "8. Modifications",
        "terms_8_text": "Shagun may revise these terms of service at any time without notice.",
        "terms_9_title": "9. Contact Information",
        "terms_9_text": "If you have any questions about these Terms of Service, please contact us.",

        // Onboarding
        "onboarding_title_1": "Say goodbye to physical chandla book",
        "onboarding_desc_1": "Hey there! Now you don't have to worry about losing your marriage chandla book.",
        "onboarding_title_2": "Manage your guest list invitations",
        "onboarding_desc_2": "Invite, track, and manage with ease your ultimate tool for seamless guest list and invitation management!",
        "onboarding_title_3": "Manage your guest list invitations",
        "onboarding_desc_3": "Invite, track, and manage with ease your ultimate tool for seamless guest list and invitation management!",
        "skip": "Skip",
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

        // Expense List
        "no_expenses_added": "કોઈ ખર્ચ ઉમેર્યો નથી",
        "track_spending": "અહીં તમારા લગ્નના ખર્ચનો ટ્રૅક કરો.",

        // Guest List
        "invitation_list": "આમંત્રણ યાદી",
        "no_guests_added": "કોઈ મહેમાન ઉમેર્યા નથી",
        "start_preparing_guest_list": "ચાલો મહેમાનોની યાદી તૈયાર કરીએ.",
        "pending": "બાકી",

        // Shagun Book
        "search_placeholder": "નામ શોધો...",
        "filter_amount": "રકમ દ્વારા ફિલ્ટર કરો",
        "add_shagun": "શગુન ઉમેરો",
        "no_shagun_added": "કોઈ શગુન ઉમેર્યું નથી",
        "add_first_shagun": "તમારું પ્રથમ શગુન એન્ટ્રી ઉમેરો",

        // Add Shagun
        "add_new_shagun": "નવું શગુન ઉમેરો",
        "name": "નામ",
        "shagun_amount": "શગુન રકમ",
        "city_village": "શહેર/ગામ",
        "gift": "ભેટ",
        "contact_number": "સંપર્ક નંબર",
        "wishes_message": "શુભેચ્છાઓ/સંદેશ",
        "wishes": "શુભેચ્છાઓ",
        "save_and_add_another": "સાચવો અને બીજું ઉમેરો",
        "happy_marriage_life": "લગ્ન જીવનની શુભકામનાઓ",
        "error": "ભૂલ",
        "success": "સફળતા",
        "all_fields_mandatory": "બધા ક્ષેત્રો ફરજિયાત છે.",
        "mobile_invalid": "મોબાઇલ નંબર માન્ય 10 અંકનો હોવો જોઈએ.",

        // Add Guest
        "add_new_guest": "નવો મહેમાન ઉમેરો",
        "total_family_count": "કુલ પરિવાર સંખ્યા",
        "guest_added_success": "મહેમાન સફળતાપૂર્વક ઉમેરવામાં આવ્યા",
        "failed_add_guest": "મહેમાન ઉમેરવામાં નિષ્ફળ",

        // Add Expense
        "add_new_expense": "નવો ખર્ચ ઉમેરો",
        "expense_for": "ખર્ચ શેના માટે",
        "paid_deposit_amount": "ચૂકવેલ જમા રકમ",
        "pending_amount": "બાકી રકમ",
        "enter_title_amount": "કૃપા કરીને શીર્ષક અને રકમ દાખલ કરો",
        "enter_valid_amount": "કૃપા કરીને માન્ય રકમ દાખલ કરો",
        "paid_amount_error": "ચૂકવેલ રકમ કુલ રકમ કરતાં વધુ ન હોઈ શકે",
        "expense_added_success": "ખર્ચ સફળતાપૂર્વક ઉમેરવામાં આવ્યો",
        "failed_add_expense": "ખર્ચ ઉમેરવામાં નિષ્ફળ",

        // Footer
        "my_wedding": "મારા લગ્ન",
        "my_shagun": "મારું શગુન",
        "profile": "પ્રોફાઇલ",

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

        // Login
        "log_in": "લૉગ ઇન",
        "log_in_subtitle": "ઇમેઇલ અને પાસવર્ડ સાથે લૉગ ઇન કરો",
        "email_address": "ઇમેઇલ સરનામું",
        "password": "પાસવર્ડ",
        "logging_in": "લૉગ ઇન કરી રહ્યા છીએ...",
        "dont_have_account": "ખાતું નથી?",
        "sign_up": "સાઇન અપ",
        "enter_email_password": "કૃપા કરીને ઇમેઇલ અને પાસવર્ડ બંને દાખલ કરો",
        "invalid_email": "અમાન્ય ઇમેઇલ",
        "invalid_credentials": "અમાન્ય ઓળખપત્રો",
        "login_failed": "લૉગિન નિષ્ફળ",

        // Signup
        "create_account": "નવું ખાતું બનાવો",
        "fill_details": "બધી વિગતો ભરો.",
        "phone_number": "ફોન નંબર",
        "signing_up": "સાઇન અપ કરી રહ્યા છીએ...",
        "continue_apple": "Apple સાથે ચાલુ રાખો",
        "continue_google": "Google સાથે ચાલુ રાખો",
        "continue_facebook": "Facebook સાથે ચાલુ રાખો",
        "already_have_account": "પહેલેથી જ ખાતું છે?",
        "login": "લૉગિન",
        "invalid_name": "અમાન્ય નામ",
        "name_alphabets_only": "નામમાં માત્ર અક્ષરો હોવા જોઈએ",
        "invalid_mobile": "અમાન્ય મોબાઇલ",
        "mobile_10_digits": "મોબાઇલ નંબર બરાબર 10 અંકનો હોવો જોઈએ",
        "weak_password": "નબળો પાસવર્ડ",
        "password_requirements": "પાસવર્ડ ઓછામાં ઓછો 8 અક્ષરોનો હોવો જોઈએ અને તેમાં એક કેપિટલ અક્ષર, એક નંબર અને વિશેષ અક્ષર શામેલ હોવો જોઈએ.",
        "signup_failed": "સાઇન અપ નિષ્ફળ",

        // Create Wedding
        "add_new_wedding": "નવા લગ્ન ઉમેરો",
        "groom_name": "વરરાજાનું નામ",
        "bride_name": "કન્યાનું નામ",
        "marriage_date": "લગ્નની તારીખ",
        "select_date": "તારીખ પસંદ કરો",
        "saving": "સાચવી રહ્યું છે...",
        "failed_create_wedding": "લગ્ન બનાવવામાં નિષ્ફળ",

        // Delete Account
        "delete_account_warning": "શું તમે ખરેખર તમારું એકાઉન્ટ કાઢી નાખવા માંગો છો? આ ક્રિયા ઉલટાવી શકાતી નથી. એકવાર કાઢી નાખ્યા પછી, તમે કાયમ માટે તમારા એકાઉન્ટની accessક્સેસ ગુમાવશો, અને તમામ સંબંધિત ડેટા ભૂંસી નાખવામાં આવશે.",

        // Terms of Service
        "last_updated": "છેલ્લે અપડેટ કર્યું: 1 જાન્યુઆરી, 2025",
        "terms_1_title": "1. શરતોનો સ્વીકાર",
        "terms_1_text": "શગુન એપ્લિકેશનનો ઉપયોગ કરીને, તમે આ કરારની શરતો અને જોગવાઈઓ સાથે બંધાયેલા રહેવા માટે સંમત થાઓ છો.",
        "terms_2_title": "2. લાઇસન્સનો ઉપયોગ",
        "terms_2_text": "શગુનનો અંગત, બિન-વ્યાવસાયિક જોવા માટે અસ્થાયી રૂપે ઉપયોગ કરવાની પરવાનગી આપવામાં આવે છે.",
        "terms_3_title": "3. વપરાશકર્તા એકાઉન્ટ",
        "terms_3_text": "તમારા એકાઉન્ટ અને પાસવર્ડની ગુપ્તતા જાળવવા માટે તમે જવાબદાર છો.",
        "terms_4_title": "4. પ્રીમિયમ સબ્સ્ક્રિપ્શન",
        "terms_4_text": "પ્રીમિયમ સબ્સ્ક્રિપ્શન માસિક ધોરણે બિલ કરવામાં આવે છે અને રદ ન થાય ત્યાં સુધી આપમેળે નવીકરણ થાય છે.",
        "terms_5_title": "5. ડેટા એક્સપોર્ટ",
        "terms_5_text": "પ્રીમિયમ વપરાશકર્તાઓ તેમનો ડેટા PDF ફોર્મેટમાં એક્સપોર્ટ કરી શકે છે. એક્સપોર્ટ કરેલો ડેટા ફક્ત વ્યક્તિગત ઉપયોગ માટે છે.",
        "terms_6_title": "6. ગોપનીયતા",
        "terms_6_text": "શગુનનો તમારો ઉપયોગ અમારી ગોપનીયતા નીતિ દ્વારા પણ સંચાલિત થાય છે.",
        "terms_7_title": "7. જવાબદારીની મર્યાદા",
        "terms_7_text": "કોઈપણ સંજોગોમાં શગુન અથવા તેના સપ્લાયર્સ એપ્લિકેશનના ઉપયોગથી થતા નુકસાન માટે જવાબદાર રહેશે નહીં.",
        "terms_8_title": "8. ફેરફારો",
        "terms_8_text": "શગુન કોઈપણ સમયે સૂચના આપ્યા વિના આ સેવાની શરતોમાં સુધારો કરી શકે છે.",
        "terms_9_title": "9. સંપર્ક માહિતી",
        "terms_9_text": "જો તમને આ સેવાની શરતો વિશે કોઈ પ્રશ્નો હોય, તો કૃપા કરીને અમારો સંપર્ક કરો.",

        // Onboarding
        "onboarding_title_1": "ભૌતિક ચાંદલા બુકને કહો અલવિદા",
        "onboarding_desc_1": "હેય! હવે તમારે તમારી લગ્નની ચાંદલા બુક ખોવાઈ જવાની ચિંતા કરવાની જરૂર નથી.",
        "onboarding_title_2": "તમારા મહેમાનોની યાદી આમંત્રણો મેનેજ કરો",
        "onboarding_desc_2": "સરળતા સાથે આમંત્રિત કરો, ટ્રૅક કરો અને સંચાલિત કરો - સીમલેસ મહેમાન યાદી અને આમંત્રણ સંચાલન માટેનું તમારું અંતિમ સાધન!",
        "onboarding_title_3": "તમારા મહેમાનોની યાદી આમંત્રણો મેનેજ કરો",
        "onboarding_desc_3": "સરળતા સાથે આમંત્રિત કરો, ટ્રૅક કરો અને સંચાલિત કરો - સીમલેસ મહેમાન યાદી અને આમંત્રણ સંચાલન માટેનું અંતિમ સાધન!",
        "skip": "છોડો",
    },
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.language = action.payload;
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
