import '../index.css'; 
import { Request } from '../model/Request';
import { ConfigLoader } from './configLoader';

export let request = new Request();
export let config = new ConfigLoader();

async function main(){
    await config.loadConfig();
    request.fetchData();

    const orderRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="order"]');
    orderRadios.forEach(radio => {
        radio.addEventListener('change', () => request.fetchData());
    });
}

window.onload = main;