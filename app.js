const DOM = {
  toast: document.getElementById('toast'),
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
  buttons: {
    verify: document.getElementById('verifyBtn'),
    selectProduk: document.getElementById('selectProdukBtn'),
    checkKode: document.getElementById('checkKodeBtn'),
    backToUser: document.getElementById('backToUserBtn'),
    backToProduk: document.getElementById('backToProdukBtn'),
    helpBtn: document.getElementById('helpBtn'),
    closeHelpModal: document.getElementById('closeHelpModal'),
    confirmHelpModal: document.getElementById('confirmHelpModal')
  },
  displays: {
    user: document.getElementById('displayUser'),
    email: document.getElementById('displayEmail'),
    produk: document.getElementById('displayProduk')
  },
  helpModal: document.getElementById('helpModal')
};

let deferredPrompt;
let currentSession = {
  user: "",
  email: "",
  produk: ""
};

function updateStepIndicator(currentStep) {
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNumber = parseInt(step.dataset.step);
    step.classList.toggle('completed', stepNumber < currentStep);
    step.classList.toggle('active', stepNumber === currentStep);
  });
  
  document.querySelectorAll('.step-connector').forEach((connector, index) => {
    connector.classList.toggle('active', index < currentStep - 1);
  });
}

function showToast(type, message) {
  const toast = DOM.toast;
  if (!toast) return;

  const content = toast.querySelector('.toast-content');
  const icon = toast.querySelector('.toast-icon');
  const messageEl = toast.querySelector('.toast-message');

  content.className = `toast-content bg-white shadow-lg rounded-lg overflow-hidden w-auto max-w-md border-l-4 toast-${type}`;
  messageEl.textContent = message;
  
  icon.innerHTML = type === 'success' ? 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>`;

  toast.classList.remove('hidden');
  content.classList.add('toast-show');

  const closeHandler = () => {
    content.classList.remove('toast-show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  };

  toast.querySelector('.toast-close').onclick = closeHandler;
  setTimeout(closeHandler, 3000);
}

function showLoading(show) {
  if (DOM.loadingIndicator) {
    DOM.loadingIndicator.classList.toggle('hidden', !show);
  }
}

function showSection(sectionId) {
  Object.values(DOM.sections).forEach(section => {
    section?.classList.toggle('hidden', section.id !== `${sectionId}Section`);
  });
  
  const stepMap = { user: 1, produk: 2, kode: 3 };
  updateStepIndicator(stepMap[sectionId]);
}

function updateUserDisplay() {
  DOM.displays.user.textContent = currentSession.user;
  DOM.displays.email.textContent = currentSession.email;
  DOM.displays.produk.textContent = currentSession.produk;
}

function selectProduk() {
  currentSession.produk = DOM.inputs.produk?.value;
  if (!currentSession.produk) {
    showToast('error', 'Harap pilih produk!');
    return;
  }
  updateUserDisplay();
  showSection("kode");
}

function backToUser() {
  showSection("user");
}

function backToProduk() {
  showSection("produk");
}

function initEventListeners() {
  DOM.buttons.verify?.addEventListener('click', verifyUser);
  DOM.buttons.selectProduk?.addEventListener('click', selectProduk);
  DOM.buttons.checkKode?.addEventListener('click', checkKode);
  DOM.buttons.backToUser?.addEventListener('click', backToUser);
  DOM.buttons.backToProduk?.addEventListener('click', backToProduk);
  
  // Help modal event listeners
  DOM.buttons.helpBtn?.addEventListener('click', () => {
    DOM.helpModal.classList.remove('hidden');
  });

  [DOM.buttons.closeHelpModal, DOM.buttons.confirmHelpModal].forEach(btn => {
    btn?.addEventListener('click', () => {
      DOM.helpModal.classList.add('hidden');
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (!DOM.sections.user?.classList.contains('hidden')) {
        verifyUser();
      } else if (!DOM.sections.produk?.classList.contains('hidden')) {
        selectProduk();
      } else if (!DOM.sections.kode?.classList.contains('hidden')) {
        checkKode();
      }
    }
  });
}

// PWA Installation Handler
function handleInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      hideInstallButton();
    }, 30000);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallButton();
    showToast('success', 'Aplikasi berhasil diinstall!');
  });
}

function showInstallButton() {
  const existingButton = document.getElementById('installButton');
  if (existingButton) return;

  const installButton = document.createElement('button');
  installButton.id = 'installButton';
  installButton.className = 'fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-50 animate-bounce';
  installButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  `;
  installButton.title = 'Install App';
  installButton.setAttribute('aria-label', 'Install App');
  
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    hideInstallButton();
  });
  
  document.body.appendChild(installButton);
}

function hideInstallButton() {
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.classList.remove('animate-bounce');
    installButton.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => installButton.remove(), 300);
  }
}

// Service Worker Update Handler
function handleServiceWorkerUpdates() {
  if ('serviceWorker' in navigator) {
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      showToast('info', 'Aplikasi sedang diperbarui...');
      setTimeout(() => window.location.reload(), 1000);
    });
    
    const checkForUpdates = () => {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().then(() => {
          console.log('Service Worker checked for updates');
        });
      });
    };
    
    // Check for updates every hour
    setInterval(checkForUpdates, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    });
  }
}

function checkPWADisplayMode() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched as PWA');
    document.documentElement.classList.add('pwa-mode');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateStepIndicator(1);
  initEventListeners();
  handleInstallPrompt();
  handleServiceWorkerUpdates();
  checkPWADisplayMode();
});