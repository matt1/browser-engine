// export interface Style {
//   fontFamily?:string,
//   fontSize?:string,
//   fontWeight?:string,
//   fontStyle?:string,
// }

export enum HTML_TAG {
  A = 'a',
  B = 'b',
  BODY = 'body',
  BR = 'br',
  EM = 'em',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  HEAD = 'head',
  HR = 'hr',
  I = 'i',
  P = 'p',
  STRONG = 'strong'

}

/** Contains the CSS property names that are used as keys for styles. */
export enum CSS_PROPERTY {
  COLOR = 'color',
  DISPLAY = 'display',
  HEIGHT = 'height',
  FONT_FAMILY = 'font-family',
  FONT_SIZE = 'font-size',
  FONT_STYLE = 'font-style',
  FONT_WEIGHT = 'font-weight',
  TEXT_DECORATION = 'text-decoration',
}

/** This is the "default" style that all other tags derive from. */
const RootStyle = new Map<CSS_PROPERTY, string>([
  [CSS_PROPERTY.COLOR, '#000000'],
  [CSS_PROPERTY.DISPLAY, 'inline'],
  [CSS_PROPERTY.FONT_FAMILY, 'serif'],
  [CSS_PROPERTY.FONT_SIZE, '16px'],
  [CSS_PROPERTY.FONT_STYLE, 'normal'],
  [CSS_PROPERTY.FONT_WEIGHT, 'normal'],
  [CSS_PROPERTY.TEXT_DECORATION, 'none'],
]);

/** Default styles for specific tags - e.g. font-size for headings etc. */
export const DefaultTagStyles = new Map<HTML_TAG, Map<CSS_PROPERTY, string>>([

  // Headings
  [HTML_TAG.H1, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_SIZE, '22px'], [CSS_PROPERTY.DISPLAY, 'block']])],
  [HTML_TAG.H2, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_SIZE, '21px'], [CSS_PROPERTY.DISPLAY, 'block']])],
  [HTML_TAG.H3, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_SIZE, '20px'], [CSS_PROPERTY.DISPLAY, 'block']])],

  // Text & Formatting
  [HTML_TAG.P, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.DISPLAY, 'block']])],
  [HTML_TAG.B, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_WEIGHT, 'bold'], [CSS_PROPERTY.DISPLAY, 'inline']])],
  [HTML_TAG.STRONG, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_WEIGHT, 'bold'], [CSS_PROPERTY.DISPLAY, 'inline']])],

  [HTML_TAG.I, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_STYLE, 'italic'], [CSS_PROPERTY.DISPLAY, 'inline']])],
  [HTML_TAG.EM, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.FONT_STYLE, 'italic'], [CSS_PROPERTY.DISPLAY, 'inline']])],

  // Links
  [HTML_TAG.A, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.COLOR, 'blue'], [CSS_PROPERTY.TEXT_DECORATION, 'underline'], [CSS_PROPERTY.DISPLAY, 'inline']])],

  // Misc
  [HTML_TAG.HR, new Map<CSS_PROPERTY, string>([[CSS_PROPERTY.DISPLAY, 'block'], [CSS_PROPERTY.HEIGHT, '1px']])],
])


/** Represents a CSS style declaration for an element. */
export class Style {
  parent?:Style;

  style: Map<CSS_PROPERTY, string> = new Map<CSS_PROPERTY, string>();

  constructor(config:any) {
    this.parent = config.parent || undefined;

    if (!this.parent) {
      this.style = RootStyle;
    }

    if (config.tag && DefaultTagStyles.has(config.tag.toLowerCase())) {
      this.style = DefaultTagStyles.get(config.tag.toLowerCase())!;
    }
  }

  /** 
   * Retrieve a property for this style declaration. Will keep looking up
   * the style tree to find a value.
   */
  getProperty(property:CSS_PROPERTY):string {
    if (this.style.has(property)) {
      return this.style.get(property)!;
    }
    return this.parent?.getProperty(property)!;
  }


  /** 
   * Return the appropriately formatted CSS Font string for consumption by the
   * HTML Canvas.
   */
  getCtxFontString():string {
    return `${this.getProperty(CSS_PROPERTY.FONT_STYLE)} ${this.getProperty(CSS_PROPERTY.FONT_WEIGHT)} ${this.getProperty(CSS_PROPERTY.FONT_SIZE)} ${this.getProperty(CSS_PROPERTY.FONT_FAMILY)}`;
        
  }
}