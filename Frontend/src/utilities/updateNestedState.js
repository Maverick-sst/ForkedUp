export default function updateNestedState(obj, keys, value) {
  // base case --- if we are left with only 1 elem in keys
  if (keys.length === 1) {
    const lastKey = keys[0];
    // If the current level is an array, create a new array.
    if (Array.isArray(obj)) {
      const newArr = [...obj];
      newArr[parseInt(lastKey, 10)] = value;
      return newArr;
    }
    return {
      ...obj,
      [lastKey]: value,
    };
  }
  // else keep on calling function using recursion
  const currentKey = keys[0];
  const remainingkeys = keys.slice(1);
  // If the current level is an array, we need to update it as an array.
  if (Array.isArray(obj)) {
    const newArr = [...obj];
    const index = parseInt(currentKey, 10);
    // Recursively call to update the next level down.
    newArr[index] = updateNestedState(obj[index] || {}, remainingkeys, value);
    return newArr;
  }
  
  const nextObj = obj[currentKey] || {};
  return {
    ...obj,
    [currentKey]: updateNestedState(nextObj, remainingkeys, value),
  };
}
