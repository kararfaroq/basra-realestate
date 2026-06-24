/* ============================================================
   ai-advisor.js  — النسخة المستقلة v3.0
   المستشار العقاري الذكي "داهية" — لدليل البصرة العقاري

   ✅ يعمل بالكامل بدون أي API خارجي
   ✅ محرك ردود ذكي مبني على قاعدة بيانات البصرة
   ✅ كشف تلقائي لنوع الطلب (بيع/إيجار/استثمار/نصيحة)
   ✅ ردود ديناميكية تتغير حسب المنطقة + نوع الطلب
   ✅ ذاكرة المحادثة (يتذكر ما سبق)
   ✅ ترويج ذكي لباقات الموقع
   ✅ مؤشر "يكتب..." واقتراحات سريعة
   ✅ لا إنترنت خارجي — يعمل 100% محلياً

   للتفعيل: <script src="ai-advisor.js" defer></script>
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     ⚙️ إعدادات الموقع — عدّل هنا فقط
     ============================================================ */
  const CONFIG = {
    SITE_NAME:           'دليل البصرة العقاري',
    PACKAGES_URL:        '/packages',
    REGISTER_URL:        '/register',
    PROMO_AFTER_MSGS:    4,   // عدد رسائل المستخدم قبل عرض ترويج الباقات
    TYPING_DELAY_MIN:    600, // أقل تأخير لمؤشر الكتابة (ms)
    TYPING_DELAY_MAX:    1400,// أعلى تأخير
  };

  /* ============================================================
     🏙️ قاعدة بيانات أحياء البصرة
     ============================================================ */
  const AREAS = {
    // ── الراقية ──
    'البراضعية':  { tier:'راقية',    buyMin:150, buyMax:400,  rentMin:300, rentMax:700,  invest:'ممتاز',  desc:'منطقة هادئة وراقية، مناسبة جداً للعائلات، بنية تحتية جيدة وأمان عالٍ.' },
    'الجزيرة':    { tier:'راقية',    buyMin:200, buyMax:600,  rentMin:400, rentMax:900,  invest:'ممتاز',  desc:'من أفخم مناطق البصرة، فلل وبيوت كبيرة، مناسبة للسكن الراقي.' },
    'حي الجامعة': { tier:'راقية',    buyMin:120, buyMax:300,  rentMin:250, rentMax:550,  invest:'جيد',    desc:'قريب من جامعة البصرة، مطلوب من الأكاديميين والطلاب.' },
    'أبو الخصيب': { tier:'راقية',    buyMin:80,  buyMax:200,  rentMin:200, rentMax:450,  invest:'جيد',    desc:'منطقة خضراء وهادئة جنوب البصرة، هواء نقي وطبيعة جميلة.' },
    // ── المتوسطة ──
    'العشار':     { tier:'متوسطة',   buyMin:100, buyMax:280,  rentMin:200, rentMax:500,  invest:'جيد جداً', desc:'قلب البصرة التجاري، حيوي ومركزي، مزيج سكني وتجاري.' },
    'الجمهورية':  { tier:'متوسطة',   buyMin:60,  buyMax:150,  rentMin:150, rentMax:300,  invest:'جيد',    desc:'حي شعبي وحيوي، خدمات متكاملة وأسعار معقولة.' },
    'الأصمعي':    { tier:'متوسطة',   buyMin:70,  buyMax:160,  rentMin:160, rentMax:320,  invest:'متوسط',  desc:'حي متوسط الحال، هادئ نسبياً، مناسب للعائلات.' },
    'الزبير':     { tier:'متوسطة',   buyMin:50,  buyMax:130,  rentMin:130, rentMax:280,  invest:'واعد',   desc:'قرب الحدود السعودية، ينمو بسرعة، فرص استثمارية جيدة.' },
    'القبلة':     { tier:'متوسطة',   buyMin:80,  buyMax:180,  rentMin:200, rentMax:400,  invest:'جيد',    desc:'موقع مركزي وحيوي، قرب الدوائر الحكومية والأسواق.' },
    'المعقل':     { tier:'متوسطة',   buyMin:70,  buyMax:150,  rentMin:150, rentMax:320,  invest:'متوسط',  desc:'قرب الميناء، طلب مرتفع من موظفي الشركات والمرافئ.' },
    'الخندق':     { tier:'متوسطة',   buyMin:50,  buyMax:120,  rentMin:130, rentMax:260,  invest:'متوسط',  desc:'حي شعبي بأسعار مناسبة، خدمات أساسية متوفرة.' },
    // ── الاقتصادية ──
    'الحيانية':   { tier:'اقتصادية', buyMin:40,  buyMax:100,  rentMin:100, rentMax:200,  invest:'متوسط',  desc:'منطقة اقتصادية وواسعة، مناسبة لمحدودي الدخل.' },
    'الشعيبة':    { tier:'اقتصادية', buyMin:35,  buyMax:90,   rentMin:90,  rentMax:180,  invest:'صناعي',  desc:'منطقة صناعية وسكنية، مناسبة للعمال والمشاريع الصغيرة.' },
    'أم قصر':     { tier:'اقتصادية', buyMin:40,  buyMax:110,  rentMin:100, rentMax:220,  invest:'واعد',   desc:'قرب الميناء الكبير، فرص استثمارية تجارية وصناعية.' },
    'سفوان':      { tier:'اقتصادية', buyMin:30,  buyMax:80,   rentMin:80,  rentMax:160,  invest:'تجاري',  desc:'منطقة حدودية مع الكويت، فرص تجارية خاصة.' },
    'الدير':      { tier:'اقتصادية', buyMin:45,  buyMax:110,  rentMin:110, rentMax:220,  invest:'متوسط',  desc:'منطقة هادئة على نهر شط العرب، طبيعة جميلة.' },
    'القرنة':     { tier:'اقتصادية', buyMin:35,  buyMax:90,   rentMin:90,  rentMax:180,  invest:'واعد',   desc:'موقع سياحي (جنة عدن)، إمكانيات سياحية واعدة.' },
  };

  /* ============================================================
     🔍 محرك الكشف الذكي عن نية المستخدم
     ============================================================ */
  const INTENTS = {
    buy: {
      keys: ['اشتري','ابتاع','شراء','تمليك','سند','ملكية','بالتقسيط','قسط','دفعة','أبي أشتري','ودي أشتري','بيت للبيع','شقة للبيع','أرض للبيع','عقار للبيع','كم سعر','بكم','سعره'],
      label: 'شراء'
    },
    rent: {
      keys: ['إيجار','اجار','أجار','استئجار','أستأجر','كراء','شهري','سنوي','للإيجار','للاجار','إيجار شهري','دفع شهري','سكن مؤقت'],
      label: 'إيجار'
    },
    invest: {
      keys: ['استثمار','استثمر','ربح','عائد','دخل شهري','مشروع','تجاري','مضاعفة','استثماري','فرصة','أرباح','مردود'],
      label: 'استثمار'
    },
    sell: {
      keys: ['أبيع','عندي عقار','للبيع','أسوّق','أعلن','أنشر','إعلان','بيع عقار','أريد أبيع'],
      label: 'بيع'
    },
    advice: {
      keys: ['نصيحة','نصائح','رأيك','توصي','أفضل','ينفع','يستاهل','مناسب','مقارنة','الفرق','أنسب','أحسن منطقة','وين أحسن'],
      label: 'استشارة'
    },
    price: {
      keys: ['سعر','أسعار','كم تكلف','بكم','تقدير','تقييم','قيمة','غالي','رخيص','مناسب الثمن'],
      label: 'استفسار سعر'
    },
    greet: {
      keys: ['هلا','مرحبا','مرحبا','السلام','أهلا','هاي','صباح','مساء','كيفك','شلونك','شخبارك'],
      label: 'تحية'
    },
  };

  /* ============================================================
     🧠 محرك توليد الردود
     ============================================================ */
  function detectIntent(txt) {
    const t = txt.toLowerCase();
    for (const [intent, data] of Object.entries(INTENTS)) {
      if (data.keys.some(k => t.includes(k))) return intent;
    }
    return 'general';
  }

  function detectArea(txt) {
    for (const area of Object.keys(AREAS)) {
      if (txt.includes(area)) return area;
    }
    return null;
  }

  function detectPropertyType(txt) {
    if (/(شقة|شقق|أبارتمنت)/.test(txt))  return 'شقة';
    if (/(بيت|دار|منزل|بيوت)/.test(txt)) return 'بيت';
    if (/(فيلا|قصر|فلل)/.test(txt))       return 'فيلا';
    if (/(أرض|قطعة|قطع)/.test(txt))       return 'أرض';
    if (/(محل|تجاري|دكان)/.test(txt))     return 'محل تجاري';
    return null;
  }

  // ردود التحية
  function replyGreet() {
    const greets = [
      `هلا هلا! 🌴 أنا داهية، مستشارك العقاري في البصرة. سواء تبي تشتري، تستأجر، أو تستثمر — اسألني وأنا بالخدمة! شو اللي تدور عليه؟`,
      `أهلاً وسهلاً! 😊 يسعدني أساعدك في أي سؤال عن عقارات البصرة. تريد أسعار منطقة معينة؟ أو نصيحة استثمارية؟ هيا اسأل!`,
      `هلا بيك! 🏠 أنا هنا لأساعدك تلكط أحسن صفقة عقارية في البصرة. شو اللي يدور بالك؟`,
    ];
    return greets[Math.floor(Math.random() * greets.length)];
  }

  // ردود حسب المنطقة + نوع الطلب
  function replyWithArea(area, intent, propType) {
    const a = AREAS[area];
    const prop = propType || 'العقار';

    if (intent === 'buy' || intent === 'price') {
      return `🏠 <strong>${area}</strong> — ${a.desc}<br><br>` +
        `💰 <strong>أسعار البيع التقريبية:</strong><br>` +
        `• ${prop === 'شقة' ? `شقة: ${Math.round(a.buyMin*0.4)}-${Math.round(a.buyMax*0.6)} مليون دينار` :
           prop === 'فيلا' ? `فيلا: ${a.buyMax}-${a.buyMax*2} مليون دينار` :
           prop === 'أرض'  ? `قطعة أرض: ${Math.round(a.buyMin*0.5)}-${Math.round(a.buyMax*0.7)} مليون دينار` :
           `بيت: ${a.buyMin}-${a.buyMax} مليون دينار`}<br><br>` +
        `📊 <strong>تصنيف المنطقة:</strong> ${a.tier} | <strong>الاستثمار:</strong> ${a.invest}<br><br>` +
        `💡 <em>السعر يتفاوت حسب المساحة والحالة الإنشائية وقرب الخدمات. تريد مقارنة مع منطقة ثانية؟</em>`;
    }

    if (intent === 'rent') {
      return `🔑 <strong>إيجار في ${area}:</strong><br><br>` +
        `${a.desc}<br><br>` +
        `💵 <strong>الإيجارات الشهرية التقريبية:</strong><br>` +
        `• شقة صغيرة (1-2 غرفة): ${Math.round(a.rentMin*0.7)}-${Math.round(a.rentMin*1.1)} ألف دينار<br>` +
        `• شقة متوسطة (3 غرف): ${a.rentMin}-${Math.round(a.rentMax*0.7)} ألف دينار<br>` +
        `• بيت كامل: ${Math.round(a.rentMax*0.7)}-${a.rentMax} ألف دينار<br><br>` +
        `⚠️ <strong>نصيحة:</strong> دائماً اكتب عقد إيجار رسمي وتأكد من الحالة قبل الدفع.<br><br>` +
        `<em>تريد مناطق ثانية بنفس الميزانية؟</em>`;
    }

    if (intent === 'invest') {
      return `📈 <strong>الاستثمار في ${area}:</strong><br><br>` +
        `${a.desc}<br><br>` +
        `🎯 <strong>تقييم الاستثمار:</strong> ${a.invest}<br>` +
        `💰 نطاق الشراء: ${a.buyMin}-${a.buyMax} مليون دينار<br>` +
        `🔄 العائد الإيجاري المتوقع: ${a.rentMin}-${a.rentMax} ألف/شهر<br>` +
        `📊 العائد السنوي التقريبي: ${Math.round((a.rentMin*12/((a.buyMin+a.buyMax)/2))*100)}%<br><br>` +
        `💡 <em>أفضل فرص الاستثمار في البصرة: الزبير، أم قصر، القرنة (نمو سريع). تريد تفاصيل أكثر؟</em>`;
    }

    if (intent === 'advice') {
      return `💡 <strong>رأيي في ${area}:</strong><br><br>` +
        `${a.desc}<br><br>` +
        `✅ <strong>المميزات:</strong> منطقة ${a.tier}، تصنيف استثماري: ${a.invest}<br>` +
        `💰 الأسعار تتراوح ${a.buyMin}-${a.buyMax} مليون للشراء<br><br>` +
        `📌 <strong>توصيتي:</strong> ${
          a.tier === 'راقية' ? 'مناسبة إذا ميزانيتك مرتفعة وتريد جودة سكن عالية.' :
          a.tier === 'متوسطة' ? 'خيار ذكي — توازن بين السعر والخدمات.' :
          'مناسبة لمحدودي الدخل أو الاستثمار طويل الأمد.'
        }<br><br>` +
        `<em>تريد مقارنة ${area} مع منطقة ثانية؟</em>`;
    }

    // عام
    return `📍 <strong>${area}</strong><br><br>${a.desc}<br><br>` +
      `💰 شراء: ${a.buyMin}-${a.buyMax} مليون | إيجار: ${a.rentMin}-${a.rentMax} ألف/شهر<br>` +
      `📊 تصنيف: ${a.tier} | استثمار: ${a.invest}<br><br>` +
      `<em>اسألني عن الشراء، الإيجار، أو الاستثمار في ${area}!</em>`;
  }

  // ردود بدون منطقة محددة
  function replyWithoutArea(intent, txt) {
    if (intent === 'buy') {
      return `🏠 <strong>دليلك للشراء في البصرة:</strong><br><br>` +
        `حسب ميزانيتك، إليك التوزيع:<br>` +
        `🌟 <strong>راقية (150M+):</strong> البراضعية، الجزيرة، حي الجامعة<br>` +
        `⭐ <strong>متوسطة (60-150M):</strong> العشار، الجمهورية، القبلة، المعقل<br>` +
        `💫 <strong>اقتصادية (أقل من 60M):</strong> الحيانية، الشعيبة، أم قصر<br><br>` +
        `💡 <strong>نصائح ذهبية قبل الشراء:</strong><br>` +
        `1️⃣ تحقق من السند في دائرة التسجيل العقاري<br>` +
        `2️⃣ اطلب كشف هندسي قبل الدفع<br>` +
        `3️⃣ لا تشتري بدون وسيط موثوق أو محامي<br><br>` +
        `<em>أخبرني عن ميزانيتك أو المنطقة وأعطيك تفاصيل أدق!</em>`;
    }

    if (intent === 'rent') {
      return `🔑 <strong>الإيجارات في البصرة (2024-2025):</strong><br><br>` +
        `📌 <strong>شقة صغيرة (1-2 غرفة):</strong> 100-250 ألف دينار/شهر<br>` +
        `📌 <strong>شقة متوسطة (3 غرف):</strong> 200-400 ألف دينار/شهر<br>` +
        `📌 <strong>بيت كامل:</strong> 300-800 ألف دينار/شهر<br>` +
        `📌 <strong>محل تجاري:</strong> 300 ألف - مليون/شهر<br><br>` +
        `🏆 <strong>أفضل مناطق للإيجار بسعر معقول:</strong><br>` +
        `الجمهورية، الخندق، الحيانية<br><br>` +
        `⚠️ <strong>نصيحة:</strong> اكتب عقد إيجار رسمي وتأكد من فاتورة الكهرباء.<br><br>` +
        `<em>أي منطقة تفضل؟ قلّي وأعطيك أسعارها بالتفصيل!</em>`;
    }

    if (intent === 'invest') {
      return `📈 <strong>أفضل فرص الاستثمار العقاري في البصرة:</strong><br><br>` +
        `🥇 <strong>الأكثر نمواً:</strong> الزبير، أم قصر، القرنة<br>` +
        `🥈 <strong>عائد إيجاري ممتاز:</strong> العشار (محلات تجارية 8-12% سنوياً)<br>` +
        `🥉 <strong>أراضي واعدة:</strong> قرب مشاريع حكومية جديدة<br><br>` +
        `💡 <strong>نصائح المستثمر الذكي:</strong><br>` +
        `✅ الأراضي قرب المشاريع الحكومية = ربح رأسمالي ممتاز<br>` +
        `✅ المحلات في العشار = دخل شهري ثابت<br>` +
        `❌ تجنب الأراضي المتنازع عليها أو على أراضي دولة<br><br>` +
        `<em>تريد تفاصيل منطقة بعينها؟</em>`;
    }

    if (intent === 'sell') {
      return `📢 <strong>تريد تبيع عقارك؟</strong><br><br>` +
        `${CONFIG.SITE_NAME} هو الدليل الأول للعقارات في البصرة! 🌟<br><br>` +
        `📋 <strong>باقاتنا للمعلنين:</strong><br>` +
        `🆓 <strong>المجانية:</strong> 3 إعلانات نشطة<br>` +
        `🥈 <strong>الفضية:</strong> 15 إعلان/شهر + تمييز<br>` +
        `🥇 <strong>الذهبية:</strong> غير محدود + تصدر النتائج<br><br>` +
        `<a href="${CONFIG.PACKAGES_URL}" style="color:var(--gold,#c9a84c);font-weight:700;">← عرض الباقات</a> | ` +
        `<a href="${CONFIG.REGISTER_URL}" style="color:var(--gold,#c9a84c);font-weight:700;">سجّل الآن ←</a><br><br>` +
        `<em>تريد نصيحة عن السعر المناسب لعقارك؟ أخبرني عن المنطقة!</em>`;
    }

    if (intent === 'advice') {
      return `💡 <strong>نصيحة داهية:</strong><br><br>` +
        `أخبرني أكثر عن احتياجك:<br>` +
        `• <strong>للسكن:</strong> البراضعية والجزيرة للعائلات الكبيرة، الجمهورية والمعقل للمتوسط<br>` +
        `• <strong>للاستثمار:</strong> الزبير وأم قصر لنمو رأس المال<br>` +
        `• <strong>للإيجار الرخيص:</strong> الحيانية والخندق<br><br>` +
        `<em>قلّي ميزانيتك والغرض وأعطيك توصية مخصصة!</em>`;
    }

    if (intent === 'price') {
      return `💰 <strong>دليل الأسعار في البصرة (2024-2025):</strong><br><br>` +
        `🏠 <strong>بيع:</strong><br>` +
        `• شقة (100-150م²): 50-150 مليون<br>` +
        `• بيت طابق (150-200م²): 80-250 مليون<br>` +
        `• بيت طابقين: 150-450 مليون<br>` +
        `• فيلا (300م²+): 300M - مليار<br>` +
        `• قطعة أرض: 30-200 مليون<br><br>` +
        `🔑 <strong>إيجار شهري:</strong><br>` +
        `• شقة صغيرة: 100-250 ألف<br>` +
        `• شقة متوسطة: 200-400 ألف<br>` +
        `• بيت كامل: 300-800 ألف<br><br>` +
        `<em>أخبرني عن المنطقة وأعطيك سعر دقيق!</em>`;
    }

    // عام / غير معروف
    return replyGeneral(txt);
  }

  function replyGeneral(txt) {
    const replies = [
      `🤔 سؤال وجيه! للأسف ما فهمت بالضبط شو تقصد. حاول تسألني عن:<br>• منطقة معينة في البصرة (مثال: "أسعار العشار")<br>• نوع العملية: شراء، إيجار، أو استثمار<br>• نصيحة عقارية عامة`,
      `🏠 أنا متخصص بعقارات البصرة فقط. اسألني مثلاً:<br>• "بيت للبيع في البراضعية بكم؟"<br>• "أفضل منطقة للاستثمار؟"<br>• "كم إيجار شقة في الجمهورية؟"`,
      `💬 مو واضح عليّ السؤال! جرب تسألني بشكل أوضح، مثلاً:<br>• اذكر المنطقة (العشار، الزبير، الجمهورية...)<br>• اذكر نوع الطلب (شراء / إيجار / استثمار)`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  /* ============================================================
     🎯 الدالة الرئيسية: توليد الرد
     ============================================================ */
  function generateReply(txt, history) {
    const intent = detectIntent(txt);
    const area   = detectArea(txt);
    const prop   = detectPropertyType(txt);

    // تحية
    if (intent === 'greet') return replyGreet();

    // إذا وجدنا منطقة → رد مخصص
    if (area) return replyWithArea(area, intent, prop);

    // بدون منطقة → رد عام حسب النية
    return replyWithoutArea(intent, txt);
  }

  /* ============================================================
     1) حقن CSS
     ============================================================ */
  const style = document.createElement('style');
  style.textContent = `
    .ai-chat-widget {
      position: fixed; bottom: 25px; left: 25px; z-index: 9999;
      display: flex; flex-direction: column; align-items: flex-start;
      font-family: 'Cairo', 'Segoe UI', sans-serif;
    }
    .ai-chat-btn {
      width: auto; padding: 0 18px; height: 46px; border-radius: 30px;
      background: linear-gradient(135deg, var(--gold,#c9a84c), var(--gold-dark,#a07830));
      color: var(--navy,#0a1628); border: 2px solid rgba(255,255,255,0.25);
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45); transition: transform .25s, box-shadow .25s;
    }
    .ai-chat-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.55); }
    .ai-chat-btn .pulse-dot {
      width: 8px; height: 8px; background: #22c55e;
      border-radius: 50%; animation: ai-pulse 1.8s infinite;
    }
    @keyframes ai-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.6} }

    .ai-chat-window {
      width: 350px; height: 510px;
      background: var(--navy-mid,#0f2040);
      border: 1.5px solid var(--gold,#c9a84c); border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,.6);
      display: none; flex-direction: column; overflow: hidden;
      margin-bottom: 12px; animation: ai-slideUp .25s ease;
    }
    .ai-chat-window.active { display: flex !important; }
    @keyframes ai-slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

    .ai-chat-header {
      background: linear-gradient(135deg,var(--navy,#0a1628),var(--navy-light,#1a3050));
      border-bottom: 1px solid rgba(201,168,76,.25);
      padding: 11px 14px; display: flex; align-items: center;
      justify-content: space-between; flex-shrink: 0;
    }
    .ai-chat-header-info { display:flex; align-items:center; gap:9px; }
    .ai-chat-avatar {
      width:34px; height:34px; border-radius:50%;
      background: linear-gradient(135deg,var(--gold,#c9a84c),#8B6914);
      display:flex; align-items:center; justify-content:center;
      font-size:17px; flex-shrink:0;
    }
    .ai-chat-header-name  { font-size:12.5px; font-weight:700; color:var(--gold,#c9a84c); }
    .ai-chat-header-status{ font-size:10px; color:#22c55e; display:flex; align-items:center; gap:4px; }
    .ai-chat-header-status::before { content:''; width:6px; height:6px; background:#22c55e; border-radius:50%; display:inline-block; }
    .ai-chat-close-btn {
      background:transparent; border:none; color:rgba(255,255,255,.4);
      cursor:pointer; font-size:18px; line-height:1; padding:2px 6px;
      border-radius:4px; transition:.2s;
    }
    .ai-chat-close-btn:hover { color:#fff; background:rgba(255,255,255,.1); }

    .ai-chat-body {
      flex:1; padding:12px; overflow-y:auto;
      display:flex; flex-direction:column; gap:10px;
      background:rgba(8,18,35,.4);
      scrollbar-width:thin; scrollbar-color:rgba(201,168,76,.3) transparent;
    }
    .ai-chat-body::-webkit-scrollbar{ width:4px; }
    .ai-chat-body::-webkit-scrollbar-thumb{ background:rgba(201,168,76,.3); border-radius:4px; }

    .ai-msg { max-width:88%; padding:9px 13px; border-radius:12px; font-size:13px; line-height:1.7; word-break:break-word; direction:rtl; text-align:right; }
    .ai-msg.bot { background:rgba(255,255,255,.06); color:rgba(255,255,255,.9); align-self:flex-start; border-right:3px solid var(--gold,#c9a84c); border-bottom-left-radius:4px; }
    .ai-msg.user { background:linear-gradient(135deg,var(--gold,#c9a84c),#a07830); color:var(--navy,#0a1628); align-self:flex-end; font-weight:600; border-bottom-right-radius:4px; }
    .ai-msg a { color:var(--gold,#c9a84c); }

    .ai-typing { display:flex; align-items:center; gap:5px; align-self:flex-start; padding:10px 14px; background:rgba(255,255,255,.06); border-right:3px solid var(--gold,#c9a84c); border-radius:12px; border-bottom-left-radius:4px; }
    .ai-typing span { width:7px; height:7px; background:var(--gold,#c9a84c); border-radius:50%; animation:ai-bounce 1.2s infinite; }
    .ai-typing span:nth-child(2){ animation-delay:.2s; }
    .ai-typing span:nth-child(3){ animation-delay:.4s; }
    @keyframes ai-bounce{ 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    .ai-suggestions { display:flex; flex-wrap:wrap; gap:6px; padding:8px 12px; background:rgba(8,18,35,.3); border-top:1px solid rgba(201,168,76,.1); flex-shrink:0; }
    .ai-suggestion-btn {
      background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.3);
      color:var(--gold,#c9a84c); padding:4px 10px; border-radius:20px;
      font-size:11px; cursor:pointer; font-family:'Cairo',sans-serif;
      transition:.2s; white-space:nowrap;
    }
    .ai-suggestion-btn:hover { background:rgba(201,168,76,.25); border-color:var(--gold,#c9a84c); }

    .ai-promo-banner {
      margin:4px 0; padding:10px 12px;
      background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.05));
      border:1px solid rgba(201,168,76,.35); border-radius:10px;
      align-self:flex-start; font-size:12px; color:rgba(255,255,255,.85);
      direction:rtl; text-align:right; max-width:88%;
    }
    .ai-promo-banner strong { color:var(--gold,#c9a84c); }
    .ai-promo-link {
      display:inline-block; margin-top:6px;
      background:var(--gold,#c9a84c); color:var(--navy,#0a1628);
      padding:4px 12px; border-radius:20px; font-size:11px;
      font-weight:700; text-decoration:none; transition:.2s;
    }
    .ai-promo-link:hover { opacity:.85; }

    .ai-chat-footer {
      padding:9px 10px; background:var(--navy,#0a1628);
      border-top:1px solid rgba(201,168,76,.15);
      display:flex; gap:7px; flex-shrink:0; align-items:center;
    }
    .ai-chat-input {
      flex:1; background:rgba(255,255,255,.06);
      border:1px solid rgba(201,168,76,.2); border-radius:8px;
      padding:8px 13px; color:#fff; font-family:'Cairo',sans-serif;
      font-size:13px; outline:none; direction:rtl; transition:border-color .2s;
    }
    .ai-chat-input:focus { border-color:var(--gold,#c9a84c); }
    .ai-chat-input::placeholder { color:rgba(255,255,255,.3); }
    .ai-chat-send {
      background:linear-gradient(135deg,var(--gold,#c9a84c),#a07830);
      border:none; color:var(--navy,#0a1628);
      width:38px; height:38px; border-radius:8px;
      cursor:pointer; display:flex; align-items:center;
      justify-content:center; font-size:16px; flex-shrink:0; transition:opacity .2s;
    }
    .ai-chat-send:hover { opacity:.85; }
    .ai-chat-send:disabled { opacity:.4; cursor:not-allowed; }

    @media (max-width:700px) {
      .ai-chat-window { width:300px; height:440px; }
      .ai-chat-widget { bottom:15px; left:12px; }
    }
  `;
  document.head.appendChild(style);

  /* ============================================================
     2) حقن HTML
     ============================================================ */
  const widget = document.createElement('div');
  widget.className = 'ai-chat-widget';
  widget.innerHTML = `
    <div class="ai-chat-window" id="aiChatWindow">
      <div class="ai-chat-header">
        <div class="ai-chat-header-info">
          <div class="ai-chat-avatar">🧠</div>
          <div>
            <div class="ai-chat-header-name">داهية — المستشار العقاري</div>
            <div class="ai-chat-header-status">متصل · خبير عقارات البصرة</div>
          </div>
        </div>
        <button id="aiChatCloseBtn" class="ai-chat-close-btn">✕</button>
      </div>

      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">
          أهلاً وسهلاً! 🌴 أنا <strong>داهية</strong>، مستشارك العقاري الذكي المتخصص في سوق البصرة.<br><br>
          سواء تريد تشتري، تستأجر، تستثمر، أو تبيع — اسألني وأنا بالخدمة! 🏠💰
        </div>
      </div>

      <div class="ai-suggestions" id="aiSuggestions">
        <button class="ai-suggestion-btn" data-msg="أسعار البيوت في العشار">🏠 أسعار العشار</button>
        <button class="ai-suggestion-btn" data-msg="أفضل مناطق الاستثمار في البصرة">📈 أفضل للاستثمار</button>
        <button class="ai-suggestion-btn" data-msg="كم إيجار شقة في الجمهورية">🔑 إيجار الجمهورية</button>
        <button class="ai-suggestion-btn" data-msg="نصائح قبل شراء عقار في البصرة">💡 نصائح الشراء</button>
        <button class="ai-suggestion-btn" data-msg="أريد أبيع عقاري في البصرة">📢 أعلن عن عقارك</button>
      </div>

      <div class="ai-chat-footer">
        <input type="text" id="aiChatInput" class="ai-chat-input"
               placeholder="اسأل داهية... مثال: بيت في البراضعية بكم؟">
        <button id="aiChatSendBtn" class="ai-chat-send"><i class="ti ti-send"></i></button>
      </div>
    </div>

    <button class="ai-chat-btn" id="aiChatToggleBtn">
      <span class="pulse-dot"></span>
      🧠 داهية — المستشار العقاري
    </button>
  `;
  document.body.appendChild(widget);

  /* ============================================================
     3) الحالة الداخلية
     ============================================================ */
  let conversationHistory = [];
  let messageCount        = 0;
  let promoShown          = false;
  let isWaiting           = false;

  /* ============================================================
     4) الدوال المساعدة
     ============================================================ */
  function appendMessage(html, role) {
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = 'ai-typing'; div.id = 'aiTypingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('aiTypingIndicator');
    if (t) t.remove();
  }

  function showPromoBanner() {
    if (promoShown) return;
    promoShown = true;
    const body = document.getElementById('aiChatBody');
    const div  = document.createElement('div');
    div.className = 'ai-promo-banner';
    div.innerHTML = `
      ✨ <strong>هل تريد الإعلان عن عقارك؟</strong><br>
      انضم إلى <strong>${CONFIG.SITE_NAME}</strong> — الدليل الأول للعقارات في البصرة.
      باقات تبدأ من المجاني وصولاً للذهبية مع تمييز كامل!<br>
      <a href="${CONFIG.PACKAGES_URL}" class="ai-promo-link">📋 عرض الباقات</a>
      <a href="${CONFIG.REGISTER_URL}" class="ai-promo-link" style="margin-right:6px;">✍️ سجّل الآن</a>
    `;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function setInputState(enabled) {
    const input = document.getElementById('aiChatInput');
    const btn   = document.getElementById('aiChatSendBtn');
    if (input) input.disabled = !enabled;
    if (btn)   btn.disabled   = !enabled;
  }

  /* ============================================================
     5) إرسال الرسالة والرد المحلي
     ============================================================ */
  function sendAiMessage() {
    if (isWaiting) return;
    const input = document.getElementById('aiChatInput');
    const txt   = input.value.trim();
    if (!txt) return;

    appendMessage(txt, 'user');
    input.value = '';
    messageCount++;

    // إخفاء الاقتراحات بعد أول رسالة
    const sugg = document.getElementById('aiSuggestions');
    if (sugg) sugg.style.display = 'none';

    conversationHistory.push({ role: 'user', content: txt });

    isWaiting = true;
    setInputState(false);
    showTyping();

    // تأخير طبيعي يوهم بالتفكير
    const delay = CONFIG.TYPING_DELAY_MIN +
      Math.random() * (CONFIG.TYPING_DELAY_MAX - CONFIG.TYPING_DELAY_MIN);

    setTimeout(() => {
      hideTyping();

      const reply = generateReply(txt, conversationHistory);
      conversationHistory.push({ role: 'assistant', content: reply });
      appendMessage(reply, 'bot');

      if (messageCount >= CONFIG.PROMO_AFTER_MSGS && !promoShown) {
        setTimeout(showPromoBanner, 700);
      }

      isWaiting = false;
      setInputState(true);
      document.getElementById('aiChatInput')?.focus();
    }, delay);
  }

  /* ============================================================
     6) فتح/إغلاق
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
  document.getElementById('aiChatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); }
  });
  document.getElementById('aiSuggestions').addEventListener('click', function(e) {
    const btn = e.target.closest('.ai-suggestion-btn');
    if (!btn) return;
    const input = document.getElementById('aiChatInput');
    if (input) { input.value = btn.dataset.msg || ''; sendAiMessage(); }
  });

  /* ============================================================
     8) تصدير للاستخدام الخارجي
     ============================================================ */
  window.toggleAiChat  = toggleAiChat;
  window.sendAiMessage = sendAiMessage;

})();
