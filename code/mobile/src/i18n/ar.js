// Arabic translation catalog.
//
// Each `tip*` string is the Arabic-equivalent explanation for a field's
// tooltip. The translations track the "Suggested Arabic translation" lines
// in `fields info.pdf` for terminology consistency.
const ar = {
  appTitle: "محلل المياه",
  provideData: "يرجى إدخال البيانات المطلوبة لعرض النتائج",
  showResults: "عرض النتائج",
  predicting: "جارٍ تحليل العينة…",
  results: "النتائج",
  recommendedDecision: "القرار الموصى به",
  confidence: "درجة الثقة",
  probabilities: "الاحتمالات",
  modelInfo: "النموذج",
  predictionFailed: "فشل التنبؤ",
  language: "اللغة",
  english: "English",
  arabic: "العربية",
  cancel: "إلغاء",
  save: "حفظ",
  close: "إغلاق",

  sectionInjection: "حقن المياه",
  sectionFormation: "خصائص الصخور والسوائل بالبئر",
  sectionChemistry: "خواص المياه الكيميائية",

  fieldInjectionPressure: "ضغط الحقن (psi)",
  fieldInjectionRate: "معدل الحقن (bbl/day)",
  fieldReservoirPressure: "ضغط المكمن (psi)",
  fieldMAIP: "أقصى ضغط حقن مسموح به (psi)",
  fieldWaterRate: "معدل تدفق المياه (bbl/day)",
  fieldWaterCut: "نسبة الماء المنتجة (0-1)",

  fieldLithology: "علم وصف الصخور",
  fieldPorosity: "المسامية (0-1)",
  fieldPermeability: "النفاذية (mD)",
  fieldGRSS: "مؤشر ملاءمة إعادة الحقن الجيولوجية (0-100)",
  fieldTemperature: "درجة الحرارة (°C)",

  fieldTDS: "إجمالي المواد الصلبة الذائبة (mg/L)",
  fieldTSS: "إجمالي المواد الصلبة المعلّقة (mg/L)",
  fieldOil: "نسبة الزيت في الماء (ppm)",
  fieldPH: "الرقم الهيدروجيني (0-14)",
  fieldCa: "تركيز الكالسيوم (Ca) (mg/L)",
  fieldSO4: "تركيز الكبريتات (SO₄) (mg/L)",
  fieldBa: "تركيز الباريوم (Ba) (mg/L)",
  fieldSr: "تركيز السترونيوم (Sr) (mg/L)",
  fieldCRI: "مؤشر خطر التآكل (CRI)",
  fieldSRI: "مؤشر خطر الترسبات (SRI)",

  lithCarbonate: "كربونات",
  lithSandstone: "حجر رملي",
  lithShale: "صخر زيتي",

  // Tooltip text in Arabic — short, accurate, mirrors English.
  tipSectionInjection:
    "الحقن هو عملية ضخّ المياه إلى المكمن للحفاظ على ضغطه عالياً.",
  tipSectionFormation:
    "خصائص صخور المكمن والسوائل التي يحتويها، والتي تتحكّم في سلوك التدفق وأداء الإنتاج.",
  tipSectionChemistry:
    "تركيب المياه المُنتَجة وجودتها.",

  tipInjectionPressure:
    "يبيّن مدى قوة ضخّ المياه إلى داخل المكمن.",
  tipInjectionRate:
    "كمّ برميلاً من المياه يدخل المكمن في اليوم.",
  tipReservoirPressure:
    "الضغط الساكن للسائل الموجود حالياً داخل المكمن.",
  tipMAIP:
    "أقصى ضغط حقن مسموح به — الحدّ الأعلى الآمن لعملية الحقن.",
  tipWaterRate:
    "كمّ من المياه يتدفّق إلى المكمن في اليوم.",
  tipWaterCut:
    "نسبة الماء من إجمالي السائل المُنتَج (من 0 إلى 1).",

  tipLithology:
    "وصف الخصائص الفيزيائية للصخر وتركيبه.",
  tipPorosity:
    "مقياس الفراغات الموجودة داخل الصخر (من 0 إلى 1).",
  tipPermeability:
    "قدرة الصخر على نقل السوائل خلاله.",
  tipGRSS:
    "مؤشر مركّب لمدى ملاءمة المكمن لإعادة الحقن الجيولوجية (من 0 إلى 100).",
  tipTemperature:
    "درجة حرارة المياه المُنتَجة.",

  tipTDS:
    "إجمالي المواد الصلبة الذائبة — كمّية الأملاح والمعادن المذابة في المياه.",
  tipTSS:
    "إجمالي المواد الصلبة المعلّقة — كمّية الجسيمات العالقة في المياه.",
  tipOil:
    "كمّية الزيت المتبقي في المياه المُنتَجة.",
  tipPH:
    "يقيس درجة حموضة المياه أو قلويّتها.",
  tipCa:
    "تركيز أيونات الكالسيوم — يؤثّر على خطر الترسّبات.",
  tipSO4:
    "تركيز أيونات الكبريتات — يؤثّر على خطر ترسّبات الكبريتات.",
  tipBa:
    "تركيز أيونات الباريوم — يؤثّر على خطر ترسّبات الباريت.",
  tipSr:
    "تركيز أيونات السترونيوم — يؤثّر على خطر ترسّبات السلستيت.",
  tipCRI:
    "مؤشّر خطر التآكل — درجة خطر التآكل على المعدّات ومنظومة الحقن.",
  tipSRI:
    "مؤشّر خطر الترسّبات — درجة خطر ترسّب المعادن وانسداد الخطوط.",

  errEmpty: "لا يمكن أن يكون الحقل فارغاً",
  errNonNumeric: "أدخل قيمة رقمية",
  errNegative: "يجب أن تكون ≥ 0",
  errRange: (lo, hi) => `يجب أن تكون بين ${lo} و ${hi}`,
  errSelect: "يرجى اختيار قيمة",
  errCannotReach:
    "تعذّر الاتصال بالخادم. تأكّد من تشغيل الـ API ومن إمكانية الوصول إليه.",

  apiSettings: "رابط الخادم",
  apiSettingsHint:
    "اضبط على http://<PC-IP>:8000 للاستخدام مع Expo Go على الهاتف.",

  autoFill: "تعبئة تلقائية",
  autoFillHint: "يملأ الحقول عشوائياً من عينة تمثيلية من مجموعة البيانات",

  // Alerts panel.
  alerts: "التنبيهات",
  alertPorosity: "المسامية",
  alertPermeability: "النفاذية",
  alertInjectivity: "مؤشر قابلية الحقن",
  alertSeverityLow: "منخفضة",
  alertSeverityGood: "جيدة",
  alertSeverityExcellent: "ممتازة",
  alertSeverityPoor: "ضعيف",
  alertSeverityModerate: "متوسط",
  alertSeverityNa: "غير متاح",

  // CHE treatment recommendation.
  treatmentTitle: "المعالجة المقترحة",
  treatmentContributor: "أبرز مُساهم",
  treatmentSubstance: "المادة المُعالِجة",
  treatmentWhen: "متى تُستخدم",
  treatmentPubchem: "مخاطر المادة (PubChem)",

  // Visualization.
  visualizeBtn: "محاكاة الموقف",
  visualizationTitle: "محاكاة حقن البئر",
  visualizationDesc:
    "حرّك المؤشّرات لاستكشاف انتقال حالة الحقن بين التشغيل الآمن وحدوث التشقّقات في المكمن.",
  controlInjectionPressure: "ضغط الحقن",
  controlMAIP: "أقصى ضغط مسموح",
  controlReservoirPressure: "ضغط المكمن",
  controlWaterCut: "نسبة الماء",
  controlLithology: "نوع الصخر",
  stateSafe: "حقن آمن",
  stateMarginal: "اقتراب من ضغط التشقّق",
  stateFracture: "تشقّق المكمن — أوقف الحقن",
  legendInjection: "المياه المحقونة",
  legendAquifer: "طبقة المياه الجوفية",
  legendReservoir: "المكمن",
  legendFracture: "تشقّق",
  fractureProgress: "هامش التشقّق",
  resetDefaults: "إعادة الضبط",

  deeperAnalysis: "تحليل أعمق بالذكاء الاصطناعي",
  deeperAnalysisHint:
    "إرسال المدخلات والنتيجة للذكاء الاصطناعي للحصول على تبرير أعمق بمستوى مهندس.",
  aiAnalysis: "تحليل الذكاء الاصطناعي",
  analyzing: "جاري التحليل…",
  retry: "إعادة المحاولة",
  aiErrorNetwork:
    "تعذّر الاتصال بخدمة الذكاء الاصطناعي. تحقّق من الشبكة وحاول مجدّداً.",
  aiErrorTimeout:
    "استغرقت الخدمة وقتاً طويلاً. حاول مرة أخرى.",
  aiErrorAuth:
    "خدمة الذكاء الاصطناعي غير مُعَدّة بشكل صحيح. تواصل مع المسؤول.",
  aiErrorQuota:
    "انتهى رصيد خدمة الذكاء الاصطناعي أو تم تجاوز الحد المسموح. حاول لاحقاً.",
  aiErrorNotConfigured: "تحليل الذكاء الاصطناعي غير مُفعّل على الخادم.",
  aiErrorGeneric: "فشل تحليل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
};

export default ar;
