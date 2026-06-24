/* ============================================================
   ai-advisor.js  — النسخة المتطورة v2.0
   المستشار العقاري الذكي لدليل البصرة العقاري

   ما الجديد في هذه النسخة؟
   ✅ ذكاء اصطناعي حقيقي عبر Gemini API (gemini-2.0-flash)
   ✅ System Prompt متخصص 100% بعقارات البصرة (أحياء، أسعار، مناطق)
   ✅ كشف تلقائي لنوع الطلب (بيع / إيجار / استثمار)
   ✅ مقارنة أسعار وتقدير عقاري ذكي
   ✅ نصائح شراء وإيجار واستثمار مخصصة
   ✅ ترويج ذكي لعروض الموقع وباقاته في الوقت المناسب
   ✅ ذاكرة المحادثة (سياق كامل مع كل رسالة)
   ✅ مؤشر "يكتب..." أثناء انتظار الرد
   ✅ أزرار اقتراحات سريعة للمستخدم
   ✅ يبقى ملف .js مستقلاً — لا تعديل على index.html

   للتفعيل: أضف سطراً واحداً في index.html:
   <script src="ai-advisor.js" defer></script>
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     ⚙️ الإعدادات — عدّل هنا فقط عند الحاجة
     ============================================================ */
  const CONFIG = {
    // 🔑 مفتاح Gemini API — ضع مفتاحك هنا (مجاني)
    // للحصول على مفتاح: https://aistudio.google.com/apikey
    API_KEY: 'AQ.Ab8RN6Jqx7NUvSBbSUB3HjrK98N1-tLyfXL_FIhtdwDWj-jaZg',

    // نموذج Gemini — gemini-2.0-flash مجاني وسريع
    GEMINI_MODEL: 'gemini-2.0-flash',

    // اسم الموقع — يُستخدم في ترويج الباقات
    SITE_NAME: 'دليل البصرة العقاري',

    // رابط صفحة الباقات في موقعك
    PACKAGES_URL: '/packages',

    // رابط صفحة تسجيل المعلنين
    REGISTER_URL: '/register',

    // عدد الرسائل قبل عرض ترويج الباقات تلقائياً
    PROMO_AFTER_MESSAGES: 4,

    // الحد الأقصى لسجل المحادثة المُرسل للـ API (لتوفير التوكنات)
    MAX_HISTORY: 14,
  };

  /* ============================================================
     🧠 System Prompt — قلب الذكاء الاصطناعي
     ============================================================ */
  const SYSTEM_PROMPT = `أنت "داهية"، المستشار العقاري الذكي لموقع "${CONFIG.SITE_NAME}".
خبرتك محصورة 100% في سوق العقارات بمحافظة البصرة، العراق.

═══════════════════════════════════════════
📍 معرفتك الجغرافية بأحياء ومناطق البصرة:
═══════════════════════════════════════════
المناطق الراقية والمرغوبة (أسعار مرتفعة):
- البراضعية: منطقة هادئة وراقية، مناسبة للعائلات، أسعار البيع 150-400 مليون دينار للبيت
- الجزيرة: فلل وبيوت فاخرة، من أغلى مناطق البصرة، 200-600 مليون
- حي الجامعة: قرب جامعة البصرة، مطلوب من الأكاديميين، 120-300 مليون
- العشار: قلب البصرة التجاري، مزيج تجاري وسكني، إيجارات الشقق 200-500 ألف/شهر
- أبو الخصيب: مناطق خضراء وهادئة، أسعار معقولة، 80-200 مليون

المناطق المتوسطة (أسعار معتدلة):
- الجمهورية: شعبية ومتوسطة، بيوت 60-150 مليون، شقق إيجار 150-300 ألف/شهر
- الأصمعي: متوسط الحال، 70-160 مليون
- الزبير: قرب الحدود السعودية، تنمو بسرعة، 50-130 مليون
- القبلة: مركزية وحيوية، 80-180 مليون، إيجارات 200-400 ألف
- المعقل: قرب الميناء، طلب من الموظفين، 70-150 مليون
- الخندق: شعبية، 50-120 مليون

المناطق الاقتصادية (أسعار منخفضة):
- الحيانية: اقتصادية وواسعة، 40-100 مليون
- الشعيبة: صناعية وسكنية، 35-90 مليون
- أم قصر: قرب الميناء، فرص استثمارية، 40-110 مليون
- سفوان: حدودية، فرص تجارية خاصة

═══════════════════════════════════════════
💰 معرفتك بالأسعار والسوق (2024-2025):
═══════════════════════════════════════════
أسعار البيع التقريبية:
- شقة (100-150م²): 50-150 مليون دينار حسب المنطقة
- بيت طابق واحد (150-200م²): 80-250 مليون
- بيت طابقين (200-300م²): 150-450 مليون
- فيلا (300م² فأكثر): 300 مليون - مليار+
- قطعة أرض سكنية (200م²): 30-200 مليون حسب الموقع
- محل تجاري: 80-500 مليون حسب الموقع والمساحة

أسعار الإيجار الشهرية:
- شقة صغيرة (1-2 غرفة): 100-250 ألف دينار
- شقة متوسطة (3 غرف): 200-400 ألف دينار
- بيت كامل: 300-800 ألف دينار
- محل تجاري صغير: 300 ألف - مليون دينار

العوامل المؤثرة في السعر:
- القرب من الخدمات (مدارس، مستشفيات، أسواق)
- الحالة الإنشائية والعمر
- المساحة والتصميم الداخلي
- الطابق (للشقق: الطوابق المنخفضة أغلى)
- توافر الحدائق والمواقف
- الكهرباء الحكومية مقابل المولدة

═══════════════════════════════════════════
🎯 كيف تكتشف نوع الطلب تلقائياً:
═══════════════════════════════════════════
- كلمات البيع: "أشتري، ابتاع، شراء، ملكية، سند، تمليك"
- كلمات الإيجار: "أستأجر، إيجار، كراء، شهري، أجار"
- كلمات الاستثمار: "استثمار، ربح، دخل، مشروع، تجاري، عائد، مضاعفة"
- كلمات البيع من المالك: "أبيع، عندي عقار، للبيع، أسوّق"

═══════════════════════════════════════════
💡 نصائحك الذهبية:
═══════════════════════════════════════════
للمشتري:
1. افحص السند وتأكد من خلوه من الديون في دائرة التسجيل العقاري
2. اطلب كشف هندسي قبل الشراء
3. تحقق من خدمات المنطقة (ماء، كهرباء، صرف صحي)
4. لا تشتري بدون وسيط موثوق أو محامي
5. السعر العادل = سعر السوق ±15%

للمستأجر:
1. اكتب عقد إيجار رسمي وموثق
2. تفقد المنزل كاملاً قبل الدفع
3. اسأل عن فاتورة الكهرباء الشهرية
4. وضّح من يتحمل الإصلاحات
5. احتفظ بنسخة من إيصالات الدفع

للمستثمر:
1. المناطق الواعدة: الزبير، أبو الخصيب، القرنة (توسع مخطط)
2. المحلات التجارية في العشار والجمهورية: عائد إيجاري 8-12% سنوياً
3. الأراضي قرب المشاريع الحكومية الجديدة: ربح رأسمالي ممتاز
4. تجنب العقارات على أراضي دولة أو متنازع عليها

═══════════════════════════════════════════
📣 ترويج الموقع وباقاته (بشكل طبيعي وذكي):
═══════════════════════════════════════════
عندما يسأل شخص عن عرض معين أو يريد الإعلان:
- اذكر أن "${CONFIG.SITE_NAME}" هو الدليل الأول للعقارات في البصرة
- الباقات المتاحة: المجانية (3 إعلانات)، الفضية (15 إعلان/شهر)، الذهبية (إعلانات غير محدودة + تمييز)
- وجّههم لصفحة الباقات: ${CONFIG.PACKAGES_URL}
- لا تبالغ بالترويج — اذكره مرة واحدة بشكل طبيعي ضمن الرد

═══════════════════════════════════════════
🗣️ أسلوبك في الرد:
═══════════════════════════════════════════
- اللهجة: عراقية بصرية دافئة ومهنية (مثال: "حبيبي، هذا الحي من أحسن المناطق...")
- الطول: متوسط — لا قصير جداً ولا طويل ممل
- دائماً أعطِ رقماً أو تقديراً للسعر عند السؤال
- استخدم إيموجي بمعقولية (🏠💰📍✅)
- في نهاية كل رد، اقترح سؤالاً متابعة أو عرض مساعدة إضافية
- إذا لم تعرف معلومة محددة، قل ذلك بصراحة واقترح كيف يتحقق منها
- لا تتحدث عن أي شيء خارج نطاق عقارات البصرة`;

  /* ============================================================
     1) حقن التنسيقات CSS
     ============================================================ */
  const style = document.createElement('style');
  style.textContent = `
    /* ── الودجة الرئيسية ── */
    .ai-chat-widget {
      position: fixed; bottom: 25px; left: 25px; z-index: 9999;
      display: flex; flex-direction: column; align-items: flex-start;
      font-family: 'Cairo', 'Segoe UI', sans-serif;
    }

    /* ── زر الفتح ── */
    .ai-chat-btn {
      width: auto; padding: 0 18px; height: 46px;
      border-radius: 30px;
      background: linear-gradient(135deg, var(--gold, #c9a84c), var(--gold-dark, #a07830));
      color: var(--navy, #0a1628); border: 2px solid rgba(255,255,255,0.25);
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .ai-chat-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.55); }
    .ai-chat-btn .pulse-dot {
      width: 8px; height: 8px; background: #22c55e;
      border-radius: 50%; animation: ai-pulse 1.8s infinite;
    }
    @keyframes ai-pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.6; }
    }

    /* ── نافذة الدردشة ── */
    .ai-chat-window {
      width: 350px; height: 500px;
      background: var(--navy-mid, #0f2040);
      border: 1.5px solid var(--gold, #c9a84c);
      border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      display: none; flex-direction: column;
      overflow: hidden; margin-bottom: 12px;
      animation: ai-slideUp 0.25s ease;
    }
    .ai-chat-window.active { display: flex !important; }
    @keyframes ai-slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── رأس النافذة ── */
    .ai-chat-header {
      background: linear-gradient(135deg, var(--navy, #0a1628), var(--navy-light, #1a3050));
      border-bottom: 1px solid rgba(201,168,76,0.25);
      padding: 11px 14px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .ai-chat-header-info { display: flex; align-items: center; gap: 9px; }
    .ai-chat-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold,#c9a84c), #8B6914);
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; flex-shrink: 0;
    }
    .ai-chat-header-texts { display: flex; flex-direction: column; }
    .ai-chat-header-name { font-size: 12.5px; font-weight: 700; color: var(--gold, #c9a84c); }
    .ai-chat-header-status { font-size: 10px; color: #22c55e; display: flex; align-items: center; gap: 4px; }
    .ai-chat-header-status::before {
      content: ''; width: 6px; height: 6px;
      background: #22c55e; border-radius: 50%; display: inline-block;
    }
    .ai-chat-close-btn {
      background: transparent; border: none;
      color: rgba(255,255,255,0.4); cursor: pointer;
      font-size: 18px; line-height: 1; padding: 2px 6px;
      border-radius: 4px; transition: 0.2s;
    }
    .ai-chat-close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }

    /* ── منطقة الرسائل ── */
    .ai-chat-body {
      flex: 1; padding: 12px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
      background: rgba(8,18,35,0.4);
      scrollbar-width: thin; scrollbar-color: rgba(201,168,76,0.3) transparent;
    }
    .ai-chat-body::-webkit-scrollbar { width: 4px; }
    .ai-chat-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 4px; }

    /* ── فقاعات الرسائل ── */
    .ai-msg {
      max-width: 88%; padding: 9px 13px;
      border-radius: 12px; font-size: 13px; line-height: 1.6;
      word-break: break-word; direction: rtl; text-align: right;
    }
    .ai-msg.bot {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
      align-self: flex-start;
      border-right: 3px solid var(--gold, #c9a84c);
      border-bottom-left-radius: 4px;
    }
    .ai-msg.user {
      background: linear-gradient(135deg, var(--gold,#c9a84c), #a07830);
      color: var(--navy, #0a1628);
      align-self: flex-end; font-weight: 600;
      border-bottom-right-radius: 4px;
    }

    /* ── مؤشر الكتابة ── */
    .ai-typing {
      display: flex; align-items: center; gap: 5px;
      align-self: flex-start; padding: 10px 14px;
      background: rgba(255,255,255,0.06);
      border-right: 3px solid var(--gold,#c9a84c);
      border-radius: 12px; border-bottom-left-radius: 4px;
    }
    .ai-typing span {
      width: 7px; height: 7px; background: var(--gold,#c9a84c);
      border-radius: 50%; animation: ai-bounce 1.2s infinite;
    }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* ── أزرار الاقتراحات السريعة ── */
    .ai-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 8px 12px; background: rgba(8,18,35,0.3);
      border-top: 1px solid rgba(201,168,76,0.1);
      flex-shrink: 0;
    }
    .ai-suggestion-btn {
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.3);
      color: var(--gold, #c9a84c);
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; cursor: pointer;
      font-family: 'Cairo', sans-serif;
      transition: 0.2s; white-space: nowrap;
    }
    .ai-suggestion-btn:hover {
      background: rgba(201,168,76,0.25);
      border-color: var(--gold,#c9a84c);
    }

    /* ── بانر ترويج الباقات ── */
    .ai-promo-banner {
      margin: 4px 0; padding: 10px 12px;
      background: linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.05));
      border: 1px solid rgba(201,168,76,0.35);
      border-radius: 10px; align-self: flex-start;
      font-size: 12px; color: rgba(255,255,255,0.85);
      direction: rtl; text-align: right; max-width: 88%;
    }
    .ai-promo-banner strong { color: var(--gold,#c9a84c); }
    .ai-promo-link {
      display: inline-block; margin-top: 6px;
      background: var(--gold,#c9a84c); color: var(--navy,#0a1628);
      padding: 4px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 700; text-decoration: none;
      transition: 0.2s;
    }
    .ai-promo-link:hover { opacity: 0.85; }

    /* ── منطقة الإدخال ── */
    .ai-chat-footer {
      padding: 9px 10px;
      background: var(--navy, #0a1628);
      border-top: 1px solid rgba(201,168,76,0.15);
      display: flex; gap: 7px; flex-shrink: 0;
      align-items: center;
    }
    .ai-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px; padding: 8px 13px;
      color: #fff; font-family: 'Cairo', sans-serif;
      font-size: 13px; outline: none;
      direction: rtl; transition: border-color 0.2s;
    }
    .ai-chat-input:focus { border-color: var(--gold, #c9a84c); }
    .ai-chat-input::placeholder { color: rgba(255,255,255,0.3); }
    .ai-chat-send {
      background: linear-gradient(135deg, var(--gold,#c9a84c), #a07830);
      border: none; color: var(--navy,#0a1628);
      width: 38px; height: 38px; border-radius: 8px;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 16px;
      flex-shrink: 0; transition: opacity 0.2s;
    }
    .ai-chat-send:hover { opacity: 0.85; }
    .ai-chat-send:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── ريسبونسف ── */
    @media (max-width: 700px) {
      .ai-chat-window { width: 300px; height: 430px; }
      .ai-chat-widget { bottom: 15px; left: 12px; }
    }
  `;
  document.head.appendChild(style);

  /* ============================================================
     2) حقن بنية HTML
     ============================================================ */
  const widget = document.createElement('div');
  widget.className = 'ai-chat-widget';
  widget.innerHTML = `
    <div class="ai-chat-window" id="aiChatWindow">

      <!-- رأس النافذة -->
      <div class="ai-chat-header">
        <div class="ai-chat-header-info">
          <div class="ai-chat-avatar">🧠</div>
          <div class="ai-chat-header-texts">
            <span class="ai-chat-header-name">داهية — المستشار العقاري</span>
            <span class="ai-chat-header-status">متصل الآن · خبير البصرة</span>
          </div>
        </div>
        <button id="aiChatCloseBtn" class="ai-chat-close-btn" title="إغلاق">✕</button>
      </div>

      <!-- منطقة الرسائل -->
      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">
          أهلاً وسهلاً! 🌴 أنا <strong>داهية</strong>، مستشارك العقاري الذكي المتخصص في سوق البصرة.<br><br>
          سواء تريد تشتري، تستأجر، تستثمر، أو تبيع — أنا هنا. اسألني عن أي منطقة أو نوع عقار وراح أعطيك تقييم دقيق وحقيقي! 🏠💰
        </div>
      </div>

      <!-- أزرار الاقتراحات السريعة -->
      <div class="ai-suggestions" id="aiSuggestions">
        <button class="ai-suggestion-btn" data-msg="أسعار البيوت في العشار">🏠 أسعار العشار</button>
        <button class="ai-suggestion-btn" data-msg="أفضل مناطق الاستثمار في البصرة">📈 أفضل للاستثمار</button>
        <button class="ai-suggestion-btn" data-msg="كم إيجار شقة في الجمهورية؟">🔑 إيجار الجمهورية</button>
        <button class="ai-suggestion-btn" data-msg="نصائح قبل شراء عقار في البصرة">💡 نصائح الشراء</button>
      </div>

      <!-- حقل الإدخال -->
      <div class="ai-chat-footer">
        <input type="text" id="aiChatInput" class="ai-chat-input"
               placeholder="اسأل داهية... مثال: بيت في البراضعية بميزانية 200 مليون">
        <button id="aiChatSendBtn" class="ai-chat-send" title="إرسال">
          <i class="ti ti-send"></i>
        </button>
      </div>

    </div>

    <!-- زر فتح الودجة -->
    <button class="ai-chat-btn" id="aiChatToggleBtn">
      <span class="pulse-dot"></span>
      🧠 داهية — المستشار العقاري
    </button>
  `;
  document.body.appendChild(widget);

  /* ============================================================
     3) الحالة الداخلية
     ============================================================ */
  let conversationHistory = []; // سجل المحادثة كاملاً
  let messageCount        = 0;  // عداد رسائل المستخدم
  let promoShown          = false; // هل عُرض ترويج الباقات؟
  let isWaiting           = false; // هل نحن في انتظار رد API؟

  /* ============================================================
     4) الدوال المساعدة
     ============================================================ */

  /** إضافة رسالة إلى واجهة الدردشة */
  function appendMessage(html, role) {
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  /** إضافة مؤشر "يكتب..." */
  function showTyping() {
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = 'ai-typing';
    div.id = 'aiTypingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  /** إزالة مؤشر "يكتب..." */
  function hideTyping() {
    const t = document.getElementById('aiTypingIndicator');
    if (t) t.remove();
  }

  /** عرض بانر ترويج الباقات */
  function showPromoBanner() {
    if (promoShown) return;
    promoShown = true;
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = 'ai-promo-banner';
    div.innerHTML = `
      ✨ <strong>هل تريد الإعلان عن عقارك؟</strong><br>
      انضم إلى <strong>${CONFIG.SITE_NAME}</strong> — الدليل الأول للعقارات في البصرة.
      باقات تبدأ من المجاني وصولاً للذهبية مع تمييز كامل!
      <br><a href="${CONFIG.PACKAGES_URL}" class="ai-promo-link" target="_blank">📋 عرض الباقات</a>
      <a href="${CONFIG.REGISTER_URL}" class="ai-promo-link" style="margin-right:6px;" target="_blank">✍️ سجّل الآن</a>
    `;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  /** تعطيل/تفعيل حقل الإدخال وزر الإرسال */
  function setInputState(enabled) {
    const input = document.getElementById('aiChatInput');
    const btn   = document.getElementById('aiChatSendBtn');
    if (input) input.disabled = !enabled;
    if (btn)   btn.disabled   = !enabled;
  }

  /* ============================================================
     5) الدالة الرئيسية: إرسال رسالة إلى Claude API
     ============================================================ */
  async function sendAiMessage() {
    if (isWaiting) return;

    const input = document.getElementById('aiChatInput');
    const txt   = input.value.trim();
    if (!txt) return;

    // تحقق من وجود مفتاح API
    if (CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      appendMessage(
        '⚠️ تنبيه: لم يتم إعداد مفتاح Gemini API بعد. يرجى وضع مفتاحك في CONFIG.API_KEY داخل ملف ai-advisor.js — احصل عليه مجاناً من: aistudio.google.com/apikey',
        'bot'
      );
      return;
    }

    // عرض رسالة المستخدم
    appendMessage(txt, 'user');
    input.value = '';
    messageCount++;

    // أخفِ الاقتراحات بعد أول رسالة
    const suggestions = document.getElementById('aiSuggestions');
    if (suggestions) suggestions.style.display = 'none';

    // أضف الرسالة لسجل المحادثة
    conversationHistory.push({ role: 'user', content: txt });

    // اقتطع السجل إذا طال جداً
    if (conversationHistory.length > CONFIG.MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-CONFIG.MAX_HISTORY);
    }

    // حالة الانتظار
    isWaiting = true;
    setInputState(false);
    showTyping();

    try {
      // بناء سجل المحادثة بصيغة Gemini
      const geminiHistory = conversationHistory.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.API_KEY}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...geminiHistory,
            { role: 'user', parts: [{ text: txt }] },
          ],
          generationConfig: { maxOutputTokens: 700, temperature: 0.7 },
        }),
      });

      hideTyping();

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const data  = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أستطع الرد الآن. حاول مجدداً.';

      // أضف الرد لسجل المحادثة
      conversationHistory.push({ role: 'assistant', content: reply });

      // اعرض الرد (تحويل줄 السطور إلى <br>)
      appendMessage(reply.replace(/\n/g, '<br>'), 'bot');

      // اعرض ترويج الباقات بعد العدد المحدد من الرسائل
      if (messageCount >= CONFIG.PROMO_AFTER_MESSAGES && !promoShown) {
        setTimeout(showPromoBanner, 800);
      }

    } catch (error) {
      hideTyping();
      console.error('[ai-advisor] API Error:', error);
      appendMessage(
        `⚠️ حدث خطأ في الاتصال بالمستشار: <em>${error.message}</em><br>تحقق من مفتاح API أو اتصالك بالإنترنت.`,
        'bot'
      );
    } finally {
      isWaiting = false;
      setInputState(true);
      document.getElementById('aiChatInput')?.focus();
    }
  }

  /* ============================================================
     6) فتح/إغلاق النافذة
     ============================================================ */
  function toggleAiChat() {
    const win = document.getElementById('aiChatWindow');
    if (!win) return;
    win.classList.toggle('active');
    if (win.classList.contains('active')) {
      setTimeout(() => document.getElementById('aiChatInput')?.focus(), 100);
    }
  }

  /* ============================================================
     7) ربط الأحداث
     ============================================================ */
  document.getElementById('aiChatToggleBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatCloseBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatSendBtn').addEventListener('click', sendAiMessage);
  document.getElementById('aiChatInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); }
  });

  // أزرار الاقتراحات السريعة
  document.getElementById('aiSuggestions').addEventListener('click', function (e) {
    const btn = e.target.closest('.ai-suggestion-btn');
    if (!btn) return;
    const input = document.getElementById('aiChatInput');
    if (input) {
      input.value = btn.dataset.msg || btn.textContent.trim();
      sendAiMessage();
    }
  });

  /* ============================================================
     8) تصدير الدوال العامة (للاستخدام الخارجي إن احتجت)
     ============================================================ */
  window.toggleAiChat  = toggleAiChat;
  window.sendAiMessage = sendAiMessage;

})();
