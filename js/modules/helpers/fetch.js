const scriptUrl = "https://script.google.com/macros/s/AKfycbyqYUZwWgD2hqLf12tdrcwoJtNl8EPGej1RgrFXJtlP5Z_GshzRqNOfVufROGcEJ1bvSA/exec";

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
