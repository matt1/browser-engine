import { CSS_PROPERTY, HTML_TAG,Style } from "../engine/default_styles.ts";
import { Element, Text, LayoutEngine, BrowserMetrics, DocumentMetrics } from "../common/types.ts";
import { DisplayList } from "./display_list.ts";

export class NoddyLayoutEngine implements LayoutEngine {

  private layoutCursorX = 0;
  private layoutCursorY = 0;
  private lineHeight = 1.25;  // TODO: get from style?

  private maxDocWidth = 0;
  private maxDocHeight = 0;

  reset(): void {
      this.layoutCursorX = 0;
      this.layoutCursorY = 0;

      this.maxDocHeight = 0;
      this.maxDocWidth = 0;
  }
  
  layout(element: Element, displayList: DisplayList, browserMetrics:BrowserMetrics, ctx:CanvasRenderingContext2D): DocumentMetrics {
    if (element === undefined) return {width: 0, height: 0};

    // update ctx font to get accurate measurements
    const style = this.getStyle(element);
    ctx.font = style.getCtxFontString();

    let height = 0;

    // Update element clientLeft & clientTop based on current layout cursor
    // TODO: this is probably wrong since it is the layoutcursor before text
    // height taken into account?
    element.clientTop = this.layoutCursorY;
    element.clientLeft = this.layoutCursorX;

    if (element instanceof Text) {
      const text = element.value;

      // If we are displaying a block element, make sure that we advance the rendering cursor
      // TODO: Bug where we have e.g. <p>foo <b>bar</b> baz</p> baz will be on a new line as
      // the baz token will look up its display property from the parent <p> and start on a new
      // line.
      if (style.getProperty(CSS_PROPERTY.DISPLAY).includes('block')) {
        // Work out the height for the full text (before tokenisation).
        const fullTextMetrics = ctx.measureText(text);
        this.layoutCursorY += ((fullTextMetrics.actualBoundingBoxAscent + fullTextMetrics.actualBoundingBoxDescent) * this.lineHeight);
        this.layoutCursorX = 0;
      }

      // Split text by word, and layout each one individually.  This allows us to measure each word
      // one-by-one to make sure that we wrap correctly.
      //
      // We also store the maximum height we find along the way so that the Y layout cursor can be
      // adjusted consistently if we are wrapping.
      const tokens = text.split(' ');
      let totalWidth = 0;
      for (const token of tokens) {
        if (token === '' || token === '\n') continue;
        const metrics = ctx.measureText(token + ' ');

        // Store the highest height we have so that wrapped lines are consistent
        height = Math.max(height, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
        const width = metrics.width;
        totalWidth += width;

        // if we are at zero, push down by initial height to avoid drawing off-screen
        if (this.layoutCursorY == 0) this.layoutCursorY += height;

        // Wrap if we go off the edge of the canvas
        if ((this.layoutCursorX + width) > browserMetrics.width) {
          this.layoutCursorX = 0;
          this.layoutCursorY += (height * this.lineHeight);
        }

        displayList.add(this.layoutCursorX, this.layoutCursorY, element, token);
        this.layoutCursorX += width;

        this.maxDocHeight = Math.max(this.maxDocHeight, this.layoutCursorY);
        this.maxDocWidth = Math.max(this.maxDocWidth, this.layoutCursorX);
      }

      element.clientHeight = height;
      element.clientWidth = totalWidth;
      
    
    } else if (element.tag == HTML_TAG.HR) {      
      this.layoutCursorX = 0;
      this.layoutCursorY += 16; // TODO: margin style?
      displayList.add(this.layoutCursorX, this.layoutCursorY, element);
      this.layoutCursorY += 16 * 1.5;
      element.clientHeight = 16 * 1.5;
    } else if (element.tag == HTML_TAG.BR) {
      this.layoutCursorX = 0;
      this.layoutCursorY += 16; // TODO: margin style?
      element.clientHeight = 16;
    }


    // // if this is not an inline display element, restart on a new line.
    // if (!style.getProperty(CSS_PROPERTY.DISPLAY).includes('inline')) {
    //   this.layoutCursorY += (height * this.lineHeight);
    //   this.layoutCursorX = 0;
    // }

    for (const child of (element! as Element)?.children || []) {
      this.layout(child, displayList, browserMetrics, ctx);
    }
    
    return {width: this.maxDocWidth, height: this.maxDocHeight};
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

}