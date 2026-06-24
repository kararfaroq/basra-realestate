/* ============================================================
   ai-advisor.js
   المستشار العقاري الذكي — مكوّن مستقل بالكامل عن ملف الواجهة.

   لماذا فُصل هذا الملف؟
   - ملف الواجهة (index.html) يبقى خفيفاً وسريع التحميل.
   - أي تعديل/تطوير لاحق على منطق الذكاء الاصطناعي (مثلاً ربطه
     بـ API حقيقي بدل الرد التجريبي) يتم هنا فقط، دون لمس الواجهة
     أو المخاطرة بكسرها.
   - تعطيل الميزة بالكامل = حذف سطر واحد فقط من index.html:
     <script src="ai-advisor.js" defer></script>

   هذا الملف يقوم بـ 3 أشياء عند تحميله:
   1) حقن تنسيقات CSS الخاصة بالودجة في <head>.
   2) حقن بنية HTML الخاصة بالودجة في نهاية <body>.
   3) تعريف منطق التفاعل (فتح/إغلاق النافذة، إرسال الرسائل).
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1) حقن التنسيقات ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .ai-chat-widget { position: fixed; bottom: 25px; left: 25px; z-index: 999; display: flex; flex-direction: column; align-items: flex-start; }
    .ai-chat-btn { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--navy); border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.4); transition: 0.3s; }
    .ai-chat-btn:hover { transform: scale(1.08) rotate(5deg); }

    .ai-chat-window { width: 340px; height: 450px; background: var(--navy-mid); border: 2px solid var(--gold); border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: none; flex-direction: column; overflow: hidden; margin-bottom: 12px; transition: 0.3s; }
    .ai-chat-window.active { display: flex !important; }

    .ai-chat-header { background: linear-gradient(135deg, var(--navy), var(--navy-light)); border-bottom: 1px solid rgba(201,168,76,0.2); padding: 12px; display: flex; align-items: center; justify-content: space-between; }
    .ai-chat-body { flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: rgba(10,22,40,0.3); }
    .ai-msg { max-width: 85%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.5; }
    .ai-msg.bot { background: rgba(255,255,255,0.06); color: var(--text-on-dark); align-self: flex-start; border-right: 3px solid var(--gold); }
    .ai-msg.user { background: var(--gold); color: var(--navy); align-self: flex-end; font-weight: 600; }
    .ai-chat-footer { padding: 8px; background: var(--navy); border-top: 1px solid rgba(201,168,76,0.15); display: flex; gap: 6px; }
    .ai-chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.2); border-radius: 6px; padding: 8px 12px; color: #fff; font-family: 'Cairo', sans-serif; font-size: 13px; outline: none; }
    .ai-chat-input:focus { border-color: var(--gold); }
    .ai-chat-send { background: var(--gold); border: none; color: var(--navy); width: 36px; height: 36px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }

    @media (max-width: 700px) {
      .ai-chat-window { width: 290px; height: 400px; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- 2) حقن بنية HTML ---------- */
  const widget = document.createElement('div');
  widget.className = 'ai-chat-widget';
  widget.innerHTML = `
    <div class="ai-chat-window" id="aiChatWindow">
      <div class="ai-chat-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:10px; height:10px; background:var(--success); border-radius:50%;"></div>
          <span style="font-size:13px; font-weight:700; color:var(--gold);">🧠 المستشار العقاري الذكي (الخبير)</span>
        </div>
        <button id="aiChatCloseBtn" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
      </div>
      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">مرحباً بك في دليل البصرة العقاري! 🌴 أنا مستشارك الذكي الشخصي. اكتب لي ماذا تبحث عنه (مثال: "أبحث عن بيت في العشار" أو "شقة إيجار") وسأقوم بالبحث والرد عليك فريّع! 🤖✨</div>
      </div>
      <div class="ai-chat-footer">
        <input type="text" id="aiChatInput" class="ai-chat-input" placeholder="اسأل المستشار، مثال: شقة في الجمهورية...">
        <button id="aiChatSendBtn" class="ai-chat-send"><i class="ti ti-send"></i></button>
      </div>
    </div>
    <button class="ai-chat-btn" id="aiChatToggleBtn" style="width: auto; padding: 0 20px; border-radius: 30px; font-size: 13px; font-weight: bold; white-space: nowrap;">✨ المستشار العقاري الذكي</button>
  `;
  document.body.appendChild(widget);

  /* ---------- 3) منطق التفاعل ---------- */
  function toggleAiChat() {
    const win = document.getElementById('aiChatWindow');
    if (win) win.classList.toggle('active');
  }

  function sendAiMessage() {
    const input = document.getElementById('aiChatInput');
    const txt = input.value.trim();
    if (!txt) return;

    const body = document.getElementById('aiChatBody');
    body.innerHTML += `<div class="ai-msg user">${txt}</div>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;

    // ملاحظة: هذا رد تجريبي ثابت حالياً (محاكاة).
    // عند ربط الميزة بنموذج ذكاء اصطناعي حقيقي، يكفي تعديل هذه الدالة فقط
    // (استبدال setTimeout بطلب fetch إلى الـ API) دون لمس باقي الملفات.
    setTimeout(() => {
      const reply = `أهلاً بك! لقد استلمت طلبك بخصوص "${txt}". جاري البحث عن أفضل اللقطات والعروض المتوفرة حالياً في مناطق البصرة وتصفيتها لك أستاذ.`;
      body.innerHTML += `<div class="ai-msg bot">${reply}</div>`;
      body.scrollTop = body.scrollHeight;
    }, 600);
  }

  /* ---------- ربط الأحداث (بدون الاعتماد على onclick داخل HTML) ---------- */
  document.getElementById('aiChatToggleBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatCloseBtn').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatSendBtn').addEventListener('click', sendAiMessage);
  document.getElementById('aiChatInput').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') sendAiMessage();
  });

  // إتاحة الدالتين بشكل عام في حال احتاج كود خارجي استدعاءهما يدوياً
  window.toggleAiChat = toggleAiChat;
  window.sendAiMessage = sendAiMessage;
})();
