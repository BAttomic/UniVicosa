// Converts Mongoose lean documents into plain, JSON-safe objects: ObjectId values
// become hex strings and Date values become ISO strings. Server Components render
// these directly, so leaving raw ObjectIds in place breaks calls like
// `order._id.slice(-6)` (ObjectId has no .slice). Centralized here so every
// repository can return wire-safe data the same way.
export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}
