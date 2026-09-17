import { useState, useEffect } from "react";
import {
  ShoppingBag, X, Plus, Minus, Check, Phone, MapPin, User, MessageSquare,
  Search, Heart, Lock, Trash2, Pencil, LogOut, ChevronRight, ChevronLeft, Menu,
  Truck, Wallet, ShieldCheck, Headphones, Instagram, Facebook, Music2, MessageCircle,
} from "lucide-react";
import { db, doc, getDoc, setDoc } from "./firebase";

/* ---------------------------------- Data ---------------------------------- */

const COLORS = {
  paper: "#F2EDE4",
  ink: "#1B1B1F",
  crimson: "#C81E3A",
  gold: "#C9A227",
  indigo: "#2B2A6B",
  muted: "#6B6560",
  line: "#D8D0C0",
};

const SWATCHES = [COLORS.crimson, COLORS.ink, COLORS.gold, COLORS.indigo, "#2F6F4E", "#7A3E9D"];

const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان", "تيميمون",
  "برج باجي مختار", "أولاد جلال", "بني عباس", "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة",
];

const CATEGORIES = ["مانجا", "مانهوا", "بوسترات", "ستيكرز"];
const ORDER_STATUSES = ["قيد الانتظار", "قيد التحضير", "تم الشحن", "تم التسليم", "ملغى"];
const DELIVERY_FEE = 400;
const formatPrice = (n) => `${Number(n).toLocaleString("en-US")} دج`;

const DEFAULT_PRODUCTS = [
  { id: 1, title: "وان بيس — الجزء 105", category: "مانجا", price: 1200, stock: 24, color: COLORS.crimson, image: "", badge: "الأكثر مبيعاً", tags: ["شونين", "الأكثر مبيعاً"], desc: "الفصول الأخيرة من رحلة طاقم قبعة القش، طبعة أصلية بورق عالي الجودة." },
  { id: 2, title: "ناروتو — الجزء 42", category: "مانجا", price: 1100, stock: 18, color: COLORS.ink, image: "", badge: "", tags: ["شونين"], desc: "معركة الحرب النينجا الرابعة تصل إلى ذروتها في هذا الجزء." },
  { id: 3, title: "أتاك أون تايتن — الجزء 30", category: "مانجا", price: 1300, stock: 10, color: COLORS.gold, image: "", badge: "جديد", tags: ["شونين"], desc: "الفصل الختامي لملحمة العمالقة، طبعة محدودة بغلاف مقوى." },
  { id: 4, title: "دراغون بول — الجزء 12", category: "مانجا", price: 1000, stock: 30, color: COLORS.indigo, image: "", badge: "", tags: ["شونين"], desc: "مغامرات غوكو الكلاسيكية بإعادة طباعة بجودة عالية." },
  { id: 5, title: "سولو ليفلنغ — المجلد 7", category: "مانهوا", price: 1400, stock: 15, color: COLORS.crimson, image: "", badge: "", tags: ["الأكثر مبيعاً"], desc: "صعود الصياد الأضعف نحو القمة، بألوان مانهوا زاهية." },
  { id: 6, title: "الغراب الأسود — المجلد 3", category: "مانهوا", price: 1350, stock: 12, color: COLORS.ink, image: "", badge: "جديد", tags: [], desc: "قصة انتقام مظلمة برسوم مانهوا كورية أصلية." },
  { id: 7, title: "سولو ليفلنغ — المجلد 8", category: "مانهوا", price: 1400, stock: 0, color: COLORS.indigo, image: "", badge: "", tags: [], desc: "تتمة مباشرة للمجلد السابع بأحداث متسارعة." },
  { id: 8, title: "بوستر — المحارب الأحمر", category: "بوسترات", price: 600, stock: 40, color: COLORS.crimson, image: "", badge: "", tags: [], desc: "بوستر مطبوع بجودة عالية، مقاس A3، مناسب للتأطير." },
  { id: 9, title: "بوستر — ليلة طوكيو", category: "بوسترات", price: 650, stock: 22, color: COLORS.ink, image: "", badge: "", tags: [], desc: "تصميم حصري بألوان نيون، مقاس A3." },
  { id: 10, title: "بوستر — سيف الساموراي", category: "بوسترات", price: 600, stock: 27, color: COLORS.gold, image: "", badge: "", tags: [], desc: "لوحة فنية بأسلوب مانجا كلاسيكي، مقاس A3." },
  { id: 11, title: "طقم ستيكرز — أبطال الأنمي", category: "ستيكرز", price: 300, stock: 55, color: COLORS.gold, image: "", badge: "جديد", tags: [], desc: "طقم من 20 ستيكر مقاوم للماء لأبطالك المفضلين." },
  { id: 12, title: "طقم ستيكرز — رموز مانجا", category: "ستيكرز", price: 250, stock: 60, color: COLORS.crimson, image: "", badge: "", tags: [], desc: "طقم من 15 ستيكر بتصاميم مستوحاة من عناوين مانجا شهيرة." },
];

const DEFAULT_SETTINGS = {
  welcomeSub: "وجهتكم الأولى للمانجا والمانهوا وسلع الأنمي الأصلية في الجزائر — توصيل ودفع عند الاستلام لكل الولايات.",
  social: { instagram: "", facebook: "", tiktok: "", whatsapp: "" },
  adminPassword: "admin123",
  heroSlides: [
    { id: 1, title: "مرحباً بكم في متجر أوتاكو بوكس", subtitle: "مانجا، مانهوا، بوسترات وستيكرز أصلية — توصيل والدفع عند الاستلام لكل الولايات.", color: COLORS.ink, category: "الكل" },
    { id: 2, title: "مجموعة سولو ليفلنغ الكاملة", subtitle: "اكتشف أحدث مجلدات المانهوا الأكثر طلباً هذا الأسبوع.", color: COLORS.crimson, category: "مانهوا" },
    { id: 3, title: "بوسترات وستيكرز حصرية", subtitle: "زيّن غرفتك بأبطالك المفضلين من عالم الأنمي.", color: COLORS.indigo, category: "بوسترات" },
  ],
  homeSections: [
    { id: 1, title: "الأكثر مبيعاً", tag: "الأكثر مبيعاً" },
    { id: 2, title: "مانجا شونين", tag: "شونين" },
  ],
  pages: {
    faq: [
      { id: 1, q: "كيف يتم الدفع؟", a: "الدفع يكون عند استلام طلبك من طرف عون التوصيل مباشرة، بدون أي دفع مسبق." },
      { id: 2, q: "كم تستغرق مدة التوصيل؟", a: "عادة بين يومين و5 أيام عمل حسب الولاية." },
      { id: 3, q: "هل يمكن إرجاع أو استبدال المنتج؟", a: "نعم، خلال 7 أيام من الاستلام، بشرط أن يكون المنتج في حالته الأصلية." },
    ],
    delivery: "أسعار التوصيل تختلف حسب الولاية، وتُحسب تلقائياً عند إتمام الطلب. التوصيل متوفر لجميع الولايات الـ58، والدفع يكون عند الاستلام.",
    terms: "باستخدامك لموقعنا فإنك توافق على الشروط التالية:\n- جميع الأسعار المعروضة نهائية.\n- الدفع يتم عند الاستلام فقط.\n- لا يمكن استرجاع المنتج بعد استخدامه أو فتح تغليفه.\n- يحتفظ المتجر بحق تعديل الأسعار والعروض في أي وقت.",
    contact: "لأي استفسار يمكنكم التواصل معنا عبر واتساب أو صفحاتنا على مواقع التواصل الاجتماعي الموجودة أسفل الموقع.",
  },
};

/* ------------------------------- Image helper ------------------------------ */

