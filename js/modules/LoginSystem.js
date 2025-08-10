import { setupSplashScreen } from './helpers/splash.js';
import { setupOffcanvas } from './helpers/offcanvas.js';
import { makeRequest } from './helpers/fetch.js';

export class LoginSystem {
  constructor() {
    this.DOM = {
      toast: document.getElementById('toast'),
      toastMessage: document.querySelector('.toast-message'),
      toastIcon: document.getElementById('toast-icon'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      sections: {
        user: document.getElementById('userSection'),
        produk: document.getElementById('produkSection'),
        kode: document.getElementById('kodeSection')
      },
      inputs: {
        user: document.getElementById('user'),
        email: document.getElementById('email'),
        produk: document.getElementById('produk'),
        kode: document.getElementById('kode')
      },
      forms: {
        user: document.getElementById('userForm'),
        produk: document.getElementById('produkForm'),
        kode: document.getElementById('kodeForm')
      },
      buttons: {
        verify: document.getElementById('verifyBtn'),
        selectProduk: document.getElementById('selectProdukBtn'),
        checkKode: document.getElementById('checkKodeBtn'),
        backToUser: document.getElementById('backToUserBtn'),
        backToProduk: document.getElementById('backToProdukBtn'),
        helpBtn: document.getElementById('helpBtn'),
        closeHelpModal: document.getElementById('closeHelpModal'),
        confirmHelpModal: document.getElementById('confirmHelpModal'),
        menuBtn: document.getElementById('menuBtn')
      },
      displays: {
        user: document.getElementById('displayUser'),
        email: document.getElementById('displayEmail'),
        produk: document.getElementById('displayProduk')
      },
      modals: {
        helpModal: new bootstrap.Modal(document.getElementById('helpModal')),
        offcanvas: new bootstrap.Offcanvas(document.getElementById('offcanvasProducts'))
      }
    };

    this.currentSession = {
      user: "",
      email: "",
      produk: ""
    };

    this.PRODUCTS = [
      { id: 1, name: "Safety Report Pro", description: "Advanced safety reporting with analytics" },
      { id: 2, name: "Incident Tracker", description: "Real-time incident monitoring" },
      { id: 3, name: "Risk Assessment", description: "Comprehensive risk evaluation tool" },
      { id: 4, name: "Audit Management", description: "Streamlined audit processes" },
      { id: 5, name: "Security Dashboard", description: "Security monitoring and analytics" }
    ];

    this.makeRequest = makeRequest.bind(this);
    this.init();
  }

  init() {
    setupSplashScreen();
    setupOffcanvas(this.PRODUCTS);
    this.initEventListeners();
    this.updateStepIndicator(1);
  }

  updateStepIndicator(currentStep) {
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNumber = parseInt(step.dataset.step);
      step.classList.toggle('completed', stepNumber < currentStep);
      step.classList.toggle('active', stepNumber === currentStep);
      step.setAttribute('aria-valuenow', stepNumber <= currentStep ? stepNumber : 0);
    });
    
