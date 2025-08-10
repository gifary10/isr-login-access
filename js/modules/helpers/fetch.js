const scriptUrl = "https://script.google.com/macros/s/AKfycbyndEy1mqc0E56C7u18mpK65e50hwS0JirWN0u5PjO94D6MNsSYlayOZb_vZsW9JleyEw/exec";

export async function makeRequest(params) {
  this.showLoading(true);
  try {
    const response = await fetch(`${scriptUrl}?${new URLSearchParams(params)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    this.showToast('error', 'Terjadi kesalahan saat memproses permintaan');
    throw error;
  } finally {
    this.showLoading(false);
  }
}