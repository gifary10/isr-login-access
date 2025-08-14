import { switchStep } from './transitions.js';
import { verifyUser, validateAccessCode } from './api.js';
import { updateProgress } from './progress.js';
import { showValidation, validateEmail } from './validation.js';
import { getDOMElements, addRippleEffect } from './dom.js';
import { state } from '../main.js';

export function initApp() {
    const dom = getDOMElements();
    
    // Check if all required elements exist
    if (!dom.btnVerify || !dom.btnNextStep2 || !dom.btnBackStep2 || 
        !dom.btnBackStep3 || !dom.btnSubmitKode) {
        console.error('Required buttons not found in DOM');
        return;
    }

    // Step 1 → Verifikasi
    dom.btnVerify.addEventListener('click', async (e) => {
        addRippleEffect(e);
        const user = dom.inputUser?.value.trim();
        const email = dom.inputEmail?.value.trim();
        
        // Validate inputs
        const isUserValid = showValidation(dom.inputUser, document.getElementById('userFeedback'), user, "Nama user harus diisi");
        const isEmailValid = showValidation(dom.inputEmail, document.getElementById('emailFeedback'), 
                              email && validateEmail(email), "Email harus valid dan diisi");
        
        if (!isUserValid || !isEmailValid) return;
        
        dom.verifyResult.textContent = "";
        dom.loadingOverlay.style.display = "flex";
        
        const result = await verifyUser(user, email);
        dom.verifyResult.textContent = result.message;
        
        if (result.success) {
            // Display user info in step 2
            document.getElementById('displayUser').textContent = user;
            document.getElementById('displayEmail').textContent = email;
            
            setTimeout(() => {
                switchStep('section1','section2');
                updateProgress(2);
            }, 1000);
        }
        
        dom.loadingOverlay.style.display = "none";
    });

    // Step 2 → Step 3
    dom.btnNextStep2.addEventListener('click', (e) => {
        addRippleEffect(e);
        if (!dom.selectProduk.value) {
            dom.selectProduk.classList.add('is-invalid');
            return;
        }
        dom.selectProduk.classList.remove('is-invalid');
        
        // Display user info and product in step 3
        document.getElementById('displayUserStep3').textContent = dom.inputUser.value.trim();
        document.getElementById('displayEmailStep3').textContent = dom.inputEmail.value.trim();
        document.getElementById('displayProduk').textContent = dom.selectProduk.value;
        
        switchStep('section2','section3');
        updateProgress(3);
    });

    // Rest of the code remains the same...
    // Step 2 → Back ke Step 1
    dom.btnBackStep2.addEventListener('click', (e) => {
        addRippleEffect(e);
        switchStep('section2','section1');
        updateProgress(1);
    });

    // Step 3 → Back ke Step 2
    dom.btnBackStep3.addEventListener('click', (e) => {
        addRippleEffect(e);
        switchStep('section3','section2');
        updateProgress(2);
    });

    // Step 3 → Submit dengan spinner
    dom.btnSubmitKode.addEventListener('click', async (e) => {
        addRippleEffect(e);
        const selectedProduk = dom.selectProduk.value;
        const kode = dom.inputKode.value.trim();
        
        // Validate kode
        if (!showValidation(dom.inputKode, document.getElementById('kodeFeedback'), kode, "Kode akses harus diisi")) {
            return;
        }
        
        dom.kodeResult.textContent = "";
        dom.loadingOverlayStep3.style.display = "flex";
        
        const result = await validateAccessCode(selectedProduk, kode);
        
        if (result.success) {
            dom.kodeResult.textContent = result.message;
            dom.kodeResult.style.backgroundColor = "#ebfbee";
            dom.kodeResult.style.color = "#2b8a3e";
            dom.kodeResult.style.borderLeftColor = "#40c057";
            
            if (result.redirectUrl) {
                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 1000);
            }
        } else {
            dom.kodeResult.textContent = result.message;
        }
        
        dom.loadingOverlayStep3.style.display = "none";
    });

    // Add input validation on blur
    if (dom.inputUser) {
        dom.inputUser.addEventListener('blur', () => {
            showValidation(dom.inputUser, document.getElementById('userFeedback'), dom.inputUser.value.trim(), "Nama user harus diisi");
        });
    }

    if (dom.inputEmail) {
        dom.inputEmail.addEventListener('blur', () => {
            const email = dom.inputEmail.value.trim();
            showValidation(dom.inputEmail, document.getElementById('emailFeedback'), email && validateEmail(email), "Email harus valid dan diisi");
        });
    }

    if (dom.inputKode) {
        dom.inputKode.addEventListener('blur', () => {
            showValidation(dom.inputKode, document.getElementById('kodeFeedback'), dom.inputKode.value.trim(), "Kode akses harus diisi");
        });
    }

    // Allow form submission with Enter key
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (dom.section1.style.display !== 'none') {
                dom.btnVerify?.click();
            } else if (dom.section2.style.display !== 'none') {
                dom.btnNextStep2?.click();
            } else if (dom.section3.style.display !== 'none') {
                dom.btnSubmitKode?.click();
            }
        }
    });
}