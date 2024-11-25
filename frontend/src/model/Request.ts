import { config } from "../scripts/main";
import { renderTable } from "../scripts/render";

export class Request {
    // fetchData Метод для получения получения списка файлов и директорий с сервера
    public async fetchData() {
        const order: string = (document.querySelector('input[name="order"]:checked') as HTMLInputElement).value;
        const response = await fetch(`/files?dir=${encodeURIComponent(config.currentDir)}&order=${order}`);
        const errorMessage = document.querySelector(".errorMessage") as HTMLHeadingElement | null;

        config.updateCurrentPath();
        config.updateBackButton();

        if (response.ok) {
            const files = await response.json();
            renderTable(files);
        } else {
            const errorText = await response.text();
            if (errorMessage !== null) {
                errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}. Вернитесь назад`;
            }
        }
    }
}