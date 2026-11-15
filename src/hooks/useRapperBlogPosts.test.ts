// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { contentMentionsRapper } from "./useRapperBlogPosts";

describe("contentMentionsRapper", () => {
  test("matches a markdown link to the rapper page", () => {
    expect(contentMentionsRapper("Read about [Drake](/rapper/drake) here", "drake")).toBe(true);
  });
  test("matches a link to one of the rapper's album pages", () => {
    expect(contentMentionsRapper("[Views](https://spithierarchy.com/rapper/drake/views)", "drake")).toBe(true);
  });
  test("does not match a different rapper whose slug starts the same", () => {
    expect(contentMentionsRapper("[Drakeo](/rapper/drakeo-the-ruler)", "drake")).toBe(false);
  });
});
