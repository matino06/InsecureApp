<script>
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { toggleMode } from 'mode-watcher';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { login, logout, getUserData, getIsAuthenticated } from '$lib/auth/auth0.svelte';

	const links = [
		{ name: 'Početna', href: '/' },
		{ name: 'Uplata', href: '/buy-ticket' }
	];
</script>

<nav class="flex w-full items-center justify-between px-4 py-4 md:pb-4">
	<!-- Desktop Links -->
	<div class="hidden gap-4 md:flex">
		{#each links as link}
			<a
				href={link.href}
				class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
			>
				{link.name}
			</a>
		{/each}
	</div>

	<!-- Desktop Controls -->
	<div class="hidden items-center gap-4 md:flex">
		{#if getIsAuthenticated()}
			<Button onclick={logout}>LogOut</Button>
		{:else}
			<Button onclick={login}>LogIn</Button>
		{/if}
		<Button onclick={toggleMode} variant="outline" size="icon">
			<SunIcon class="h-5 w-5 dark:hidden" />
			<MoonIcon class="hidden h-5 w-5 dark:block" />
		</Button>
	</div>

	<!-- Mobile Hamburger Menu -->
	<div class="md:hidden">
		<Sheet>
			<SheetTrigger>
				<Button variant="outline" size="icon">
					<MenuIcon class="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" class="flex flex-col gap-4 p-4">
				{#each links as link}
					<a
						href={link.href}
						class="text-sm font-medium text-muted-foreground hover:text-primary"
						onclick={() => {}}
					>
						{link.name}
					</a>
				{/each}

				<div class="mt-4 flex flex-col gap-2">
					{#if getIsAuthenticated()}
						<Button onclick={logout}>LogOut</Button>
					{:else}
						<Button onclick={login}>Google LogIn</Button>
					{/if}

					<Button onclick={toggleMode} variant="outline" size="icon">
						<SunIcon class="h-5 w-5 dark:hidden" />
						<MoonIcon class="hidden h-5 w-5 dark:block" />
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	</div>
</nav>
