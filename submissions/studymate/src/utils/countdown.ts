/**
 * This function will countdown from a certain time and update the timer element.
 * @param timer The element where the timer will be displayed.
 * @param time The time you want to countdown from in milliseconds.
 * @param onUpdate A callback function that will be called with the remaining time.
 * @returns The interval ID which can be used to clear the interval.
 */

import toDoubleDigit from "./toDoubleDigit";

export function countdown(timer: HTMLElement, time: number, onUpdate?: (timeBetween: number) => void, onFinish?: () => void): NodeJS.Timeout {
    let now = Date.now();
    let completed = now + time;

    const countdown = setInterval(function() {
      now = Date.now();
      let timeBetween = completed - now;
      let minutes = toDoubleDigit(Math.floor((timeBetween / 60000) % 60));
      let seconds = toDoubleDigit(Math.floor((timeBetween / 1000) % 60));

      timer.innerText = `${minutes}:${seconds}`;
      
      if (onUpdate) onUpdate(timeBetween);

      if (timeBetween <= 0) {
        clearInterval(countdown);
        timer.innerText = "00:00";
        if (onFinish) onFinish();
      }
    }, 500);

    return countdown;
}