    document.querySelectorAll('.step-connector').forEach((connector, index) => {
      connector.classList.toggle('active', index < currentStep - 1);
    });
  }

  showToast(type, message) {
    const toastEl = this.DOM.toast.querySelector('.toast');
    if (!toastEl) return;

    this.DOM.toastMessage.textContent = message;
    
    if (type === 'success') {
      this.DOM.toastIcon.innerHTML = '<i class="material-icons text-success">check_circle</i>';
      toastEl.classList.add('toast-success');
      toastEl.classList.remove('toast-error');
    } else {
      this.DOM.toastIcon.innerHTML = '<i class="material-icons text-danger">error</i>';
      toastEl.classList.add('toast-error');
      toastEl.classList.remove('toast-success');
    }

    this.DOM.toast.style.display = 'block';
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }

  showLoading(show) {
    if (this.DOM.loadingIndicator) {
      this.DOM.loadingIndicator.style.display = show ? 'block' : 'none';
      document.body.setAttribute('aria-busy', show ? 'true' : 'false');
    }
  }

  showSection(sectionId) {
    Object.values(this.DOM.sections).forEach(section => {
      const isActive = section.id === `${sectionId}Section`;
      section.style.display = isActive ? 'block' : 'none';
      
      if (isActive) {
        setTimeout(() => {
          const firstInput = section.querySelector('input, select');
          if (firstInput) firstInput.focus();
        }, 100);
      }
    });
    
    const stepMap = { user: 1, produk: 2, kode: 3 };
    this.updateStepIndicator(stepMap[sectionId]);
  }

  updateUserDisplay() {
    this.DOM.displays.user.textContent = this.currentSession.user;
    this.DOM.displays.email.textContent = this.currentSession.email;
    this.DOM.displays.produk.textContent = this.currentSession.produk;
  }

  async verifyUser(e) {
    if (e) e.preventDefault();
    
    if (!this.DOM.forms.user.checkValidity()) {
      this.DOM.forms.user.classList.add('was-validated');
      return;
    }

    this.currentSession.user = this.DOM.inputs.user.value.trim();
    let emailInput = this.DOM.inputs.email.value.trim();
    
    if (emailInput && !emailInput.endsWith('@gmail.com')) {
      emailInput += '@gmail.com';
    }
    this.currentSession.email = emailInput;

    try {
      this.showLoading(true);
      const data = await this.makeRequest({
        action: "verify",
        user: this.currentSession.user,
        email: this.currentSession.email
      });

      if (data.status === "success") {
        this.DOM.inputs.produk.innerHTML = data.produk?.map(p => 
          `<option value="${p}">${p}</option>`
        ).join('') || '';
        this.showSection("produk");
        this.DOM.forms.user.classList.remove('was-validated');
      } else {
        this.showToast('error', 'User atau email tidak ditemukan!');
      }
    } catch (error) {
      console.error('Error in verifyUser:', error);
      this.showToast('error', 'Terjadi kesalahan saat memverifikasi');
    } finally {
      this.showLoading(false);
    }
  }

  selectProduk(e) {
    if (e) e.preventDefault();
    
    if (!this.DOM.forms.produk.checkValidity()) {
      this.DOM.forms.produk.classList.add('was-validated');
      return;
    }

    this.currentSession.produk = this.DOM.inputs.produk.value;
    this.updateUserDisplay();
    this.showSection("kode");
    this.DOM.forms.produk.classList.remove('was-validated');
  }

  async checkKode(e) {
    if (e) e.preventDefault();
    
    if (!this.DOM.forms.kode.checkValidity()) {
      this.DOM.forms.kode.classList.add('was-validated');
      return;
    }

    const kode = this.DOM.inputs.kode.value.trim();
    
    try {
      this.showLoading(true);
      const data = await this.makeRequest({
        action: "checkCode",
        user: this.currentSession.user,
        email: this.currentSession.email,
        produk: this.currentSession.produk,
        kode: kode
      });

      if (data.status === "success") {
        this.showToast('success', 'Akses berhasil! Mengarahkan...');
        
        setTimeout(() => {
          if (data.link) window.location.href = data.link;
        }, 1500);
      } else {
        this.showToast('error', 'Kode akses salah!');
      }
    } catch (error) {
      console.error('Error in checkKode:', error);
      this.showToast('error', 'Terjadi kesalahan saat memverifikasi kode');
    } finally {
      this.showLoading(false);
    }
  }

  backToUser() {
    this.showSection("user");
  }

  backToProduk() {
    this.showSection("produk");
  }

  initEventListeners() {
    this.DOM.forms.user?.addEventListener('submit', (e) => this.verifyUser(e));
    this.DOM.forms.produk?.addEventListener('submit', (e) => this.selectProduk(e));
    this.DOM.forms.kode?.addEventListener('submit', (e) => this.checkKode(e));
    
    this.DOM.buttons.backToUser?.addEventListener('click', () => this.backToUser());
    this.DOM.buttons.backToProduk?.addEventListener('click', () => this.backToProduk());
    
    this.DOM.buttons.helpBtn?.addEventListener('click', () => {
      this.DOM.modals.helpModal.show();
    });

    [this.DOM.buttons.closeHelpModal, this.DOM.buttons.confirmHelpModal].forEach(btn => {
      btn?.addEventListener('click', () => {
        this.DOM.modals.helpModal.hide();
      });
    });
    
    this.DOM.buttons.menuBtn?.addEventListener('click', () => {
      this.DOM.modals.offcanvas.show();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.matches('textarea, [type="textarea"]')) {
        if (this.DOM.sections.user.style.display !== 'none') {
          this.verifyUser();
        } else if (this.DOM.sections.produk.style.display !== 'none') {
          this.selectProduk();
        } else if (this.DOM.sections.kode.style.display !== 'none') {
          this.checkKode();
        }
      }
    });
    
    Object.values(this.DOM.inputs).forEach(input => {
      if (input) {
        input.addEventListener('blur', () => {
          if (input.value.trim() === '') return;
          input.classList.toggle('is-invalid', !input.checkValidity());
        });
      }
    });
  }
}