function resizeImageFile(file, maxSize = 700, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        else if (height >= width && height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* --------------------------------- Styles ---------------------------------- */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Tajawal:wght@300;400;500;700&display=swap');

    .ob-app { font-family: 'Tajawal', sans-serif; background: ${COLORS.paper}; color: ${COLORS.ink}; min-height: 100vh; direction: rtl; }
    .ob-app * { box-sizing: border-box; }
    .ob-heading { font-family: 'Almarai', sans-serif; }

    .ob-header { position: sticky; top: 0; z-index: 30; background: ${COLORS.ink}; color: ${COLORS.paper}; }
    .ob-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; gap: 14px; }
    .ob-logo { font-family: 'Almarai', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: baseline; gap: 4px; white-space: nowrap; }
    .ob-logo span { color: ${COLORS.crimson}; }
    .ob-nav { display: flex; align-items: center; gap: 14px; }
    .ob-nav-link { background: none; border: none; color: ${COLORS.paper}; font-family: 'Tajawal'; font-size: 15px; cursor: pointer; padding: 6px 2px; opacity: 0.85; border-bottom: 2px solid transparent; }
    .ob-nav-link.active { opacity: 1; border-color: ${COLORS.crimson}; }
    .ob-icon-btn { background: none; border: none; cursor: pointer; color: ${COLORS.ink}; display: flex; position: relative; padding: 4px; }
    .ob-cart-btn { position: relative; background: ${COLORS.crimson}; border: none; color: white; width: 38px; height: 38px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .ob-cart-count { position: absolute; top: -6px; left: -6px; background: ${COLORS.gold}; color: ${COLORS.ink}; font-size: 11px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .ob-search-wrap { display: flex; align-items: center; }
    .ob-search-input { background: rgba(255,255,255,0.1); border: 1px solid rgba(242,237,228,0.3); color: white; border-radius: 20px; font-family: 'Tajawal'; font-size: 13px; width: 0; opacity: 0; padding: 0; transition: width .2s, opacity .2s, padding .2s; }
    .ob-search-input.open { width: 140px; opacity: 1; padding: 6px 14px; }
    .ob-search-input::placeholder { color: rgba(242,237,228,0.6); }
    .ob-hamburger { display: none; background: none; border: none; color: ${COLORS.paper}; cursor: pointer; }

    .ob-mobile-menu { background: ${COLORS.ink}; color: ${COLORS.paper}; padding: 6px 20px 14px; display: flex; flex-direction: column; }
    .ob-mobile-menu button { background: none; border: none; color: ${COLORS.paper}; text-align: right; padding: 11px 2px; font-family: 'Tajawal'; font-size: 15px; cursor: pointer; border-bottom: 1px solid rgba(242,237,228,0.1); }

    .ob-catnav { background: white; border-bottom: 1px solid ${COLORS.line}; overflow-x: auto; }
    .ob-catnav-inner { max-width: 1100px; margin: 0 auto; display: flex; gap: 22px; padding: 10px 20px; }
    .ob-catnav-item { background: none; border: none; font-family: 'Tajawal'; font-weight: 500; font-size: 14px; color: ${COLORS.ink}; cursor: pointer; white-space: nowrap; padding: 4px 2px; border-bottom: 2px solid transparent; }
    .ob-catnav-item.active { border-color: ${COLORS.crimson}; color: ${COLORS.crimson}; font-weight: 700; }

    .ob-slider { position: relative; overflow: hidden; }
    .ob-slide { position: relative; padding: 76px 20px 88px; text-align: center; color: ${COLORS.paper}; }
    .ob-slide-lines { position: absolute; inset: 0; background-image: repeating-linear-gradient(115deg, rgba(242,237,228,0.06) 0px, rgba(242,237,228,0.06) 2px, transparent 2px, transparent 34px); }
    .ob-slide-content { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; animation: obRise .5s ease-out; }
    @keyframes obRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .ob-hero-title { font-family: 'Almarai', sans-serif; font-weight: 800; font-size: clamp(26px, 5vw, 46px); line-height: 1.2; margin: 0 0 16px; }
    .ob-hero-sub { font-size: 16px; color: ${COLORS.line}; margin: 0 auto 28px; line-height: 1.7; }
    .ob-slider-dots { position: absolute; bottom: 14px; right: 0; left: 0; display: flex; justify-content: center; gap: 8px; z-index: 2; }
    .ob-slider-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(242,237,228,0.4); border: none; cursor: pointer; padding: 0; }
    .ob-slider-dot.active { background: ${COLORS.gold}; width: 22px; border-radius: 4px; }
    .ob-slider-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.25); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; }
    .ob-slider-arrow.right { right: 14px; } .ob-slider-arrow.left { left: 14px; }

    .ob-btn-primary { background: ${COLORS.crimson}; color: white; border: none; padding: 13px 30px; font-family: 'Tajawal'; font-weight: 700; font-size: 15px; border-radius: 4px; cursor: pointer; transition: transform .15s, background .15s; }
    .ob-btn-primary:hover { background: #a91830; transform: translateY(-1px); }
    .ob-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .ob-btn-secondary { background: transparent; color: ${COLORS.ink}; border: 1.5px solid ${COLORS.ink}; padding: 12px 26px; font-family: 'Tajawal'; font-weight: 700; font-size: 15px; border-radius: 4px; cursor: pointer; }

    .ob-section { max-width: 1100px; margin: 0 auto; padding: 56px 20px; }
    .ob-section-title { font-family: 'Almarai'; font-weight: 800; font-size: 26px; margin: 0 0 26px; }
    .ob-cat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .ob-cat-card { background: ${COLORS.ink}; color: ${COLORS.paper}; padding: 22px 10px; text-align: center; border-radius: 4px; cursor: pointer; font-family: 'Almarai'; font-weight: 700; font-size: 15px; border: none; transition: transform .15s; }
    .ob-cat-card:hover { transform: translateY(-3px); }
    .ob-cat-card:nth-child(1) { background: ${COLORS.crimson}; }
    .ob-cat-card:nth-child(2) { background: ${COLORS.indigo}; }
    .ob-cat-card:nth-child(3) { background: ${COLORS.gold}; color: ${COLORS.ink}; }
    .ob-cat-card:nth-child(4) { background: ${COLORS.ink}; }

    .ob-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .ob-card { font-family: 'Tajawal'; transition: transform .15s, box-shadow .15s; background: white; border: 1.5px solid rgba(27,27,31,0.45); border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .ob-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.14); border-color: rgba(27,27,31,0.6); }
    .ob-card-cover { position: relative; aspect-ratio: 3 / 4; overflow: hidden; display: flex; align-items: flex-end; cursor: pointer; background: ${COLORS.line}; }
    .ob-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ob-halftone { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.4px); background-size: 7px 7px; mix-blend-mode: overlay; opacity: .55; pointer-events: none; }
    .ob-cover-title { position: relative; z-index: 1; color: white; font-family: 'Almarai'; font-weight: 800; font-size: 16px; line-height: 1.3; padding: 14px 12px 20px; text-shadow: 0 1px 4px rgba(0,0,0,0.35); }
    .ob-ribbon { position: absolute; top: 10px; left: -30px; background: ${COLORS.gold}; color: ${COLORS.ink}; font-size: 11px; font-weight: 800; padding: 4px 34px; transform: rotate(-40deg); z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    .ob-ribbon.muted { background: ${COLORS.muted}; color: white; }
    .ob-fav-btn { position: absolute; top: 8px; right: 8px; z-index: 3; background: rgba(0,0,0,0.4); border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .ob-card-info { padding: 10px 12px 12px; }
    .ob-card-cat { font-size: 11px; color: ${COLORS.muted}; margin-bottom: 3px; cursor: pointer; }
    .ob-card-title { font-family: 'Tajawal'; font-weight: 700; font-size: 14px; color: ${COLORS.ink}; margin-bottom: 8px; line-height: 1.35; cursor: pointer; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
    .ob-card-bottom-row { display: flex; align-items: center; justify-content: space-between; }
    .ob-card-price { color: ${COLORS.crimson}; font-weight: 800; font-family: 'Almarai'; font-size: 14px; }
    .ob-quickadd-btn { background: ${COLORS.ink}; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .ob-quickadd-btn:disabled { opacity: .35; cursor: not-allowed; }

    .ob-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .ob-feature { text-align: center; padding: 18px 10px; }
    .ob-feature .ic { width: 46px; height: 46px; border-radius: 50%; background: ${COLORS.paper}; border: 1.5px solid ${COLORS.line}; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .ob-feature h4 { font-family: 'Almarai'; font-size: 15px; margin: 0 0 6px; }
    .ob-feature p { font-size: 13px; color: ${COLORS.muted}; margin: 0; line-height: 1.6; }

    .ob-cod-banner { background: ${COLORS.gold}; color: ${COLORS.ink}; text-align: center; padding: 26px 20px; }
    .ob-cod-banner strong { font-family: 'Almarai'; font-weight: 800; }

    .ob-footer { background: ${COLORS.ink}; color: ${COLORS.line}; padding: 36px 20px; text-align: center; font-size: 13px; }
    .ob-footer .ob-logo { justify-content: center; margin-bottom: 10px; }
    .ob-social-row { display: flex; justify-content: center; gap: 14px; margin: 16px 0; }
    .ob-social-btn { width: 34px; height: 34px; border-radius: 50%; background: rgba(242,237,228,0.1); display: flex; align-items: center; justify-content: center; color: ${COLORS.paper}; text-decoration: none; }
    .ob-footer-links { display: flex; justify-content: center; gap: 18px; margin-top: 8px; flex-wrap: wrap; }
    .ob-admin-link { background: none; border: none; color: ${COLORS.muted}; font-size: 12px; cursor: pointer; text-decoration: underline; }

    .ob-filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
    .ob-filter-tab { background: white; border: 1.5px solid ${COLORS.line}; padding: 8px 18px; border-radius: 20px; font-family: 'Tajawal'; font-weight: 500; font-size: 14px; cursor: pointer; }
    .ob-filter-tab.active { background: ${COLORS.ink}; border-color: ${COLORS.ink}; color: white; }

    .ob-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; opacity: 0; pointer-events: none; transition: opacity .2s; }
    .ob-drawer-overlay.open { opacity: 1; pointer-events: auto; }
    .ob-drawer { position: fixed; top: 0; bottom: 0; left: 0; width: min(380px, 92vw); background: ${COLORS.paper}; z-index: 41; transform: translateX(-100%); transition: transform .25s ease; display: flex; flex-direction: column; direction: rtl; box-shadow: 4px 0 20px rgba(0,0,0,0.15); }
    .ob-drawer.open { transform: translateX(0); }
    .ob-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid ${COLORS.line}; }
    .ob-drawer-head h3 { font-family: 'Almarai'; font-size: 18px; margin: 0; }
    .ob-drawer-items { flex: 1; overflow-y: auto; padding: 12px 20px; }
    .ob-drawer-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${COLORS.line}; align-items: center; }
    .ob-drawer-thumb { width: 52px; height: 68px; border-radius: 3px; flex-shrink: 0; object-fit: cover; }
    .ob-drawer-item-info { flex: 1; min-width: 0; }
    .ob-drawer-item-info .t { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .ob-drawer-item-info .p { color: ${COLORS.crimson}; font-weight: 700; font-size: 13px; }
    .ob-qty-row { display: flex; align-items: center; gap: 8px; }
    .ob-qty-btn { width: 24px; height: 24px; border: 1px solid ${COLORS.line}; background: white; border-radius: 3px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .ob-drawer-foot { padding: 18px 20px; border-top: 1px solid ${COLORS.line}; }
    .ob-drawer-subtotal { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 14px; font-size: 15px; }
    .ob-empty { text-align: center; color: ${COLORS.muted}; padding: 60px 10px; }

    .ob-back-btn { background: none; border: none; color: ${COLORS.muted}; font-family: 'Tajawal'; font-size: 14px; cursor: pointer; margin-bottom: 22px; padding: 0; }
    .ob-product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; align-items: start; }
    .ob-detail-cover { position: relative; aspect-ratio: 3 / 4; border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end; background: ${COLORS.line}; }
    .ob-detail-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ob-detail-cover .ob-cover-title { font-size: 26px; padding: 20px; }
    .ob-detail-tag { display: inline-block; background: ${COLORS.line}; color: ${COLORS.ink}; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 14px; }
    .ob-detail-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .ob-detail-title { font-family: 'Almarai'; font-weight: 800; font-size: 28px; margin: 0 0 12px; line-height: 1.3; }
    .ob-detail-price { color: ${COLORS.crimson}; font-family: 'Almarai'; font-weight: 800; font-size: 24px; margin-bottom: 18px; }
    .ob-detail-desc { color: ${COLORS.muted}; line-height: 1.8; margin-bottom: 26px; font-size: 15px; }
    .ob-stepper { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
    .ob-stepper-btn { width: 34px; height: 34px; border: 1.5px solid ${COLORS.ink}; background: white; border-radius: 4px; cursor: pointer; font-size: 16px; }
    .ob-cod-note { display: flex; align-items: center; gap: 8px; color: ${COLORS.muted}; font-size: 13px; margin-top: 18px; }

    .ob-checkout-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: start; }
    .ob-form-field { margin-bottom: 18px; }
    .ob-form-field label { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; margin-bottom: 7px; }
    .ob-form-field input, .ob-form-field select, .ob-form-field textarea { width: 100%; padding: 11px 13px; border: 1.5px solid ${COLORS.line}; border-radius: 4px; font-family: 'Tajawal'; font-size: 14px; background: white; color: ${COLORS.ink}; }
    .ob-form-field textarea { resize: vertical; min-height: 70px; }
    .ob-form-field input:focus, .ob-form-field select:focus, .ob-form-field textarea:focus { outline: 2px solid ${COLORS.crimson}; outline-offset: 1px; }
    .ob-summary-card { background: white; border: 1px solid ${COLORS.line}; border-radius: 6px; padding: 22px; }
    .ob-summary-card h3 { font-family: 'Almarai'; margin: 0 0 16px; font-size: 17px; }
    .ob-summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; }
    .ob-summary-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 17px; border-top: 1px solid ${COLORS.line}; margin-top: 10px; padding-top: 12px; }
    .ob-payment-option { display: flex; align-items: center; gap: 10px; border: 1.5px solid ${COLORS.crimson}; background: rgba(200,30,58,0.06); border-radius: 5px; padding: 12px 14px; margin: 16px 0; font-weight: 700; font-size: 14px; }
    .ob-payment-option.disabled { border-color: ${COLORS.line}; background: transparent; color: ${COLORS.muted}; }
    .ob-error { color: ${COLORS.crimson}; font-size: 13px; margin-top: 10px; }

    .ob-success { text-align: center; max-width: 460px; margin: 0 auto; padding: 60px 20px; }
    .ob-check-circle { width: 70px; height: 70px; border-radius: 50%; background: ${COLORS.gold}; display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; }
    .ob-order-id { font-family: 'Almarai'; font-weight: 800; font-size: 20px; color: ${COLORS.crimson}; margin: 14px 0 20px; }

    .ob-faq-item { border-bottom: 1px solid ${COLORS.line}; padding: 16px 0; }
    .ob-faq-q { font-family: 'Almarai'; font-weight: 800; margin-bottom: 6px; font-size: 15px; }
    .ob-faq-a { color: ${COLORS.muted}; line-height: 1.8; font-size: 14px; }
    .ob-help-text { color: ${COLORS.muted}; line-height: 2; font-size: 15px; white-space: pre-line; }

    .ob-loading { text-align: center; padding: 120px 20px; color: ${COLORS.muted}; font-family: 'Tajawal'; }

    .ob-admin-login { max-width: 360px; margin: 80px auto; background: white; border: 1px solid ${COLORS.line}; padding: 32px; border-radius: 6px; text-align: center; }
    .ob-admin-wrap { max-width: 1100px; margin: 0 auto; padding: 30px 20px; }
    .ob-admin-tabs { display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid ${COLORS.line}; overflow-x: auto; }
    .ob-admin-tab { background: none; border: none; padding: 10px 16px; font-family: 'Tajawal'; font-weight: 700; font-size: 13px; cursor: pointer; color: ${COLORS.muted}; border-bottom: 2px solid transparent; white-space: nowrap; }
    .ob-admin-tab.active { color: ${COLORS.crimson}; border-color: ${COLORS.crimson}; }
    .ob-admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .ob-admin-table th { text-align: right; padding: 10px; background: ${COLORS.ink}; color: ${COLORS.paper}; font-family: 'Almarai'; font-size: 12px; }
    .ob-admin-table td { padding: 10px; border-bottom: 1px solid ${COLORS.line}; vertical-align: middle; }
    .ob-status-select { padding: 6px 8px; border-radius: 4px; border: 1px solid ${COLORS.line}; font-family: 'Tajawal'; font-size: 12px; }
    .ob-admin-actions { display: flex; gap: 8px; }
    .ob-btn-mini { padding: 6px 12px; font-size: 12px; border-radius: 4px; border: 1px solid ${COLORS.line}; background: white; cursor: pointer; font-family: 'Tajawal'; display: inline-flex; align-items: center; gap: 4px; }
    .ob-btn-mini.danger { border-color: ${COLORS.crimson}; color: ${COLORS.crimson}; }
    .ob-product-form { background: white; border: 1px solid ${COLORS.line}; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .ob-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .ob-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
    .ob-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
    .ob-swatch.selected { border-color: ${COLORS.ink}; }
    .ob-slide-editor { border: 1px solid ${COLORS.line}; border-radius: 6px; padding: 14px; margin-bottom: 12px; }
    .ob-hint { color: ${COLORS.muted}; font-size: 13px; margin-bottom: 16px; line-height: 1.6; }

    @media (max-width: 1000px) {
      .ob-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 760px) {
      .ob-grid { grid-template-columns: repeat(2, 1fr); }
      .ob-cat-row { grid-template-columns: repeat(2, 1fr); }
      .ob-features { grid-template-columns: repeat(2, 1fr); }
      .ob-product-detail, .ob-checkout-grid, .ob-form-grid { grid-template-columns: 1fr; }
      .ob-nav-link { display: none; }
      .ob-catnav { display: none; }
      .ob-hamburger { display: flex; }
    }
  `}</style>
);

/* -------------------------------- Storefront -------------------------------- */

function Header({ view, setView, cartCount, favCount, onOpenCart, searchOpen, setSearchOpen, searchQuery, setSearchQuery, onSearchSubmit, onToggleMenu }) {
  return (
    <header className="ob-header">
      <div className="ob-header-inner">
        <div className="ob-logo" onClick={() => setView("home")}>أوتاكو<span>بوكس</span></div>
        <nav className="ob-nav">
          <button className="ob-hamburger" onClick={onToggleMenu} aria-label="القائمة"><Menu size={22} /></button>
          <button className={`ob-nav-link ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>الرئيسية</button>
          <button className={`ob-nav-link ${view === "shop" ? "active" : ""}`} onClick={() => setView("shop")}>المتجر</button>
          <button className={`ob-nav-link ${view === "help" ? "active" : ""}`} onClick={() => setView("help")}>مساعدة</button>
          <div className="ob-search-wrap">
            <input
              className={`ob-search-input ${searchOpen ? "open" : ""}`}
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
            />
            <button type="button" className="ob-icon-btn" style={{ color: COLORS.paper }} onClick={() => (searchOpen && searchQuery ? onSearchSubmit() : setSearchOpen((o) => !o))}>
              <Search size={18} />
            </button>
          </div>
          <button className="ob-icon-btn" style={{ color: COLORS.paper }} onClick={() => setView("favorites")}>
            <Heart size={18} />
            {favCount > 0 && <span className="ob-cart-count">{favCount}</span>}
          </button>
          <button className="ob-cart-btn" onClick={onOpenCart} aria-label="السلة">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="ob-cart-count">{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}

function MobileMenu({ setView, goShop, close }) {
  const go = (fn) => { fn(); close(); };
  return (
    <div className="ob-mobile-menu">
      <button onClick={() => go(() => setView("home"))}>الرئيسية</button>
      <button onClick={() => go(() => setView("shop"))}>المتجر (كل المنتجات)</button>
      {CATEGORIES.map((c) => <button key={c} onClick={() => go(() => goShop(c))}>{c}</button>)}
      <button onClick={() => go(() => setView("favorites"))}>المفضلة</button>
      <button onClick={() => go(() => setView("help"))}>مساعدة ومعلومات</button>
      <button onClick={() => go(() => setView("admin"))}>لوحة التحكم</button>
    </div>
  );
}

function CategoryNav({ view, activeCategory, goShop, setView }) {
  return (
    <div className="ob-catnav">
      <div className="ob-catnav-inner">
        <button className={`ob-catnav-item ${view === "shop" && activeCategory === "الكل" ? "active" : ""}`} onClick={() => goShop("الكل")}>الكل</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`ob-catnav-item ${view === "shop" && activeCategory === cat ? "active" : ""}`} onClick={() => goShop(cat)}>{cat}</button>
        ))}
        <button className={`ob-catnav-item ${view === "favorites" ? "active" : ""}`} onClick={() => setView("favorites")}>المفضلة</button>
      </div>
    </div>
  );
}

