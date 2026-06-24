// =========================================================================
// 🔒 نظام الحماية، الرتب وتتبع الجلسات الحالية (Authentication Engine)
// =========================================================================

if (typeof sendPrompt !== 'function') {
  window.sendPrompt = function(message) {
    console.log("إشعار الإجراء: " + message);
  };
}

// الذاكرة المؤقتة للبيانات الحية المجلوبة
let siteData = { listings: [], offices: [] };

// جلب الرتبة المخزنة في المتصفح تلقائياً (الافتراضي هو زائر guest)
let currentUser = JSON.parse(localStorage.getItem('basra_user')) || { role: 'guest', username: 'زائر' };

document.addEventListener('DOMContentLoaded', () => {
  // تحديث مظهر شريط التنقل بناءً على حالة تسجيل الدخول الحالية
  updateAuthNavbar();
  
  // جلب البيانات الأساسية من السيرفر وضخها في التصميم
  loadRealData();
  
  // تشغيل عداد المجتمع الرقمي الثابت
  setTimeout(() => {
    animateCount('count-members', 100000, '+');
  }, 400);
});

// =========================================================================
// 🌐 جلب واستقبال البيانات الحية وضخها في القوالب (UI Renderer)
// =========================================================================

async function loadRealData() {
  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('فشل جلب البيانات من السيرفر');
    
    const data = await response.json();
    siteData = data;
    renderDataToUI(siteData);

  } catch (error) {
    console.error('Error fetching data:', error);
    
    // [وضع محاكاة الأوفلاين الذكي]: لتجربة لوحة التحكم والتسجيل مباشرة بدون سيرفر باكيند
    if (!siteData.offices || siteData.offices.length === 0) {
      siteData = {
        listings: [
          {type:'بيت',action:'للبيع',price:'75,000$',area:'200 م²',rooms:4,bath:3,district:'العشار',office:'مكتب الأمانة',vip:true,icon:'🏠',color:'#C9A84C'},
          {type:'شقة',action:'للإيجار',price:'500$/شهر',area:'120 م²',rooms:3,bath:2,district:'الجمهورية',office:'عقارات الخليج',vip:false,icon:'🏢',color:'#4A9FD4'},
          {type:'فيلا',action:'للبيع',price:'220,000$',area:'450 م²',rooms:6,bath:5,district:'المعقل',office:'مكتب الرافدين',vip:true,icon:'🏰',color:'#C9A84C'}
        ],
        offices: [
          {id: "1", name:'مكتب الأمانة العقاري', area:'العشار', props:48, rating:4.9, pkg:'gold', initials:'أم'},
          {id: "2", name:'عقارات الخليج', area:'الجمهورية', props:32, rating:4.7, pkg:'eco', initials:'خل'},
          {id: "3", name:'مكتب الرافدين', area:'المعقل', props:61, rating:5.0, pkg:'gold', initials:'رف'}
        ]
      };
    }
    renderDataToUI(siteData);
  }
}

