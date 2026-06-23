document.addEventListener('DOMContentLoaded', () => {
  loadRealData();
  
  // تشغيل عداد المجتمع (لأنه رقم ثابت في تصميمك)
  setTimeout(()=>{
    animateCount('count-members', 100000, '+');
  }, 400);
});

// دالة جلب البيانات الحية وحقنها في قوالب تصميمك الأصلي تماماً
async function loadRealData() {
  const lGrid = document.getElementById('listingGrid');
  const oGrid = document.getElementById('officesGrid');

  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('فشل جلب البيانات الحية');
    
    const data = await response.json();

    // تشغيل عدادات العقارات والمكاتب بناءً على البيانات الحية
    animateCount('count-props', data.listings ? data.listings.length : 0);
    animateCount('count-offices', data.offices ? data.offices.length : 0);

    // 1. حقن العقارات بنفس قالب الـ HTML الأصلي الخاص بك 100%
    if (lGrid) {
      if (data.listings && data.listings.length > 0) {
        lGrid.innerHTML = data.listings.map(l => {
          const action = l.action || 'للبيع';
          const color = l.color || (action === 'للبيع' ? '#C9A84C' : '#4A9FD4');
          const icon = l.icon || (action === 'للبيع' ? '🏠' : '🏢');
          const vip = l.vip || false;
          const officeName = l.office_name || l.office || 'دليل البصرة';
          const officeInitials = officeName.length > 5 ? officeName.charAt(5) : officeName.charAt(0);

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
                    <button class="card-btn"><i class="ti ti-phone" aria-hidden="true" style="font-size:13px"></i>اتصال</button>
                    <button class="card-btn whatsapp"><i class="ti ti-brand-whatsapp" aria-hidden="true" style="font-size:13px"></i></button>
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

    // 2. حقن المكاتب بنفس قالب الـ HTML الأصلي الخاص بك 100%
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
                <div class="office-pkg ${pkg=='gold'?'pkg-gold':'pkg-eco'}">${pkg=='gold'?'🥇 ذهبي':'💎 اقتصادي'}</div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        oGrid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:var(--text-muted)">لا توجد مكاتب مسجلة حالياً.</div>';
      }
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    if(lGrid) lGrid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:2rem;color:#ff6b6b">⚠️ تعذر الاتصال بخادم Render.</div>';
  }
}

// =========================================================================
// كافة الدوال أدناه هي دوالك الأصلية دون أي تغيير إطلاقاً للحفاظ على حركية الموقع
// =========================================================================

function animateCount(id,target,suffix=''){
  const el=document.getElementById(id);
  if(!el)return;
  let start=0;
  const step=Math.ceil(target/60) || 1;
  const iv=setInterval(()=>{
    start=Math.min(start+step,target);
    el.textContent=start.toLocaleString('ar-EG')+suffix;
    if(start>=target)clearInterval(iv);
  },30);
}

function showRegisterModal(){
  const m=document.getElementById('regModal');
  m.style.display='flex';
}
function closeModal(){
  document.getElementById('regModal').style.display='none';
}
function scrollToSearch(){
  document.getElementById('search').scrollIntoView({behavior:'smooth'});
}
function runSearch(){
  const q=document.getElementById('searchInput').value;
  if(q.trim()) sendPrompt('أريد البحث عن: '+q+' في دليل البصرة العقاري');
}
function quickSearch(q){
  document.getElementById('searchInput').value=q;
  sendPrompt('ابحث عن '+q+' في دليل البصرة العقاري وأخبرني بنصائح للعثور على أفضل العروض');
}
function submitRegister(){
  closeModal();
  sendPrompt('أريد تسجيل مكتبي في دليل البصرة العقاري والبدء في خطوات البرمجة. ساعدني في تحديد التقنيات المناسبة (Tech Stack) وخطوات البناء الأولى');
}
