import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.mines': 'Mines',
    'nav.compliance': 'Compliance Monitoring',
    'nav.inspections': 'Field Inspections',
    'nav.violations': 'Violations',
    'nav.capa': 'Corrective Actions (CAPA)',
    'nav.ai_insights': 'AI Risk & Insights',
    'nav.gis_map': 'GIS Mine Map',
    'nav.documents': 'Document Digitization',
    'nav.contractors': 'Contractor Management',
    'nav.grievances': 'Grievances',
    'nav.reports': 'Reports & Exports',
    'nav.audit': 'Audit Trail (Hash Chain)',
    'nav.users': 'User Management',
    'nav.settings': 'System Settings',

    // Roles
    'role.inspector': 'Mine Inspector',
    'role.manager': 'Mine Manager',
    'role.admin': 'Corporate Admin',
    'role.auditor': 'Statutory Auditor',

    // Statuses
    'status.compliant': 'Compliant',
    'status.partially_compliant': 'Partially Compliant',
    'status.non_compliant': 'Non-Compliant',
    'status.pending': 'Pending Verification',
    'status.open': 'Open',
    'status.assigned': 'Assigned',
    'status.in_progress': 'In Progress',
    'status.closed': 'Closed',
    'status.reopened': 'Reopened',

    // Risk levels
    'risk.low': 'LOW',
    'risk.medium': 'MEDIUM',
    'risk.high': 'HIGH',
    'risk.critical': 'CRITICAL',

    // Common
    'app.title': 'MineGuard AI',
    'app.subtitle': 'Intelligent Mine Governance & Multi-Domain Compliance',
    'common.search': 'Search records...',
    'common.filter': 'Filter',
    'common.reset': 'Reset',
    'common.export_csv': 'Export CSV',
    'common.export_pdf': 'Export PDF',
    'common.new_record': 'New Record',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.submit': 'Submit',
    'common.verify': 'Verify',
    'common.logout': 'Sign Out',
  },
  hi: {
    // Nav
    'nav.dashboard': 'डैशबोर्ड (Dashboard)',
    'nav.mines': 'खदान प्रबंधन (Mines)',
    'nav.compliance': 'अनुपालन निगरानी (Compliance)',
    'nav.inspections': 'क्षेत्र निरीक्षण (Inspections)',
    'nav.violations': 'उल्लंघन रिकॉर्ड (Violations)',
    'nav.capa': 'सुधारात्मक कार्रवाई (CAPA)',
    'nav.ai_insights': 'AI जोखिम एवं अंतर्दृष्टि',
    'nav.gis_map': 'GIS खदान मानचित्र (Map)',
    'nav.documents': 'दस्तावेज़ डिजिटलीकरण (OCR)',
    'nav.contractors': 'ठेकेदार प्रबंधन (Contractors)',
    'nav.grievances': 'शिकायत निवारण (Grievances)',
    'nav.reports': 'रिपोर्ट एवं निर्यात (Reports)',
    'nav.audit': 'ऑडिट ट्रेल (Hash Chain)',
    'nav.users': 'उपयोगकर्ता प्रबंधन',
    'nav.settings': 'सिस्टम सेटिंग्स',

    // Roles
    'role.inspector': 'खदान निरीक्षक (Inspector)',
    'role.manager': 'खदान प्रबंधक (Manager)',
    'role.admin': 'कॉर्पोरेट प्रशासक (Admin)',
    'role.auditor': 'वैधानिक लेखा परीक्षक (Auditor)',

    // Statuses
    'status.compliant': 'अनुपालक (Compliant)',
    'status.partially_compliant': 'आंशिक अनुपालक',
    'status.non_compliant': 'गैर-अनुपालक (Violation)',
    'status.pending': 'सत्यापन लंबित',
    'status.open': 'सक्रिय (Open)',
    'status.assigned': 'आवंटित (Assigned)',
    'status.in_progress': 'प्रगति में (In Progress)',
    'status.closed': 'समाप्त (Closed)',
    'status.reopened': 'पुनः खुला (Reopened)',

    // Risk levels
    'risk.low': 'निम्न (LOW)',
    'risk.medium': 'मध्यम (MEDIUM)',
    'risk.high': 'उच्च (HIGH)',
    'risk.critical': 'गंभीर (CRITICAL)',

    // Common
    'app.title': 'माइनगार्ड AI (MineGuard AI)',
    'app.subtitle': 'बुद्धिमान खदान शासन एवं बहु-क्षेत्र अनुपालन प्रणाली',
    'common.search': 'खोजें...',
    'common.filter': 'फ़िल्टर',
    'common.reset': 'रीसेट',
    'common.export_csv': 'CSV निर्यात',
    'common.export_pdf': 'PDF रिपोर्ट डाउनलोड',
    'common.new_record': 'नया रिकॉर्ड बनाएं',
    'common.view': 'देखें',
    'common.edit': 'संपादित करें',
    'common.submit': 'जमा करें',
    'common.verify': 'सत्यापित करें',
    'common.logout': 'लॉग आउट',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
