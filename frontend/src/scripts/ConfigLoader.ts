import { pathManager } from "./main";

export class ConfigLoader{

    // load - Метод для загрузки конфигурации из config.json
    async loadPath() {
        const response = await fetch('./config.json');
        if (response.ok) {
            const config = await response.json();
            console.log(config.path);
            console.log(config.dir);
            pathManager.currentDir = config.dir;
            pathManager.checkPastDir()
        } else {
            console.error('Не удалось загрузить конфигурацию.');
        }
    }
}