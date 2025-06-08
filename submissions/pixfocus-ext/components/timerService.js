export class TimerService {
  constructor(initialDuration, onTick, onComplete) {
    this.initialDuration = initialDuration;
    this.timeRemaining = initialDuration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) return;

    this.onTick(this.timeRemaining);

    this.intervalId = setInterval(() => {
      this.timeRemaining -= 1;
      this.onTick(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  stop() {
    this.pause();
    this.timeRemaining = this.initialDuration;
    this.onTick(this.timeRemaining);
  }

  complete() {
    this.pause();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  getProgress() {
    return 1 - this.timeRemaining / this.initialDuration;
  }

  cleanup() {
    this.pause();
  }
}
