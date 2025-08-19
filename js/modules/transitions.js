export function switchStep(fromId, toId) {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    fromEl.classList.remove('fade-scale-in');
    fromEl.classList.add('fade-scale-out');
    setTimeout(() => {
        fromEl.style.display = "none";
        toEl.style.display = "block";
        toEl.classList.remove('fade-scale-out');
        toEl.classList.add('fade-scale-in');
        const firstInput = toEl.querySelector('input, select');
        if (firstInput) firstInput.focus();
    }, 400);
}