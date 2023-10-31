import { Element } from "../common/types.ts";


export class ListEntry {
  public x:number;
  public y:number;
  public element:Element;

  constructor(config:any) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.element = config.element;
  }
}

export class TokenListEntry extends ListEntry {
  public token:string;

  constructor(config:any) {
    super(config);
    this.token = config.token;
  }
}

/** Contains all elements that are to be rendered to the screen. */
export class DisplayList {

  list:Array<ListEntry> = [];

  /** 
   * Add an element to the display list.  If token is provided then a new
   * token list entry (i.e. text) is added.
   */
  add(x:number, y:number, element:Element, token?:string) {   
   if (!token) {
    this.list.push(new ListEntry({x,y,element}));
   } else {
    this.list.push(new TokenListEntry({x,y,element,token}));
   }
  }


  clear() {
    this.list = [];
  }

}
