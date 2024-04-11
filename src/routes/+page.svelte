<script lang="ts">
	import TripsByDayChart from '$lib/features/tripsByDay/TripsByDayChart.svelte';

	export let data;
</script>

<h1>Bluebike data</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<TripsByDayChart getQuery={data.getQuery} />
