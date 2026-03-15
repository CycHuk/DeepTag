const dropArea = document.getElementById('dropArea');
const input = document.getElementById('images');
const preview = document.getElementById('preview');
const MAX_FILES = 250;
const MAX_SIZE_MB = 10;

let filesArray = [];

// Open file selector on click
dropArea.addEventListener('click', () => input.click());

// Handle files selection
input.addEventListener('change', e => handleFiles(e.target.files));

// Handle drag & drop
dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('border-flyon-primary', 'bg-flyon-card/20');
});
dropArea.addEventListener('dragleave', e => {
    dropArea.classList.remove('border-flyon-primary', 'bg-flyon-card/20');
});
dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('border-flyon-primary', 'bg-flyon-card/20');
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    for (let file of files) {
        if (filesArray.length >= MAX_FILES) {
            alert(`Максимум ${MAX_FILES} фотографий`);
            break;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`Файл ${file.name} превышает 10 МБ`);
            continue;
        }
        filesArray.push(file);
        addPreview(file, filesArray.length - 1);
    }
    updateInputFiles();
}

function addPreview(file, idx) {
    const reader = new FileReader();
    reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'relative group';
        div.dataset.index = idx;
        div.innerHTML = `
            <img src="${e.target.result}" class="w-full h-32 object-cover rounded-xl border border-gray-200" />
            <button type="button" class="absolute top-1 right-1 bg-flyon-card/80 hover:bg-red-500 text-red-600 hover:text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition" onclick="removeFile(${idx}, this)">
                <span class="icon-[tabler--x] w-4 h-4"></span>
            </button>
        `;
        preview.appendChild(div);
    };
    reader.readAsDataURL(file);
}

function removeFile(index, button) {
    // Удаляем файл из массива
    filesArray[index] = null;

    // Удаляем только элемент DOM
    const div = button.closest('div[data-index]');
    if (div) div.remove();

    updateInputFiles();
}

function updateInputFiles() {
    const dataTransfer = new DataTransfer();
    filesArray.forEach(f => {
        if (f) dataTransfer.items.add(f);
    });
    input.files = dataTransfer.files;
}

function handleFormSubmit() {
    document.getElementById('formToast').classList.remove('hidden');
}