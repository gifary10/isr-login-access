// dom.js
export function getDOMElements() {
    return {
        inputUser: document.getElementById('inputUser'),
        inputEmail: document.getElementById('inputEmail'),
        inputKode: document.getElementById('inputKode'),
        selectProduk: document.getElementById('selectProduk'),
        verifyResult: document.getElementById('verifyResult'),
        kodeResult: document.getElementById('kodeResult'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingOverlayStep3: document.getElementById('loadingOverlayStep3'),
        section1: document.getElementById('section1'),
        section2: document.getElementById('section2'),
        section3: document.getElementById('section3'),
        btnVerify: document.getElementById('btnVerify'),
        btnNextStep2: document.getElementById('btnNextStep2'),
        btnBackStep2: document.getElementById('btnBackStep2'),
        btnBackStep3: document.getElementById('btnBackStep3'),
        btnSubmitKode: document.getElementById('btnSubmitKode')
    };
}

export function skeletonProduk() {
    const { selectProduk } = getDOMElements();
    if (!selectProduk) return;
    
    selectProduk.innerHTML = "";
    const placeholder = document.createElement('option');
    placeholder.textContent = "Memuat produk...";
    placeholder.disabled = true;
    placeholder.selected = true;
    selectProduk.appendChild(placeholder);
}

export function populateProduk(rows) {
    const { selectProduk } = getDOMElements();
    if (!selectProduk) return;
    
    selectProduk.innerHTML = "";
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Pilih produk Anda";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectProduk.appendChild(defaultOption);
    
    // Add product options
    const uniqueProducts = [...new Set(rows.map(row => row.Produk))];
    uniqueProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        selectProduk.appendChild(option);
    });
}

export function addRippleEffect(e) {
    if (!e.currentTarget) return;
    
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}