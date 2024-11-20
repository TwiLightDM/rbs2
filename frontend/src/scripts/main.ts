import { loadConfig } from './configLoader';
import { fetchFiles } from './fileFetcher';
import '../style.css'; 

async function main(){
    await loadConfig();
    fetchFiles();

    const orderRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="order"]');
    orderRadios.forEach(radio => {
        radio.addEventListener('change', () => fetchFiles());
    });
}

window.onload = main;