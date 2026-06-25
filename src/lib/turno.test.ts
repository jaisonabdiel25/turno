import { describe, it, expect } from "vitest";
import { sequenceToCode, MAX_TURNO_SEQUENCE } from "./turno";

describe("sequenceToCode", () => {
  it("usa números del 1 al 99", () => {
    expect(sequenceToCode(1)).toBe("1");
    expect(sequenceToCode(7)).toBe("7");
    expect(sequenceToCode(99)).toBe("99");
  });

  it("pasa a A01 tras el 99", () => {
    expect(sequenceToCode(100)).toBe("A01");
    expect(sequenceToCode(101)).toBe("A02");
    expect(sequenceToCode(198)).toBe("A99");
  });

  it("pasa a B01 tras A99", () => {
    expect(sequenceToCode(199)).toBe("B01");
    expect(sequenceToCode(297)).toBe("B99");
    expect(sequenceToCode(298)).toBe("C01");
  });

  it("llega hasta Z99 en el máximo", () => {
    expect(sequenceToCode(MAX_TURNO_SEQUENCE)).toBe("Z99");
  });

  it("rechaza valores inválidos y fuera de rango", () => {
    expect(() => sequenceToCode(0)).toThrow();
    expect(() => sequenceToCode(-1)).toThrow();
    expect(() => sequenceToCode(1.5)).toThrow();
    expect(() => sequenceToCode(MAX_TURNO_SEQUENCE + 1)).toThrow();
  });
});
