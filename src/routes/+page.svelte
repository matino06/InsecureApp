<script>
	import { onMount } from 'svelte';
	import '../app.css';

	let messages = $state([]);
	let users = $state([]);
	let filter = $state('');
	let sqlEnabled = $state(true);
	let sensitiveEnabled = $state(true);
	let author = $state('');
	let content = $state('');
	let newUsername = $state('');
	let newPassword = $state('');

	async function loadMessages() {
		const url = filter
			? `/api/messages?filter=${encodeURIComponent(filter)}&sqlEnabled=${sqlEnabled}`
			: `/api/messages?sqlEnabled=${sqlEnabled}`;
		const res = await fetch(url).then((r) => r.json());
		messages = res.rows || [];
	}

	async function addMessage() {
		await fetch('/api/messages', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ author, content })
		});
		author = '';
		content = '';
		await loadMessages();
	}

	users = [
		{ username: 'admin', password: 'plaintext123' },
		{ username: 'user', password: 'password456' },
		{ username: 'demo', password: 'test789' }
	];

	$effect(() => {
		loadMessages();
	});
</script>

<div class="mx-auto max-w-2xl space-y-6 p-4">
	<h1 class="text-3xl font-bold tracking-tight">Insecure App</h1>

	<!-- Toggles -->
	<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
		<h2 class="mb-3 text-lg font-semibold">Ranjivosti</h2>
		<div class="space-y-2">
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" class="h-4 w-4 accent-primary" bind:checked={sqlEnabled} />
				<span>SQL Injection (filter tautologija)</span>
			</label>

			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" class="h-4 w-4 accent-primary" bind:checked={sensitiveEnabled} />
				<span>Sensitive Data Exposure (plaintext lozinke)</span>
			</label>
		</div>
	</div>

	<!-- SQL Injection -->
	<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
		<h2 class="mb-3 text-lg font-semibold">Poruke</h2>

		<div class="space-y-3">
			<div>
				<label class="mb-1 block text-sm font-medium">Filter (tautologija test)</label>
				<input
					class="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
					placeholder="npr. ' OR '1'='1"
					bind:value={filter}
				/>
				<p class="mt-1 text-xs text-muted-foreground">
					Primjer tautologije:&nbsp;
					<code class="rounded border border-border bg-background/60 px-1 py-0.5 text-sm"
						>' OR '1'='1</code
					>
				</p>
			</div>

			<div class="flex gap-2"></div>

			<hr class="my-3 border-border" />

			<div class="space-y-2">
				<label class="block text-sm font-medium">Dodaj poruku</label>
				<input
					class="w-full rounded-md border border-input px-2 py-1 text-sm"
					placeholder="author"
					bind:value={author}
				/>
				<input
					class="w-full rounded-md border border-input px-2 py-1 text-sm"
					placeholder="content"
					bind:value={content}
				/>
				<button
					class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
					on:click={addMessage}
				>
					Spremi
				</button>
			</div>

			<div class="mt-4">
				<h3 class="mb-1 font-semibold">Rezultati</h3>
				<ul class="list-inside list-disc space-y-1 text-sm">
					{#each messages as m}
						<li>
							<strong>{m.author}</strong>: {m.content}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Sensitive Data Exposure -->
	<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
		<div class="mt-4 space-y-2">
			<h3 class="font-semibold">Dodaj korisnika</h3>
			<input
				class="w-full rounded-md border border-input px-2 py-1 text-sm"
				placeholder="username"
				bind:value={newUsername}
			/>
			<input
				class="w-full rounded-md border border-input px-2 py-1 text-sm"
				placeholder="password"
				type="password"
				bind:value={newPassword}
			/>
			<button
				class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
			>
				Spremi korisnika
			</button>
		</div>
	</div>
	<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
		<h2 class="mb-3 text-lg font-semibold">Korisnici (Sensitive Data)</h2>
		<button
			class="mb-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
		>
			Osvježi korisnike
		</button>
		<ul class="list-inside list-disc space-y-1 text-sm">
			{#each users as u}
				<li>
					{u.username} — <em class="text-muted-foreground">{u.password}</em>
				</li>
			{/each}
		</ul>
	</div>
</div>
