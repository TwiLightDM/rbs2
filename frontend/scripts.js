let currentDir = '.';
let previousDir = currentDir; 

// loadConfig - Функция Загрузка конфигурации из config.json
async function loadConfig() {
    const response = await fetch('./config.json');
    if (response.ok) {
        const config = await response.json();
        console.log(config.port);
        console.log(config.dir);
        currentDir = config.dir; 
    } else {
        console.error('Не удалось загрузить конфигурацию.');
    }
}

// fetchFiles - Функция для вывода списка файлов и директорий
async function fetchFiles() {
    const order = document.querySelector('input[name="order"]:checked').value;
    const response = await fetch(`/files?dir=${encodeURIComponent(currentDir)}&order=${order}`);
    const errorMessage = document.getElementById('errorMessage');
    updateCurrentPath();
    updateBackButton(); 
    if (response.ok) {
        const files = await response.json();
        if (files !== null){
            const fileList = document.getElementById('fileList');

            fileList.innerHTML = ''; 
            errorMessage.textContent = ''; 

            files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.textContent = `${file.name} - ${file.size} ${file.format}`;
                if (file.isDir) {
                    listItem.classList.add('dir');
                    listItem.onclick = () => handleFileClick(file);
                }
                fileList.appendChild(listItem);
            });
        } else {
            const errorText = await response.text();
            errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}`; 
            fileList.innerHTML = '';
        }
    }
}

// handleFileClick Функция для обработки клика на файл или папку
function handleFileClick(file) {
    if (file.isDir) { 
        previousDir = currentDir;
        console.log(previousDir)
        console.log(currentDir)
        currentDir = `${currentDir}/${file.name}`;
        fetchFiles();
    }
}
// updateCurrentPath Фунция для отображения нынешней директории
function updateCurrentPath() {
    const path = document.getElementById("currentPath")
    path.textContent = currentDir
}

// handleOrderChange Функция для обработки изменения порядка сортировки
function handleOrderChange() {
    fetchFiles(); 
}

// updateBackButton Функция для изменения состояния кнопки
function updateBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.style.display = (currentDir === '.') ? 'none' : 'block'; 
}

// pastDir Функция для возврата на предыдущую директорию  
function pastDir(){
    if (previousDir !== null) {
        currentDir = previousDir; 
        previousDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
        fetchFiles(); 
    }
}

window.onload = async () => {
    await loadConfig();
    fetchFiles();
    const orderRadios = document.querySelectorAll('input[name="order"]');
    orderRadios.forEach(radio => {
        radio.addEventListener('change', handleOrderChange);
    });
}