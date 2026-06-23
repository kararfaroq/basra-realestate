// =========================================================================
// 🔒 إعدادات الأمان وإدارة الصلاحيات (المدير والمشرفين)
// =========================================================================

// منع حدوث ReferenceError في حال لم تكن الدالة معرّفة في بيئة التشغيل الخارجية
if (typeof sendPrompt !== 'function') {
  window.sendPrompt = function(message) {
    console.log("إشعار (وضع التطوير) - تم استدعاء الأجراء: " + message);
  };
}

// تخزين البيانات محلياً لتحديث الواجهات بشكل فوري وتفاعلي
let siteData = { listings: [], offices: [] };

// رتبة المستخدم الحالي المتصل (يمكن تغييرها إلى 'supervisor' أو 'admin' للاختبار)
let currentUserRole = 'admin'; 

document.addEventListener('DOMContentLoaded', () => {
  // جلب البيانات الحية وحقنها في قوالب التصميم
  loadRealData();
  
  // تشغيل عداد المجتمع الرقمي الثابت
  setTimeout(() => {
    animateCount('count-members', 100000, '+');
  }, 400);
});

// =========================================================================
// 🌐 جلب البيانات وحقنها تفاعلياً في الواجهات
// =========================================================================

async function loadRealData() {
  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('فشل جلب البيانات الحية من السيرفر');
    
    const data = await response.json();
    siteData = data; // حفظ البيانات في الذاكرة المحلية للموقع
    
    // تمرير البيانات لدالة التحديث وضخها في الـ HTML
    renderDataToUI(siteData);

  } catch (error) {
    console.error('Error fetching data:', error);
    
    // [وضع المحاكاة التفاعلية الذكي]: إذا فشل السيرفر أو تعمل محلياً، نملأ البيانات ديمو لتجربة الصلاحيات مباشرة
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
    console.log('⚠️ تم تفعيل وضع المحاكاة التفاعلي للأوفلاين لضمان عمل أزرار التحكم والصلاحيات.');
  }
}

// دالة معالجة وحقن البيانات في قوالب الـ HTML وتحديث العدادات
function renderDataToUI(data) {
  const lGrid = document.getElementById('listingGrid');
  const oGrid = document.getElementById('officesGrid');

  // تشغيل العدادات التفاعلية بناءً على عدد المصفوفات الحالية
  animateCount('count-props', data.listings ? data.listings.length : 0);
  animateCount('count-offices', data.offices ? data.offices.length : 0);

  // 1. حقن العقارات
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

  // 2. حقن المكاتب
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

  // 3. تحديث لوحة التحكم الخاصة بالإدارة والمشرفين (تلقائياً عند وجودها في الصفحة)
  renderAdminDashboard();
}

// =========================================================================
// ⚙️ لوحة تحكم الإدارة (الترقية، التنزيل، الحذف والتحقق من الصلاحيات)
// =========================================================================

