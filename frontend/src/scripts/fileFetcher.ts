import { currentDir, updateBackButton, handleFileClick, updateCurrentPath} from './configLoader';
import { FileInfo } from '../interfaces/iFileInfo';

// fetchFiles - Функция для вывода списка файлов и директорий
export async function fetchFiles() {
    const order: string = (document.querySelector('input[name="order"]:checked') as HTMLInputElement).value;
    const response = await fetch(`/files?dir=${encodeURIComponent(currentDir)}&order=${order}`);
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    updateCurrentPath();
    updateBackButton();

    if (response.ok) {
        const files: FileInfo[] | null = await response.json();
        const fileTableBody = document.getElementById('fileTableBody') as HTMLTableSectionElement;
        
        if (files !== null) {
            fileTableBody.innerHTML = ''; 
            errorMessage.textContent = ''; 

            files.forEach((file: FileInfo) => {
                const row = document.createElement('tr');
                row.classList.add('file-item');

                const nameCell = document.createElement('td');
                nameCell.textContent = file.name;

                const sizeCell = document.createElement('td');
                sizeCell.textContent = `${file.size} ${file.format}`;

                const typeCell = document.createElement('td');
                typeCell.innerHTML = file.isDir ? "<span>Директория</span>" : "<span>Файл</span>";

                row.appendChild(nameCell);
                row.appendChild(sizeCell);
                row.appendChild(typeCell);

                if (file.isDir) {
                    row.classList.add('dir');
                    row.onclick = () => handleFileClick(file);
                }
                row.classList.add('file');
                fileTableBody.appendChild(row);
            });
        } else {
            const errorText = await response.text();
            errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}`; 
            fileTableBody.innerHTML = '';
        }
    }
}