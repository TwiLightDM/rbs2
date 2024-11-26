import '../stat.css';
import { PhpLoader } from './PhpLoader';
import { RenderGraf } from './RenderGraf';
import { RenderTableDB } from './RenderTableDB';
import { Utils } from './Utils';

export let graf = new RenderGraf();
export let table = new RenderTableDB();
export let utils = new Utils();
export let config = new PhpLoader();

window.onload = table.render;