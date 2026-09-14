import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseFilter, useHashFilter } from "../src/hooks/useHashFilter";

describe("parseFilter", () => {
    it("maps hashes to filters and falls back to all", () => {
        expect(parseFilter("#/active")).toBe("active");
        expect(parseFilter("#/completed")).toBe("completed");
        expect(parseFilter("#/")).toBe("all");
        expect(parseFilter("")).toBe("all");
    });
});

describe("useHashFilter", () => {
    it("reads the initial hash and reacts to hash changes", () => {
        window.location.hash = "#/completed";

        const { result } = renderHook(() => useHashFilter());

        expect(result.current).toBe("completed");

        act(() => {
            window.location.hash = "#/active";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(result.current).toBe("active");
    });
});
