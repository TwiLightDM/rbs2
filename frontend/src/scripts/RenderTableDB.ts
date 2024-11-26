import { Data } from "../interfaces/iData";
import { graf, utils, config} from "./stat";

export class RenderTableDB{
    // render Метод для вывода таблицы из бд
    async render(){
        await config.loadPhpUrl();
        fetch(config.phpUrl)
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

                utils.sizes[index] = utils.convertToBytes(item.size);

                utils.times[index] = utils.convertToMilliseconds(item.time);


            });

            utils.sort(utils.sizes, utils.times);
            graf.render(utils.sizes, utils.times);
        });
    }
}