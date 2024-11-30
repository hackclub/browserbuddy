<script lang="ts">
  import { POMODORO as pomodoro, SHORT_BREAK as shortBreak, LONG_BREAK as longBreak } from "@/utils/constants";
  import { countdown } from "@/utils/countdown";
  import toDoubleDigit from "@/utils/toDoubleDigit";
  import timeUp from "~/assets/sound/time-up.wav";
  import pauseIcon from "~/assets/icon/pause.png";
  import playIcon from "~/assets/icon/play.png";

  export let timer: HTMLElement | null = document.getElementById("timer");
  export let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = "POMODORO";
  export let buttonState: "START" | "PAUSE" = "START";
  export let completedSessions = {
    completedPomodoros: 0,
    completedShortBreaks: 0,
    completedLongBreaks: 0
  };

  const timeUpSound = new Audio(timeUp);

  let interval: NodeJS.Timeout | null = null;
  let timeBetween: number;

  $: {
    switch (timerType) {
      case "POMODORO":
        timeBetween = Number(pomodoro);
        break;
      case "SHORT_BREAK":
        timeBetween = Number(shortBreak);
        break;
      case "LONG_BREAK":
        timeBetween = Number(longBreak);
        break;
    }
  }

  const getMinutesSeconds = (time: number) => ({
    minutes: toDoubleDigit(Math.floor((time / 60000) % 60)),
    seconds: toDoubleDigit(Math.floor((time / 1000) % 60))
  });

  $: ({ minutes, seconds } = getMinutesSeconds(timeBetween));

  $: {
    if (timer) {
      timer.innerHTML = `${minutes}:${seconds}`;
    }
  }

  const changeButtonState = () => {
    buttonState = buttonState === "START" ? "PAUSE" : "START";
  };

  const resetTimer = () => {
    switch (timerType) {
      case "POMODORO":
        timeBetween = Number(pomodoro);
        buttonState = "START";
        break;
      case "SHORT_BREAK":
        timeBetween = Number(shortBreak);
        buttonState = "START";
        break;
      case "LONG_BREAK":
        timeBetween = Number(longBreak);
        buttonState = "START";
        break;
    }
    if (timer) {
      const { minutes, seconds } = getMinutesSeconds(timeBetween);
      timer.innerHTML = `${minutes}:${seconds}`;
    }
  };

  const playTimer = () => {
    if (timer) {
      interval = countdown(timer, timeBetween, (remainingTime) => {
        timeBetween = remainingTime;
      }, () => {
        if (timerType === "POMODORO") {
          completedSessions.completedPomodoros += 1;
          timeUpSound.play();
        } else if (timerType === "SHORT_BREAK") {
          completedSessions.completedShortBreaks += 1;
          timeUpSound.play();
        } else if (timerType === "LONG_BREAK") {
          completedSessions.completedLongBreaks += 1;
          timeUpSound.play();
        }

        resetTimer();
      });
    }
  };

  const pauseTimer = () => {
    if (interval !== null) clearInterval(interval);
  };

  const handleClick = () => {
    if (buttonState === "START") {
      playTimer();
    } else {
      pauseTimer();
    }
    changeButtonState();
  };
</script>

<button id="timerButton" on:click={handleClick}>
  {#if buttonState === "START"}
    <img src={playIcon} width="12" alt="Play" />
  {:else}
    <img src={pauseIcon} width="12" alt="Pause" />
  {/if}
</button>
