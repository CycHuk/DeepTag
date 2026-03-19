function handleFormSubmit() {
    document.getElementById('formToast').classList.remove('hidden');
}

setTimeout(() => {
    document.querySelectorAll('.toast-item').forEach(el => {
      el.classList.add('opacity-0', 'transition', 'duration-500');
      setTimeout(() => el.remove(), 500);
    });
  }, 5000);