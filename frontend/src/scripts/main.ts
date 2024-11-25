import '../index.css'; 
import { loadConfig } from './configLoader';
import { modelFetch } from '../model/model';

async function main(){
    await loadConfig();
    modelFetch();

    const orderRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="order"]');
    orderRadios.forEach(radio => {
        radio.addEventListener('change', () => modelFetch());
    });
}

window.onload = main;