export function simulateApiDelay(ms?: number): Promise<void> {
  const delay = ms ?? Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
