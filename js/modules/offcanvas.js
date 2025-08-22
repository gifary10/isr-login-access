const API_URL = 'https://script.google.com/macros/s/AKfycbw-TVP8TIAbC4td5vtaE8d4SZ5AX7UZHZNHVHFc0L2hi79BAWdxxS_8z-KSsdXDI1E1/exec';

// Optimized status and icon maps with less redundancy
const STATUS_MAP = {
    aktif: 'success',
    active: 'success',
    tersedia: 'success',
    beta: 'warning',
    pengembangan: 'warning',
    maintenance: 'secondary',
    offline: 'danger',
    'tidak tersedia': 'danger',
    default: 'primary'
};

const ICON_MAP = {
    aktif: 'shopping_cart',
    active: 'shopping_cart',
    tersedia: 'shopping_cart',
    beta: 'build',
    pengembangan: 'build',
    default: ''
};

// Memoization for status and icon lookups
const statusCache = new Map();
const iconCache = new Map();

export function statusClassFor(text) {
    if (!text) return STATUS_MAP.default;
    
    const key = String(text).trim().toLowerCase();
    if (statusCache.has(key)) return statusCache.get(key);
    
    const result = STATUS_MAP[key] || STATUS_MAP.default;
    statusCache.set(key, result);
    return result;
}

export function iconForStatus(text) {
    if (!text) return ICON_MAP.default;
    
    const key = String(text).trim().toLowerCase();
    if (iconCache.has(key)) return iconCache.get(key);
    
    const result = ICON_MAP[key] || ICON_MAP.default;
    iconCache.set(key, result);
    return result;
}

// More efficient HTML escaping using a single replace with regex
const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '\n': '<br>'
};

const HTML_ESCAPE_REGEX = /[&<>"'\n]/g;

export function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe).replace(HTML_ESCAPE_REGEX, match => HTML_ESCAPE_MAP[match]);
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
                'Accept': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
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
    for (const item of allData) {
        const cat = String(item.Kategori || '').trim();
        if (cat) categories.add(cat);
    }
    return Array.from(categories).sort((a, b) => 
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
}

export function renderCategoryBar(categories, activeCategory, onCategoryClick) {
    const categoryBar = document.getElementById('categoryBar');
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Create ALL button
    const allBtn = document.createElement('button');
    allBtn.className = `btn ${activeCategory === 'All' ? 'btn-primary' : 'btn-outline-primary'}`;
    allBtn.textContent = 'All';
    allBtn.dataset.category = 'All';
    allBtn.addEventListener('click', onCategoryClick);
    fragment.appendChild(allBtn);
    
    // Create category buttons
    for (const cat of categories) {
        const btn = document.createElement('button');
        btn.className = `btn ${activeCategory === cat ? 'btn-secondary' : 'btn-outline-secondary'}`;
        btn.textContent = cat;
        btn.dataset.category = cat;
        btn.addEventListener('click', onCategoryClick);
        fragment.appendChild(btn);
    }
    
    // Replace all children at once
    categoryBar.innerHTML = '';
    categoryBar.appendChild(fragment);
}

export function filterData(allData, activeCategory, searchTerm) {
    if (!searchTerm && activeCategory === 'All') return allData;
    
    const searchTermLower = searchTerm?.toLowerCase() ?? '';
    
    return allData.filter(item => {
        // Filter by category
        if (activeCategory !== 'All') {
            const category = String(item.Kategori || '').trim();
            if (category !== activeCategory) return false;
        }
        
        // Filter by search term if provided
        if (searchTermLower) {
            const name = String(item['Nama Aplikasi'] || '').toLowerCase();
            const desc = String(item.Deskripsi || '').toLowerCase();
            return name.includes(searchTermLower) || desc.includes(searchTermLower);
        }
        
        return true;
    });
}

// Cache for template strings to avoid repeated string operations
const templateCache = new Map();

function getItemTemplate(item) {
    const cacheKey = JSON.stringify(item);
    if (templateCache.has(cacheKey)) return templateCache.get(cacheKey);
    
    const kategori = escapeHtml(item.Kategori || '');
    const nama = escapeHtml(item['Nama Aplikasi'] || '');
    const desc = escapeHtml(item.Deskripsi || '');
    const status = item.Status || '';
    const link = item.Link || '#';
    const versi = escapeHtml(item.Versi || '');
    const pembaruan = escapeHtml(item['Pembaruan Terakhir'] || '');
    const pengembang = escapeHtml(item.Pengembang || '');
    const badgeClass = statusClassFor(status);
    const iconName = iconForStatus(status);
    
    const template = `
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
    
    templateCache.set(cacheKey, template);
    return template;
}

export function renderItems(items) {
    const cardGrid = document.getElementById('cardGrid');
    const noData = document.getElementById('noData');
    
    if (!items.length) {
        cardGrid.innerHTML = '';
        noData.textContent = 'Tidak ada data yang cocok';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    for (const item of items) {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = getItemTemplate(item);
        fragment.appendChild(col);
    }
    
    // Replace all children at once
    cardGrid.innerHTML = '';
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
        if (loaded) return;
        
        try {
            allData = await fetchData();
            if (!allData.length) {
                noData.textContent = 'Tidak ada data yang tersedia';
                noData.style.display = 'block';
                return;
            }
            
            categories = buildCategories(allData);
            renderCategoryBar(categories, activeCategory, onCategoryClick);
            renderItems(filterData(allData, activeCategory, searchTerm));
            loaded = true;
        } catch (error) {
            console.error('Initialization error:', error);
            noData.textContent = 'Gagal memuat data. Silakan coba lagi.';
            noData.style.display = 'block';
        }
    });

}
