export function httpError(message: string, status = 400): never {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  throw err;
}
