let currentDir = '.';
let previousDir; 

// loadConfig - Функция для загрузки конфигурации из config.json
async function loadConfig() {
    const response = await fetch('./config.json');
    if (response.ok) {
        const config = await response.json();
        console.log(config.path);
        console.log(config.port);
        console.log(config.dir);
        currentDir = config.dir;

        let slashCount = 0;
        for (let i = 0; i < currentDir.length; i++) {
            if (currentDir[i] === '/') {
                slashCount++;
            }
        }
        if (slashCount > 1) {
            previousDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
        }
        console.log(previousDir) 
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
        const fileList = document.getElementById('fileList');
        if (files !== null){
            if(fileList != null){
                fileList.innerHTML = ''; 
            }
            if(errorMessage != null){
                errorMessage.textContent = ''; 
            }
            files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.classList.add('file-item');
                
                const fileInfo = document.createElement('span');
                fileInfo.textContent = `${file.name} - ${file.size} ${file.format}`;
                
                const fileType = document.createElement('div');
                fileType.classList.add('file-type');
                fileType.innerHTML = file.isDir ? "<span>Директория</span>" : "<span>Файл</span>";

                listItem.appendChild(fileInfo);
                listItem.appendChild(fileType);

                if (file.isDir) {
                    listItem.classList.add('dir');
                    listItem.onclick = () => handleFileClick(file);
                }
                listItem.classList.add('file');
                if (fileList != null){
                    fileList.appendChild(listItem);
                }
                
            });
        } else {
            const errorText = await response.text();
            if (errorMessage != null){
                errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}`; 
            }
            if (fileList != null){
                fileList.innerHTML = '';
            }
            
        }
    }
}

// handleFileClick Функция для обработки клика на файл или папку
function handleFileClick(file) {
    if (file.isDir) { 
        previousDir = currentDir;
        currentDir = `${currentDir}/${file.name}`;
        fetchFiles();
    }
}
// updateCurrentPath Фунция для отображения нынешней директории
function updateCurrentPath() {
    const path = document.getElementById("currentPath")
    if(path != null){
        path.textContent = currentDir
    }
}

// handleOrderChange Функция для обработки изменения порядка сортировки
function handleOrderChange() {
    fetchFiles(); 
}

// updateBackButton Функция для изменения состояния кнопки
function updateBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton != null){
        backButton.style.display = (currentDir === '.') ? 'none' : 'block'; 
    }
}

// checkPastDir Функция для проверки возможности вернуться в предыдущую директорию
function checkPastDir(){
    let slashCount = 0;
    for (let i = 0; i < currentDir.length; i++) {
        if (currentDir[i] === '/') {
            slashCount++;
        }
    }
    if (slashCount > 1) {
        previousDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
    } 
}

// pastDir Функция для возврата на предыдущую директорию  
function pastDir(){
    if (previousDir !== null) {
        currentDir = previousDir; 
        checkPastDir();
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