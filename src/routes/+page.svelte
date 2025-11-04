<script>
	import { onMount } from 'svelte';
	import '../app.css';
	let messages = [];
	let users = [];
	let filter = '';
	let sqlEnabled = true;
	let sensitiveEnabled = true;
	let author = '';
	let content = '';
	let newUsername = '';
	let newPassword = '';

	messages = [
		{ author: 'Ivan', content: 'Prva test poruka' },
		{ author: 'Ana', content: 'Druga poruka za test' },
		{ author: 'Marko', content: 'Treća poruka u listi' }
	];

	users = [
		{ username: 'admin', email: 'admin@example.com', password: 'plaintext123' },
		{ username: 'user', email: 'user@test.com', password: 'password456' },
		{ username: 'demo', email: 'demo@demo.com', password: 'test789' }
	];
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
		<h2 class="mb-3 text-lg font-semibold">Messages (SQLi demo)</h2>

		<div class="space-y-3">
			<div>
				<label class="mb-1 block text-sm font-medium">Filter (tautologija test)</label>
				<input
					class="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
					placeholder="unesi filter"
					bind:value={filter}
				/>
			</div>

			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
				>
					Pretraži
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:opacity-90"
				>
					Umetni tautologiju
				</button>
			</div>

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
					{u.username} — {u.email} — <em class="text-muted-foreground">{u.password}</em>
				</li>
			{/each}
		</ul>
	</div>
</div>
