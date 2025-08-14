export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function showValidation(element, feedbackElement, isValid, message) {
    if (isValid) {
        element.classList.remove('is-invalid');
        feedbackElement.style.display = 'none';
    } else {
        element.classList.add('is-invalid');
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
    }
    return isValid;
}