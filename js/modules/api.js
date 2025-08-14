import { state } from '../main.js';
import { populateProduk, skeletonProduk } from './dom.js';
import { showValidation } from './validation.js';

export async function verifyUser(user, email) {
    try {
        const res = await fetch(state.JSON_URL);
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        state.matchedRows = data.filter(row => 
            row.User.toLowerCase() === user.toLowerCase() && 
            row.Email.toLowerCase() === email.toLowerCase()
        );
        
        if (state.matchedRows.length > 0) {
            skeletonProduk();
            setTimeout(() => {
                populateProduk(state.matchedRows);
                return { success: true, message: "User ditemukan!" };
            }, 1000);
            return { success: true, message: "User ditemukan!" };
        } else {
            return { success: false, message: "User/Email tidak ditemukan. Silakan coba lagi." };
        }
    } catch(err) { 
        console.error('Error:', err);
        return { success: false, message: "Gagal mengambil data. Silakan coba lagi nanti." };
    }
}

export async function validateAccessCode(selectedProduk, kode) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const matched = state.matchedRows.find(row => 
        row.Produk === selectedProduk && 
        row["Kode Akses"] === kode
    );
    
    if (matched) {
        if (matched.Link) {
            return { 
                success: true, 
                message: "Kode valid! Mengarahkan...",
                redirectUrl: matched.Link + (matched.Link.includes('?') ? '&' : '?') + "token=" + encodeURIComponent(kode)
            };
        }
    }
    return { success: false, message: "Kode akses salah! Silakan coba lagi." };
}