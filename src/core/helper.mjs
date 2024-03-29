/* a generic helper class for now, until it grows */
export class Helper {

  // stolen from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
  static replaceCircularReference() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
}

export function uniqueId() {
  return String(Math.random().toString(16).slice(2))
}