function renderDataToUI(data) {
  const lGrid = document.getElementById('listingGrid');
  const oGrid = document.getElementById('officesGrid');

  // تحديث العدادات التفاعلية العلوية
  animateCount('count-props', data.listings ? data.listings.length : 0);
  animateCount('count-offices', data.offices ? data.offices.length : 0);

  // 1. حقن وتحديث العقارات
  if (lGrid) {
    if (data.listings && data.listings.length > 0) {
      lGrid.innerHTML = data.listings.map(l => {
        const action = l.action || 'للبيع';
        const color = l.color || (action === 'للبيع' ? '#C9A84C' : '#4A9FD4');
        const icon = l.icon || (action === 'للبيع' ? '🏠' : '🏢');
        const vip = l.vip || false;
        const officeName = l.office_name || l.office || 'دليل البصرة';
        const officeInitials = officeName.length > 0 ? officeName.charAt(0) : 'ب';

        return `
          <div class="listing-card">
            <div class="card-img" style="background:linear-gradient(135deg,rgba(${color=='#C9A84C'?'201,168,76':'74,159,212'},0.08) 0%,#1A3A5C 100%)">
              <div class="card-img-placeholder">${icon}</div>
              <div class="card-badge ${action=='للبيع'?'badge-sale':'badge-rent'}">${action}</div>
              ${vip ? '<div class="badge-vip"><i class="ti ti-crown" aria-hidden="true" style="font-size:11px"></i> VIP</div>' : ''}
            </div>
            <div class="card-body">
              <div class="card-price">${l.price || 'السعر عند الاتصال'} <span>${l.type || 'عقار'} - ${l.area || ''}</span></div>
              <div class="card-title">${l.type || 'عقار'} ${action} في ${l.district || 'البصرة'}</div>
              <div class="card-meta">
                ${l.rooms ? `<div class="card-meta-item"><i class="ti ti-door" aria-hidden="true" style="font-size:13px"></i>${l.rooms} غرف</div>` : ''}
                ${l.bath ? `<div class="card-meta-item"><i class="ti ti-bath" aria-hidden="true" style="font-size:13px"></i>${l.bath} حمامات</div>` : ''}
                <div class="card-meta-item"><i class="ti ti-map-pin" aria-hidden="true" style="font-size:13px"></i>${l.district || 'البصرة'}</div>
              </div>
              <div class="card-footer">
                <div class="card-office">
                  <div class="office-avatar">${officeInitials}</div>
                  <div>
                    <div style="font-size:12px;color:var(--text-on-dark)">${officeName}</div>
                    ${vip ? '<div class="verified-badge"><i class="ti ti-circle-check" aria-hidden="true" style="font-size:11px"></i> موثّق</div>' : ''}
                  </div>
                </div>
                <div class="card-actions">
                  <button class="card-btn" onclick="sendPrompt('الاتصال بمكتب ${officeName}')"><i class="ti ti-phone" aria-hidden="true" style="font-size:13px"></i>اتصال</button>
                  <button class="card-btn whatsapp" onclick="sendPrompt('فتح واتساب لمكتب ${officeName}')"><i class="ti ti-brand-whatsapp" aria-hidden="true" style="font-size:13px"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      lGrid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:var(--text-muted)">لا توجد عقارات حالياً.</div>';
    }
  }

  // 2. حقن وتحديث المكاتب
  if (oGrid) {
    if (data.offices && data.offices.length > 0) {
      oGrid.innerHTML = data.offices.map(o => {
        const name = o.name || 'مكتب عقاري';
        const initials = o.initials || name.substring(0, 2);
        const pkg = o.pkg || 'eco';

        return `
          <div class="office-card">
            <div class="office-header">
              <div class="office-logo">${initials}</div>
              <div class="office-info">
                <div class="office-name">${name}</div>
                <div class="office-verified"><i class="ti ti-circle-check" aria-hidden="true" style="font-size:12px"></i> مكتب موثّق</div>
              </div>
            </div>
            <div class="office-stats">
              <div class="office-stat"><i class="ti ti-building" aria-hidden="true" style="font-size:13px"></i>${o.props || 0} عقار</div>
              <div class="office-stat"><i class="ti ti-star" aria-hidden="true" style="font-size:13px"></i>${o.rating || 5.0}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div class="office-location"><i class="ti ti-map-pin" aria-hidden="true" style="font-size:12px"></i>${o.area || o.location || 'البصرة'}</div>
              <div class="office-pkg ${pkg=='gold'?'pkg-gold':'pkg-eco'}">${pkg=='gold'?'🥇 ذهبي VIP':'💎 اقتصادي'}</div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      oGrid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:var(--text-muted)">لا توجد مكاتب مسجلة حالياً.</div>';
    }
  }

  // 3. مراقبة تفعيل لوحة تحكم الإدارة حسب رتبة المستخدم النشط حالياً
  evaluateAdminDashboardVisibility();
}

// =========================================================================
// 🔑 محرك إدارة الجلسات وتسجيل الدخول والخروج (Auth & Sessions)
// =========================================================================

function showLoginModal() {
  const m = document.getElementById('loginModal');
  if (m) m.style.display = 'flex';
}

function closeLoginModal() {
  const m = document.getElementById('loginModal');
  if (m) m.style.display = 'none';
}

// دالة معالجة ضغط زر "دخول آمن"
async function submitLogin() {
  const userIn = document.getElementById('loginUsername').value.trim();
  const passIn = document.getElementById('loginPassword').value.trim();

  if (!userIn || !passIn) {
    alert('الرجاء كتابة اسم المستخدم وكلمة المرور أولاً!');
    return;
  }

  try {
    // إرسال طلب حقيقي للباكيند (Backend API) في حال كان السيرفر متاحاً ومبرمجاً
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userIn, password: passIn })
    });

    if (response.ok) {
      const result = await response.json();
      currentUser = { role: result.role, username: result.username };
      saveSessionAndRefresh();
      return;
    }
    throw new Error();

  } catch (error) {
    // [وضع محاكاة الهوية الذكي]: التحقق محلياً لتسهيل الاختبار والعرض بدون شبكة
    if (userIn === 'admin' && passIn === 'admin123') {
      currentUser = { role: 'admin', username: 'مدير الموقع الرئيسي' };
    } else if (userIn === 'super' && passIn === 'super123') {
      currentUser = { role: 'supervisor', username: 'المشرف العام' };
    } else if (userIn === 'office' && passIn === 'office123') {
      currentUser = { role: 'office', username: 'مكتب الأمانة العقاري' };
    } else {
      alert('❌ اسم المستخدم أو كلمة المرور غير صحيحة! يرجى مراجعة تلميحات التجربة بالأسفل.');
      return;
    }

    saveSessionAndRefresh();
  }
}

