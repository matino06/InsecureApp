<script>
	import { onMount } from 'svelte';
	import '../app.css';

	let messages = $state([]);
	let users = $state([]);
	let filter = $state('');
	let sqlEnabled = $state(true);
	let csrfProtected = $state(true);
	let content = $state('');
	let contentNoToken = $state('');
	let username = $state('');
	let sessionCsrf = $state('');

	async function loadMessages() {
		const url = filter
			? `/api/messages?filter=${encodeURIComponent(filter)}&sqlEnabled=${sqlEnabled}`
			: `/api/messages?sqlEnabled=${sqlEnabled}`;
		const res = await fetch(url).then((r) => r.json());
		messages = res.rows || [];
	}

	async function addMessage() {
		const value = content;
		await fetch(`/api/messages?csrfProtected=${csrfProtected}`, {
			method: 'POST',
			body: JSON.stringify({ value }),
			headers: {
				'content-type': 'application/json',
				'x-csrf-token': sessionCsrf
			}
		});
		content = '';
		await loadMessages();
	}

	async function addMessageNoToken() {
		const value = contentNoToken;
		await fetch(`/api/messages?csrfProtected=${csrfProtected}`, {
			method: 'POST',
			body: JSON.stringify({ value })
		});
		contentNoToken = '';
		await loadMessages();
	}

	async function login() {
		const res = await fetch('/api/login', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ username })
		});
		const data = await res.json();
		sessionCsrf = data.csrfToken;
	}

	async function logout() {
		await fetch('/api/logout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({})
		});
		sessionCsrf = '';
		await loadMessages();
	}

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
				<input type="checkbox" class="h-4 w-4 accent-primary" bind:checked={csrfProtected} />
				<span>CSRF</span>
			</label>
		</div>
	</div>

	<div class="space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm">
		<label class="block text-sm font-medium">Login as user</label>
		<input
			class="w-full rounded-md border border-input px-2 py-1 text-sm"
			placeholder="username"
			bind:value={username}
		/>

		<button
			class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
			on:click={login}
		>
			Login
		</button>

		<button
			class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
			on:click={logout}
		>
			Logout
		</button>

		<p class="text-xs text-muted-foreground">
			CSRF token: <code>{sessionCsrf || '—'}</code>
		</p>
	</div>

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
				<label class="block text-sm font-medium">Dodaj poruku - šalje token</label>
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
			<div class="space-y-2">
				<label class="block text-sm font-medium">Dodaj poruku - ne šalje token</label>
				<input
					class="w-full rounded-md border border-input px-2 py-1 text-sm"
					placeholder="content"
					bind:value={contentNoToken}
				/>
				<button
					class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
					on:click={addMessageNoToken}
				>
					Spremi
				</button>

				<p class="mt-2 text-sm text-foreground/90">
					<strong>Upozorenje:</strong> u ovom obrascu <em>nikako</em> ne šaljemo CSRF token. Ako je
					<b>CSRF</b> isključen (prekidač iznad), server će odbaciti zahtjev bez tokena; ako je CSRF
					uključen, poruka će se spremiti iako token nije poslan. Ako si trenutno ulogiran u aplikaciju
					(imaš aktivnu sesiju / session cookie), server će poruku pripisati tvojem korisničkom računu
					— što znači da zlonamjerni formular hostan na drugoj stranici može poslati poruku u ime ulogiranog
					korisnika sve dok je njegova sesija aktivna. Idealno, ova akcija bi se izvodila sa zasebne
					web-stranice (npr. zlonamjerni CSRF formular ili vanjski cilj napada) koja šalje POST zahtjev
					prema ovom API-ju — ovdje je to demonstrirano direktno u sučelju radi lakšeg testiranja.
				</p>
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
</div>
