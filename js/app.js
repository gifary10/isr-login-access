import { LoginSystem } from './modules/LoginSystem.js';

document.addEventListener('DOMContentLoaded', () => {
  new LoginSystem();
  
  // Check if app is running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    console.log('Running in standalone mode');
    document.body.classList.add('standalone-mode');
  }
  
  // Check for updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
});