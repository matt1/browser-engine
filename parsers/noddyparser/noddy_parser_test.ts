import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { testCases } from "../testing/data.ts";
import { NoddyParser } from "./noddy_parser.ts";
import { Element, Text } from "../../common/types.ts";

// Remove the parent key from element (and recurse into children too) - parent
// is a reference so not useful in tests.
function removeParentKey(element:Element) {
  delete element.parent;

  if (!element.children) return
  for (const elem of element.children) {
    if ((elem as Text).value) continue;
      removeParentKey(elem as Element);
  }
}

// Rmove empty elements so that we don't have to assertEqual on `Map(0){}`
function removeEmptyAttributes(element:Element) {
  if (element.attributes?.size === 0) {
    delete element.attributes;
  }

  if (!element.children) return
  for (const elem of element.children) {
    if ((elem as Text).value) continue;
      removeEmptyAttributes(elem as Element);
  }

}

Deno.test("NoddyParser parses ok", () => {
  const parser = new NoddyParser();

  testCases.forEach((testCase, testName) => {

    assertExists(testCase);
    const doc = parser.parse(testCase.html!);
  
    // Remove some stuff we don't care about for tests
    removeParentKey(doc.documentElement!);
    removeParentKey(testCase.document.documentElement!);
  //  removeEmptyAttributes(doc.documentElement!);

    assertEquals(doc, testCase.document);
  });


});