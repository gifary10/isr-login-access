import { state, elements, utils, productManager, API_CONFIG } from './cores.js';

// UI Handlers
const ui = {
  showLoading: (button) => {
    const spinner = button.querySelector('.spinner-border');
    const text = button.querySelector('span:not(.spinner-border)');
    if (spinner) spinner.classList.remove('d-none');
    if (text) text.classList.add('d-none');
    button.disabled = true;
  },

  hideLoading: (button) => {
    const spinner = button.querySelector('.spinner-border');
    const text = button.querySelector('span:not(.spinner-border)');
    if (spinner) spinner.classList.add('d-none');
    if (text) text.classList.remove('d-none');
    button.disabled = false;
  },

  showError: (message, element) => {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
  },

  clearErrors: () => {
    Object.values(elements.errors).forEach(error => {
      if (error) error.style.display = 'none';
    });
  },

  showGlobalLoading: () => {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.style.display = 'flex';
    }
  },

  hideGlobalLoading: () => {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.style.display = 'none';
    }
  }
};

// API Handlers
const api = {
  verifyEmail: async () => {
    try {
      const data = await utils.fetchWithTimeout(
        `${API_CONFIG.SCRIPT_URL}?action=verifyEmail&user=${encodeURIComponent(state.user.username)}&email=${encodeURIComponent(state.user.email)}`,
        {},
        API_CONFIG.TIMEOUTS.VERIFY_EMAIL
      );

      if (data.success) {
        elements.displays.userInfo.textContent = `${state.user.username} | ${state.user.email}`;
        productManager.populate(data.products);
        utils.showSection('product');
        utils.updateStepIndicator(3);
      } else {
        utils.showToast(
          'Verifikasi Gagal', 
          'Username dan email tidak sesuai dengan data pada saat pembelian di lynk.id. Silakan periksa kembali.', 
          'error'
        );
        
        elements.inputs.email.value = '';
        elements.inputs.email.focus();
        
        throw new Error("Verifikasi gagal. Silakan coba lagi.");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        ui.showError("Waktu verifikasi habis. Silakan coba lagi.", elements.errors.email);
      } else {
        ui.showError(error.message, elements.errors.email);
      }
      throw error;
    } finally {
      ui.hideLoading(elements.buttons.submitEmail);
    }
  },

  getAccessCode: async () => {
    try {
      const data = await utils.fetchWithTimeout(
        `${API_CONFIG.SCRIPT_URL}?action=getAccessCode&user=${encodeURIComponent(state.user.username)}&email=${encodeURIComponent(state.user.email)}&product=${encodeURIComponent(state.product)}`,
        {},
        API_CONFIG.TIMEOUTS.GET_ACCESS_CODE
      );
      
      if (data.success) {
        state.accessCode = data.accessCode;
        state.redirectUrl = data.redirectUrl || state.redirectUrl;
        
        elements.displays.userInfoFinal.textContent = `${state.user.username} | ${state.user.email}`;
        elements.displays.product.value = state.product;
        elements.displays.accessCode.textContent = state.accessCode;
        
        utils.showSection('accessCode');
        utils.updateStepIndicator(4);
      } else {
        throw new Error(data.message || "Gagal mendapatkan kode akses");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        ui.showError("Waktu permintaan habis. Silakan coba lagi.", elements.errors.product);
      } else {
        ui.showError(error.message, elements.errors.product);
      }
      throw error;
    } finally {
      ui.hideLoading(elements.buttons.verify);
    }
  }
};

// Event Handlers
const handleUsernameSubmit = () => {
  ui.clearErrors();
  const username = utils.sanitizeInput(elements.inputs.username.value.trim());
  
  if (!username) {
    ui.showError("Username harus diisi", elements.errors.username);
    return;
  }
  
  if (username.length < 3) {
    ui.showError("Username minimal 3 karakter", elements.errors.username);
    return;
  }
  
  state.user.username = username.toLowerCase();
  utils.showSection('email');
  utils.updateStepIndicator(2);
};

const handleEmailSubmit = async () => {
  ui.clearErrors();
  const email = utils.sanitizeInput(elements.inputs.email.value.trim().toLowerCase());
  
  if (!email) {
    ui.showError("Email harus diisi", elements.errors.email);
    return;
  }
  
  if (!utils.isValidEmail(email)) {
    ui.showError("Format email tidak valid atau menggunakan domain sementara", elements.errors.email);
    return;
  }
  
  const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  const domain = email.split('@')[1];
  if (!commonProviders.includes(domain)) {
    if (!confirm(`Email dari domain ${domain} mungkin tidak diterima. Lanjutkan?`)) {
      return;
    }
  }
  
  ui.showLoading(elements.buttons.submitEmail);
  state.user.email = email;
  await api.verifyEmail();
};

const handleProductVerify = async () => {
  ui.clearErrors();
  if (!elements.inputs.product.value || elements.inputs.product.disabled) {
    ui.showError("Silakan pilih produk", elements.errors.product);
    return;
  }
  
  state.product = elements.inputs.product.value;
  ui.showLoading(elements.buttons.verify);
  await api.getAccessCode();
};

const handleContinue = () => {
  ui.showLoading(elements.buttons.continue);
  
  const loginData = {
    isLoggedIn: true,
    username: state.user.username,
    product: state.product,
    expires: Date.now() + 24 * 60 * 60 * 1000
  };
  localStorage.setItem('isrAuthData', JSON.stringify(loginData));
  
  // Pastikan spinner dihentikan sebelum redirect
  setTimeout(() => {
    ui.hideLoading(elements.buttons.continue);
    window.location.href = state.redirectUrl;
  }, 500);
};

const handleBackNavigation = () => {
  ui.clearErrors();
  if (elements.sections.email.style.display === 'block') {
    utils.showSection('username');
    utils.updateStepIndicator(1);
  } else if (elements.sections.product.style.display === 'block') {
    utils.showSection('email');
    utils.updateStepIndicator(2);
  } else if (elements.sections.accessCode.style.display === 'block') {
    utils.showSection('product');
    utils.updateStepIndicator(3);
  }
};

// Input Handlers with Debounce
const setupInputListeners = () => {
  const debounce = (func, timeout = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  };

  elements.inputs.username.addEventListener('input', debounce(() => {
    elements.errors.username.style.display = 'none';
  }));
  
  elements.inputs.email.addEventListener('input', debounce(() => {
    elements.errors.email.style.display = 'none';
  }));
  
  elements.inputs.product.addEventListener('change', () => {
    elements.errors.product.style.display = 'none';
  });
};

// Initialize Event Listeners
const initEventListeners = () => {
  // Reset form state saat halaman dimuat atau dimuat ulang
  utils.resetFormState();

  elements.buttons.submitUsername.addEventListener('click', handleUsernameSubmit);
  elements.buttons.submitEmail.addEventListener('click', handleEmailSubmit);
  elements.buttons.verify.addEventListener('click', handleProductVerify);
  elements.buttons.continue.addEventListener('click', handleContinue);
  
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', handleBackNavigation);
  });
  
  // Handle browser back button
  window.addEventListener('popstate', () => {
    utils.resetFormState();
  });
  
  setupInputListeners();
};

// Initialize App
document.addEventListener('DOMContentLoaded', initEventListeners);
