/**
 * Module untuk menangani penyimpanan data login dan redirect ke halaman tujuan
 */
export class LoginHandler {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    // Handle form submissions for all three steps
    document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserForm(e));
    document.getElementById('produkForm')?.addEventListener('submit', (e) => this.handleProdukForm(e));
    document.getElementById('kodeForm')?.addEventListener('submit', (e) => this.handleKodeForm(e));
    
    // Back button handlers
    document.getElementById('backToUserBtn')?.addEventListener('click', () => this.backToUser());
    document.getElementById('backToProdukBtn')?.addEventListener('click', () => this.backToProduk());
    
    // Help modal handlers
    document.getElementById('helpBtn')?.addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('helpModal')).show();
    });
    
    document.getElementById('confirmHelpModal')?.addEventListener('click', () => {
      const helpModal = bootstrap.Modal.getInstance(document.getElementById('helpModal'));
      helpModal.hide();
    });
  }

  handleUserForm(e) {
    e.preventDefault();
    
    const user = document.getElementById('user').value.trim();
    const email = document.getElementById('email').value.trim() + "@gmail.com";
    
    if (user && email) {
      // Show loading indicator
      document.getElementById('loadingIndicator').style.display = 'block';
      
      // Simulate verification process
      setTimeout(() => {
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Move to produk section
        document.getElementById('userSection').style.display = 'none';
        document.getElementById('produkSection').style.display = 'block';
        
        // Update step indicator
        this.updateStepIndicator(2);
        
        // Store user data temporarily
        sessionStorage.setItem('tempUser', user);
        sessionStorage.setItem('tempEmail', email);
      }, 1500);
    }
  }

  handleProdukForm(e) {
    e.preventDefault();
    
    const produk = document.getElementById('produk').value;
    
    if (produk) {
      // Move to kode section
      document.getElementById('produkSection').style.display = 'none';
      document.getElementById('kodeSection').style.display = 'block';
      
      // Update step indicator
      this.updateStepIndicator(3);
      
      // Display user info
      document.getElementById('displayUser').textContent = sessionStorage.getItem('tempUser');
      document.getElementById('displayEmail').textContent = sessionStorage.getItem('tempEmail');
      document.getElementById('displayProduk').textContent = produk;
      
      // Store produk temporarily
      sessionStorage.setItem('tempProduk', produk);
    }
  }

  handleKodeForm(e) {
    e.preventDefault();
    
    const kode = document.getElementById('kode').value.trim();
    
    if (kode) {
      // Show loading indicator
      document.getElementById('loadingIndicator').style.display = 'block';
      
      // Simulate verification process
      setTimeout(() => {
        // Create login data object
        const loginData = {
          user: sessionStorage.getItem('tempUser'),
          email: sessionStorage.getItem('tempEmail'),
          produk: sessionStorage.getItem('tempProduk'),
          kode: kode,
          loginTime: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('safetyReportLoginData', JSON.stringify(loginData));
        
        // Redirect to destination
        window.location.href = 'https://gifary10.github.io/isr-e-45001-2018/';
      }, 1500);
    }
  }

  backToUser() {
    document.getElementById('produkSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'block';
    this.updateStepIndicator(1);
  }

  backToProduk() {
    document.getElementById('kodeSection').style.display = 'none';
    document.getElementById('produkSection').style.display = 'block';
    this.updateStepIndicator(2);
  }

  updateStepIndicator(activeStep) {
    document.querySelectorAll('.step').forEach(step => {
      const stepNumber = parseInt(step.dataset.step);
      if (stepNumber === activeStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
}

// Inisialisasi jika diperlukan
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
