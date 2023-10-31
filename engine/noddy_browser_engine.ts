import { BrowserEngine, LayoutEngine, DocumentTree, Element, Text, HtmlParser  } from "../common/types.ts";
import { NoddyParser } from "../parsers/noddyparser/noddy_parser.ts";
import { DisplayList, TokenListEntry } from "../layout/display_list.ts";
import { CSS_PROPERTY, HTML_TAG, Style } from "./default_styles.ts";
import { NoddyLayoutEngine } from "../layout/noddy_layout_engine.ts";
//import { assert } from "https://deno.land/std/assert/mod.ts";


interface HitBox {
  path:Path2D;
  element:Element;
}

/** 
 * Implements the core browser engine, responsible for parsing and rendering
 * HTML.
 * 
 * Mainly this wires up parsers and layout engines, and will need to be fed
 * appropriate HTML etc (it will not fetch it itself).
 */
export class NoddyBrowserEngine  implements BrowserEngine {

  private parser:HtmlParser;
  private document?:DocumentTree;
  private ctx:CanvasRenderingContext2D;
  private displayList = new DisplayList();
  private layoutEngine:LayoutEngine;

  private canvasWidth = 0;

  private hitboxes:Array<HitBox> = [];

  constructor(private readonly canvas:HTMLCanvasElement) {
    this.layoutEngine = new NoddyLayoutEngine();
    this.initDisplayScale();

    //assert(this.canvas, 'rendering canvas was not defined');
    this.ctx = this.canvas.getContext('2d')!;
    this.parser = new NoddyParser();

    this.initCtx();
  }


  render(html: string) {
    this.document = this.parser.parse(html);
    this.clear();

    const browserMetrics = {
      width: this.canvasWidth,
    };
    const docMetrics = this.layoutEngine.layout(this.document.documentElement!, this.displayList, browserMetrics, this.ctx);

    // Resize the canvas to fit the layouted-doc
    // TODO: something makes this scale weird?  Looks like text is "too small" and not scaled correctly when drawn
    // Perhaps we need to do something in the actual draw() function to scale everything up by the DPI?  perhaps
    // there is a way to just transform the entire canvas after drawing 1:1?
    //this.canvas.setAttribute('height', `${docMetrics.height * window.devicePixelRatio}`);
    this.canvas.setAttribute('height', `${docMetrics.height}`);
    //this.canvas.setAttribute('width', docMetrics.width * window.devicePixelRatio);

    this.setupEventListeners();

    this.draw();

    return;
    
  }

  private initCtx() {
    this.ctx.font = "16px serif";
    this.ctx.textBaseline = 'top';

    // have to do this outside of initDisplayScale since ctx is not defined yet.
    //this.ctx.scale(window.devicePixelRatio,window.devicePixelRatio); 
  }

  private initDisplayScale() {
    const canvasHeight = Number.parseFloat(getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2));
    const canvasWidth = Number.parseFloat(getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2));

    // this.canvas.setAttribute('height', `${canvasHeight * window.devicePixelRatio}`);
    // this.canvas.setAttribute('width', `${canvasWidth * window.devicePixelRatio}`);

    // this.canvasWidth = Number.parseFloat(`${canvasWidth * window.devicePixelRatio}`);

    this.canvas.setAttribute('height', `${canvasHeight}`);
    this.canvas.setAttribute('width', `${canvasWidth}`);

    this.canvasWidth = Number.parseFloat(`${canvasWidth}`);
  
  }

  private setupEventListeners() {
    const mouseMoveFn = (event:MouseEvent) => {
      for (const hitbox of this.hitboxes) {
        if (this.ctx.isPointInPath(hitbox.path, event.offsetX, event.offsetY)) {
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }
      }
    };

    const mouseClick = (event:MouseEvent) => {
      for (const hitbox of this.hitboxes) {
        if (this.ctx.isPointInPath(hitbox.path, event.offsetX, event.offsetY)) {
          // When clicking on a link, we're actually clicking on the text node
          // and not the <a> itself, so get the parent.
          const aTag = hitbox.element.parent;
          console.log('click ' + aTag!.attributes?.get('href'));
          console.log(aTag);
        } 
      }
    };

    this.canvas.addEventListener('mousemove', mouseMoveFn);
    this.canvas.addEventListener('click', mouseClick);

  }

  private clear() {
    this.layoutEngine.reset();  // reinstantiate?
    this.displayList.clear();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** 
   * Try getting the style from the parent element, and continue up the chain
   * until we do.
   */
  private getStyle(element:Element):Style {
    if (element instanceof Text) {
      return element.parent?.style!;
    }
    return element.style;
  }

  /** Performs the actual pixels-on-screen drawing of the display list. */
  private draw() {
    for(const listItem of this.displayList.list) {
      
      // Get element's style and set the canvas fill-style
      const style = this.getStyle(listItem.element);
      this.ctx.fillStyle = style.getProperty(CSS_PROPERTY.COLOR);
      
      // Perform per-listitem rendering.  This will switch on the type and
      // do what is required to render.
      
      // TokenListEntry is essentially just plain text elements
      if (listItem instanceof TokenListEntry) {
        const text = listItem.token;
        
        this.ctx.font = style.getCtxFontString();
        this.ctx.fillText(text, listItem.x, listItem.y);

        // if this is an <a> tag then also set up the hit-box for the link
        if (listItem.element.parent?.tag == HTML_TAG.A) {
          // Hack for underline
          this.ctx.fillText("_".repeat(text.length-1), listItem.x, listItem.y);
          
          const x = listItem.x;
          const y = listItem.y - listItem.element.clientHeight!;
          const w = listItem.element.clientWidth!;
          const h = listItem.element.clientHeight!;

          const path = new Path2D();
          path.rect(x,y,w,h);
          this.hitboxes.push({element:listItem.element, path});                              

          // For debug, draw the hitboxes
          this.ctx.globalAlpha = 0.25;  
          this.ctx.rect(x,y,w,h);
          this.ctx.fill();
          this.ctx.globalAlpha = 1;
          
        }
      } else if (listItem.element.tag == HTML_TAG.HR) {
        const hrHeight = Number.parseInt(style.getProperty(CSS_PROPERTY.HEIGHT).slice(0, 2));
        this.ctx.beginPath();
        this.ctx.rect(listItem.x, listItem.y, this.canvasWidth, hrHeight);
        this.ctx.stroke();

      }

    }
  }
}