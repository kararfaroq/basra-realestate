/* ============================================================
   ai-advisor.js  v2.0
   داهية العقارات البصراوية — مدعوم بـ Claude AI حقيقي

   ما الجديد في v2؟
   - ردود من Claude AI حقيقي (مو setTimeout وهمي)
   - شخصية "أبو علي" — داهية عقاري بصراوي
   - يعرف أسعار مناطق البصرة
   - يفهم طلبات المستخدم ويصفي العقارات
   - يعطي نصايح شراء/إيجار/استثمار
   - يسوق للموقع والاشتراكات بذكاء
   - تاريخ المحادثة محفوظ خلال الجلسة
   - مؤشر "يكتب..." أثناء انتظار الرد
   - رسائل ترحيب سريعة (Quick Replies)
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     A) CSS
  ============================================================ */
  const style = document.createElement('style');
  style.textContent = `
    /* --- Widget Container --- */
    .ai-chat-widget {
      position: fixed;
      bottom: 25px;
      left: 25px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      font-family: 'Cairo', 'Segoe UI', sans-serif;
    }

    /* --- Toggle Button --- */
    .ai-chat-btn {
      padding: 0 20px;
      height: 48px;
      border-radius: 30px;
      background: linear-gradient(135deg, var(--gold, #C9A84C), var(--gold-dark, #a07830));
      color: var(--navy, #0a1628);
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
      transition: transform 0.25s, box-shadow 0.25s;
      white-space: nowrap;
    }
    .ai-chat-btn:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.55); }
    .ai-chat-btn .pulse-dot {
      width: 9px; height: 9px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulseDot 1.6s ease-in-out infinite;
    }
    @keyframes pulseDot {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:.4; transform:scale(1.5); }
    }

    /* --- Chat Window --- */
    .ai-chat-window {
      width: 360px;
      height: 490px;
      background: var(--navy-mid, #0d1f3c);
      border: 1.5px solid var(--gold, #C9A84C);
      border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      display: none;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 12px;
      animation: slideUp 0.25s ease;
    }
    .ai-chat-window.active { display: flex; }
    @keyframes slideUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* --- Header --- */
    .ai-chat-header {
      background: linear-gradient(135deg, var(--navy, #0a1628) 0%, var(--navy-light, #1a3050) 100%);
      border-bottom: 1px solid rgba(201,168,76,0.25);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .ai-chat-header .advisor-info { display:flex; align-items:center; gap:10px; }
    .ai-chat-header .advisor-avatar {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, var(--gold,#C9A84C), #8B6914);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .ai-chat-header .advisor-name { font-size:13px; font-weight:700; color:var(--gold,#C9A84C); }
    .ai-chat-header .advisor-status { font-size:10px; color:#22c55e; display:flex; align-items:center; gap:4px; margin-top:1px; }
    .ai-chat-header .advisor-status::before { content:''; display:block; width:6px; height:6px; background:#22c55e; border-radius:50%; }
    .ai-close-btn {
      background: transparent; border: none;
      color: rgba(255,255,255,0.4); cursor: pointer;
      font-size: 18px; line-height:1;
      transition: color 0.2s;
    }
    .ai-close-btn:hover { color: rgba(255,255,255,0.8); }

    /* --- Message Body --- */
    .ai-chat-body {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(8,18,35,0.4);
      scroll-behavior: smooth;
    }
    .ai-chat-body::-webkit-scrollbar { width:4px; }
    .ai-chat-body::-webkit-scrollbar-track { background: transparent; }
    .ai-chat-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius:2px; }

    /* --- Messages --- */
    .ai-msg {
      max-width: 88%;
      padding: 9px 13px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.65;
      word-break: break-word;
    }
    .ai-msg.bot {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.9);
      align-self: flex-start;
      border-right: 3px solid var(--gold,#C9A84C);
      border-bottom-right-radius: 4px;
    }
    .ai-msg.user {
      background: linear-gradient(135deg, var(--gold,#C9A84C), #a07830);
      color: var(--navy,#0a1628);
      align-self: flex-end;
      font-weight: 600;
      border-bottom-left-radius: 4px;
    }

    /* --- Typing Indicator --- */
    .ai-typing {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 9px 14px;
      background: rgba(255,255,255,0.07);
      border-right: 3px solid var(--gold,#C9A84C);
      border-radius: 12px;
      border-bottom-right-radius: 4px;
      align-self: flex-start;
      width: fit-content;
    }
    .ai-typing span {
      width: 7px; height: 7px;
      background: var(--gold,#C9A84C);
      border-radius: 50%;
      animation: typingBounce 1.2s ease-in-out infinite;
      opacity: 0.6;
    }
    .ai-typing span:nth-child(2) { animation-delay:.2s; }
    .ai-typing span:nth-child(3) { animation-delay:.4s; }
    @keyframes typingBounce {
      0%,80%,100% { transform:translateY(0); opacity:.6; }
      40%          { transform:translateY(-6px); opacity:1; }
    }

    /* --- Quick Replies --- */
    .ai-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 14px 10px;
      flex-shrink: 0;
    }
    .ai-quick-btn {
      background: rgba(201,168,76,0.12);
      border: 1px solid rgba(201,168,76,0.35);
      color: var(--gold,#C9A84C);
      padding: 5px 11px;
      border-radius: 20px;
      font-size: 11.5px;
      font-family: 'Cairo', sans-serif;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .ai-quick-btn:hover {
      background: rgba(201,168,76,0.25);
      transform: scale(1.04);
    }

    /* --- Footer --- */
    .ai-chat-footer {
      padding: 10px;
      background: var(--navy,#0a1628);
      border-top: 1px solid rgba(201,168,76,0.15);
      display: flex;
      gap: 7px;
      flex-shrink: 0;
    }
    .ai-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1.5px solid rgba(201,168,76,0.2);
      border-radius: 8px;
      padding: 9px 13px;
      color: #fff;
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ai-chat-input::placeholder { color: rgba(255,255,255,0.3); }
    .ai-chat-input:focus { border-color: var(--gold,#C9A84C); }
    .ai-chat-send {
      background: linear-gradient(135deg, var(--gold,#C9A84C), #a07830);
      border: none;
      color: var(--navy,#0a1628);
      width: 40px; height: 40px;
      border-radius: 8px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      transition: transform 0.2s, opacity 0.2s;
      flex-shrink: 0;
    }
    .ai-chat-send:hover { transform: scale(1.08); }
    .ai-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    /* --- Error Message --- */
    .ai-error-msg {
      font-size: 11px;
      color: #f87171;
      text-align: center;
      padding: 4px 0;
      display: none;
    }

    @media (max-width: 700px) {
      .ai-chat-window { width: 300px; height: 430px; }
      .ai-chat-widget { bottom: 15px; left: 15px; }
    }
  `;
  document.head.appendChild(style);


  /* ============================================================
     B) HTML
  ============================================================ */
  const widget = document.createElement('div');
  widget.className = 'ai-chat-widget';
  widget.innerHTML = `
    <div class="ai-chat-window" id="aiChatWindow">

      <div class="ai-chat-header">
        <div class="advisor-info">
          <div class="advisor-avatar">🧠</div>
          <div>
            <div class="advisor-name">أبو علي — داهية العقارات</div>
            <div class="advisor-status">متصل ومستعد يساعدك</div>
          </div>
        </div>
        <button class="ai-close-btn" id="aiChatCloseBtn">✕</button>
      </div>

      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">
          هلا والله! أنا أبو علي، داهية العقارات بالبصرة 🌴<br>
          عندي خبرة بكل منطقة — من العشار للحيانية، ومن الجنينة للبراضعية 🏘️<br><br>
          كولي شتريد: بيت، شقة، أرض، للشراء أو الإيجار، وأنا أوريك الصح! 💪
        </div>
      </div>

      <div class="ai-quick-replies" id="aiQuickReplies">
        <button class="ai-quick-btn">🏠 بيت للشراء</button>
        <button class="ai-quick-btn">🏢 شقة للإيجار</button>
        <button class="ai-quick-btn">📊 أسعار العشار</button>
        <button class="ai-quick-btn">💰 نصيحة استثمار</button>
        <button class="ai-quick-btn">🌍 أحسن منطقة؟</button>
      </div>

      <div class="ai-error-msg" id="aiErrorMsg">⚠️ ما قدرنا نوصلك بالمستشار، اجرب ثاني</div>

      <div class="ai-chat-footer">
        <input type="text" id="aiChatInput" class="ai-chat-input" placeholder="مثال: أبي شقة إيجار بالجمهورية...">
        <button id="aiChatSendBtn" class="ai-chat-send">
          <i class="ti ti-send" style="font-size:16px;"></i>
        </button>
      </div>

    </div>

    <button class="ai-chat-btn" id="aiChatToggleBtn">
      <span class="pulse-dot"></span>
      ✨ داهية العقارات
    </button>
  `;
  document.body.appendChild(widget);


  /* ============================================================
     C) LOGIC
  ============================================================ */

  // --- Conversation History (يحفظ المحادثة خلال الجلسة) ---
  const conversationHistory = [];

  // --- System Prompt لشخصية أبو علي ---
  const SYSTEM_PROMPT = `أنت "أبو علي"، داهية العقارات في مدينة البصرة، العراق.
شخصيتك: ودود، ذكي، صادق، تتكلم بالعامية البصراوية الدارجة بس بشكل محترم.
دورك: مستشار عقاري متخصص بسوق البصرة فقط.

=== معلوماتك عن سوق البصرة (2024-2025) ===

أسعار الشراء (تقريبية بالمليون دينار):
- العشار (وسط البصرة): بيوت 150-400م² = 150-500 مليون | شقق = 80-200 مليون
- المعقل: بيوت = 120-350 مليون | شقق = 60-150 مليون
- البراضعية: بيوت = 80-200 مليون | شقق = 40-100 مليون
- حي الحسين / الجمهورية: بيوت = 100-280 مليون | شقق = 50-130 مليون
- الحيانية: بيوت = 70-180 مليون | أراضي = 30-80 مليون (قطعة)
- الجنينة: بيوت = 60-160 مليون | مناسبة للعوائل
- الزبير: أراضي = 20-60 مليون | بيوت = 50-130 مليون
- أبو الخصيب: مناطق هادية، بيوت = 50-120 مليون
- الفاو: أسعار أقل، استثمار مستقبلي

أسعار الإيجار (شهري بالألف دينار):
- العشار: شقة = 200-500 ألف | بيت = 350-800 ألف
- المعقل: شقة = 150-400 ألف | بيت = 250-600 ألف
- الجمهورية/الحسين: شقة = 120-300 ألف | بيت = 200-500 ألف
- البراضعية/الحيانية: شقة = 80-200 ألف | بيت = 150-350 ألف

نصايح عامة للسوق:
- أحسن مناطق للاستثمار: العشار، المعقل، الجنينة
- أحسن مناطق للعوائل: الجنينة، أبو الخصيب، البراضعية
- أحسن مناطق للشباب والإيجار: الجمهورية، حي الحسين
- السوق الحالي: طلب عالي على الشقق المتوسطة
- أسعار الأراضي ترتفع خصوصاً قرب المشاريع الحكومية

=== قواعد الرد ===
1. اتكلم بالعامية البصراوية دايماً (مثل: شتريد، وين تسكن، هم-زين، لا بأس، والله، يخوي، حبيبي)
2. اسأل عن ميزانية المستخدم وعدد الغرف إذا ما ذكرهم
3. اعطي أسعار واقعية من المعلومات اللي عندك
4. نصف رسالة كل فترة اذكر الموقع كمصدر للعقارات ("شايل عروض زينة بالموقع يخوي، ورح تلاكي أحسن من هذا!")
5. إذا سأل عن منطقة ما عندك معلومات عنها، قول بصراحة وانصحه بأقرب منطقة
6. خلي ردودك قصيرة ومركزة (مو أطول من 120 كلمة)
7. استخدم الإيموجي باعتدال 🏠💰
8. إذا كان الطلب غير واضح، اسأله سؤال واحد لتوضيح الطلب
9. لا تعطي معلومات خارج العقارات والبصرة`;

  // --- Toggle Window ---
  function toggleAiChat() {
    const win = document.getElementById('aiChatWindow');
    if (win) win.classList.toggle('active');
  }

  // --- Scroll to bottom ---
  function scrollToBottom() {
    const body = document.getElementById('aiChatBody');
    if (body) body.scrollTop = body.scrollHeight;
  }

  // --- Add Message to UI ---
  function addMessage(text, role) {
    const body = document.getElementById('aiChatBody');
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    // دعم줄 line breaks
    div.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(div);
    scrollToBottom();
    return div;
  }

  // --- Show/Hide Typing Indicator ---
  function showTyping() {
    const body = document.getElementById('aiChatBody');
    const typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.id = 'aiTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    const t = document.getElementById('aiTypingIndicator');
    if (t) t.remove();
  }

  // --- Show/Hide Error ---
  function showError(show) {
    const el = document.getElementById('aiErrorMsg');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  // --- Send Message to Claude API ---
  async function sendAiMessage(userText) {
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSendBtn');
    const quickReplies = document.getElementById('aiQuickReplies');

    const txt = (userText || input.value).trim();
    if (!txt) return;

    // إخفاء Quick Replies بعد أول رسالة
    if (quickReplies) quickReplies.style.display = 'none';

    // إضافة رسالة المستخدم للواجهة
    addMessage(txt, 'user');
    if (input) input.value = '';

    // تعطيل الإدخال أثناء الانتظار
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    showError(false);

    // إضافة رسالة المستخدم للتاريخ
    conversationHistory.push({ role: 'user', content: txt });

    // عرض مؤشر الكتابة
    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationHistory
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const replyText = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');

      // إضافة رد المستشار للتاريخ والواجهة
      conversationHistory.push({ role: 'assistant', content: replyText });
      hideTyping();
      addMessage(replyText, 'bot');

    } catch (err) {
      hideTyping();
      showError(true);
      console.error('AI Advisor Error:', err);
      // إزالة آخر رسالة مستخدم من التاريخ لإعادة المحاولة
      conversationHistory.pop();
    } finally {
      if (input) input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  }


  /* ============================================================
     D) Event Listeners
  ============================================================ */
  document.getElementById('aiChatToggleBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatCloseBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatSendBtn').addEventListener('click', () => sendAiMessage());
  document.getElementById('aiChatInput').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') sendAiMessage();
  });

  // Quick Reply Buttons
  document.getElementById('aiQuickReplies').addEventListener('click', function (e) {
    const btn = e.target.closest('.ai-quick-btn');
    if (btn) sendAiMessage(btn.textContent.trim());
  });

  // إتاحة الدوال للاستخدام الخارجي
  window.toggleAiChat = toggleAiChat;
  window.sendAiMessage = sendAiMessage;

})();
