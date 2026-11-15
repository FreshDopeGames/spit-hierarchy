// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { extractRapperSlugsFromContent } from "./useMentionedRappers";

describe("extractRapperSlugsFromContent", () => {
  test("ignores a trailing space inside the link", () => {
    expect(
      extractRapperSlugsFromContent("[Curtiss King](https://spithierarchy.com/rapper/curtiss-king )"),
    ).toEqual(["curtiss-king"]);
  });

  test("reads relative, www and trailing-slash links", () => {
    expect(
      extractRapperSlugsFromContent(
        "[A](/rapper/blu) [B](https://www.spithierarchy.com/rapper/thurz/) [C](http://spithierarchy.com/rapper/kurupt?x=1)",
      ),
    ).toEqual(["blu", "thurz", "kurupt"]);
  });

  test("album links count as the rapper", () => {
    expect(
      extractRapperSlugsFromContent("[Album](https://spithierarchy.com/rapper/kurupt/tales-from-my-hood)"),
    ).toEqual(["kurupt"]);
  });

  test("de-duplicates repeat mentions", () => {
    expect(extractRapperSlugsFromContent("[a](/rapper/blu) [b](/rapper/blu )")).toEqual(["blu"]);
  });
});
