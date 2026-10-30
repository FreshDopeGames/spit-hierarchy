// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { classifyRegion, favoriteRegion, rapperAge } from "./topFiveInsights";

describe("favoriteRegion", () => {
  test("3 East Coast rappers makes East Coast the favorite", () => {
    expect(favoriteRegion(["Brooklyn, NY", "Queens, NY", "Philadelphia, PA", "Atlanta, GA", "Compton, CA"])).toBe("US East Coast");
  });
  test("no more than 2 of any region is Balanced", () => {
    expect(favoriteRegion(["Brooklyn, NY", "Queens, NY", "Atlanta, GA", "Houston, TX", "Detroit, MI"])).toBe("Balanced");
  });
  test("non-US origins are International", () => {
    expect(classifyRegion("London, ON")).toBe("International");
    expect(classifyRegion("Kingston, Jamaica")).toBe("International");
  });
  test("Midwest and South states classify correctly", () => {
    expect(classifyRegion("Detroit, MI")).toBe("US Midwest");
    expect(classifyRegion("Fayetteville, NC")).toBe("US South");
  });
});

test("deceased rapper age uses death year", () => {
  expect(rapperAge(1971, 1996, 2026)).toBe(25);
  expect(rapperAge(1975, null, 2026)).toBe(51);
});
