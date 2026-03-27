const themeRadios = document.querySelectorAll('.theme-controller');
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    applyTheme(savedTheme);
    const selectedRadio = document.querySelector(`.theme-controller[value="${savedTheme}"]`);
    if (selectedRadio) selectedRadio.checked = true;
}

themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            const theme = radio.value;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        }
    });
});