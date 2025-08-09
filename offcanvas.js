document.addEventListener('DOMContentLoaded', () => {
  const products = [
    { id: 1, name: "Safety Report Pro", description: "Advanced safety reporting with analytics" },
    { id: 2, name: "Incident Tracker", description: "Real-time incident monitoring" },
    { id: 3, name: "Risk Assessment", description: "Comprehensive risk evaluation tool" },
    { id: 4, name: "Audit Management", description: "Streamlined audit processes" },
    { id: 5, name: "Compliance Dashboard", description: "Regulatory compliance tracking" }
  ];

  const offCanvas = document.createElement('div');
  offCanvas.id = 'offCanvas';
  offCanvas.className = 'fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out';
  offCanvas.style.zIndex = 'var(--z-offcanvas)';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-4 right-4 text-gray-500 hover:text-gray-700';
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;

  const header = document.createElement('div');
  header.className = 'p-4 border-b border-gray-200 flex items-center justify-between';
  header.innerHTML = '<h3 class="text-lg font-medium text-gray-900">Daftar Produk</h3>';
  header.appendChild(closeBtn);

  const productList = document.createElement('div');
  productList.className = 'p-4 space-y-4';

  products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.className = 'p-3 bg-gray-50 rounded-lg';
    productItem.innerHTML = `
      <h4 class="font-medium text-primary">${product.name}</h4>
      <p class="text-sm text-gray-600 mt-1">${product.description}</p>
    `;
    productList.appendChild(productItem);
  });

  const overlay = document.createElement('div');
  overlay.id = 'offCanvasOverlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 hidden';
  overlay.style.zIndex = 'var(--z-offcanvas-overlay)';

  const toggleOffCanvas = () => {
    offCanvas.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
  };

  closeBtn.addEventListener('click', toggleOffCanvas);
  overlay.addEventListener('click', toggleOffCanvas);

  offCanvas.appendChild(header);
  offCanvas.appendChild(productList);
  document.body.appendChild(offCanvas);
  document.body.appendChild(overlay);

  const cardHeader = document.querySelector('.card-header');
  if (cardHeader) {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'absolute left-4 top-4 text-white hover:text-gray-200';
    menuBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    `;
    menuBtn.addEventListener('click', toggleOffCanvas);
    
    cardHeader.style.position = 'relative';
    cardHeader.prepend(menuBtn);
  }

  const style = document.createElement('style');
  style.textContent = `
    #offCanvas {
      max-width: 100%;
    }
    .translate-x-0 {
      transform: translateX(0);
    }
    @media (min-width: 640px) {
      #offCanvas {
        max-width: 20rem;
      }
    }
  `;
  document.head.appendChild(style);
});