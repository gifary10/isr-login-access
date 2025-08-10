/**
 * Module untuk menangani penyimpanan data login dan redirect ke halaman tujuan
 */
export class LoginHandler {
  constructor() {
    this.loginDataKey = 'safetyReportLoginData';
    this.loginPageUrl = 'https://gifary10.github.io/isr-login-access/';
    this.targetPageUrl = 'https://gifary10.github.io/isr-e-45001-2018/';
    this.sessionDuration = 8 * 60 * 60 * 1000; // 8 jam dalam milidetik
    this.loginForm = document.getElementById('loginForm');
    this.init();
  }

  init() {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Cek session saat inisialisasi
    this.checkSession();
  }

  /**
   * Menangani proses login dan penyimpanan data
   * @param {Event} e - Event submit form
   */
  handleLogin(e) {
    e.preventDefault();

    const user = document.getElementById('user')?.value.trim(); // Diubah dari username → user
    const email = document.getElementById('email')?.value.trim();
    const accessCode = document.getElementById('accessCode')?.value.trim();

    if (!user || !email || !accessCode) {
      this.showError('Harap isi semua field!');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Format email tidak valid');
      return;
    }

    // Simpan data login dengan field 'user' bukan 'username'
    this.saveLoginData({
      user, // Diubah dari username → user
      email,
      accessCode,
      loginTime: Date.now()
    });

    this.redirectToTarget();
  }

  /**
   * Cek validitas session yang tersimpan
   * @returns {boolean} - True jika session valid
   */
  checkSession() {
    const loginData = this.getSavedLoginData();
    if (!loginData) return false;

    // Validasi field yang diperlukan (sesuai dengan LoginSystem.js)
    if (!loginData.user || !loginData.email || !loginData.accessCode) { // Diubah dari username → user
      this.clearLoginData();
      return false;
    }

    const now = Date.now();
    if (now - loginData.loginTime > this.sessionDuration) {
      this.clearLoginData();
      return false;
    }

    return true;
  }

  // ... (method-method lainnya tetap sama, hanya disesuaikan field username → user)
  // validateEmail(), saveLoginData(), redirectToTarget(), showError(), dll
}

document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
