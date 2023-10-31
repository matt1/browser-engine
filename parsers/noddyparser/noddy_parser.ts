import { DocumentTree, Element, HtmlParser, SELF_CLOSING_TAGS, Text } from "../../common/types.ts";
import { assert } from "../../utils.ts";
//import { assert } from "https://deno.land/std/assert/mod.ts";

type TagAttributes = {
  tag:string,
  attributes:Map<string,string>,
}

/** 
 * A very simple and basic HTML parser.
 * 
 * At its core, it works by:
 * 
 *  - step over every character in the HTML source
 *    - when it sees a < character, it starts tag handling
 *    - when it sees a > character, it stops tag handling
 *    - when not handling a tag, everything is treated as text nodes
 *  - open tags push a new "unclosed" tag into a stack
 *  - when a closing tag (`</...`) is found, the current unclosed tag is popped
 *    off of the stack and the next element on the stack set as its parent.
 */
export class NoddyParser implements HtmlParser {

  private unclosedTags: Element[] = [];

  parse(html: string): DocumentTree {
    let inTag = false;
    let text = '';

    for (let i = 0; i < html.length; i++) {
      if (html[i] === '<') {
        inTag = true;

        // If we have some text collected already, and we see the start
        // of a tag, create a new text node
        if (text) {
          // TODO - do not trim whitespace for PRE
          this.addTextNode(text.trim());
          text = '';
        }
      } else if (html[i] === '>') {
        inTag = false;
        this.addElementNode(text);
        text = '';
      } else {
        text += html[i];
      }
    }

    if (!inTag && text) this.addTextNode(text);

    return this.finish();
  }

  private addElementNode(tagString:string) {
    const {tag, attributes} = this.getTagAttributes(tagString);

    if (tag.startsWith('!')) {
      // Ignore comments and doctag etc
      return;
    } else if (tag.startsWith('/')) {
      // If this is the last unfinished tag, return early (will be tidied up later).
      if (this.unclosedTags.length === 1) return;
      const node = this.unclosedTags.pop();
      const parent = this.unclosedTags.at(-1);
      assert(parent != undefined, "parent tag was undefined when closing tag");
      parent!.children!.push(node!);
    } else if (SELF_CLOSING_TAGS.indexOf(tag) > -1) {
      // If this is a self-closing tag, automatically close it.
      const parent = this.unclosedTags.at(-1);
      assert(parent != undefined, "parent tag was undefined when closing self-closing tag");
      const node = new Element({tag, parent, attributes, children: []});
      parent!.children!.push(node)
    } else {
      const parent = this.unclosedTags.at(-1);
      this.unclosedTags.push(new Element({
        tag,
        parent,
        attributes,
        children: [],
      }));
    }
  }

  private addTextNode(text:string) {
    if (!text) return;
    const parent = this.unclosedTags.at(-1);
    assert(parent != undefined, "parent tag was undefined when adding text node");
    const node = new Text(text);
    parent!.children!.push(node);
    node.parent = parent;
  }

  /** 
   * Given the complete tag string (e.g. 'link rel=stylesheet') return the tag
   * and the map of attributes.
   */
  private getTagAttributes(tagString:string): TagAttributes {
    const parts:string[] = tagString.split(' ');
    const tag = parts[0];
    const attributes = new Map<string,string>();

    for (let i=1; i<parts.length; i++) {
      const attrParts = parts[i].split('=');
      const key = attrParts[0].toLowerCase();
      if (key === '/') continue;
      let value = key;
      if (attrParts.length == 2) {
        value = attrParts[1].toLowerCase();
      }
      value = value.replaceAll(/(\'|\")/g, '');
      attributes.set(key, value);
    }

    return {
      tag,
      attributes,
    }
  }

  private finish():DocumentTree {
    // If there were no elements left unfinished, insert an <html> one. This
    // handles the empty-string case.  In normal operation the <html> tag should
    // be left unclosed (i.e. length == 1) as addElementNode leaves the final
    // tag unclosed, and then we pop that final tag off of the unclosed stack
    // when we return from this function.
    if (this.unclosedTags.length === 0) {
      this.addElementNode('html');
    }

    // Close any tags left unclosed (apart from the first element in the stack)
    while (this.unclosedTags.length > 1) {
      const node = this.unclosedTags.pop();
      const parent = this.unclosedTags.at(-1);
      assert(parent != undefined, "parent tag was undefined when adding text node");
      parent?.children?.push(node!);
    }

    // Finally, pop the first element (typically <html>) off of the stack and
    // return it as the 
    return {documentElement:this.unclosedTags.pop()};
  }

}