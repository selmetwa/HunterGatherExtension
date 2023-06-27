<script>
  export let email
  export let password
  export let handleLogin
  export let handleUpdatePassword
  export let handleUpdateEmail
</script>

<div class="w-full max-w-md space-y-4">
  <h2
    class="font-sans text-left text-2xl font-light tracking-tight text-gray-400"
  >
    Sign in to your account
  </h2>
  <div class="flex-grow border-t border-gray-200" />
</div>
<input
  class="font-sans mt-2 relative block text-gray-400 w-full appearance-none rounded border border-gray-300 px-3 py-3 text-gray-500 placeholder-gray-200 focus:z-5 focus:border-orange-400 focus:outline-none focus:ring-orange-400 sm:text-md drop-shadow-sm ease-in-out duration-300"
  type="text"
  placeholder="email"
  value={email}
  on:change={handleUpdateEmail}
/>
<input
  class="font-sans mt-2 relative block text-gray-400 w-full appearance-none rounded border border-gray-300 px-3 py-3 text-gray-500 placeholder-gray-200 focus:z-5 focus:border-orange-400 focus:outline-none focus:ring-orange-400 sm:text-md drop-shadow-sm ease-in-out duration-300"
  type="password"
  placeholder="password"
  value={password}
  on:change={handleUpdatePassword}
/>
<button
  class="font-bold font-sans group relative flex w-min justify-center rounded-md border border-transparent bg-action-400 hover:bg-action-500 py-2 px-4 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:gray-300 focus:ring-offset-2 drop-shadow-sm ease-in-out duration-300 whitespace-nowrap mx-auto my-3"
  on:click={handleLogin}>Submit</button
>
<div class="relative flex py-4 items-center">
  <a href="/register" class="m-auto font-light text-gray-400"
    >not a member? <span class="font-semibold text-action-400">Join</span
    ></a
  >
</div>