export function updateProgress(step) {
    const progressBar = document.getElementById("progressBar");
    let percent = step * 33.33;
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", step);
    progressBar.textContent = "Step " + step + " dari 3";
    
    if (step === 1) {
        progressBar.className = "progress-bar bg-primary";
    } else if (step === 2) {
        progressBar.className = "progress-bar bg-info";
    } else {
        progressBar.className = "progress-bar bg-success";
    }
}