function HeroSlider({ slides, goShop }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  const s = slides[Math.min(idx, slides.length - 1)];
  return (
    <div className="ob-slider">
      <div className="ob-slide" style={{ background: s.color }}>
        <div className="ob-slide-lines" />
        <div className="ob-slide-content" key={s.id}>
          <h1 className="ob-hero-title">{s.title}</h1>
          <p className="ob-hero-sub">{s.subtitle}</p>
          <button className="ob-btn-primary" onClick={() => goShop(s.category || "الكل")}>تسوق الآن</button>
        </div>
        {slides.length > 1 && (
          <>
            <button className="ob-slider-arrow right" onClick={() => setIdx((i) => (i + 1) % slides.length)}><ChevronRight size={18} /></button>
            <button className="ob-slider-arrow left" onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}><ChevronLeft size={18} /></button>
            <div className="ob-slider-dots">
              {slides.map((_, i) => <button key={i} className={`ob-slider-dot ${i === idx ? "active" : ""}`} onClick={() => setIdx(i)} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen, isFav, onToggleFav, onQuickAdd }) {
  const outOfStock = product.stock <= 0;
  const ribbonText = outOfStock ? "نفدت الكمية" : product.badge;
  return (
    <div className="ob-card">
      <div className="ob-card-cover" style={product.image ? {} : { background: product.color }} onClick={() => onOpen(product.id)}>
        {product.image ? (
          <img src={product.image} alt={product.title} className="ob-card-img" />
        ) : (
          <>
            <div className="ob-halftone" />
            <div className="ob-cover-title">{product.title}</div>
          </>
        )}
        <button className="ob-fav-btn" onClick={(e) => { e.stopPropagation(); onToggleFav(product.id); }}>
          <Heart size={14} color={isFav ? COLORS.crimson : "white"} fill={isFav ? COLORS.crimson : "none"} />
        </button>
        {ribbonText && <div className={`ob-ribbon ${outOfStock ? "muted" : ""}`}>{ribbonText}</div>}
      </div>
      <div className="ob-card-info">
        <div className="ob-card-cat" onClick={() => onOpen(product.id)}>{product.category}</div>
        <div className="ob-card-title" onClick={() => onOpen(product.id)}>{product.title}</div>
        <div className="ob-card-bottom-row">
          <span className="ob-card-price">{formatPrice(product.price)}</span>
          <button className="ob-quickadd-btn" disabled={outOfStock} onClick={(e) => { e.stopPropagation(); if (!outOfStock) onQuickAdd(product.id, 1); }}>
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const items = [
    { Icon: Truck, title: "توصيل لكل الولايات", text: "نوصل طلبك إلى الـ58 ولاية عبر شركاء التوصيل." },
    { Icon: Wallet, title: "الدفع عند الاستلام", text: "ادفع فقط عند استلام طلبك، بدون أي مخاطرة." },
    { Icon: ShieldCheck, title: "منتجات أصلية 100%", text: "نضمن لكم جودة وأصالة جميع منتجاتنا." },
    { Icon: Headphones, title: "دعم سريع", text: "فريقنا جاهز للإجابة على استفساراتكم في أي وقت." },
  ];
  return (
    <section className="ob-section" style={{ paddingTop: 0 }}>
      <div className="ob-features">
        {items.map(({ Icon, title, text }) => (
          <div className="ob-feature" key={title}>
            <div className="ic"><Icon size={20} color={COLORS.crimson} /></div>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeSection({ title, products, openProduct, favorites, toggleFavorite, addToCart }) {
  if (!products.length) return null;
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">{title}</h2>
      <div className="ob-grid">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} onOpen={openProduct} isFav={favorites.includes(p.id)} onToggleFav={toggleFavorite} onQuickAdd={addToCart} />
        ))}
      </div>
    </section>
  );
}

function HomePage({ openProduct, goShop, products, favorites, toggleFavorite, addToCart, settings }) {
  const featured = products.slice(0, 8);
  return (
    <>
      <HeroSlider slides={settings.heroSlides} goShop={goShop} />

      <section className="ob-section">
        <h2 className="ob-section-title">تصفح حسب الفئة</h2>
        <div className="ob-cat-row">
          {CATEGORIES.map((cat) => (
            <button key={cat} className="ob-cat-card" onClick={() => goShop(cat)}>{cat}</button>
          ))}
        </div>
      </section>

      <section className="ob-section">
        <h2 className="ob-section-title">الأكثر طلباً</h2>
        <div className="ob-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={openProduct} isFav={favorites.includes(p.id)} onToggleFav={toggleFavorite} onQuickAdd={addToCart} />
          ))}
        </div>
      </section>

      {settings.homeSections.map((sec) => {
        const items = products.filter((p) => p.category === sec.tag || (p.tags || []).includes(sec.tag));
        return (
          <HomeSection key={sec.id} title={sec.title} products={items} openProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />
        );
      })}

      <FeaturesSection />

      <div className="ob-cod-banner">
        <strong>التوصيل والدفع عند الاستلام</strong> — إلى الـ58 ولاية، بدون أي التزام مسبق.
      </div>
    </>
  );
}

function ShopPage({ activeCategory, setActiveCategory, openProduct, products, favorites, toggleFavorite, addToCart }) {
  const filtered = activeCategory === "الكل" ? products : products.filter((p) => p.category === activeCategory);
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">المتجر</h2>
      <div className="ob-filter-tabs">
        {["الكل", ...CATEGORIES].map((cat) => (
          <button key={cat} className={`ob-filter-tab ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="ob-empty">لا توجد منتجات في هذه الفئة حالياً.</div>
      ) : (
        <div className="ob-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={openProduct} isFav={favorites.includes(p.id)} onToggleFav={toggleFavorite} onQuickAdd={addToCart} />
          ))}
        </div>
      )}
    </section>
  );
}

function FavoritesPage({ products, favorites, openProduct, toggleFavorite, addToCart }) {
  const items = products.filter((p) => favorites.includes(p.id));
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">قائمة المفضلة</h2>
      {items.length === 0 ? (
        <div className="ob-empty">لم تقم بإضافة أي منتج إلى المفضلة بعد.</div>
      ) : (
        <div className="ob-grid">
          {items.map((p) => <ProductCard key={p.id} product={p} onOpen={openProduct} isFav onToggleFav={toggleFavorite} onQuickAdd={addToCart} />)}
        </div>
      )}
    </section>
  );
}

function SearchPage({ products, query, openProduct, favorites, toggleFavorite, addToCart }) {
  const q = query.trim().toLowerCase();
  const results = products.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">نتائج البحث عن: «{query}»</h2>
      {results.length === 0 ? (
        <div className="ob-empty">لا توجد نتائج مطابقة لبحثك.</div>
      ) : (
        <div className="ob-grid">
          {results.map((p) => <ProductCard key={p.id} product={p} onOpen={openProduct} isFav={favorites.includes(p.id)} onToggleFav={toggleFavorite} onQuickAdd={addToCart} />)}
        </div>
      )}
    </section>
  );
}

function ProductPage({ product, setView, addToCart, isFav, toggleFavorite }) {
  const [qty, setQty] = useState(1);
  if (!product) return null;
  const outOfStock = product.stock <= 0;
  return (
    <section className="ob-section">
      <button className="ob-back-btn" onClick={() => setView("shop")}>‹ رجوع إلى المتجر</button>
      <div className="ob-product-detail">
        <div className="ob-detail-cover" style={product.image ? {} : { background: product.color }}>
          {product.image ? (
            <img src={product.image} alt={product.title} className="ob-detail-img" />
          ) : (
            <>
              <div className="ob-halftone" />
              <div className="ob-cover-title">{product.title}</div>
            </>
          )}
        </div>
        <div>
          <span className="ob-detail-tag">{product.category}</span>
          <div className="ob-detail-title-row">
            <h1 className="ob-detail-title">{product.title}</h1>
            <button className="ob-icon-btn" onClick={() => toggleFavorite(product.id)}>
              <Heart size={20} color={isFav ? COLORS.crimson : COLORS.ink} fill={isFav ? COLORS.crimson : "none"} />
            </button>
          </div>
          <div className="ob-detail-price">{formatPrice(product.price)}</div>
          <p className="ob-detail-desc">{product.desc}</p>
          {outOfStock ? (
            <div className="ob-error" style={{ marginBottom: 14 }}>هذا المنتج نفد من المخزون حالياً.</div>
          ) : (
            <div className="ob-stepper">
              <button className="ob-stepper-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button className="ob-stepper-btn" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
          )}
          <button className="ob-btn-primary" disabled={outOfStock} onClick={() => !outOfStock && addToCart(product.id, qty)}>
            أضف إلى السلة
          </button>
          <div className="ob-cod-note"><Check size={15} color={COLORS.gold} /> الدفع عند الاستلام متوفر لهذا المنتج</div>
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ open, onClose, cartItems, updateQty, removeItem, subtotal, goCheckout }) {
  return (
    <>
      <div className={`ob-drawer-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`ob-drawer ${open ? "open" : ""}`}>
        <div className="ob-drawer-head">
          <h3>سلتك</h3>
          <button className="ob-icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ob-drawer-items">
          {cartItems.length === 0 && <div className="ob-empty">سلتك فارغة حالياً</div>}
          {cartItems.map(({ product, qty }) => (
            <div className="ob-drawer-item" key={product.id}>
              {product.image ? <img className="ob-drawer-thumb" src={product.image} alt="" /> : <div className="ob-drawer-thumb" style={{ background: product.color }} />}
              <div className="ob-drawer-item-info">
                <div className="t">{product.title}</div>
                <div className="p">{formatPrice(product.price)}</div>
                <div className="ob-qty-row">
                  <button className="ob-qty-btn" onClick={() => updateQty(product.id, -1)}><Minus size={12} /></button>
                  <span>{qty}</span>
                  <button className="ob-qty-btn" onClick={() => updateQty(product.id, 1)}><Plus size={12} /></button>
                </div>
              </div>
              <button className="ob-icon-btn" onClick={() => removeItem(product.id)}><X size={16} /></button>
            </div>
          ))}
        </div>
        {cartItems.length > 0 && (
          <div className="ob-drawer-foot">
            <div className="ob-drawer-subtotal"><span>المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
            <button className="ob-btn-primary" style={{ width: "100%" }} onClick={goCheckout}>إتمام الشراء</button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutPage({ cartItems, subtotal, form, setForm, onSubmit, error }) {
  const total = subtotal + (cartItems.length ? DELIVERY_FEE : 0);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">إتمام الطلب</h2>
      <div className="ob-checkout-grid">
        <div>
          <div className="ob-form-field"><label><User size={14} /> الاسم الكامل</label><input value={form.name} onChange={set("name")} placeholder="مثال: أمين بلقاسمي" /></div>
          <div className="ob-form-field"><label><Phone size={14} /> رقم الهاتف</label><input value={form.phone} onChange={set("phone")} placeholder="0555 XX XX XX" /></div>
          <div className="ob-form-field">
            <label><MapPin size={14} /> الولاية</label>
            <select value={form.wilaya} onChange={set("wilaya")}>
              <option value="">اختر ولايتك</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="ob-form-field"><label><MapPin size={14} /> العنوان الكامل</label><textarea value={form.address} onChange={set("address")} placeholder="الحي، الشارع، رقم المنزل..." /></div>
          <div className="ob-form-field"><label><MessageSquare size={14} /> ملاحظة (اختياري)</label><textarea value={form.note} onChange={set("note")} placeholder="مثال: التوصيل بعد الساعة 17:00" /></div>
        </div>

        <div className="ob-summary-card">
          <h3>ملخص الطلب</h3>
          {cartItems.map(({ product, qty }) => (
            <div className="ob-summary-row" key={product.id}><span>{product.title} × {qty}</span><span>{formatPrice(product.price * qty)}</span></div>
          ))}
          <div className="ob-summary-row"><span>رسوم التوصيل</span><span>{formatPrice(DELIVERY_FEE)}</span></div>
          <div className="ob-summary-total"><span>المجموع الكلي</span><span>{formatPrice(total)}</span></div>
          <div className="ob-payment-option"><Check size={16} /> الدفع عند الاستلام</div>
          <div className="ob-payment-option disabled">الدفع الإلكتروني (قريباً)</div>
          {error && <div className="ob-error">{error}</div>}
          <button className="ob-btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={onSubmit}>تأكيد الطلب</button>
        </div>
      </div>
    </section>
  );
}

function SuccessPage({ orderId, setView }) {
  return (
    <section className="ob-success">
      <div className="ob-check-circle"><Check size={34} color={COLORS.ink} /></div>
      <h2 className="ob-heading" style={{ fontSize: 24, fontWeight: 800 }}>تم استلام طلبك بنجاح!</h2>
      <p style={{ color: COLORS.muted, lineHeight: 1.8 }}>سيتصل بك فريقنا قريباً لتأكيد الطلب قبل التوصيل والدفع عند الاستلام.</p>
      <div className="ob-order-id">رقم الطلب: {orderId}</div>
      <button className="ob-btn-secondary" onClick={() => setView("home")}>متابعة التسوق</button>
    </section>
  );
}

function HelpPage({ settings }) {
  const [tab, setTab] = useState("faq");
  const tabs = [["faq", "الأسئلة الشائعة"], ["delivery", "أسعار التوصيل"], ["terms", "الشروط العامة"], ["contact", "اتصل بنا"]];
  return (
    <section className="ob-section">
      <h2 className="ob-section-title">مساعدة ومعلومات</h2>
      <div className="ob-filter-tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={`ob-filter-tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab === "faq" && (
        <div>
          {settings.pages.faq.map((item) => (
            <div className="ob-faq-item" key={item.id}>
              <div className="ob-faq-q">{item.q}</div>
              <div className="ob-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      )}
      {tab === "delivery" && <p className="ob-help-text">{settings.pages.delivery}</p>}
      {tab === "terms" && <p className="ob-help-text">{settings.pages.terms}</p>}
      {tab === "contact" && <p className="ob-help-text">{settings.pages.contact}</p>}
    </section>
  );
}

function Footer({ settings, setView }) {
  const { social } = settings;
  return (
    <footer className="ob-footer">
      <div className="ob-logo">أوتاكو<span>بوكس</span></div>
      <div>{settings.welcomeSub}</div>
      <div className="ob-social-row">
        {social.instagram && <a className="ob-social-btn" href={social.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /></a>}
        {social.facebook && <a className="ob-social-btn" href={social.facebook} target="_blank" rel="noreferrer"><Facebook size={16} /></a>}
        {social.tiktok && <a className="ob-social-btn" href={social.tiktok} target="_blank" rel="noreferrer"><Music2 size={16} /></a>}
        {social.whatsapp && <a className="ob-social-btn" href={`https://wa.me/${social.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /></a>}
      </div>
      <div className="ob-footer-links">
        <button className="ob-admin-link" onClick={() => setView("help")}>مساعدة ومعلومات</button>
        <button className="ob-admin-link" onClick={() => setView("admin")}>لوحة التحكم</button>
      </div>
    </footer>
  );
}

/* --------------------------------- Admin ------------------------------------ */

function AdminLogin({ settings, onLogin, setView }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const tryLogin = () => {
    const typed = pwd.trim();
    const validPasswords = [String(settings.adminPassword || "").trim(), DEFAULT_SETTINGS.adminPassword];
    if (typed && validPasswords.includes(typed)) { setErr(""); onLogin(); }
    else setErr("كلمة المرور غير صحيحة");
  };
  return (
    <div className="ob-admin-login">
      <Lock size={30} color={COLORS.crimson} style={{ marginBottom: 14 }} />
      <h2 className="ob-heading" style={{ fontSize: 20, marginBottom: 16 }}>دخول لوحة التحكم</h2>
      <div className="ob-form-field">
        <input type="password" placeholder="كلمة المرور" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") tryLogin(); }} />
      </div>
      {err && <div className="ob-error">{err}</div>}
      <button type="button" className="ob-btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={tryLogin}>دخول</button>
      <button type="button" className="ob-back-btn" style={{ marginTop: 16 }} onClick={() => setView("home")}>‹ العودة للموقع</button>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product || { title: "", category: CATEGORIES[0], price: "", stock: "", color: COLORS.crimson, image: "", badge: "", tags: [], desc: "" });
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) { /* ignore */ }
    setUploading(false);
  };

  const submit = () => {
    if (!form.title || !form.price) return;
    onSave({ ...form, id: form.id || Date.now(), price: Number(form.price), stock: Number(form.stock) || 0 });
  };

  return (
    <div className="ob-product-form">
      <h3 className="ob-heading" style={{ marginTop: 0 }}>{product ? "تعديل المنتج" : "منتج جديد"}</h3>
      <div className="ob-form-grid">
        <div className="ob-form-field"><label>اسم المنتج</label><input value={form.title} onChange={set("title")} /></div>
        <div className="ob-form-field"><label>الفئة</label>
          <select value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div className="ob-form-field"><label>السعر (دج)</label><input type="number" value={form.price} onChange={set("price")} /></div>
        <div className="ob-form-field"><label>الكمية المتوفرة</label><input type="number" value={form.stock} onChange={set("stock")} /></div>
        <div className="ob-form-field"><label>شارة (اختياري)</label><input value={form.badge} onChange={set("badge")} placeholder="جديد / الأكثر مبيعاً" /></div>
        <div className="ob-form-field">
          <label>وسوم إضافية لتصنيفها في الأقسام (افصل بفاصلة)</label>
          <input
            value={(form.tags || []).join(", ")}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
            placeholder="مثال: شونين، الأكثر مبيعاً"
          />
        </div>
      </div>

      <div className="ob-form-field">
        <label>صورة المنتج</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {uploading && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>جاري تجهيز الصورة...</div>}
        {form.image && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <img src={form.image} alt="" style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
            <button type="button" className="ob-btn-mini danger" onClick={() => setForm((f) => ({ ...f, image: "" }))}>إزالة الصورة</button>
          </div>
        )}
      </div>

      <div className="ob-form-field">
        <label>لون الخلفية (يُستخدم إذا لم تُضف صورة)</label>
        <div className="ob-swatches">
          {SWATCHES.map((c) => <button type="button" key={c} className={`ob-swatch ${form.color === c ? "selected" : ""}`} style={{ background: c }} onClick={() => setForm((f) => ({ ...f, color: c }))} />)}
        </div>
      </div>

      <div className="ob-form-field"><label>الوصف</label><textarea value={form.desc} onChange={set("desc")} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="ob-btn-primary" type="button" onClick={submit}>حفظ</button>
        <button className="ob-btn-secondary" type="button" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

function AdminProducts({ products, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  if (editing) {
    return <ProductForm product={editing === "new" ? null : editing} onCancel={() => setEditing(null)} onSave={(p) => { onSave(p); setEditing(null); }} />;
  }
  return (
    <div>
      <button className="ob-btn-primary" style={{ marginBottom: 18 }} onClick={() => setEditing("new")}>+ إضافة منتج جديد</button>
      <div style={{ overflowX: "auto" }}>
        <table className="ob-admin-table">
          <thead><tr><th>الصورة</th><th>الاسم</th><th>الفئة</th><th>السعر</th><th>الكمية</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.image ? <img src={p.image} alt="" style={{ width: 34, height: 44, objectFit: "cover", borderRadius: 3 }} /> : <div style={{ width: 34, height: 44, borderRadius: 3, background: p.color }} />}</td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <div className="ob-admin-actions">
                    <button className="ob-btn-mini" onClick={() => setEditing(p)}><Pencil size={12} /> تعديل</button>
                    <button className="ob-btn-mini danger" onClick={() => { if (confirm("حذف هذا المنتج؟")) onDelete(p.id); }}><Trash2 size={12} /> حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders({ orders, onUpdateStatus }) {
  if (orders.length === 0) return <div className="ob-empty">لا توجد طلبات حتى الآن.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ob-admin-table">
        <thead><tr><th>الطلب</th><th>الزبون</th><th>الولاية</th><th>المنتجات</th><th>المجموع</th><th>الحالة</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}<br /><span style={{ color: COLORS.muted, fontSize: 11 }}>{new Date(o.createdAt).toLocaleDateString("ar-DZ")}</span></td>
              <td>{o.name}<br /><span style={{ color: COLORS.muted, fontSize: 12 }}>{o.phone}</span></td>
              <td>{o.wilaya}</td>
              <td>{o.items.map((i) => `${i.title} ×${i.qty}`).join("، ")}</td>
              <td>{formatPrice(o.total)}</td>
              <td>
                <select className="ob-status-select" value={o.status} onChange={(e) => onUpdateStatus(o.id, e.target.value)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminSections({ settings, onSave }) {
  const [sections, setSections] = useState(settings.homeSections);
  const [saved, setSaved] = useState(false);
  const update = (idx, key, val) => { const next = [...sections]; next[idx] = { ...next[idx], [key]: val }; setSections(next); };
  const add = () => setSections((s) => [...s, { id: Date.now(), title: "قسم جديد", tag: "" }]);
  const remove = (idx) => setSections((s) => s.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const next = [...sections];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setSections(next);
  };
  const save = () => { onSave({ ...settings, homeSections: sections }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="ob-product-form">
      <h3 className="ob-heading" style={{ marginTop: 0 }}>أقسام الصفحة الرئيسية</h3>
      <p className="ob-hint">كل قسم يعرض المنتجات التي تحمل نفس الفئة أو نفس الوسم. مثال: ضع "شونين" هنا، ثم أضف نفس الكلمة في خانة "الوسوم" عند المنتجات المطلوبة من صفحة المنتجات.</p>
      {sections.map((s, idx) => (
        <div key={s.id} className="ob-slide-editor">
          <div className="ob-form-grid">
            <div className="ob-form-field"><label>عنوان القسم</label><input value={s.title} onChange={(e) => update(idx, "title", e.target.value)} /></div>
            <div className="ob-form-field"><label>الوسم أو الفئة المطابقة</label><input value={s.tag} onChange={(e) => update(idx, "tag", e.target.value)} placeholder="مثال: شونين" /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="ob-btn-mini" onClick={() => move(idx, -1)}>▲ أعلى</button>
            <button type="button" className="ob-btn-mini" onClick={() => move(idx, 1)}>▼ أسفل</button>
            <button type="button" className="ob-btn-mini danger" onClick={() => remove(idx)}>حذف القسم</button>
          </div>
        </div>
      ))}
      <button type="button" className="ob-btn-mini" onClick={add} style={{ marginBottom: 20 }}>+ إضافة قسم جديد</button>
      <div>
        <button type="button" className="ob-btn-primary" onClick={save}>حفظ الأقسام</button>
        {saved && <span style={{ color: COLORS.gold, marginRight: 10, fontWeight: 700 }}>✓ تم الحفظ</span>}
      </div>
    </div>
  );
}

function AdminPages({ settings, onSave }) {
  const [pages, setPages] = useState(settings.pages);
  const [saved, setSaved] = useState(false);
  const updateFaq = (idx, key, val) => { const next = [...pages.faq]; next[idx] = { ...next[idx], [key]: val }; setPages((p) => ({ ...p, faq: next })); };
  const addFaq = () => setPages((p) => ({ ...p, faq: [...p.faq, { id: Date.now(), q: "سؤال جديد", a: "الإجابة هنا" }] }));
  const removeFaq = (idx) => setPages((p) => ({ ...p, faq: p.faq.filter((_, i) => i !== idx) }));
  const save = () => { onSave({ ...settings, pages }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="ob-product-form">
      <h3 className="ob-heading" style={{ marginTop: 0 }}>الأسئلة الشائعة</h3>
      {pages.faq.map((f, idx) => (
        <div key={f.id} className="ob-slide-editor">
          <div className="ob-form-field"><label>السؤال</label><input value={f.q} onChange={(e) => updateFaq(idx, "q", e.target.value)} /></div>
          <div className="ob-form-field"><label>الجواب</label><textarea value={f.a} onChange={(e) => updateFaq(idx, "a", e.target.value)} /></div>
          <button type="button" className="ob-btn-mini danger" onClick={() => removeFaq(idx)}>حذف السؤال</button>
        </div>
      ))}
      <button type="button" className="ob-btn-mini" onClick={addFaq} style={{ marginBottom: 24 }}>+ إضافة سؤال</button>

      <h3 className="ob-heading">أسعار التوصيل</h3>
      <div className="ob-form-field"><textarea value={pages.delivery} onChange={(e) => setPages((p) => ({ ...p, delivery: e.target.value }))} /></div>

      <h3 className="ob-heading">الشروط العامة</h3>
      <div className="ob-form-field"><textarea value={pages.terms} onChange={(e) => setPages((p) => ({ ...p, terms: e.target.value }))} /></div>

      <h3 className="ob-heading">اتصل بنا</h3>
      <div className="ob-form-field"><textarea value={pages.contact} onChange={(e) => setPages((p) => ({ ...p, contact: e.target.value }))} /></div>

      <button type="button" className="ob-btn-primary" onClick={save}>حفظ</button>
      {saved && <span style={{ color: COLORS.gold, marginRight: 10, fontWeight: 700 }}>✓ تم الحفظ</span>}
    </div>
  );
}

function AdminSettings({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [pwd2, setPwd2] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSocial = (k) => (e) => setForm((f) => ({ ...f, social: { ...f.social, [k]: e.target.value } }));

  const updateSlide = (idx, key, val) => {
    const slides = [...form.heroSlides];
    slides[idx] = { ...slides[idx], [key]: val };
    setForm((f) => ({ ...f, heroSlides: slides }));
  };
  const addSlide = () => setForm((f) => ({ ...f, heroSlides: [...f.heroSlides, { id: Date.now(), title: "عنوان جديد", subtitle: "وصف الشريحة", color: COLORS.crimson, category: "الكل" }] }));
  const removeSlide = (idx) => setForm((f) => ({ ...f, heroSlides: f.heroSlides.filter((_, i) => i !== idx) }));

  const submit = () => {
    const next = { ...form };
    if (pwd2) next.adminPassword = pwd2;
    onSave(next);
    setPwd2("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="ob-product-form">
      <h3 className="ob-heading" style={{ marginTop: 0 }}>وصف المتجر (يظهر أسفل الموقع)</h3>
      <div className="ob-form-field"><textarea value={form.welcomeSub} onChange={set("welcomeSub")} /></div>

      <h3 className="ob-heading">شرائح العرض الرئيسية (Slider)</h3>
      {form.heroSlides.map((s, idx) => (
        <div key={s.id} className="ob-slide-editor">
          <div className="ob-form-grid">
            <div className="ob-form-field"><label>العنوان</label><input value={s.title} onChange={(e) => updateSlide(idx, "title", e.target.value)} /></div>
            <div className="ob-form-field"><label>الوصف</label><input value={s.subtitle} onChange={(e) => updateSlide(idx, "subtitle", e.target.value)} /></div>
            <div className="ob-form-field">
              <label>الفئة عند الضغط على "تسوق الآن"</label>
              <select value={s.category} onChange={(e) => updateSlide(idx, "category", e.target.value)}>
                <option value="الكل">الكل</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="ob-form-field">
              <label>اللون</label>
              <div className="ob-swatches">
                {SWATCHES.map((c) => <button type="button" key={c} className={`ob-swatch ${s.color === c ? "selected" : ""}`} style={{ background: c }} onClick={() => updateSlide(idx, "color", c)} />)}
              </div>
            </div>
          </div>
          <button type="button" className="ob-btn-mini danger" onClick={() => removeSlide(idx)}>حذف هذه الشريحة</button>
        </div>
      ))}
      <button type="button" className="ob-btn-mini" onClick={addSlide} style={{ marginBottom: 24 }}>+ إضافة شريحة</button>

      <h3 className="ob-heading">روابط التواصل</h3>
      <div className="ob-form-grid">
        <div className="ob-form-field"><label>Instagram</label><input value={form.social.instagram} onChange={setSocial("instagram")} placeholder="https://instagram.com/..." /></div>
        <div className="ob-form-field"><label>Facebook</label><input value={form.social.facebook} onChange={setSocial("facebook")} placeholder="https://facebook.com/..." /></div>
        <div className="ob-form-field"><label>TikTok</label><input value={form.social.tiktok} onChange={setSocial("tiktok")} placeholder="https://tiktok.com/@..." /></div>
        <div className="ob-form-field"><label>رقم واتساب</label><input value={form.social.whatsapp} onChange={setSocial("whatsapp")} placeholder="213555xxxxxx" /></div>
      </div>

      <h3 className="ob-heading">كلمة مرور لوحة التحكم</h3>
      <div className="ob-form-field"><label>كلمة مرور جديدة (اتركها فارغة لعدم التغيير)</label><input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} /></div>

      <button className="ob-btn-primary" type="button" onClick={submit}>حفظ الإعدادات</button>
      {saved && <span style={{ color: COLORS.gold, marginRight: 10, fontWeight: 700 }}>✓ تم الحفظ</span>}
    </div>
  );
}

function AdminDashboard({ products, orders, settings, onSaveProduct, onDeleteProduct, onUpdateOrderStatus, onSaveSettings, onLogout, setView }) {
  const [tab, setTab] = useState("orders");
  return (
    <div className="ob-admin-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 className="ob-section-title" style={{ margin: 0 }}>لوحة التحكم</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ob-btn-mini" onClick={() => setView("home")}>عرض الموقع</button>
          <button className="ob-btn-mini danger" onClick={onLogout}><LogOut size={13} /> خروج</button>
        </div>
      </div>
      <div className="ob-admin-tabs">
        <button className={`ob-admin-tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>الطلبات ({orders.length})</button>
        <button className={`ob-admin-tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>المنتجات ({products.length})</button>
        <button className={`ob-admin-tab ${tab === "sections" ? "active" : ""}`} onClick={() => setTab("sections")}>أقسام الرئيسية</button>
        <button className={`ob-admin-tab ${tab === "pages" ? "active" : ""}`} onClick={() => setTab("pages")}>مساعدة ومعلومات</button>
        <button className={`ob-admin-tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>الإعدادات العامة</button>
      </div>
      {tab === "orders" && <AdminOrders orders={orders} onUpdateStatus={onUpdateOrderStatus} />}
      {tab === "products" && <AdminProducts products={products} onSave={onSaveProduct} onDelete={onDeleteProduct} />}
      {tab === "sections" && <AdminSections settings={settings} onSave={onSaveSettings} />}
      {tab === "pages" && <AdminPages settings={settings} onSave={onSaveSettings} />}
      {tab === "settings" && <AdminSettings settings={settings} onSave={onSaveSettings} />}
    </div>
  );
}

/* ----------------------------------- App ----------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = useState([]);

  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [selectedId, setSelectedId] = useState(null);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", wilaya: "", address: "", note: "" });
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "store", "products"));
        if (snap.exists()) setProducts(snap.data().list);
        else { setProducts(DEFAULT_PRODUCTS); await setDoc(doc(db, "store", "products"), { list: DEFAULT_PRODUCTS }); }
      } catch { setProducts(DEFAULT_PRODUCTS); }
      try {
        const snap = await getDoc(doc(db, "store", "orders"));
        if (snap.exists()) setOrders(snap.data().list);
        else { setOrders([]); await setDoc(doc(db, "store", "orders"), { list: [] }); }
      } catch { setOrders([]); }
      try {
        const snap = await getDoc(doc(db, "store", "settings"));
        if (snap.exists()) {
          const loaded = snap.data();
          setSettings({ ...DEFAULT_SETTINGS, ...loaded, social: { ...DEFAULT_SETTINGS.social, ...(loaded.social || {}) }, pages: { ...DEFAULT_SETTINGS.pages, ...(loaded.pages || {}) } });
        } else { setSettings(DEFAULT_SETTINGS); await setDoc(doc(db, "store", "settings"), DEFAULT_SETTINGS); }
      } catch { setSettings(DEFAULT_SETTINGS); }
      try { setFavorites(JSON.parse(localStorage.getItem("ob_favorites") || "[]")); } catch { setFavorites([]); }
      setLoading(false);
    })();
  }, []);

  const persistProducts = async (next) => {
    setProducts(next);
    try { await setDoc(doc(db, "store", "products"), { list: next }); } catch {}
  };
  const persistOrders = async (next) => {
    setOrders(next);
    try { await setDoc(doc(db, "store", "orders"), { list: next }); } catch {}
  };
  const persistSettings = async (next) => {
    setSettings(next);
    try { await setDoc(doc(db, "store", "settings"), next); } catch {}
  };
  const persistFavorites = (next) => {
    setFavorites(next);
    try { localStorage.setItem("ob_favorites", JSON.stringify(next)); } catch {}
  };

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    persistFavorites(next);
  };

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === Number(id)), qty }))
    .filter((i) => i.product && i.qty > 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const addToCart = (id, qty = 1) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + qty }));
    setCartOpen(true);
  };
  const updateQty = (id, delta) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));
  const removeItem = (id) => setCart((c) => ({ ...c, [id]: 0 }));

  const openProduct = (id) => { setSelectedId(id); setView("product"); window.scrollTo(0, 0); };
  const goShop = (cat) => { setActiveCategory(cat || "الكل"); setView("shop"); window.scrollTo(0, 0); };
  const handleSearchSubmit = () => { if (searchQuery.trim()) { setView("search"); window.scrollTo(0, 0); } };

  const handleCheckoutSubmit = () => {
    if (!form.name || !form.phone || !form.wilaya || !form.address) {
      setError("المرجو تعبئة كل الحقول المطلوبة قبل تأكيد الطلب.");
      return;
    }
    setError("");
    const newOrder = {
      id: "OB-" + Date.now().toString().slice(-6),
      name: form.name, phone: form.phone, wilaya: form.wilaya, address: form.address, note: form.note,
      items: cartItems.map((i) => ({ id: i.product.id, title: i.product.title, price: i.product.price, qty: i.qty })),
      subtotal, deliveryFee: DELIVERY_FEE, total: subtotal + DELIVERY_FEE,
      status: ORDER_STATUSES[0], createdAt: Date.now(),
    };
    persistOrders([newOrder, ...orders]);
    persistProducts(products.map((p) => {
      const item = cartItems.find((i) => i.product.id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    }));
    setCart({});
    setOrderId(newOrder.id);
    setView("success");
    window.scrollTo(0, 0);
  };

  const saveOneProduct = (p) => {
    const exists = products.some((x) => x.id === p.id);
    persistProducts(exists ? products.map((x) => (x.id === p.id ? p : x)) : [...products, p]);
  };
  const deleteProductById = (id) => persistProducts(products.filter((p) => p.id !== id));
  const updateOrderStatus = (id, status) => persistOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));

  const selectedProduct = products.find((p) => p.id === selectedId);

  if (loading) {
    return (
      <div className="ob-app">
        <GlobalStyle />
        <div className="ob-loading">جاري تحميل المتجر...</div>
      </div>
    );
  }

  return (
    <div className="ob-app">
      <GlobalStyle />
      <Header
        view={view} setView={setView} cartCount={cartCount} favCount={favorites.length}
        onOpenCart={() => setCartOpen(true)}
        searchOpen={searchOpen} setSearchOpen={setSearchOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onToggleMenu={() => setMobileMenuOpen((o) => !o)}
      />

      {mobileMenuOpen && <MobileMenu setView={setView} goShop={goShop} close={() => setMobileMenuOpen(false)} />}

      {view !== "admin" && <CategoryNav view={view} activeCategory={activeCategory} goShop={goShop} setView={setView} />}

      {view === "home" && (
        <HomePage openProduct={openProduct} goShop={goShop} products={products} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} settings={settings} />
      )}
      {view === "shop" && (
        <ShopPage activeCategory={activeCategory} setActiveCategory={setActiveCategory} openProduct={openProduct} products={products} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />
      )}
      {view === "favorites" && (
        <FavoritesPage products={products} favorites={favorites} openProduct={openProduct} toggleFavorite={toggleFavorite} addToCart={addToCart} />
      )}
      {view === "search" && (
        <SearchPage products={products} query={searchQuery} openProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />
      )}
      {view === "product" && (
        <ProductPage product={selectedProduct} setView={setView} addToCart={addToCart} isFav={favorites.includes(selectedId)} toggleFavorite={toggleFavorite} />
      )}
      {view === "checkout" && (
        <CheckoutPage cartItems={cartItems} subtotal={subtotal} form={form} setForm={setForm} onSubmit={handleCheckoutSubmit} error={error} />
      )}
      {view === "success" && <SuccessPage orderId={orderId} setView={setView} />}
      {view === "help" && <HelpPage settings={settings} />}
      {view === "admin" && !adminAuthed && <AdminLogin settings={settings} onLogin={() => setAdminAuthed(true)} setView={setView} />}
      {view === "admin" && adminAuthed && (
        <AdminDashboard
          products={products} orders={orders} settings={settings}
          onSaveProduct={saveOneProduct} onDeleteProduct={deleteProductById}
          onUpdateOrderStatus={updateOrderStatus} onSaveSettings={persistSettings}
          onLogout={() => { setAdminAuthed(false); setView("home"); }}
          setView={setView}
        />
      )}

      {view !== "admin" && <Footer settings={settings} setView={setView} />}

      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)} cartItems={cartItems}
        updateQty={updateQty} removeItem={removeItem} subtotal={subtotal}
        goCheckout={() => { setCartOpen(false); setView("checkout"); window.scrollTo(0, 0); }}
      />
    </div>
  );
}
