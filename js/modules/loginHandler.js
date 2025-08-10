/**
 * Module untuk menangani penyimpanan data login dan redirect ke halaman tujuan
 */
export class LoginHandler {
  constructor() {
    this.loginDataKey = 'safetyReportLoginData';
    this.redirectUrl = 'https://gifary10.github.io/halaman-tujuan/';
    this.loginForm = document.getElementById('loginForm');
    this.init();
  }

  init() {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  /**
   * Menangani proses login dan penyimpanan data
   * @param {Event} e - Event submit form
   */
  handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const accessCode = document.getElementById('accessCode')?.value.trim();

    if (!username || !email || !accessCode) {
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
      username,
      email,
      accessCode,
      loginTime: Date.now() // Waktu login dalam milidetik
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
    window.location.href = this.redirectUrl;
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
}

// Inisialisasi jika diperlukan
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});