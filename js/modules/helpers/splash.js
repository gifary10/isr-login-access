export function setupSplashScreen() {
  const splashScreen = document.createElement('div');
  splashScreen.id = 'splash-screen';
  
  splashScreen.innerHTML = `
    <div class="text-center">
      <img src="logoh.png" alt="Logo" class="mb-4" loading="eager">
      <h1 class="mb-2">Integrated Safety Report</h1>
      <p class="mb-4">Empowering organizations with smarter safety solutions</p>
      <div class="progress" style="height: 4px; width: 200px; margin: 0 auto;">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
      </div>
    </div>
  `;
  
  document.body.prepend(splashScreen);
  
  const progressBar = splashScreen.querySelector('.progress-bar');
  let progress = 0;
  
  // Fungsi untuk menghitung kecepatan progress (lebih cepat di akhir)
  const getProgressIncrement = (currentProgress) => {
    if (currentProgress < 70) return 0.5; // Lambat di awal
    if (currentProgress < 90) return 1;   // Sedang di tengah
    return 2;                            // Cepat di akhir
  };

  const progressInterval = setInterval(() => {
    progress += getProgressIncrement(progress);
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      // Mulai animasi fade out setelah progress selesai
      setTimeout(() => {
        splashScreen.style.opacity = '0';
        // Hapus element setelah transisi selesai
        setTimeout(() => splashScreen.remove(), 500);
      }, 300);
    }
  }, 30);

  window.addEventListener('load', () => {
    // Jika halaman selesai load sebelum progress 90%, percepat ke 90%
    if (progress < 100) {
      clearInterval(progressInterval);
      progress = 100;
      progressBar.style.width = '100%';
      
      // Lanjutkan animasi ke 100% dengan kecepatan normal
      const finishInterval = setInterval(() => {
        progress += 1;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
          clearInterval(finishInterval);
          setTimeout(() => {
            splashScreen.style.opacity = '0';
            setTimeout(() => splashScreen.remove(), 5000);
          }, 300);
        }
      }, 30);
    }
  });
}
