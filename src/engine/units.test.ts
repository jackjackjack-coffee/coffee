import { describe, it, expect } from 'vitest';
import {
  toBase,
  fromBase,
  baseUnit,
  dimensionOf,
  sameDimension,
  isUnit,
} from './units';

describe('units', () => {
  it('normalises weight to grams', () => {
    expect(toBase(1, 'kg')).toBe(1000);
    expect(toBase(500, 'g')).toBe(500);
    expect(toBase(0.25, 'kg')).toBe(250);
  });

  it('normalises volume to millilitres', () => {
    expect(toBase(1, 'l')).toBe(1000);
    expect(toBase(250, 'ml')).toBe(250);
  });

  it('treats count as each', () => {
    expect(toBase(12, 'ea')).toBe(12);
  });

  it('round-trips through fromBase', () => {
    expect(fromBase(1000, 'kg')).toBe(1);
    expect(fromBase(1000, 'l')).toBe(1);
    expect(fromBase(250, 'g')).toBe(250);
  });

  it('reports the right base unit and dimension', () => {
    expect(baseUnit('kg')).toBe('g');
    expect(baseUnit('l')).toBe('ml');
    expect(baseUnit('ea')).toBe('ea');
    expect(dimensionOf('kg')).toBe('weight');
    expect(dimensionOf('ml')).toBe('volume');
  });

  it('compares dimensions', () => {
    expect(sameDimension('g', 'kg')).toBe(true);
    expect(sameDimension('ml', 'l')).toBe(true);
    expect(sameDimension('g', 'ml')).toBe(false);
  });

  it('validates units', () => {
    expect(isUnit('kg')).toBe(true);
    expect(isUnit('oz')).toBe(false);
  });

  it('rejects negative / non-finite quantities', () => {
    expect(() => toBase(-1, 'g')).toThrow(RangeError);
    expect(() => toBase(Number.NaN, 'g')).toThrow(RangeError);
    expect(() => toBase(Infinity, 'g')).toThrow(RangeError);
  });
});
