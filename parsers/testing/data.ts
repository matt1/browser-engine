/** Contains test data for use in testing different parsers. */

import { DocumentTree, Element, Text } from "../../common/types.ts";

export interface ParserTestData {
  html: string;
  document: DocumentTree
}

export const testCases: Map<string, ParserTestData> = new Map([
  ['empty', {
    html: '',
    document: {
      documentElement: new Element({tag: 'html'})
    }
  }],
  // basic test
  ['basic', {
    html: '<html><head><link rel=\'stylesheet\' HREF="style.css" /></head><body><h1>This is some HTML.</h1></body></html>',
    document: {
      documentElement: new Element({
        tag: 'html',
        children: [
          new Element({tag: 'head', children: [
            new Element({tag: 'link', attributes: new Map([['rel','stylesheet'],['href','style.css']])})
          ]}),
          new Element({
            tag: 'body',
            children: [
              new Element({tag: 'h1', children:[new Text('This is some HTML.')]})
            ],
          })
        ],
      })
    }
  }],
  ['unclosed', {
    html: '<html><head></head><body><h1>This is some HTML.',
    document: {
      documentElement: new Element({
        tag: 'html',
        children: [
          new Element({tag: 'head'}),
          new Element({
            tag: 'body',
            children: [
              new Element({tag: 'h1', children:[new Text('This is some HTML.')]})
            ],
          })
        ],
      })
    }
  }],
  // Comments and doctype
  ['comments', {
    html: '<!doctye html><html><head></head><body><!-- a comment --></body></html>',
    document: {
      documentElement: new Element({
        tag: 'html',
        children: [
          new Element({tag: 'head'}),
          new Element({tag: 'body'})
        ],
    })
    }
  }],
  // Selc-closing test
  ['self-closing', {
    html: '<html><head></head><body><p>hello</p><br><p>world</p></body></html>',
    document: {
      documentElement: new Element({
        tag: 'html',
        children: [
          new Element({tag: 'head'}),
          new Element({
            tag: 'body',
            children: [
              new Element({tag: 'p', children: [new Text('hello')]}),
              new Element({tag: 'br'}),
              new Element({tag: 'p', children: [new Text('world')]})
            ],
          })
        ],
      })
    }
  }
  ],
]);
