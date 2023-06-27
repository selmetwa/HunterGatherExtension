<script lang="ts">
  import { createClient } from "@supabase/supabase-js";
  import { onMount } from "svelte";
  import Login from "./Login.svelte";
  import Collections from "./Collections.svelte";

  const supabase = createClient(
    "https://chedwybrxwxgbrtqmlfc.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZWR3eWJyeHd4Z2JydHFtbGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1NDE1MjcsImV4cCI6MTk4ODExNzUyN30.iXF4pYcNhvzWAiLcPD-6fkP5sOaP2SCcQdrqIUuqiYI"
  );

  $: isAuthenticated = false;
  $: aToken = "";
  $: password = "";
  $: email = "";
  $: userId = "";
  $: url = "";
  $: title = ""

  const handleUpdatePassword = (e) => {
    password = e.target.value;
  };

  const handleUpdateEmail = (e) => {
    email = e.target.value;
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (data && !error) {
      console.log({ data, error });
      const accessToken = data?.session?.access_token;
      aToken = accessToken;
      userId = data?.user?.id;
      chrome.storage.sync.set({ accessToken }).then(() => {});
      chrome.storage.sync.set({ userId }).then(() => {});
      isAuthenticated = true;
    }
  };

  onMount(async () => {
    const { accessToken } = await chrome.storage.sync.get();
    const { userId: u } = await chrome.storage.sync.get();

    chrome.tabs.query({}, tabs => {
      const active = tabs.filter(t=>t.active===true)[0]
      url = active.url
      title = active.title
    });

    aToken = accessToken
    userId = u;
    console.log("mount", { accessToken });
  });
</script>

<div class="mt-4 space-y-6 w-[450px] h-[500px]">
  <div class="p-4 mt-12">
    {#if aToken}
    <div class="bg-gray-200 py-8 flex items-center justify-center">
      <h1 class="text-gray-400 font-light text-xl">{url}</h1>
    </div>
    <Collections client={supabase} userId={userId} {title} {url} />
    {:else}
      <Login
        {email}
        {password}
        {handleLogin}
        {handleUpdatePassword}
        {handleUpdateEmail}
      />
    {/if}
  </div>
</div>
