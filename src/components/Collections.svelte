<script>
  import { onMount } from "svelte";
  import CollectionPills from "./CollectionPills.svelte";
  export let client;
  export let userId;
  export let title;
  export let url;

  $: collectionIds = [];
  $: toggledIds = [];
  $: inProgress = false;
  $: successMessage = "";
  $: errorMessage = "";

  async function getCollectionsByUserId(userId) {
    const { data: collections } = await client
      .from("collections")
      .select()
      .eq("userId", userId)
      .order("updated_at", { ascending: false });

    return collections || [];
  }

  onMount(async () => {
    collectionIds = await getCollectionsByUserId(userId);
    console.log({ collectionIds });
  });

  const onPillClick = (e) => {
    const copy = [...toggledIds];
    const id = e.target.value;
    if (copy.includes(id)) {
      const index = copy.indexOf(id);
      copy.splice(index, 1);
    } else {
      copy.push(id);
    }

    toggledIds = copy;
  };

  const handleResponse = (res, responseData) => {
    const { status } = res;

    // handle error
    if (status === 500) {
      setTimeout(() => {
        inProgress = false;
        errorMessage = responseData.message;
        url = "";
        toggledIds = [];
      }, 1000);

      return;
    }

    errorMessage = "";

    setTimeout(() => {
      inProgress = false;
      successMessage = `Block has been created successfully.`;
      url = "";
      toggledIds = [];

      setTimeout(() => {
        successMessage = "";
      }, 2000);
    }, 1000);
  };

  const onSubmit = async () => {
    inProgress = true;
    const res = await fetch(`http://localhost:5173/api/blocks`, {
      method: "POST",
      headers: { accept: "application/json" },
      body: JSON.stringify({
        title,
        url,
        collectionIds: toggledIds,
        userId,
      }),
    });

    // const res = await createBlock(title, url, toggledCollectionIds, $page?.data?.session?.user?.id);
    const responseData = await res.json();
    console.log({ responseData });
    handleResponse(res, responseData);
  };
</script>

{#if errorMessage}
  <div
    class="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded relative mb-4"
    role="alert"
  >
    <span class="block sm:inline">Something went wrong</span>
  </div>
{/if}

{#if successMessage}
  <div
    class="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded relative mb-4 mt-4"
    role="alert"
  >
    <span class="block sm:inline">Block Created successfully</span>
  </div>
{/if}
<CollectionPills
  {collectionIds}
  toggledCollectionIds={toggledIds}
  {onPillClick}
/>
<button
  class="font-bold font-sans group relative flex w-min justify-center rounded-md border border-transparent bg-action-400 hover:bg-action-500 py-2 px-4 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:gray-300 focus:ring-offset-2 drop-shadow-sm ease-in-out duration-300 whitespace-nowrap mx-auto my-3 mt-4"
  on:click={onSubmit}
>
  Create Block
</button>
