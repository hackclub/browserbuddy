/**
 * Turns a number with one digit in a double-digited number
 * @example toDoubleDigit(1) returns "01"
 * @param num The number that you want to convert
 * @returns The double-digited number as a string
 */

export default function toDoubleDigit(num: number): string {
  return num.toString().padStart(2, '0');
}