function saveSessionAndRefresh() {
  localStorage.setItem('basra_user', JSON.stringify(currentUser));
  closeLoginModal();
  updateAuthNavbar();
  evaluateAdminDashboardVisibility();
  alert(`🔓 أهلاً بك يا (${currentUser.username}). تم التحقق من صلاحياتك بنجاح.`);
}

function logout() {
  if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
    currentUser = { role: 'guest', username: 'زائر' };
    localStorage.removeItem('basra_user');
    updateAuthNavbar();
    evaluateAdminDashboardVisibility();
    alert('🔒 تم تسجيل الخروج بنجاح وتحويل المتصفح لوضع الزائر العادي.');
  }
}

// دالة تحديث شريط التنقل العلوي برمجياً ليعكس اسم المستخدم المسجل الحالي
function updateAuthNavbar() {
  const zone = document.getElementById('navAuthZone');
  if (!zone) return;

  if (currentUser.role === 'guest') {
    zone.innerHTML = `
      <button class="nav-cta" onclick="showLoginModal()" style="background:transparent; border:1px solid var(--gold); color:var(--gold); margin-left:8px;">تسجيل الدخول</button>
      <button class="nav-cta" onclick="showRegisterModal()">سجّل مكتبك مجاناً</button>
    `;
  } else {
    let roleText = currentUser.role === 'admin' ? 'مدير' : currentUser.role === 'supervisor' ? 'مشرف' : 'مكتب';
    zone.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:13px; color:var(--text-muted)">👤 أهلاً، <strong style="color:var(--gold)">${currentUser.username}</strong> (${roleText})</span>
        <button class="nav-cta" onclick="logout()" style="background:#ff4d4d; color:white; border:none; padding:6px 12px; font-size:12px;">خروج</button>
      </div>
    `;
  }
}

// التحكم في إظهار أو إخفاء لوحة تحكم المسؤولين والمشرفين بناء على رتبة الحساب
function evaluateAdminDashboardVisibility() {
  const section = document.getElementById('adminSection');
  const badge = document.getElementById('adminRoleBadge');
  
  if (!section) return;

  // اللوحة تظهر فقط للمدير (admin) والمشرف (supervisor) وتختفي عن المكاتب والزوار
  if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
    section.style.display = 'block';
    if (badge) {
      badge.textContent = currentUser.role === 'admin' ? '👑 مدير الموقع الرئيسي' : '🛡️ مشرف معتمد';
      badge.style.color = currentUser.role === 'admin' ? 'var(--gold)' : '#4A9FD4';
    }
    renderAdminDashboard();
  } else {
    section.style.display = 'none';
  }
}

// =========================================================================
// ⚙️ أدوات لوحة التحكم (الترقية، التنزيل، الحذف وإدارة الأمان)
// =========================================================================

function renderAdminDashboard() {
  const tableBody = document.getElementById('adminOfficesTable');
  if (!tableBody || !siteData.offices) return;

  tableBody.innerHTML = siteData.offices.map((o, index) => {
    const id = o.id || index;
    return `
      <tr>
        <td style="padding:10px;"><strong>${o.name}</strong></td>
        <td style="padding:10px;">${o.area || 'البصرة'}</td>
        <td style="padding:10px;">${o.props || 0} عقار</td>
        <td style="padding:10px; color: ${o.pkg=='gold' ? 'var(--gold)' : '#4A9FD4'}">
          ${o.pkg=='gold' ? '🥇 ذهبي VIP' : o.pkg=='eco' ? '💎 اقتصادي' : '⭐ باقة مجانية'}
        </td>
        <td style="padding:10px;">
          <select style="background:var(--navy); color:var(--text-on-dark); border:1px solid rgba(201,168,76,0.3); padding:4px 8px; border-radius:6px; font-family:'Cairo';" onchange="updatePackage('${id}', this.value)">
            <option value="free" ${o.pkg == 'free' ? 'selected' : ''}>باقة مجانية</option>
            <option value="eco" ${o.pkg == 'eco' ? 'selected' : ''}>باقة اقتصادية</option>
            <option value="gold" ${o.pkg == 'gold' ? 'selected' : ''}>باقة ذهبية VIP</option>
          </select>
        </td>
        <td style="padding:10px;">
          <button onclick="deleteOffice('${id}')" style="background:#ff4d4d; color:white; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-family:'Cairo'; font-size:12px;">
            حذف المكتب
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// إجراء تعديل الباقة (مسموح للمدير والمشرفين على حد سواء)
async function updatePackage(officeId, newPkg) {
  if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
    alert('❌ رفض الصلاحية الأمنية: لا تمتلك رتبة إدارية تسمح لك بتحديث باقات المشتركين!');
    return;
  }

  try {
    const response = await fetch('/api/update-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officeId, package: newPkg })
    });

    if (response.ok) {
      alert('✅ تم تحديث باقة المكتب في قاعدة البيانات بنجاح.');
      loadRealData();
    } else {
      throw new Error();
    }
  } catch (err) {
    // التحديث التفاعلي الفوري للمحاكاة بدون إنترنت
    const idx = siteData.offices.findIndex((o, i) => o.id == officeId || i == officeId);
    if (idx !== -1) {
      siteData.offices[idx].pkg = newPkg;
      renderDataToUI(siteData);
      alert(`[محاكاة الرتب - ${currentUser.username}]: تم تبديل الباقة لـ (${siteData.offices[idx].name}) نجاح.`);
    }
  }
}

