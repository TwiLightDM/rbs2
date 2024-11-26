import { FileInfo } from "../interfaces/iFileInfo";
import { pathManager } from "./main";

export class RenderTableDir{
    // render - Метод для отображения списка файлов и директорий
    render() {
        const fileTableBody = document.querySelector(".fileTable__tableRow") as HTMLHeadingElement | null;
        const errorMessage = document.querySelector(".errorMessage") as HTMLHeadingElement | null;

        if (pathManager.currentFiles !== null && fileTableBody !== null && errorMessage !== null) {
            fileTableBody.innerHTML = ''; 
            errorMessage.textContent = '';

            pathManager.currentFiles.forEach((file: FileInfo, index: number) => {
                const row = document.createElement('tr');
                row.classList.add('file-item');
                row.dataset.index = index.toString();

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
                }else{
                    row.classList.add('file');

                }
                fileTableBody.appendChild(row);
            });

            if (!fileTableBody.dataset.listenerAttached) {
                const handleClick = (event: MouseEvent) => pathManager.handleTableClick(event);
            
                fileTableBody.addEventListener('click', handleClick);
                fileTableBody.dataset.listenerAttached = 'true';
            
                fileTableBody.dataset.listener = handleClick.toString();
            }
        } else {
            if (fileTableBody!== null){
                fileTableBody.innerHTML = '';
            }
        }
    }
}