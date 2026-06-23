document.addEventListener('DOMContentLoaded', () => {
  loadRealData();
});

// الدالة الأساسية المحدثة لربط خادم Render بكلاسات تصميمك الفخم الأصلي
async function loadRealData() {
  const lGrid = document.getElementById('listingsGrid');
  const oGrid = document.getElementById('officesGrid');

  try {
    // الاتصال بالخادم الحي على Render
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('فشل جلب البيانات الحية');
    
    const data = await response.json();

    // تشغيل العدادات الفخمة الأصلية وتغذيتها بالأرقام الحية
    if (document.getElementById('count-listings')) {
      animateCount('count-listings', data.listings ? data.listings.length : 0);
    }
    if (document.getElementById('count-offices')) {
      animateCount('count-offices', data.offices ? data.offices.length : 0);
    }

    // 1. حقن العقارات المتاحة مع الحفاظ على القوالب والـ Icons والـ Badges الأصلية لتصميمك
    if (lGrid) {
      if (data.listings && data.listings.length > 0) {
        lGrid.innerHTML = data.listings.map(l => `
          <div class="card">
            <div class="card-hero-img">
              <div class="prop-icon">${l.icon || '🏡'}</div>
              ${l.vip ? '<div class="badge-vip">⭐ تميز VIP</div>' : ''}
              <div class="badge-type">${l.action || 'بيع'}</div>
            </div>
            <div class="card-body">
              <h3 class="prop-title">${l.type || 'عقار'}</h3>
              <div class="prop-loc">📍 ${l.district || 'البصرة'}</div>
              <div class="prop-features">
                <div class="feature-item">📐 ${l.area || 'غير محدد'}</div>
                <div class="feature-item">🛏️ ${l.rooms || 0} غرف</div>
                <div class="feature-item">🚿 ${l.bath || 0} حمام</div>
              </div>
              <div class="card-footer">
                <div class="prop-price">${l.price || 'اتصال'}</div>
                <div class="prop-owner">🏢 ${l.office_name || 'دليل البصرة'}</div>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        lGrid.innerHTML = '<div class="loading-box">لا توجد عقارات مضافة حالياً في قاعدة البيانات.</div>';
      }
    }

    // 2. حقن المكاتب العقارية الشريكة بالتنسيق الأصلي الكامل وبطاقات الـ VIP
    if (oGrid) {
      if (data.offices && data.offices.length > 0) {
        oGrid.innerHTML = data.offices.map(o => `
          <div class="office-card">
            <div class="office-avatar">🏢</div>
            <div class="office-info">
              <div class="office-name">${o.name}</div>
              <div class="office-meta">
                <div>👤 الإدارة: ${o.manager}</div>
                <div>📍 ${o.location}</div>
                <div>📐 ${o.area || ''}</div>
              </div>
              <div class="office-pkg ${o.pkg == 'gold' ? 'pkg-gold' : 'pkg-eco'}">
                ${o.pkg == 'gold' ? '🥇 مكتب ذهبي VIP' : '💎 عضو اقتصادي'}
              </div>
            </div>
          </div>
        `).join('');
      } else {
        oGrid.innerHTML = '<div class="loading-box">لا توجد مكاتب دلالية مسجلة حالياً.</div>';
      }
    }

  } catch (error) {
    console.error('Pipeline Error:', error);
    if(lGrid) lGrid.innerHTML = '<div class="loading-box" style="color:#ff6b6b;">⚠️ عذراً، تعذر جلب البيانات الحية من خادم Render.</div>';
  }
}

// دالة عد الأرقام المتحركة الفخمة الأصلية للتصميم
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