// إجراء الحذف النهائي (مسموح للمدير العام فقط، وممنوع تماماً على المشرفين!)
async function deleteOffice(officeId) {
  if (currentUser.role !== 'admin') {
    alert('❌ خرق للصلاحيات: عذراً، لا يمكن للمشرف القيام بحذف الحسابات! هذه الصلاحية حصرية لـ (مدير الموقع الرئيسي) فقط.');
    return;
  }

  const idx = siteData.offices.findIndex((o, i) => o.id == officeId || i == officeId);
  if (idx === -1) return;

  if (!confirm(`هل أنت متأكد من حذف مكتب "${siteData.offices[idx].name}" نهائياً من دليل البصرة؟`)) return;

  try {
    const response = await fetch(`/api/delete-office/${officeId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('🗑️ تم الحذف النهائي من السيرفر.');
      loadRealData();
    } else {
      throw new Error();
    }
  } catch (err) {
    // إزالة محلية فورية للمحاكاة الحية أمامك في المتصفح
    siteData.offices.splice(idx, 1);
    renderDataToUI(siteData);
    alert('🗑️ [محاكاة المدير]: تم شطب المكتب وتحديث إعلانات الواجهة الحالية بنجاح.');
  }
}

// =========================================================================
// 📥 معالجة طلبات تسجيل المكاتب الجديدة
// =========================================================================

async function submitRegister() {
  const nameInput = document.getElementById('regOfficeName');
  const phoneInput = document.getElementById('regOfficePhone');
  const districtInput = document.getElementById('regOfficeDistrict');

  if (!nameInput || !phoneInput || !districtInput) {
    closeModal();
    return;
  }

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const district = districtInput.value;

  if (!name || !phone || district.includes('اختر')) {
    alert('الرجاء إدخال اسم المكتب، الهاتف، وتحديد منطقة العمل بشكل صحيح!');
    return;
  }

  const newOffice = {
    name: name,
    phone: phone,
    area: district,
    props: 0,
    rating: 5.0,
    pkg: 'gold', 
    initials: name.substring(0, 2)
  };

  try {
    const response = await fetch('/api/register-office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOffice)
    });

    if (response.ok) {
      alert(`🎉 تم تسجيل مكتبك "${name}" بنجاح.`);
      closeModal();
      loadRealData();
    } else {
      throw new Error();
    }
  } catch (error) {
    if (!siteData.offices) siteData.offices = [];
    siteData.offices.push({ id: Date.now().toString(), ...newOffice });
    renderDataToUI(siteData);
    closeModal();
    alert(`🎉 [محاكاة التسجيل]: تم تسجيل مكتب "${name}" وتفعيل الباقة الذهبية VIP المجانية له! يمكنك تسجيل الدخول باسم (admin) لرؤيته والتحكم به بالأسفل.`);
  }

  nameInput.value = '';
  phoneInput.value = '';
}

// =========================================================================
// 📊 الدوال والأنيميشن الحركية الأصلية للموقع
// =========================================================================

function animateCount(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = Math.ceil(target / 60) || 1;
  const iv = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString('ar-EG') + suffix;
    if (start >= target) clearInterval(iv);
  }, 30);
}

function showRegisterModal() {
  const m = document.getElementById('regModal');
  if (m) m.style.display = 'flex';
}

function closeModal() {
  const m = document.getElementById('regModal');
  if (m) m.style.display = 'none';
}

function scrollToSearch() {
  const s = document.getElementById('search');
  if (s) s.scrollIntoView({ behavior: 'smooth' });
}

function runSearch() {
  const q = document.getElementById('searchInput').value;
  if (q.trim()) sendPrompt('أريد البحث عن: ' + q + ' في دليل البصرة العقاري');
}

function quickSearch(q) {
  document.getElementById('searchInput').value = q;
  sendPrompt('ابحث عن ' + q + ' في دليل البصرة العقاري وأخبرني بنصائح للعثور على أفضل العروض');
}

// =========================================================================
// 🚀 تحديث تطبيق الويب التقدمي (PWA) وتسجيل Service Worker
// =========================================================================

// ١. تسجيل الـ Service Worker في المتصفح
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('تم تفعيل نظام التطبيق بنجاح!'))
      .catch(err => console.log('خطأ في تفعيل نظام التطبيق:', err));
  });
}

// ٢. التقاط حدث التثبيت وإظهاره تلقائياً للمستخدم أول مرة
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // منع المتصفح من إظهار النافذة التلقائية فوراً بشكل مزعج
  e.preventDefault();
  deferredPrompt = e;

  // إظهار نافذة طلب التثبيت تلقائياً بعد مرور 4 ثوانٍ من تصفح الموقع لأول مرة
  setTimeout(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // إظهار نافذة المتصفح "هل تريد إضافة التطبيق للشاشة؟"
      
      // معرفة قرار المستخدم (هل وافق أم رفض؟)
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('وافق المستخدم على تثبيت التطبيق 🎉');
        } else {
          console.log('رفض المستخدم التثبيت ❌');
        }
        deferredPrompt = null; // تفريغ المتغير حتى لا تتكرر النافذة
      });
    }
  }, 4000); // 4000 مللي ثانية تعني 4 ثوانٍ
});
