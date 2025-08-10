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

    /**
   * Menangani proses login dan penyimpanan data
   * @param {Event} e - Event submit form
   */
  handleLogin(e) {
    e.preventDefault();

    const user = document.getElementById('user')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const accessCode = document.getElementById('accessCode')?.value.trim();

    if (!user || !email || !accessCode) {
      this.showError('Harap isi semua field!');
      return;
    }

    // Validasi format email
    if (!this.validateEmail(email)) {
      this.showError('Format email tidak valid');
      return;
    }

    // Simpan data login
    this.saveLoginData({
      user,
      email,
      accessCode,
      loginTime: Date.now()
    });

    // Redirect ke halaman tujuan
    this.redirectToTarget();
  }

  /**
   * Validasi format email
   * @param {string} email - Email yang akan divalidasi
   * @returns {boolean} - True jika email valid
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Menyimpan data login ke localStorage
   * @param {Object} data - Data login yang akan disimpan
   */
  saveLoginData(data) {
    try {
      localStorage.setItem(this.loginDataKey, JSON.stringify(data));
      console.log('Login data saved successfully');
    } catch (error) {
      console.error('Error saving login data:', error);
      this.showError('Gagal menyimpan data login');
    }
  }

  /**
   * Redirect ke halaman tujuan
   */
  redirectToTarget() {
    window.location.href = this.targetPageUrl;
  }

  /**
   * Redirect ke halaman login
   */
  redirectToLogin() {
    window.location.href = this.loginPageUrl;
  }

  /**
   * Menampilkan pesan error
   * @param {string} message - Pesan error yang akan ditampilkan
   */
  showError(message) {
    alert(message); // Bisa diganti dengan toast notification yang lebih baik
  }

  /**
   * Mendapatkan data login yang tersimpan
   * @returns {Object|null} - Data login atau null jika tidak ada
   */
  getSavedLoginData() {
    try {
      const data = localStorage.getItem(this.loginDataKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving login data:', error);
      return null;
    }
  }

  /**
   * Membersihkan data login yang tersimpan
   */
  clearLoginData() {
    localStorage.removeItem(this.loginDataKey);
  }

  /**
   * Cek apakah user sudah login
   * @returns {boolean} - True jika sudah login
   */
  isLoggedIn() {
    const loginData = this.getSavedLoginData();
    if (!loginData) return false;

    const now = Date.now();
    if (now - loginData.loginTime > this.sessionDuration) {
      this.clearLoginData();
      return false;
    }

    return true;
  }
}

// Inisialisasi jika diperlukan
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
