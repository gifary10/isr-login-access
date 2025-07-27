// Google Sheets API Configuration
const API_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwEjl7ig0V9_AzBrgEhxpjL6JQI8-Mmy3tl0GTq0FbJ67Q2PSv5FOn9HMp93j8VpT7YCA/exec",
  TIMEOUTS: {
    VERIFY_EMAIL: 10000,
    GET_ACCESS_CODE: 15000
  }
};

// Application State Management
const state = {
  user: {
    username: '',
    email: ''
  },
  product: '',
  accessCode: '',
  redirectUrl: "https://gifary10.github.io/isr-login-access/"
};

// DOM Elements Cache
const elements = {
  sections: {
    username: document.getElementById('usernameSection'),
    email: document.getElementById('emailSection'),
    product: document.getElementById('productDropdownSection'),
    accessCode: document.getElementById('accessCodeSection')
  },
  inputs: {
    username: document.getElementById('usernameInput'),
    email: document.getElementById('emailInput'),
    product: document.getElementById('product')
  },
  displays: {
    userInfo: document.getElementById('userInfoDisplay'),
    userInfoFinal: document.getElementById('userInfoDisplayFinal'),
    product: document.getElementById('productDisplay'),
    accessCode: document.getElementById('generatedAccessCode')
  },
  buttons: {
    submitUsername: document.getElementById('submitUsernameBtn'),
    submitEmail: document.getElementById('submitEmailBtn'),
    verify: document.getElementById('verifyBtn'),
    continue: document.getElementById('continueBtn')
  },
  errors: {
    username: document.getElementById('usernameError'),
    email: document.getElementById('emailError'),
    product: document.getElementById('productError')
  },
  steps: {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4'),
    progressBar: document.getElementById('progressBar')
  },
  toasts: {
    toast: new bootstrap.Toast(document.getElementById('liveToast')),
    toastTitle: document.getElementById('toastTitle'),
    toastMessage: document.getElementById('toastMessage')
  }
};

// Utility Functions
const utils = {
  showSection: (sectionName) => {
    Object.values(elements.sections).forEach(section => {
      section.style.display = 'none';
    });
    elements.sections[sectionName].style.display = 'block';
  },

  updateStepIndicator: (stepNumber) => {
    // Reset all steps
    Object.values(elements.steps).forEach((step, index) => {
      if (index < 4) {
        step.classList.remove('active', 'completed');
      }
    });

    // Update progress
    const progressPercent = (stepNumber / 4) * 100;
    elements.steps.progressBar.style.width = `${progressPercent}%`;

    // Mark completed and active steps
    for (let i = 1; i <= 4; i++) {
      const step = elements.steps[`step${i}`];
      if (i < stepNumber) {
        step.classList.add('completed');
      } else if (i === stepNumber) {
        step.classList.add('active');
      }
    }
  },

  fetchWithTimeout: async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      throw error;
    }
  },

  isValidEmail: (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email).toLowerCase())) {
      return false;
    }
    
    const disposableDomains = [
      'tempmail.com', 'mailinator.com', '10minutemail.com', 
      'guerrillamail.com', 'yopmail.com', 'fakeinbox.com'
    ];
    
    const domain = email.split('@')[1];
    return !disposableDomains.some(d => domain.includes(d));
  },

  showToast: (title, message, type = 'info') => {
    elements.toasts.toastTitle.textContent = title;
    elements.toasts.toastMessage.textContent = message;
    
    // Remove previous color classes
    const toastEl = document.getElementById('liveToast');
    toastEl.classList.remove('bg-danger', 'bg-warning', 'bg-success', 'bg-info');
    
    // Add appropriate color class
    switch(type) {
      case 'error':
        toastEl.classList.add('bg-danger');
        break;
      case 'warning':
        toastEl.classList.add('bg-warning');
        break;
      case 'success':
        toastEl.classList.add('bg-success');
        break;
      default:
        toastEl.classList.add('bg-info');
    }
    
    elements.toasts.toast.show();
  },

  sanitizeInput: (input) => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

// Product Management
const productManager = {
  populate: (products) => {
    elements.inputs.product.innerHTML = '<option selected disabled>-- Pilih Produk --</option>';
    
    if (!products || products.length === 0) {
      const option = document.createElement('option');
      option.textContent = "Tidak ada produk tersedia";
      option.disabled = true;
      elements.inputs.product.appendChild(option);
      return;
    }
    
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product;
      option.textContent = product;
      elements.inputs.product.appendChild(option);
    });
    
    // Enable verify button when products are available
    elements.buttons.verify.disabled = false;
  }
};

// Initialize App
function init() {
  utils.showSection('username');
  utils.updateStepIndicator(1);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Export for use in handlers.js
export { state, elements, utils, productManager, API_CONFIG };
