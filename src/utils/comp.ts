export function deepEqual(obj1: Object, obj2: Object) {
  // Check if both are the same reference
  if (obj1 === obj2) return true;

  // If either is null or not an object, return false
  if (
    obj1 == null ||
    obj2 == null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if they have the same number of keys
  if (keys1.length !== keys2.length) return false;

  // Check each key and value
  for (let key of keys1) {
    // Recursively check each property
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
