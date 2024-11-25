import {FileInfo} from '../interfaces/iFileInfo';
import { request, config } from './main';

export class ConfigLoader{
    public currentDir: string = "";
    public previousDir: string = "";

    // loadConfig - Метод для загрузки конфигурации из config.json
    async loadConfig() {
    const response = await fetch('./config.json');
    if (response.ok) {
        const config = await response.json();
        console.log(config.path);
        console.log(config.dir);
        this.currentDir = config.dir;
        this.checkPastDir()
    } else {
        console.error('Не удалось загрузить конфигурацию.');
    }
}

// handleFileClick Метод для обработки клика на файл или папку
    handleFileClick(file: FileInfo){
        if (file.isDir) { 
            this.previousDir = this.currentDir;
            this.currentDir = `${this.currentDir}/${file.name}`;
            request.fetchData();
        }
}

// updateCurrentPath Метод для отображения нынешней директории
    updateCurrentPath() {
        const path = document.querySelector(".currentPath") as HTMLHeadingElement | null;
        if(path != null){
            path.textContent = this.currentDir
        }
}

// updateBackButton Метод для изменения состояния кнопки
    updateBackButton() {
        const backButton = document.querySelector(".backButton") as HTMLHeadingElement | null;
        if (backButton != null){
            backButton.style.display = (this.currentDir === '.' || this.currentDir === '/') ? 'none' : 'inline'; 
        }
}

// checkPastDir Метод для проверки возможности вернуться в предыдущую директорию
    checkPastDir(){
        let slashCount = 0;
        for (let i = 0; i < this.currentDir.length; i++) {
            if (this.currentDir[i] === '/') {
                slashCount++;
            }
        }
        if (slashCount > 1) {
            this.previousDir = this.currentDir.substring(0, this.currentDir.lastIndexOf('/'));
        } else{
            if (this.currentDir.charAt(0)=='.'){
                this.previousDir = '.';
            }

            if (this.currentDir == '/home'){
                this.previousDir = '/';
            }
            
        }
    }

// handleTableClick Метод для обработки клика на элемент таблицы
    handleTableClick(event: MouseEvent, files: FileInfo[]) {
        const target = event.target as HTMLElement;
        const row = target.closest('tr') as HTMLTableRowElement;

        if (row && row.classList.contains('dir')) {
            const index = row.dataset.index;
            if (index !== undefined && files[+index]) {
                this.handleFileClick(files[+index]);
            }
        }
    }
}

//  Функция для возврата на предыдущую директорию  
document.querySelector('.backButton')?.addEventListener('click', () => {
    if (config.previousDir != null) {
        config.currentDir = config.previousDir; 
        config.checkPastDir();
        request.fetchData();
    }
});
