/**
 * access-control.js
 * Mengontrol akses ke link tujuan dengan memastikan verifikasi dilakukan terlebih dahulu
 */

const ACCESS_KEY = "verifiedAccessToken";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit dalam milidetik
const VALID_BYPASS_TOKENS = new Set(['DEV_BYPASS_123', 'TEMPORARY_ACCESS_456']);

function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUrl = urlParams.get('target');
  const bypassToken = urlParams.get('token');

  if (bypassToken && VALID_BYPASS_TOKENS.has(bypassToken) && targetUrl) {
    window.location.href = decodeURIComponent(targetUrl);
    return;
  }

  if (targetUrl && !isVerified()) {
    sessionStorage.setItem('targetUrl', decodeURIComponent(targetUrl));
    showToastIfVisible('info', 'Silakan verifikasi diri Anda terlebih dahulu untuk mengakses link tujuan');
  }
}

function showToastIfVisible(type, message) {
  const toast = document.getElementById('toast');
  if (toast && !toast.classList.contains('hidden')) {
    showToast(type, message);
  }
}

function isVerified() {
  const accessData = localStorage.getItem(ACCESS_KEY);
  if (!accessData) return false;

  try {
    const { timestamp, user, email } = JSON.parse(accessData);
    const currentTime = Date.now();

    if (currentTime - timestamp > SESSION_TIMEOUT) {
      localStorage.removeItem(ACCESS_KEY);
      return false;
    }

    return user === currentSession.user && email === currentSession.email;
  } catch (e) {
    console.error('Error parsing access data:', e);
    return false;
  }
}

function setVerified() {
  const verificationData = {
    user: currentSession.user,
    email: currentSession.email,
    timestamp: Date.now()
  };
  localStorage.setItem(ACCESS_KEY, JSON.stringify(verificationData));
}

function redirectToTarget() {
  const targetUrl = sessionStorage.getItem('targetUrl');
  if (targetUrl) {
    sessionStorage.removeItem('targetUrl');
    window.location.href = targetUrl;
  }
}

async function checkKode() {
  const kode = DOM.inputs.kode.value.trim();
  if (!kode) {
    showToast('error', 'Harap masukkan kode akses!');
    return;
  }

  try {
    const data = await makeRequest({
      action: "checkCode",
      user: currentSession.user,
      email: currentSession.email,
      produk: currentSession.produk,
      kode: kode
    });

    if (data.status === "success") {
      setVerified();
      showToast('success', 'Akses berhasil! Mengarahkan...');
      
      setTimeout(() => {
        const targetUrl = sessionStorage.getItem('targetUrl') || data.link;
        if (targetUrl) window.location.href = targetUrl;
      }, 1500);
    } else {
      showToast('error', 'Kode akses salah!');
    }
  } catch (error) {
    console.error('Error in checkKode:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkUrlParameters();
  
  if (isVerified() && sessionStorage.getItem('targetUrl')) {
    redirectToTarget();
  }
});

window.accessControl = {
  isVerified,
  setVerified,
  redirectToTarget
};