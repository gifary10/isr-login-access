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
  const progressInterval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) clearInterval(progressInterval);
  }, 30);

  window.addEventListener('load', () => {
  // Hentikan progress bar di 90% saat load event
  clearInterval(progressInterval);
  progressBar.style.width = '90%';
  
  // Animasi selesai ke 100% sebelum menghilang
  setTimeout(() => {
    progressBar.style.width = '100%';
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      setTimeout(() => splashScreen.remove(), 500);
    }, 300);
  }, 700);
});
}