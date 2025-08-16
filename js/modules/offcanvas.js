const API_URL = 'https://script.google.com/macros/s/AKfycbzJnHvDqSml5Pf5GBDQroGcjpyGqAWI4grnmrFKyNQoVvqDC1I2HsuX1Iydf9pDRNaP/exec';

const statusMap = {
    'aktif': 'success', 'active': 'success', 'tersedia': 'success',
    'beta': 'warning', 'pengembangan': 'warning',
    'maintenance': 'secondary',
    'offline': 'danger', 'tidak tersedia': 'danger',
    'default': 'primary'
};

const iconMap = {
    'aktif': 'shopping_cart', 'active': 'shopping_cart', 'tersedia': 'shopping_cart',
    'beta': 'build', 'pengembangan': 'build', 'default': ''
};

export function statusClassFor(text) {
    if (!text) return 'primary';
    const key = String(text).trim().toLowerCase();
    return statusMap[key] || statusMap['default'];
}

export function iconForStatus(text) {
    if (!text) return '';
    const key = String(text).trim().toLowerCase();
    return iconMap[key] || iconMap['default'];
}

export function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;').replaceAll('\n', '<br>');
}

export async function fetchData() {
    const loadingEl = document.getElementById('loading');
    const cardGrid = document.getElementById('cardGrid');
    const noData = document.getElementById('noData');
    
    loadingEl.style.display = 'flex';
    cardGrid.innerHTML = '';
    noData.style.display = 'none';
    
    try {
        const res = await fetch(API_URL, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error('Gagal memuat data');
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Fetch error:', err);
        noData.textContent = 'Gagal memuat data. Coba lagi nanti.';
        noData.style.display = 'block';
        return [];
    } finally {
        loadingEl.style.display = 'none';
    }
}

export function buildCategories(allData) {
    const categories = new Set();
    allData.forEach(item => {
        const cat = String(item['Kategori'] || '').trim();
        if (cat) categories.add(cat);
    });
    return Array.from(categories).sort((a, b) => 
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
}

export function renderCategoryBar(categories, activeCategory, onCategoryClick) {
    const categoryBar = document.getElementById('categoryBar');
    categoryBar.innerHTML = '';
    
    // Create ALL button
    const allBtn = document.createElement('button');
    allBtn.className = `btn ${activeCategory === 'All' ? 'btn-primary' : 'btn-outline-primary'}`;
    allBtn.textContent = 'All';
    allBtn.dataset.category = 'All';
    allBtn.addEventListener('click', onCategoryClick);
    categoryBar.appendChild(allBtn);
    
    // Create category buttons
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `btn ${activeCategory === cat ? 'btn-secondary' : 'btn-outline-secondary'}`;
        btn.textContent = cat;
        btn.dataset.category = cat;
        btn.addEventListener('click', onCategoryClick);
        categoryBar.appendChild(btn);
    });
}

export function filterData(allData, activeCategory, searchTerm) {
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';
    
    return allData.filter(item => {
        // Filter by category
        const category = String(item['Kategori'] || '').trim();
        if (activeCategory !== 'All' && category !== activeCategory) return false;
        
        // Filter by search term
        if (searchTermLower) {
            const name = String(item['Nama Aplikasi'] || '').toLowerCase();
            const desc = String(item['Deskripsi'] || '').toLowerCase();
            return name.includes(searchTermLower) || desc.includes(searchTermLower);
        }
        
        return true;
    });
}

export function renderItems(items) {
    const cardGrid = document.getElementById('cardGrid');
    const noData = document.getElementById('noData');
    
    cardGrid.innerHTML = '';
    
    if (!items.length) {
        noData.textContent = 'Tidak ada data yang cocok';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col';
        
        const kategori = escapeHtml(item['Kategori'] || '');
        const nama = escapeHtml(item['Nama Aplikasi'] || '');
        const desc = escapeHtml(item['Deskripsi'] || '');
        const status = item['Status'] || '';
        const link = item['Link'] || '#';
        const versi = escapeHtml(item['Versi'] || '');
        const pembaruan = escapeHtml(item['Pembaruan Terakhir'] || '');
        const pengembang = escapeHtml(item['Pengembang'] || '');
        const badgeClass = statusClassFor(status);
        const iconName = iconForStatus(status);
        
        col.innerHTML = `
            <div class="app-card h-100">
                <div class="app-card-content">
                    ${kategori ? `<span class="badge bg-${badgeClass} category-badge">${kategori}</span>` : ''}
                    <div class="title-app">${nama}</div>
                    ${desc ? `<div class="desc-app">${desc}</div>` : ''}
                    
                    ${versi || pembaruan || pengembang ? `
                    <div class="app-meta text-muted small mt-2">
                        ${versi ? `<div class="meta-item"><span class="material-icons" style="font-size:0.8em;">label</span> ${versi}</div>` : ''}
                        ${pembaruan ? `<div class="meta-item"><span class="material-icons" style="font-size:0.8em;">update</span> ${pembaruan}</div>` : ''}
                        ${pengembang ? `<div class="meta-item"><span class="material-icons" style="font-size:0.8em;">code</span> ${pengembang}</div>` : ''}
                    </div>
                    ` : ''}
                </div>
                
                <div class="app-card-footer mt-auto">
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-${badgeClass} w-100">
                        ${iconName ? `<span class="material-icons">${iconName}</span>` : ''}
                        ${escapeHtml(status || 'Lihat')}
                    </a>
                </div>
            </div>
        `;
        
        fragment.appendChild(col);
    });
    
    cardGrid.appendChild(fragment);
}

export function initOffcanvas() {
    let allData = [];
    let categories = [];
    let activeCategory = 'All';
    let searchTerm = '';
    let loaded = false;
    let debounceTimeout = null;

    const searchInput = document.getElementById('search');
    const cardGrid = document.getElementById('cardGrid');
    const noData = document.getElementById('noData');

    function onCategoryClick(e) {
        activeCategory = e.currentTarget.dataset.category;
        renderCategoryBar(categories, activeCategory, onCategoryClick);
        renderItems(filterData(allData, activeCategory, searchTerm));
    }

    function handleSearch() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            searchTerm = searchInput.value.trim().toLowerCase();
            renderItems(filterData(allData, activeCategory, searchTerm));
        }, 300);
    }

    searchInput.addEventListener('input', handleSearch);

    document.getElementById('openProduk').addEventListener('click', async () => {
        if (!loaded) {
            try {
                allData = await fetchData();
                if (allData.length) {
                    categories = buildCategories(allData);
                    renderCategoryBar(categories, activeCategory, onCategoryClick);
                    renderItems(filterData(allData, activeCategory, searchTerm));
                    loaded = true;
                }
            } catch (error) {
                console.error('Initialization error:', error);
                noData.textContent = 'Gagal memuat data. Silakan coba lagi.';
                noData.style.display = 'block';
            }
        }
    });
}