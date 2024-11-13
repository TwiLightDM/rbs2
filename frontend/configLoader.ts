import { fetchFiles } from './fileFetcher';
import {FileInfo} from './interfaces/iFileInfo';

export let currentDir: string = "";
export let previousDir: string = "";

// loadConfig - Функция для загрузки конфигурации из config.json
export async function loadConfig() {
    const response = await fetch('../config.json');
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
        fetchFiles();
    }
}

// updateCurrentPath Фунция для отображения нынешней директории
export function updateCurrentPath() {
    const path = document.getElementById("currentPath")
    if(path != null){
        path.textContent = currentDir
    }
}

// updateBackButton Функция для изменения состояния кнопки
export function updateBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton != null){
        backButton.style.display = (currentDir === '.') ? 'none' : 'block'; 
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
    } 
}

//  Функция для возврата на предыдущую директорию  
document.getElementById('backButton')?.addEventListener('click', () => {
    if (previousDir !== null) {
        currentDir = previousDir; 
        checkPastDir();
        fetchFiles(); 
    }
});
