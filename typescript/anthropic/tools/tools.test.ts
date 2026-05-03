  import { describe, it, expect } from "vitest";
  import { addDurationToDate } from "./tools";

  describe("addDurationToDate", () => {
    it("adds days to an ISO date", () => {
      const result = addDurationToDate("2026-05-03", 5, "days");
      expect(result).toBe("Friday, May 08, 2026 12:00:00 AM");
    });

    it("clamps Jan 31 + 1 month to Feb 28 in non-leap years", () => {
      const result = addDurationToDate("2025-01-31", 1, "months");
      expect(result).toContain("February 28, 2025");
    });

    it("throws on unparseable input", () => {
      expect(() => addDurationToDate("garbage", 1, "days")).toThrow();
    });
  });