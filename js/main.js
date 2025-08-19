import { initApp } from './modules/events.js';
import { updateProgress } from './modules/progress.js';

export const state = {
    matchedRows: [],
    JSON_URL: "https://script.google.com/macros/s/AKfycbxmmdgHsgikOoJ_H5ppkFLSKIZfwmgQbcl2xMjon3naP-c-Oqf8t-q2X80tuvtYM-MF5w/exec",
    isOnline: navigator.onLine
};

// Track online/offline status
window.addEventListener('online', () => {
    state.isOnline = true;
    showOnlineStatus();
});

window.addEventListener('offline', () => {
    state.isOnline = false;
    showOfflineStatus();
});

function showOnlineStatus() {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast bg-success text-white';
    toast.textContent = 'You are back online';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showOfflineStatus() {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast bg-warning text-dark';
    toast.textContent = 'You are offline. Some features may be limited.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Check for updates when the app starts
function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) reg.update().catch(err => console.log('Update check failed:', err));
        });
    }
}

// Register periodic sync for data updates
function registerPeriodicSync() {
    if ('periodicSync' in window && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            reg.periodicSync.register('update-content', {
                minInterval: 24 * 60 * 60 * 1000 // Once per day
            }).catch(err => console.log('Periodic sync registration failed:', err));
        });
    }
}

// Initialize push notifications
function initPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Push notifications permission granted');
                subscribeToPush();
            }
        });
    }
}

function subscribeToPush() {
    navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
        }).then(sub => {
            console.log('Push subscription successful:', sub);
            // Send subscription to your server
        }).catch(err => console.log('Push subscription failed:', err));
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running as PWA');
        document.documentElement.setAttribute('data-pwa', 'true');
    }
    
    updateProgress(1);
    initApp();
    
    // Initialize PWA features
    checkForUpdates();
    registerPeriodicSync();
    initPushNotifications();
});
