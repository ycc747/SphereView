
export interface CoordinateState {
  x: number;
  y: number;
  z: number;
}

export interface EquationResult {
  isValid: boolean;
  value: number;
  error?: string;
}

export type Axis = 'x' | 'y' | 'z';

export interface SurfacePoint {
  x: number;
  y: number;
  z: number;
  val: number;
}
