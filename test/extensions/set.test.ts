describe("Set.prototype.some", () => {
  it("returns true for the first matching value and stops iterating", () => {
    const values = new Set([3, 5, 7]);
    const predicate = vi.fn((value: number, index: number, set: ReadonlySet<number>) => {
      expect(set).toBe(values);
      return value === 5 && index === 1;
    });

    expect(values.some(predicate)).toBe(true);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(predicate).toHaveBeenNthCalledWith(1, 3, 0, values);
    expect(predicate).toHaveBeenNthCalledWith(2, 5, 1, values);
  });

  it("returns false when no value satisfies the predicate", () => {
    const values = new Set([1, 2, 3]);

    expect(values.some(value => value > 3)).toBe(false);
  });

  it("does not invoke the predicate for an empty set", () => {
    const predicate = vi.fn();

    expect(new Set<number>().some(predicate)).toBe(false);
    expect(predicate).not.toHaveBeenCalled();
  });
});
