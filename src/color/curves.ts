export type Curve = (x: number) => number

export const linear: Curve = (x) => x

/** Endpoint-normalized S curve on [0, 1]. */
export const arctangent = (strength: number): Curve => (x) =>
  (Math.atan(strength * (2 * x - 1)) + Math.atan(strength)) / (2 * Math.atan(strength))
