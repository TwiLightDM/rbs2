import {FileInfo} from '../interfaces/iFileInfo';
import { modelFetch } from '../model/model';

export let currentDir: string = "";
export let previousDir: string = "";

// loadConfig - Функция для загрузки конфигурации из config.json
export async function loadConfig() {
    const response = await fetch('./config.json');
    if (response.ok) {
        const config = await response.json();
        console.log(config.path);
        console.log(config.dir);
        currentDir = config.dir;
        checkPastDir()
    } else {
        console.error('Не удалось загрузить конфигурацию.');
    }
}

// handleFileClick Функция для обработки клика на файл или папку
export function handleFileClick(file: FileInfo){
    if (file.isDir) { 
        previousDir = currentDir;
        currentDir = `${currentDir}/${file.name}`;
        modelFetch();
    }
}

// updateCurrentPath Фунция для отображения нынешней директории
export function updateCurrentPath() {
    const path = document.querySelector(".currentPath") as HTMLHeadingElement | null;
    if(path != null){
        path.textContent = currentDir
    }
}

// updateBackButton Функция для изменения состояния кнопки
export function updateBackButton() {
    const backButton = document.querySelector(".backButton") as HTMLHeadingElement | null;
    if (backButton != null){
        backButton.style.display = (currentDir === '.' || currentDir === '/') ? 'none' : 'inline'; 
    }
}

// checkPastDir Функция для проверки возможности вернуться в предыдущую директорию
export function checkPastDir(){
    let slashCount = 0;
    for (let i = 0; i < currentDir.length; i++) {
        if (currentDir[i] === '/') {
            slashCount++;
        }
    }
    if (slashCount > 1) {
        previousDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
    } else{
        if (currentDir.charAt(0)=='.'){
            previousDir = '.';
        }

        if (currentDir == '/home'){
            previousDir = '/';
        }
        
    }
}

//  Функция для возврата на предыдущую директорию  
document.querySelector('.backButton')?.addEventListener('click', () => {
    if (previousDir != null) {
        currentDir = previousDir; 
        checkPastDir();
        modelFetch(); 
    }
});

// handleTableClick Функция для обработки клика на элемент таблицы
export function handleTableClick(event: MouseEvent, files: FileInfo[]) {
    const target = event.target as HTMLElement;
    const row = target.closest('tr') as HTMLTableRowElement;

    if (row && row.classList.contains('dir')) {
        const index = row.dataset.index;
        if (index !== undefined && files[+index]) {
            handleFileClick(files[+index]);
        }
    }
}