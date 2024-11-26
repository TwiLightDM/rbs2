import '../index.css'; 
import { Request } from '../model/Request';
import { ConfigLoader } from './ConfigLoader';
import { PathManager } from './PathManager';
import { RenderTableDir } from './RenderTableDir';

export let request = new Request();
export let config = new ConfigLoader();
export let pathManager = new PathManager();
export let table = new RenderTableDir();

async function main(){
    await config.loadPath();
    request.fetchDataDir();

    const orderRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="order"]');
    orderRadios.forEach(radio => {
        radio.addEventListener('change', () => request.fetchDataDir());
    });
}

window.onload = main;