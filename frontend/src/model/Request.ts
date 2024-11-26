import { pathManager, table} from "../scripts/main";

export class Request {

    // fetchData Метод для получения получения списка файлов и директорий с сервера
    public async fetchDataDir() {
        const order: string = (document.querySelector('input[name="order"]:checked') as HTMLInputElement).value;
        const response = await fetch(`/files?dir=${encodeURIComponent(pathManager.currentDir)}&order=${order}`);
        const errorMessage = document.querySelector(".errorMessage") as HTMLHeadingElement | null;

        pathManager.updateCurrentPath();
        pathManager.updateBackButton();

        if (response.ok) {
            const files = await response.json();
            pathManager.currentFiles = files;
            console.log(pathManager.currentFiles)
            table.render();
        } else {
            const errorText = await response.text();
            if (errorMessage !== null) {
                errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}. Вернитесь назад`;
            }
        }
    }
}