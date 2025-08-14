import { initApp } from './modules/events.js';
import { updateProgress } from './modules/progress.js';

// Global state
export const state = {
    matchedRows: [],
    JSON_URL: "https://script.google.com/macros/s/AKfycbxmmdgHsgikOoJ_H5ppkFLSKIZfwmgQbcl2xMjon3naP-c-Oqf8t-q2X80tuvtYM-MF5w/exec"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    updateProgress(1);
    initApp();
});