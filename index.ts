
import { NoddyBrowserEngine } from "./engine/noddy_browser_engine.ts";
const canvas = document.querySelector('#canvas');
const engine = new NoddyBrowserEngine(canvas);
console.log('Engine instantiated - rendering...');
const source = document.querySelector('#source');
engine.render(source.value);

document.querySelector('#render').addEventListener('click', (event) => {
  engine.render(source.value);
  display(event, '#engine');
});

