// دالة رئيسية لتشغيل الكود بمجرد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadRealData();
});

// الدالة المسؤولة عن جلب البيانات من سيرفر Render وعرضها
async function loadRealData() {
    const listingsContainer = document.getElementById('listings-container');
    const officesContainer = document.getElementById('offices-container');

    try {
        // طلب البيانات من مسار الـ API التابع لـ Render
        const response = await fetch('/api/get-data');
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات من السيرفر');
        }

        const data = await response.json();

        // 1. عرض العقارات (Listings)
        if (listingsContainer) {
            listingsContainer.innerHTML = ''; // تفريغ العناصر التجريبية القديمة

            if (data.listings && data.listings.length > 0) {
                data.listings.forEach(item => {
                    const card = document.createElement('div');
                    card.className = `card ${item.vip ? 'vip-card' : ''}`;
                    
                    card.innerHTML = `
                        <div class="card-image">
                            <span class="property-icon">${item.icon || '🏡'}</span>
                            ${item.vip ? '<span class="badge-vip">⭐ تميز</span>' : ''}
                            <span class="badge-action">${item.action}</span>
                        </div>
                        <div class="card-content">
                            <h3 class="property-type">${item.type}</h3>
                            <p class="property-district">📍 ${item.district}</p>
                            <div class="property-details">
                                <span>📐 ${item.area}</span>
                                <span>🛏️ ${item.rooms} غرف</span>
                                <span>🚿 ${item.bath} حمام</span>
                            </div>
                            <hr>
                            <div class="card-footer">
                                <span class="property-price">${item.price}</span>
                                <span class="office-tag">🏢 ${item.office_name}</span>
                            </div>
                        </div>
                    `;
                    listingsContainer.appendChild(card);
                });
            } else {
                listingsContainer.innerHTML = '<p class="no-data">لا توجد عقارات مضافة حالياً.</p>';
            }
        }

        // 2. عرض مكاتب الدلالية (Offices)
        if (officesContainer) {
            officesContainer.innerHTML = ''; // تفريغ المكاتب القديمة

            if (data.offices && data.offices.length > 0) {
                data.offices.forEach(office => {
                    const card = document.createElement('div');
                    card.className = 'office-card';
                    
                    card.innerHTML = `
                        <h3>🏢 ${office.name}</h3>
                        <p>👤 الإدارة: ${office.manager}</p>
                        <p>📍 الموقع: ${office.location}</p>
                        <a href="https://wa.me/${office.phone}" target="_blank" class="whatsapp-btn">
                            💬 تواصل عبر واتساب
                        </a>
                    `;
                    officesContainer.appendChild(card);
                });
            } else {
                officesContainer.innerHTML = '<p class="no-data">لا توجد مكاتب مسجلة حالياً.</p>';
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        if (listingsContainer) {
            listingsContainer.innerHTML = '<p class="error-msg">⚠️ عذراً، حدث خطأ أثناء تحميل البيانات الحية.</p>';
        }
    }
}