import { createContext, useContext, useState } from 'react'

// Minimal, real (not decorative) i18n for the public marketing pages —
// covers nav, hero, and section copy. The authenticated dashboard stays
// English-only for now; scope this dictionary out to the rest of the
// app when full localization is prioritized.
const STRINGS = {
  en: {
    navProducts: 'Products',
    navHow: 'How It Works',
    navPayment: 'Payment',
    navTrust: 'Compliance',
    navTrack: 'Track',
    login: 'Log in',
    becomeMember: 'Become a Member',
    heroEyebrow: 'Medical Procurement Platform',
    heroTitle: 'Medical procurement, connected',
    heroSub:
      'MEDFLOW connects clinics, suppliers, regulatory workflows, payment, and logistics in one place — informing your decisions first, recommending second, and never pushing a sale.',
    heroCtaPrimary: 'Order Products',
    heroCtaSecondary: 'Become a Member',
    heroPreviewCaption: 'A live view of your dashboard once you sign in',
    trustISO: 'ISO 13485',
    trustGDP: 'GDP Certified',
    trustHIPAA: 'HIPAA Compliant',
    actionsKicker: 'Get started',
    actionsTitle: 'One next step, whichever role you\u2019re in',
    orderTitle: 'Order Products',
    orderDesc: 'Browse the supplier catalog and place a procurement request in minutes.',
    memberTitle: 'Become a Member',
    memberDesc: 'Create a clinic account to order, track, and manage procurement.',
    trackTitle: 'Track an Order',
    trackDesc: 'Follow a shipment through confirmation, dispatch, and delivery.',
    howTitle: 'How MedFlow Works',
    howDesc: 'See the full path from discovery to delivery.',
    suppliersTitle: 'Suppliers & Partners',
    suppliersDesc: 'List your catalog and reach verified clinics.',
    workflowKicker: 'The process',
    workflowTitle: 'From request to delivery, every step accounted for',
    wfSelect: 'Select',
    wfSelectDesc: 'Browse verified suppliers and products',
    wfVerify: 'Verify',
    wfVerifyDesc: 'Regulatory and compliance checks',
    wfProcess: 'Process',
    wfProcessDesc: 'Agreement and payment settled',
    wfTrack: 'Track',
    wfTrackDesc: 'Chain-of-custody visibility in transit',
    wfDeliver: 'Deliver',
    wfDeliverDesc: 'Confirmed receipt at your clinic',
    footerTagline: 'Medical procurement, connected.',
  },
  th: {
    navProducts: 'สินค้า',
    navHow: 'วิธีการทำงาน',
    navPayment: 'การชำระเงิน',
    navTrust: 'มาตรฐานและความน่าเชื่อถือ',
    navTrack: 'ติดตามคำสั่งซื้อ',
    login: 'เข้าสู่ระบบ',
    becomeMember: 'สมัครสมาชิก',
    heroEyebrow: 'แพลตฟอร์มจัดซื้อเวชภัณฑ์',
    heroTitle: 'จัดซื้อเวชภัณฑ์ เชื่อมต่อกันอย่างครบวงจร',
    heroSub:
      'MEDFLOW เชื่อมโยงคลินิก ซัพพลายเออร์ กระบวนการกำกับดูแล การชำระเงิน และโลจิสติกส์ไว้ในที่เดียว — ให้ข้อมูลก่อน แนะนำเป็นอันดับสอง และไม่เร่งการขาย',
    heroCtaPrimary: 'สั่งซื้อสินค้า',
    heroCtaSecondary: 'สมัครสมาชิก',
    heroPreviewCaption: 'ตัวอย่างแดชบอร์ดของคุณหลังเข้าสู่ระบบ',
    trustISO: 'ISO 13485',
    trustGDP: 'รับรอง GDP',
    trustHIPAA: 'มาตรฐาน HIPAA',
    actionsKicker: 'เริ่มต้นใช้งาน',
    actionsTitle: 'ขั้นตอนถัดไป ไม่ว่าคุณจะอยู่บทบาทใด',
    orderTitle: 'สั่งซื้อสินค้า',
    orderDesc: 'เลือกดูแคตตาล็อกซัพพลายเออร์และส่งคำขอจัดซื้อได้ในไม่กี่นาที',
    memberTitle: 'สมัครสมาชิก',
    memberDesc: 'สร้างบัญชีคลินิกเพื่อสั่งซื้อ ติดตาม และจัดการการจัดซื้อ',
    trackTitle: 'ติดตามคำสั่งซื้อ',
    trackDesc: 'ติดตามการจัดส่งตั้งแต่ยืนยัน จัดส่ง จนถึงส่งมอบ',
    howTitle: 'วิธีการทำงานของ MedFlow',
    howDesc: 'ดูเส้นทางทั้งหมดตั้งแต่ค้นหาจนถึงจัดส่ง',
    suppliersTitle: 'ซัพพลายเออร์และพันธมิตร',
    suppliersDesc: 'ลงแคตตาล็อกของคุณและเข้าถึงคลินิกที่ผ่านการยืนยัน',
    workflowKicker: 'กระบวนการ',
    workflowTitle: 'ตั้งแต่คำขอจนถึงการจัดส่ง ทุกขั้นตอนตรวจสอบได้',
    wfSelect: 'เลือก',
    wfSelectDesc: 'เลือกดูซัพพลายเออร์และสินค้าที่ผ่านการยืนยัน',
    wfVerify: 'ตรวจสอบ',
    wfVerifyDesc: 'ตรวจสอบด้านกำกับดูแลและมาตรฐาน',
    wfProcess: 'ดำเนินการ',
    wfProcessDesc: 'ตกลงเงื่อนไขและชำระเงิน',
    wfTrack: 'ติดตาม',
    wfTrackDesc: 'มองเห็นการจัดส่งแบบตรวจสอบย้อนกลับได้',
    wfDeliver: 'ส่งมอบ',
    wfDeliverDesc: 'ยืนยันรับสินค้าที่คลินิกของคุณ',
    footerTagline: 'จัดซื้อเวชภัณฑ์ เชื่อมต่อกันอย่างครบวงจร',
  },
}

const LangCtx = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => STRINGS[lang][key] ?? key
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export function useLanguage() {
  return useContext(LangCtx)
}
