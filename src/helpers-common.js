'use strict';

/**
 *
 * Binary search to find the closest match for a number
 * in a sorted numeric array
 *
 * O(log n) time complexity
 * O(1) space complexity
 *
 * @param {Number} num - the target number
 * @param {Array} arr - the array of numbers to search
 * @returns {Number} the index of the exact or closest match
 *
 */
export function arrayFindClosestNumber(num, arr) {
  let lp = 0;
  let rp = arr.length - 1;
  while (rp - lp > 1) {
    const mid = (lp + rp) >> 1;
    if (arr[mid] < num) {
      lp = mid;
    } else {
      rp = mid;
    }
  }
  return num - arr[lp] <= arr[rp] - num ? lp : rp;
}

/**
 *
 * Format number
 *
 * numberFormatter(123.456789, 2) // '123.46'
 * numberFormatter('12.34e+4', 1) // '123400.0'
 *
 * @param {Number|String} num
 * @return {String} a formatted number string
 *
 */
export function numberFormatter(num, fractions = 2) {
  const result = Number(num).toLocaleString('fullwide', {
    useGrouping: false,
    minimumFractionDigits: fractions,
    maximumFractionDigits: fractions
  });
  return result;
}

/**
 *
 * Diff Numeric Strings
 * This function is for identifying the changes between 2 numbers
 * For example in stock data if you wanted to know by how much a value
 * has increased or decreased
 *
 * num1   num2     return
 * 1234   1244   [12, 44]
 * 10010  11000  [1, 1000]
 * 20000  12345  [12345,]
 *
 * @param {String} num1
 * @param {String} num2
 * @return {Object}
 *
 */
export function diffNumericStrings(num1, num2) {

  let prefix;
  let suffix;
  num1 = String(num1);
  num2 = String(num2);

  if (num2.length > num1.length) {
    prefix = '';
    suffix = num2;
  }
  else {
    let i = num1.length - 1;
    let idx;
    for (; i > - 1; i--) {
      if (num1.charAt(i) !== num2.charAt(i)) {
        idx = i;
      }
    }
    prefix = num2.substring(0, idx);
    suffix = num2.substring(idx);
  }

  if (prefix === suffix) suffix = '';

  return [prefix, suffix];

}
