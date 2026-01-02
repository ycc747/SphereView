import { create, all } from 'mathjs';

const math = create(all);

export const validateEquation = (equation: string): boolean => {
  try {
    const node = math.parse(equation);
    return true;
  } catch {
    return false;
  }
};

export const evaluateEquation = (equation: string, x: number, y: number, z: number): number => {
  try {
    const scope = { x, y, z };
    return math.evaluate(equation, scope);
  } catch {
    return NaN;
  }
};
