export function setupOffcanvas(products) {
  const offcanvasEl = document.getElementById('offcanvasProducts');
  if (!offcanvasEl) return;

  const offcanvasBody = offcanvasEl.querySelector('.offcanvas-body');
  if (offcanvasBody) {
    offcanvasBody.innerHTML = products.map(product => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title text-primary">${product.name}</h5>
          <p class="card-text text-muted">${product.description}</p>
        </div>
      </div>
    `).join('');
  }
}