document.addEventListener('DOMContentLoaded', () => {
  // Create splash screen element
  const splashScreen = document.createElement('div');
  splashScreen.id = 'splash-screen';
  splashScreen.style.position = 'fixed';
  splashScreen.style.top = '0';
  splashScreen.style.left = '0';
  splashScreen.style.width = '100%';
  splashScreen.style.height = '100%';
  splashScreen.style.backgroundColor = '#f8fafc';
  splashScreen.style.display = 'flex';
  splashScreen.style.flexDirection = 'column';
  splashScreen.style.alignItems = 'center';
  splashScreen.style.justifyContent = 'center';
  splashScreen.style.zIndex = 'var(--z-splash)';
  splashScreen.style.transition = 'opacity 0.5s ease, backdrop-filter 0.5s ease';
  splashScreen.style.overflow = 'hidden';
  splashScreen.style.backdropFilter = 'blur(0px)';

  // Background dots animation
  const background = document.createElement('div');
  background.style.position = 'absolute';
  background.style.top = '0';
  background.style.left = '0';
  background.style.width = '100%';
  background.style.height = '100%';
  background.style.backgroundImage = 'radial-gradient(#0000000a 1px, transparent 0)';
  background.style.backgroundSize = '20px 20px';
  background.style.animation = 'moveDots 20s linear infinite';
  background.style.zIndex = '0';

  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.style.position = 'relative';
  contentContainer.style.zIndex = '2';
  contentContainer.style.display = 'flex';
  contentContainer.style.flexDirection = 'column';
  contentContainer.style.alignItems = 'center';
  contentContainer.style.justifyContent = 'center';
  contentContainer.style.textAlign = 'center';
  contentContainer.style.padding = '2rem';

  // Logo container
  const logoContainer = document.createElement('div');
  logoContainer.style.position = 'relative';
  logoContainer.style.width = '120px';
  logoContainer.style.height = '120px';
  logoContainer.style.margin = '1rem 0';

  // Logo
  const logo = document.createElement('img');
  logo.src = 'logoh.png';
  logo.alt = 'Logo';
  logo.style.width = '100%';
  logo.style.height = '100%';
  logo.style.objectFit = 'contain';
  logo.style.opacity = '0';
  logo.style.transform = 'scale(0.8)';
  logo.style.animation = 'fadeInScale 0.8s ease 0.3s forwards, float 3s ease-in-out infinite 1.1s';

  // Pulsing circle
  const circle = document.createElement('div');
  circle.style.position = 'absolute';
  circle.style.width = '100%';
  circle.style.height = '100%';
  circle.style.borderRadius = '50%';
  circle.style.backgroundColor = 'rgba(250, 128, 12, 0.1)';
  circle.style.top = '0';
  circle.style.left = '0';
  circle.style.transform = 'scale(0)';
  circle.style.animation = 'pulse 2s ease-out infinite 0.5s';

  // Title
  const title = document.createElement('h1');
  title.textContent = 'Integrated Safety Report';
  title.style.fontSize = '1.75rem';
  title.style.fontWeight = '700';
  title.style.color = '#1f2937';
  title.style.marginBottom = '0.5rem';
  title.style.opacity = '0';
  title.style.transform = 'translateY(20px)';
  title.style.animation = 'fadeInUp 0.6s ease 0.5s forwards';

  // Slogan
  const slogan = document.createElement('p');
  slogan.textContent = 'Empowering organizations with smarter safety solutions';
  slogan.style.fontSize = '0.9rem';
  slogan.style.color = '#4b5563';
  slogan.style.maxWidth = '300px';
  slogan.style.marginBottom = '1.5rem';
  slogan.style.opacity = '0';
  slogan.style.transform = 'translateY(20px)';
  slogan.style.animation = 'fadeInUp 0.6s ease 0.7s forwards';

  // Progress bar container
  const progressContainer = document.createElement('div');
  progressContainer.style.width = '200px';
  progressContainer.style.height = '4px';
  progressContainer.style.backgroundColor = '#e5e7eb';
  progressContainer.style.borderRadius = '2px';
  progressContainer.style.overflow = 'hidden';
  progressContainer.style.marginTop = '1rem';
  progressContainer.style.position = 'relative';

  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.style.width = '0%';
  progressBar.style.height = '100%';
  progressBar.style.backgroundColor = '#fa800c';
  progressBar.style.borderRadius = '2px';
  progressBar.style.transition = 'width 0.2s ease';

  // Shimmer effect on progress bar
  const shimmer = document.createElement('div');
  shimmer.style.position = 'absolute';
  shimmer.style.top = '0';
  shimmer.style.left = '0';
  shimmer.style.height = '100%';
  shimmer.style.width = '50px';
  shimmer.style.background = 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)';
  shimmer.style.animation = 'shimmer 1s infinite';

  // Structure
  logoContainer.appendChild(circle);
  logoContainer.appendChild(logo);
  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(shimmer);

  contentContainer.appendChild(logoContainer);
  contentContainer.appendChild(title);
  contentContainer.appendChild(slogan);
  contentContainer.appendChild(progressContainer);

  splashScreen.appendChild(background);
  splashScreen.appendChild(contentContainer);
  document.body.appendChild(splashScreen);

  // Animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.8; }
      70% { transform: scale(1.2); opacity: 0.2; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    @keyframes shimmer {
      0% { left: -50px; }
      100% { left: 200px; }
    }

    @keyframes moveDots {
      0% { background-position: 0 0; }
      100% { background-position: 40px 40px; }
    }
  `;
  document.head.appendChild(style);

  // Animate progress bar
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) clearInterval(progressInterval);
  }, 50);

  // Check if launched as PWA
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  };

  // Hide splash
  window.addEventListener('load', () => {
    const splashDuration = isPWA() ? 2000 : 4500;
    
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      splashScreen.style.backdropFilter = 'blur(8px)';
      setTimeout(() => splashScreen.remove(), 600);
    }, splashDuration);
  });
});