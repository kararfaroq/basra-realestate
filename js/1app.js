async function loadRealData() {
    try {
        const response = await fetch('/.netlify/functions/get-data');
        const data = await response.json();

        if (data.listings && data.listings.length > 0) {
            renderListings(data.listings);
        } else {
            document.getElementById('listingGrid').innerHTML = '<p style="grid-column:1/-1; text-align:center;">لا توجد عقارات مضافة في قاعدة البيانات حالياً.</p>';
        }

        if (data.offices && data.offices.length > 0) {
            renderOffices(data.offices);
        } else {
            document.getElementById('officesGrid').innerHTML = '<p style="grid-column:1/-1; text-align:center;">لا توجد مكاتب مسجلة حالياً.</p>';
        }
        
        animateCount('count-offices', data.offices ? data.offices.length : 0);
        animateCount('count-props', data.listings ? data.listings.length : 0);

    } catch (error) {
        console.error("خطأ جلب البيانات:", error);
    }
}

function renderListings(listings) {
    const g = document.getElementById('listingGrid');
    if(!g) return;
    g.innerHTML = listings.map(l => `
    <div class="listing-card">
      <div class="card-img">
        <div class="card-img-placeholder">${l.icon || '🏠'}</div>
        <div class="card-badge">${l.action}</div>
      </div>
      <div class="card-body">
        <div class="card-price">${l.price} <span>${l.type} - ${l.area}</span></div>
        <div class="card-title">${l.type} في ${l.district}</div>
        <div class="card-footer">
          <div class="card-office"><div>${l.office_name || 'مكتب مستقل'}</div></div>
        </div>
      </div>
    </div>`).join('');
}

function renderOffices(offices) {
    const g = document.getElementById('officesGrid');
    if(!g) return;
    g.innerHTML = offices.map(o => `
    <div class="office-card">
      <div class="office-header">
        <div class="office-logo">${o.initials || 'م'}</div>
        <div class="office-info"><div class="office-name">${o.name}</div></div>
      </div>
      <div class="office-location"><i class="ti ti-map-pin"></i>${o.area}</div>
    </div>`).join('');
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = target.toLocaleString('ar-EG');
}

document.addEventListener('DOMContentLoaded', loadRealData);