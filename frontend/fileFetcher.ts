import { currentDir, updateBackButton, handleFileClick, updateCurrentPath} from './configLoader';
import { FileInfo } from './interfaces/iFileInfo';

// fetchFiles - Функция для вывода списка файлов и директорий
export async function fetchFiles(){
    const order: string = (document.querySelector('input[name="order"]:checked') as HTMLInputElement).value;
    const response = await fetch(`/files?dir=${encodeURIComponent(currentDir)}&order=${order}`);
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    updateCurrentPath();
    updateBackButton();

    if (response.ok) {
        const files: FileInfo[] | null = await response.json();
        const fileList = document.getElementById('fileList') as HTMLUListElement;
        console.log(fileList)
        if (files !== null) {
            fileList.innerHTML = ''; 
            errorMessage.textContent = ''; 

            files.forEach((file: FileInfo) => {
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
                fileList.appendChild(listItem);
            });
        } else {
            const errorText = await response.text();
            errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}`; 
            fileList.innerHTML = '';
        }
    }
}