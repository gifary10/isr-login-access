const scriptUrl = "https://script.google.com/macros/s/AKfycbyndEy1mqc0E56C7u18mpK65e50hwS0JirWN0u5PjO94D6MNsSYlayOZb_vZsW9JleyEw/exec";

async function makeRequest(params) {
  showLoading(true);
  try {
    const response = await fetch(`${scriptUrl}?${new URLSearchParams(params)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    showToast('error', 'Terjadi kesalahan saat memproses permintaan');
    throw error;
  } finally {
    showLoading(false);
  }
}

async function verifyUser() {
  currentSession.user = DOM.inputs.user?.value.trim() || '';
  let emailInput = DOM.inputs.email?.value.trim() || '';
  
  // Append @gmail.com if not already present
  if (emailInput && !emailInput.endsWith('@gmail.com')) {
    emailInput += '@gmail.com';
  }
  currentSession.email = emailInput;

  if (!currentSession.user || !currentSession.email) {
    showToast('error', 'Harap isi nama dan email!');
    return;
  }

  try {
    const data = await makeRequest({
      action: "verify",
      user: currentSession.user,
      email: currentSession.email
    });

    if (data.status === "success") {
      DOM.inputs.produk.innerHTML = data.produk?.map(p => 
        `<option value="${p}">${p}</option>`
      ).join('') || '';
      showSection("produk");
    } else {
      showToast('error', 'User atau email tidak ditemukan!');
    }
  } catch (error) {
    console.error('Error in verifyUser:', error);
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