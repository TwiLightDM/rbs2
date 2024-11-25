import '../stat.css';
import { Data } from '../interfaces/iData';
import { renderChart } from './render';

var phpUrl: string;
const MINI_MICRO_SECONDS = 1000
const SIZE_OF_MEMORY = 1024

// loadPhpUrl Функция для загрзки пути к php серверу
export async function loadPhpUrl() {
    const response = await fetch('./config.json');
    if (response.ok) {
        const config = await response.json();
        phpUrl = config.phpUrl;
    } else {
        console.error('Не удалось загрузить конфигурацию.');
    }
}

// convertToBytes Функция для преобразования размера в байты
export function convertToBytes(size: string): number {
    const value = parseFloat(size); 
    const unit = size.match(/[a-zA-Z]+$/)?.[0]; 

    if (!unit) return value; 
    switch (unit.toLowerCase()) {
        case 'b':
            return value;
        case 'kb':
            return value * SIZE_OF_MEMORY;
        case 'mb':
            return value * SIZE_OF_MEMORY ** 2;
        case 'gb':
            return value * SIZE_OF_MEMORY ** 3;
        case 'tb':
            return value * SIZE_OF_MEMORY ** 4;
        default:
            return value; 
    }
}

// convertToMilliseconds Функция для преобразования времени в миллисекунды
export function convertToMilliseconds(time: string): number {
    if (time.endsWith('ms')) {
        return parseInt(time.replace('ms', ''), 10);
    } else if (time.endsWith('µs')) {
        return parseFloat(time.replace('µs', '')) / MINI_MICRO_SECONDS;
    } else if (time.endsWith('s')){
        return parseFloat(time.replace('s', '')) * MINI_MICRO_SECONDS;
    }
    return 0;
}

// sort Функция для сортировки массивов размера и времени, где основным маcсивом является время
export function sort(sizes: Number[], times: Number[]){
    for (let i = 0; i < times.length - 1; i++){
        for (let j = 0; j < times.length - 1 - i; j++){
            if (times[j] > times[j + 1]) {
                [times[j], times[j + 1]] = [times[j + 1], times[j]];
                [sizes[j], sizes[j + 1]] = [sizes[j + 1], sizes[j]];
            }
        }
    }
}

// loadData Функция для вывода таблицы из бд 
export async function loadData() {
    let times: Number[] = []
    let sizes: Number[] = []
    await loadPhpUrl();
    fetch(phpUrl)
        .then((response: Response) => response.json())  
        .then((data: Data[]) => {
            const tableBody = document.querySelector(".fileTable__tableRow") as HTMLHeadingElement | null;
            if (tableBody !== null){
                tableBody.innerHTML = '';  
            }
        
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
                
                if (tableBody !== null){
                    tableBody.appendChild(row);
                }
                
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
