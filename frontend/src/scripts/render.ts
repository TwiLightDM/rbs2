import { FileInfo } from '../interfaces/iFileInfo';

import {
    Chart,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    LineController,

} from 'chart.js';
import { config } from './main';

Chart.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    LineController,
);

// renderTable - Функция для отображения списка файлов и директорий
export function renderTable(files: FileInfo[] | null) {
    const fileTableBody = document.querySelector(".fileTable__tableRow") as HTMLHeadingElement | null;
    const errorMessage = document.querySelector(".errorMessage") as HTMLHeadingElement | null;

    if (files !== null && fileTableBody !== null && errorMessage !== null) {
        fileTableBody.innerHTML = ''; 
        errorMessage.textContent = '';

        files.forEach((file: FileInfo, index: number) => {
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
            }
            row.classList.add('file');
            fileTableBody.appendChild(row);
        });

        if (!fileTableBody.dataset.listenerAttached) {
            fileTableBody.addEventListener('click', (event) => config.handleTableClick(event, files));
            fileTableBody.dataset.listenerAttached = 'true';
        }
    } else {
        if (fileTableBody!== null){
            fileTableBody.innerHTML = '';
        }
    }
}

// renderChart Функция для отображения графика
export function renderChart(sizes: Number[], times: Number[]) {
    const ctx = document.querySelector('.graf') as HTMLCanvasElement | null;
    if (ctx !== null) {
        new Chart(ctx, {
            type: 'line', 
            data: {
                labels: times, 
                datasets: [{
                    data: sizes, 
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
