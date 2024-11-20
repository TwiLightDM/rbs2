import { Data } from '../interfaces/iData';
import '../stat.css';
import Chart from 'chart.js/auto';

// convertToBytes Функция для преобразования размера в байты
function convertToBytes(size: string): number {
    const value = parseFloat(size); 
    const unit = size.match(/[a-zA-Z]+$/)?.[0]; 

    if (!unit) return value; 
    switch (unit.toLowerCase()) {
        case 'b':
            return value;
        case 'kb':
            return value * 1024;
        case 'mb':
            return value * 1024 ** 2;
        case 'gb':
            return value * 1024 ** 3;
        case 'tb':
            return value * 1024 ** 4;
        default:
            return value; 
    }
}

// convertToMilliseconds Функция для преобразования времени в миллисекунды
function convertToMilliseconds(time: string): number {
    if (time.endsWith('ms')) {
        return parseInt(time.replace('ms', ''), 10);
    } else if (time.endsWith('µs')) {
        return parseFloat(time.replace('µs', '')) / 1000;
    } else if (time.endsWith('s')){
        return parseFloat(time.replace('s', '')) * 1000;
    }
    return 0;
}

function sort(sizes: Number[], times: Number[]){
    for (let i = 0; i < times.length - 1; i++){
        for (let j = 0; j < times.length - 1 - i; j++){
            if (times[j] > times[j + 1]) {
                [times[j], times[j + 1]] = [times[j + 1], times[j]];
                [sizes[j], sizes[j + 1]] = [sizes[j + 1], sizes[j]];
            }
        }
    }
}
// renderChart Функция для отображения графика
function renderChart(sizes: Number[], times: Number[]) {

    const ctx = document.getElementById('graf') as HTMLCanvasElement;
    new Chart(ctx, {
        type: 'line', 
        data: {
            labels: times, 
            datasets: [{
                data: sizes, 
                backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)'],
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

// loadData Функция для вывода таблицы из бд 
export function loadData() {
    let times: Number[] = []
    let sizes: Number[] = []

    fetch('http://localhost:3000/frontend/src/index.php')
        .then((response: Response) => response.json())  
        .then((data: Data[]) => {
            
            const tableBody = document.getElementById('fileTableBody') as HTMLElement;
            tableBody.innerHTML = '';  

            data.forEach((item: Data, index: number) => {
                const row = document.createElement('tr');

                const idCell = document.createElement('td');
                idCell.textContent = item.id.toString();
                row.appendChild(idCell);

                const pathCell = document.createElement('td');
                pathCell.textContent = item.path;
                row.appendChild(pathCell);

                const sizeCell = document.createElement('td');
                sizeCell.textContent = item.size;
                row.appendChild(sizeCell);

                const timeCell = document.createElement('td');
                timeCell.textContent = item.time;
                row.appendChild(timeCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = item.date;
                row.appendChild(dateCell);

                tableBody.appendChild(row);
                
                sizes[index] = convertToBytes(item.size);
                
                times[index] = convertToMilliseconds(item.time);

            });
            sort(sizes, times);
            renderChart(sizes, times);
        })
        .catch((error: Error) => {
            console.error('Ошибка при загрузке данных:', error);
        });
        
}

window.onload = loadData;