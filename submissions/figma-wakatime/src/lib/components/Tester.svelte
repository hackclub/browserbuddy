<script lang="ts">
  import { onMount } from "svelte";
  import { wakaApiKey, apiUrl, figmaApiKey } from "@/lib/store";
  import WakaTime from "@/lib/wakatime";
  import { log } from "@/lib/util";
  import { fade } from "svelte/transition";

  import Check from "lucide-svelte/icons/check";
  import X from "lucide-svelte/icons/x";

  type TestStatus = {
    passed: boolean | null;
    error?: string;
  };

  let wakaStatus: TestStatus = $state({ passed: null });
  let figmaStatus: TestStatus = $state({ passed: null });
  let testing = $state(false);

  async function testWakaConnection(apiKey: string, apiUrl: string) {
    const wakatime = new WakaTime(apiKey, apiUrl);

    try {
      const testHeartbeat = {
        entity: `figma-wakatime-${Date.now()}.txt`,
        type: "file" as const,
        time: Date.now() / 1000,
        project: "welcome",
        language: "text",
        category: "designing" as const,
        is_write: false,
      };

      await wakatime.trySendHeartbeats([testHeartbeat]);
      wakaStatus = { passed: true };
      log.info("WakaTime API test succeeded");
    } catch (error) {
      wakaStatus = {
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      log.error("WakaTime API test failed:", error);
    }
  }

  async function testFigmaConnection(apiKey: string) {
    try {
      const response = await fetch("https://api.figma.com/v1/me", {
        headers: {
          "X-Figma-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      figmaStatus = { passed: true };
      log.info("Figma API test succeeded");
    } catch (error) {
      figmaStatus = {
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      log.error("Figma API test failed:", error);
    }
  }

  onMount(() => {
    $effect(() => {
      testing = true;

      if ($wakaApiKey && $apiUrl && $apiUrl.trim() !== "") {
        testWakaConnection($wakaApiKey, $apiUrl);
      } else {
        wakaStatus = { passed: null };
      }

      if ($figmaApiKey && $figmaApiKey.trim() !== "") {
        testFigmaConnection($figmaApiKey);
      } else {
        figmaStatus = { passed: null };
      }

      testing = false;
    });
  });

  const tests = $derived.by(() => {
    return [
      { label: "Sent WakaTime heartbeat", passed: wakaStatus.passed },
      { label: "Connected to Figma", passed: figmaStatus.passed },
    ];
  });
  const allPassed = $derived.by(() => {
    return tests.every((test) => test.passed);
  });
  const allRan = $derived.by(() => {
    return wakaStatus.passed !== null && figmaStatus.passed !== null;
  });
</script>

<div class="flex flex-col gap-4">
  <div
    class="card transition-colors duration-300 ease-in-out {allPassed === true
      ? 'bg-primary text-primary-content'
      : allPassed === false
        ? 'bg-error text-error-content'
        : 'bg-base-200'} w-full shadow-xl"
    transition:fade={{ duration: 100 }}
  >
    <div class="p-5">
      {#if testing}
        <div class="card-title">Testing connection...</div>
        <p class="mt-2 text-base">
          Checking connection to WakaTime and Figma...
        </p>
      {:else if allRan}
        <h2 class="card-title">
          {#if allPassed}
            <span>All tests passed</span>
          {:else}
            <span>Some tests failed</span>
          {/if}
        </h2>

        <p class="text-base mb-2">
          {#if allPassed}
            You're ready to start tracking your Figma activity!
          {:else}
            Double check your configuration and try again.
          {/if}
        </p>

        <ul class="*:text-base">
          {#each tests as { label, passed }}
            <li class="flex items-center">
              {#if passed}
                <Check class="w-5 h-5 mr-1" />
              {:else}
                <X class="w-5 h-5 mr-1" />
              {/if}
              {label}
            </li>
          {/each}
        </ul>
      {:else}
        <div class="card-title">Initializing...</div>
        <p class="mt-2 text-base">
          Waiting for WakaTime and Figma configuration...
        </p>
      {/if}
    </div>
  </div>
</div>
