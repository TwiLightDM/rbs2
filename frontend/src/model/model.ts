import { currentDir, updateBackButton, updateCurrentPath } from "../scripts/configLoader";
import { renderTable } from "../scripts/render";

// modelFetch - Функция для получения списка файлов и директорий с сервера
export async function modelFetch(){
    const order: string = (document.querySelector('input[name="order"]:checked') as HTMLInputElement).value;
    const response = await fetch(`/files?dir=${encodeURIComponent(currentDir)}&order=${order}`);
    const errorMessage = document.querySelector(".errorMessage") as HTMLHeadingElement | null;

    updateCurrentPath();
    updateBackButton();

    if (response.ok) {
        renderTable(await response.json());
    } else {
        const errorText = await response.text();
        if (errorMessage !== null){
            errorMessage.textContent = `Ошибка: ${response.status} - ${errorText}. Вернитесь назад`;
        }
        return null;
    }
}