import {isEqual} from 'lodash';

export function getObjectDiff(originalObj, updatedObj) {
  const updates = {};

  // Check all keys from the updated object
  for (const key in updatedObj) {
    // Use lodash's isEqual for a reliable deep comparison of objects and arrays
    if (!isEqual(originalObj[key], updatedObj[key])) {
      updates[key] = updatedObj[key];
    }
  }

  return updates;
}