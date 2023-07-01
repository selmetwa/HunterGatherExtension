<script>
  import { onMount } from "svelte";
  import { v4 as uuidv4 } from "uuid";
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
  $: objectsCount = 0;
  $: isSubscriber = false;
  $: activeTab = "block";
  $: collectionTitle = "";
  $: collectionDescription = "";

  const tabs = [
    {
      name: "Block",
      val: "block",
    },
    {
      name: "Collection",
      val: "collection",
    },
  ];

  const createCollectionQuery = async (
    title,
    description,
    collectionIds,
    userId
  ) => {
    const collectionId = uuidv4();

    const { data: responseData, error: responseError } = await client
      .from("collections")
      .insert({
        collectionId: collectionId,
        title: title,
        description: description,
        userId: userId,
        collectionIds: collectionIds,
        objectType: "collection",
      })
      .select();

    return responseData;
  };

  async function getUserById(userId) {
    const { data: user } = await client.from("users").select().eq("id", userId);

    return user || [{}];
  }

  async function getCollectionsCountByUserId(userId) {
    const count = await client
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    return count.count || 0;
  }

  async function getBlocksCountByUserId(userId) {
    const count = await client
      .from("blocks")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    return count.count || 0;
  }

  async function getCollectionsByUserId(userId) {
    const { data: collections } = await client
      .from("collections")
      .select()
      .eq("userId", userId)
      .order("updated_at", { ascending: false });

    return collections || [];
  }

  onMount(async () => {
    const collectionsCount = await getCollectionsCountByUserId(userId);
    const blocksCount = await getBlocksCountByUserId(userId);
    const user = await getUserById(userId);
    isSubscriber = user?.[0].is_subscriber;
    objectsCount = collectionsCount + blocksCount;
    collectionIds = await getCollectionsByUserId(userId);
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

  const createBlock = async (t, u, colIds, uId) => {
    inProgress = true;
    const res = await fetch(`http://localhost:5173/api/blocks`, {
      method: "POST",
      headers: { accept: "application/json" },
      body: JSON.stringify({
        title: t,
        url: u,
        collectionIds: colIds,
        userId: uId,
      }),
    });

    // const res = await createBlock(title, url, toggledCollectionIds, $page?.data?.session?.user?.id);
    const responseData = await res.json();
    handleResponse(res, responseData);
  };

  const handleCreateBlock = async () => {
    createBlock(title, url, toggledIds, userId);
  };

  const createCollection = async () => {
    inProgress = true;
    const res = await createCollectionQuery(
      collectionTitle,
      collectionDescription,
      toggledIds,
      userId
    );
    const colId = res?.[0]?.collectionId;
    createBlock(title, url, [colId], userId);
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

<!-- objectsCount <= 200 || true -->
{#if objectsCount <= 200 || isSubscriber}
  <section class="flex">
    {#each tabs as tab}
      <button
        value={tab.val}
        class={`${
          activeTab === tab.val
            ? "border-2 text-action-400 border-action-400 font-bold"
            : "text-gray-400 border-2 border-gray-100"
        } bg-gray-100 rounded-md my-2 mx-2 m font-sans group relative flex w-full justify-center py-2 px-4 font-medium ease-in-out duration-300 cursor-pointer`}
        on:click={(e) => (activeTab = e.target.value)}
      >
        {tab.name}
      </button>
    {/each}
  </section>

  {#if activeTab === "block"}
    <CollectionPills
      {collectionIds}
      toggledCollectionIds={toggledIds}
      {onPillClick}
    />
    <button
      class="font-bold font-sans group relative flex w-min justify-center rounded-md border border-transparent bg-action-400 hover:bg-action-500 py-2 px-4 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:gray-300 focus:ring-offset-2 drop-shadow-sm ease-in-out duration-300 whitespace-nowrap mx-auto my-3 mt-4"
      on:click={handleCreateBlock}
    >
      Create Block
    </button>
  {:else}
    <p class="text-gray-400 font-light text-lg mt-2">
      Create a new collection and save current URL to it
    </p>
    <input
      class="font-sans mt-2 relative block text-gray-400 w-full appearance-none rounded border border-gray-300 px-3 py-3 text-gray-500 placeholder-gray-200 focus:z-5 focus:border-orange-400 focus:outline-none focus:ring-orange-400 sm:text-md drop-shadow-sm ease-in-out duration-300"
      type="text"
      placeholder="collection title"
      value={collectionTitle}
      on:change={(e) => (collectionTitle = e.target.value)}
    />
    <input
      class="font-sans mt-2 relative block text-gray-400 w-full appearance-none rounded border border-gray-300 px-3 py-3 text-gray-500 placeholder-gray-200 focus:z-5 focus:border-orange-400 focus:outline-none focus:ring-orange-400 sm:text-md drop-shadow-sm ease-in-out duration-300"
      type="text"
      placeholder="collection description"
      value={collectionDescription}
      on:change={(e) => (collectionDescription = e.target.value)}
    />
    <CollectionPills
      {collectionIds}
      toggledCollectionIds={toggledIds}
      {onPillClick}
    />
    <button
      class="font-bold font-sans group relative flex w-min justify-center rounded-md border border-transparent bg-action-400 hover:bg-action-500 py-2 px-4 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:gray-300 focus:ring-offset-2 drop-shadow-sm ease-in-out duration-300 whitespace-nowrap mx-auto my-3 mt-4"
      on:click={createCollection}
    >
      Create Collection
    </button>
  {/if}
{:else}
  <h2
    class="font-sans text-left text-2xl font-light tracking-tight text-gray-400 mt-4"
  >
    HunterGather Premium
  </h2>

  <div class="flex-grow border-t border-gray-200" />
  <div class="text-blue-400 font-semibold text-xl mt-4">$4.00 a Month</div>
  <p class="text-gray-400 font-light text-lg mt-4">
    You have exceeded the free tier limit of 200 blocks & collections
  </p>
  <p class="text-gray-400 font-light text-lg mt-2">
    Subscribe for the ability to contribute unlimited blocks & collections
  </p>
  <a href="http://localhost:5173/pricing">
    <button
      class="font-bold font-sans group relative flex w-min justify-center rounded-md border border-transparent bg-action-400 hover:bg-action-500 py-2 px-4 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:gray-300 focus:ring-offset-2 drop-shadow-sm ease-in-out duration-300 whitespace-nowrap mx-auto my-3 mt-4 w-full"
    >
      Subscribe
    </button>
  </a>
  <p class="text-gray-400 font-light text-lg mt-2">
    Or if you want to continue contributing to the site but don't want to pay
    $4/mo just email me at <span class="text-blue-400">selmetwa@gmail.com</span>
  </p>
{/if}
