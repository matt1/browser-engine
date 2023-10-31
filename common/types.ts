import { DisplayList } from "../layout/display_list.ts";
import { Style } from "../engine/default_styles.ts";

export interface BrowserMetrics {
  width:number;
}

export interface DocumentMetrics {
    width:number;
    height:number;
}

/** HtmlParsers are able to parse HTML into a DOM tree. */
export interface HtmlParser {
    /** Parse the provided HTML into a DOM tree. */
    parse(html:string):DocumentTree;
}

/**
 * Browser engine is responsible for orchestrating the main layout and render of
 * a parsed HTML document.
 */
export interface BrowserEngine {
  /** Render the given HTML */
  render(html:string):void;
}

/**
 * Layout engines take parsed HTML elements and layout the elements (i.e. their
 * X & Y coordinates on the page), and update a display list.  They are not
 * directly responsible for the actual drawing of elements itself.
 */
export interface LayoutEngine {
  /** Layout the provided root element into the provided display list. */  
  layout(rootElement:Element, displayList:DisplayList, browserMetrics:BrowserMetrics, ctx:CanvasRenderingContext2D):DocumentMetrics;

  /** Reset the layout engine. */
  reset():void;
}


/** Tags which are self-closing (e.g. `<br>`). */
export const SELF_CLOSING_TAGS = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
];

/** Represents a HTML document. */
export class DocumentTree {
    /** Root element of document - typically <html> */
    documentElement?:Element;
}

export interface ElementConfig {
    tag?:string,
    parent?:Element|undefined,
    children?:Element[],
    attributes?:Map<string, string>,

    // Layout related
    clientHeight?:number;
    clientLeft?:number;
    clientTop?:number;
    clientWidth?:number;
}

/** A general purpose HTML elment. */
export class Element {
    /** The tag name for this element, e.g. `p` or `h1`. */
    tag?:string;

    /** The parent element - might be null for root elements. */
    parent?:Element|undefined;

    /** Any child elements - might be null or empty. */
    children?:Element[];

    /** Attribute map for this element. */
    attributes?:Map<string, string>;

    /** Contains the styles for this element. */
    style:Style;

    clientHeight?:number;
    clientLeft?:number;
    clientTop?:number;
    clientWidth?:number;    

    constructor(config:ElementConfig) {
        this.tag = config.tag || '';
        this.parent = config.parent;
        this.children = config.children || [];
        this.attributes = config.attributes || new Map<string,string>();
        this.clientHeight = config.clientHeight;
        this.clientLeft = config.clientLeft;
        this.clientTop = config.clientTop;
        this.clientWidth = config.clientWidth;


        if (this.parent) {
            this.style = new Style({parent:this.parent.style, tag: this.tag});
        } else {
            this.style = new Style({tag:this.tag});
        }
    }
}

/** A simple text node. */
export class Text extends Element {
    value = '';
    constructor(value:string) {
        super({});
        this.value = value;
    }
}