import { FileInfo } from "../interfaces/iFileInfo";
import { pathManager, request } from "./main";

export class PathManager{
    public currentDir: string = "";
    public previousDir: string = "";
    public currentFiles: FileInfo[] = [];
    
    // handleFileClick Метод для обработки клика на файл или папку
    handleFileClick(file: FileInfo) {
        if (file.isDir) { 
            console.log("Handling click for directory:", file.name);
            console.log("Previous Dir:", this.previousDir);
            console.log("Current Dir Before Update:", this.currentDir);
            
            this.previousDir = this.currentDir;
            this.currentDir = `${this.currentDir}/${file.name}`;
            
            console.log("Current Dir After Update:", this.currentDir);
            request.fetchDataDir();
        } else {
            console.log("Clicked on a file, no action required");
            console.log(this.currentFiles);
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
    handleTableClick(event: MouseEvent) {
        console.log(this.currentFiles)
        const target = event.target as HTMLElement;
        const row = target.closest('tr') as HTMLTableRowElement;

        if (row && row.classList.contains('dir')) {
            const index = row.dataset.index;
            if (index !== undefined && this.currentFiles[+index]) {
                this.handleFileClick(this.currentFiles[+index]);
            }
        }
    }
}

//  Функция для возврата на предыдущую директорию  
document.querySelector('.backButton')?.addEventListener('click', () => {
    if (pathManager.previousDir != null) {
        pathManager.currentDir = pathManager.previousDir; 
        pathManager.checkPastDir();
        request.fetchDataDir();
    }
});
