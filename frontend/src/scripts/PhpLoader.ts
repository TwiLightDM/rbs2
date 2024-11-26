export class PhpLoader{
    public phpUrl: string = "";

    // loadPhpUrl Метод для загрузки пути к php серверу
    async loadPhpUrl() {
        const response = await fetch('./config.json');
        if (response.ok) {
            const config = await response.json();
            this.phpUrl = config.phpUrl;
            console.log(this.phpUrl)
        } else {
            console.error('Не удалось загрузить конфигурацию.');
        }
    }
}