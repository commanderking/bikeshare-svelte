<script lang="ts">
	export let data;

	import HorizontalBar from '../lib/components/HorizontalBar.svelte';
</script>

<h1>Welcome to Blue bike data!</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<HorizontalBar getQuery={data.getQuery} />