function renderAdminDashboard() {
  const tableBody = document.getElementById('adminOfficesTable');
  if (!tableBody || !siteData.offices) return;

  tableBody.innerHTML = siteData.offices.map((o, index) => {
    const id = o.id || index;
    return `
      <tr>
        <td><strong>${o.name}</strong></td>
        <td>${o.area || 'البصرة'}</td>
        <td>${o.props || 0} عقار</td>
        <td style="color: ${o.pkg=='gold' ? 'var(--gold)' : '#4A9FD4'}">
          ${o.pkg=='gold' ? '🥇 ذهبي VIP' : o.pkg=='eco' ? '💎 اقتصادي' : '⭐ باقة مجانية'}
        </td>
        <td>
          <select class="admin-select" onchange="updatePackage('${id}', this.value)">
            <option value="free" ${o.pkg == 'free' ? 'selected' : ''}>باقة مجانية</option>
            <option value="eco" ${o.pkg == 'eco' ? 'selected' : ''}>باقة اقتصادية</option>
            <option value="gold" ${o.pkg == 'gold' ? 'selected' : ''}>باقة ذهبية VIP</option>
          </select>
        </td>
        <td>
          <button onclick="deleteOffice('${id}')" style="background:#ff4d4d; color:white; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-family:'Cairo'; font-size:12px;">
            حذف المكتب
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// دالة تبديل الرتب للاختبار المحرك الفوري
function changeRole() {
  const roleSelect = document.getElementById('currentRole');
  if (roleSelect) {
    currentUserRole = roleSelect.value;
    alert("🔐 تم تحويل صلاحية المتصفح الحالية إلى: " + (currentUserRole === 'admin' ? "مدير الموقع" : "مشرف"));
  }
}

// إجراء تعديل الباقة (مسموح للمدير والمشرفين)
async function updatePackage(officeId, newPkg) {
  if (currentUserRole !== 'admin' && currentUserRole !== 'supervisor') {
    alert('❌ خطأ أمني: لا تمتلك الصلاحيات الإدارية لتعديل الباقات!');
    return;
  }

  try {
    const response = await fetch('/api/update-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officeId, package: newPkg })
    });

    if (response.ok) {
      alert('✅ تم تحديث باقة المكتب بنجاح في السيرفر.');
      loadRealData();
    } else {
      throw new Error('لا يوجد استجابة من الخلفية');
    }
  } catch (err) {
    // تحديث محلي فوري للمحاكاة والتجربة الحية
    const idx = siteData.offices.findIndex((o, i) => o.id == officeId || i == officeId);
    if (idx !== -1) {
      siteData.offices[idx].pkg = newPkg;
      renderDataToUI(siteData);
      alert(`[محاكاة - صلاحية ${currentUserRole==='admin'?'المدير':'المشرف'}]: تم تعديل باقة (${siteData.offices[idx].name}) إلى الباقة المحددة بنجاح.`);
    }
  }
}

// إجراء الحذف النهائي (مسموح فقط لمدير الموقع ويمنع المشرفين)
async function deleteOffice(officeId) {
  if (currentUserRole !== 'admin') {
    alert('❌ رفض الصلاحية: عذراً، لا يمكن للمشرف حذف المكاتب. هذه الصلاحية حصرية لـ (مدير الموقع) فقط!');
    return;
  }

  const idx = siteData.offices.findIndex((o, i) => o.id == officeId || i == officeId);
  if (idx === -1) return;

  if (!confirm(`هل أنت متأكد تماماً من حذف "${siteData.offices[idx].name}" نهائياً من النظام؟`)) return;

  try {
    const response = await fetch(`/api/delete-office/${officeId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('🗑️ تم حذف المكتب نهائياً.');
      loadRealData();
    } else {
      throw new Error();
    }
  } catch (err) {
    // الحذف من الذاكرة المحلية للعرض الفوري عند التجربة
    siteData.offices.splice(idx, 1);
    renderDataToUI(siteData);
    alert('🗑️ [محاكاة المدير]: تم حذف المكتب بنجاح وتحديث القوائم الحالية.');
  }
}

// =========================================================================
// 📥 إرسال نموذج تسجيل المكاتب بشكل حقيقي
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

  if (!name || !phone || !district) {
    alert('الرجاء تعبئة اسم المكتب، رقم الهاتف واختيار المنطقة أولاً!');
    return;
  }

  const newOffice = {
    name: name,
    phone: phone,
    area: district,
    props: 0,
    rating: 5.0,
    pkg: 'gold', // منح العضو المسجل الباقة الذهبية VIP تلقائياً للتجربة
    initials: name.substring(0, 2)
  };

  try {
    const response = await fetch('/api/register-office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOffice)
    });

    if (response.ok) {
      alert(`🎉 تم تسجيل مكتبك "${name}" بنجاح في قاعدة البيانات.`);
      closeModal();
      loadRealData();
    } else {
      throw new Error();
    }
  } catch (error) {
    // حقن المكتب الجديد محلياً لمشاهدة النتيجة فوراً
    if (!siteData.offices) siteData.offices = [];
    siteData.offices.push({ id: Date.now().toString(), ...newOffice });
    
    renderDataToUI(siteData);
    closeModal();
    
    alert(`🎉 [محاكاة التسجيل]: تم تسجيل مكتب "${name}" بنجاح وتفعيل الباقة الذهبية له مجاناً لمدة 30 يوماً! يمكنك التحكم به الآن من لوحة الإدارة بالأسفل.`);
  }

  // تصفير الخانات بعد الإرسال
  nameInput.value = '';
  phoneInput.value = '';
  districtInput.value = '';
}

// =========================================================================
// 📊 الدوال الحركية ومؤثرات التنقل والبحث الأصلية
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
