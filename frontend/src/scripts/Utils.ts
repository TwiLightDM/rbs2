const MINI_MICRO_SECONDS = 1000
const SIZE_OF_MEMORY = 1024

export class Utils{
    public times: Number[] = [];
    public sizes: Number[] = [];
    
    // convertToBytes Метод для преобразования размера в байты
    convertToBytes(size: string): number {
        const value = parseFloat(size); 
        console.log(value)
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
            console.log(value * SIZE_OF_MEMORY ** 3)
            return value * SIZE_OF_MEMORY ** 3;
        case 'tb':
            return value * SIZE_OF_MEMORY ** 4;
        default:
            return value; 
    }
}

    // convertToMilliseconds Метод для преобразования времени в миллисекунды
    convertToMilliseconds(time: string): number {
        if (time.endsWith('ms')) {
            return parseInt(time.replace('ms', ''), 10);
        } else if (time.endsWith('µs')) {
            return parseFloat(time.replace('µs', '')) / MINI_MICRO_SECONDS;
        } else if (time.endsWith('s')){
            return parseFloat(time.replace('s', '')) * MINI_MICRO_SECONDS;
        }
        return 0;
    }

    // sort Метод для сортировки массивов размера и времени, где основным маcсивом является время
    sort(sizes: Number[], times: Number[]){
        for (let i = 0; i < times.length - 1; i++){
            for (let j = 0; j < times.length - 1 - i; j++){
                if (times[j] > times[j + 1]) {
                    [times[j], times[j + 1]] = [times[j + 1], times[j]];
                    [sizes[j], sizes[j + 1]] = [sizes[j + 1], sizes[j]];
                }
            }
        }
    }
}