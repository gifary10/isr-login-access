const scriptUrl = "https://script.google.com/macros/s/AKfycbyqYUZwWgD2hqLf12tdrcwoJtNl8EPGej1RgrFXJtlP5Z_GshzRqNOfVufROGcEJ1bvSA/exec";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export async function makeRequest(params) {
  this.showLoading(true);
  
  try {
    // Try to fetch from network first
    const response = await fetch(`${scriptUrl}?${new URLSearchParams(params)}`);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // Cache the successful response
    if (data.status === "success") {
      const cacheKey = `api_${params.action}_${JSON.stringify(params)}`;
      const cacheData = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    
    return data;
  } catch (error) {
    console.error('Network request failed, trying cache:', error);
    
    // Try to serve from cache if offline
    const cacheKey = `api_${params.action}_${JSON.stringify(params)}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      const parsedCache = JSON.parse(cachedResponse);
      
      // Check if cache is expired
      if (Date.now() - parsedCache.timestamp < CACHE_EXPIRY) {
        console.log('Serving from cache:', parsedCache.data);
        return parsedCache.data;
      } else {
        console.log('Cache expired, deleting:', cacheKey);
        localStorage.removeItem(cacheKey);
      }
    }
    
    this.showToast('error', 'Terjadi kesalahan saat memproses permintaan');
    throw error;
  } finally {
    this.showLoading(false);
  }
}
