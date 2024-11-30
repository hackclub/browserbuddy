<script lang="ts">
    import './timertype.css';
    import './Start.svelte';

    export let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = "POMODORO";
    export let buttonState: "START" | "PAUSE" = "START";
    export let completedSessions = {
      completedPomodoros: 0,
      completedShortBreaks: 0,
      completedLongBreaks: 0
    };

    const handleClick = () => {
        const pomodoro = document.getElementById('pomodoro') as HTMLInputElement;
        const shortBreak = document.getElementById('shortBreak') as HTMLInputElement;
        const longBreak = document.getElementById('longBreak') as HTMLInputElement;

        if (pomodoro.checked) {
            timerType = "POMODORO";
        } else if (shortBreak.checked) {
            timerType = "SHORT_BREAK";
        } else if (longBreak.checked) {
            timerType = "LONG_BREAK";
        }

        console.log(`debug> timer changed to: ${timerType}`);
    }
</script>

<div class="timer-type">
    <form>
        <label>
            <input type="radio" id="pomodoro" name="timerType" checked on:click={handleClick} disabled={buttonState === "PAUSE"}>
            <span>Pomodoro {#if completedSessions.completedPomodoros > 0}<strong>({completedSessions.completedPomodoros})</strong>{/if}</span>
        </label>
        <label>
            <input type="radio" id="shortBreak" name="timerType" on:click={handleClick} disabled={buttonState === "PAUSE"}>
            <span>Short Break {#if completedSessions.completedShortBreaks > 0}<strong>({completedSessions.completedShortBreaks})</strong>{/if}</span>
        </label>
        <label>
            <input type="radio" id="longBreak" name="timerType" on:click={handleClick} disabled={buttonState === "PAUSE"}>
            <span>Long Break {#if completedSessions.completedLongBreaks > 0}<strong>({completedSessions.completedLongBreaks})</strong>{/if}</span>
        </label>
    </form>
</div>
