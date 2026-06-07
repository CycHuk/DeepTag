// Function to apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// Function to restore theme from localStorage
function restoreTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        const selectedRadio = document.querySelector(`.theme-controller[value="${savedTheme}"]`);
        if (selectedRadio) selectedRadio.checked = true;
    }
}

// Apply theme on initial load
restoreTheme();
// Add event listener for theme changes
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('theme-controller') && e.target.checked) {
        const theme = e.target.value;
        applyTheme(theme);
        localStorage.setItem('theme', theme);
    }
});
// Re-apply theme after htmx requests
if (typeof htmx !== 'undefined') {
    document.body.addEventListener('htmx:afterRequest', function(evt) {
        // Small delay to ensure DOM is updated
        setTimeout(restoreTheme, 50);
    });
}