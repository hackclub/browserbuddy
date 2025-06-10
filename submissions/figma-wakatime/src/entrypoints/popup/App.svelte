<script lang="ts">
  import { apiUrl, wakaApiKey, figmaApiKey } from "@/lib/store";
  import Tester from "@/lib/components/Tester.svelte";
  import "./app.css";
</script>

<h1 class="text-2xl font-semibold">WakaTime for Figma</h1>
<Tester />
<div class="space-y-2">
  <label class="form-control w-full max-w-xs">
    <div class="label">
      <span class="label-text">API Key</span>
    </div>
    <input
      type="password"
      bind:value={$wakaApiKey}
      placeholder="Type here"
      class="input input-bordered w-full max-w-xs"
    />
  </label>

  <label class="form-control w-full max-w-xs">
    <div class="label">
      <span class="label-text">API URL</span>
    </div>
    <input
      type="text"
      bind:value={$apiUrl}
      placeholder="Type here"
      class="input input-bordered w-full max-w-xs"
    />
    <div class="label">
      <span class="label-text-alt"
        >Only change this if you know what you're doing</span
      >
    </div>
  </label>

  <label class="form-control w-full max-w-xs">
    <div class="label">
      <span class="label-text">Figma API Key</span>
    </div>
    <input
      type="password"
      bind:value={$figmaApiKey}
      placeholder="Type here"
      class="input input-bordered w-full max-w-xs"
    />
    <div class="label">
      <span class="label-text-alt"
        ><a
          href="https://files.catbox.moe/jfkqc7.mp4"
          target="_blank"
          class="underline">How do I get this?</a
        ></span
      >
    </div>
  </label>
</div>
