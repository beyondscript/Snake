<template>
    <main class="mainContainer">
    	<div class="linkContainer">
	    	<router-link class="link" :to="{name: 'Play'}">Play</router-link>
	    	<router-link class="link" :to="{name: 'Scores'}">Scores</router-link>
	    	<router-link class="link" :to="{name: 'Settings'}">Settings</router-link>
	    </div>
    </main>
</template>

<style scoped>
	.mainContainer {
	    min-height: calc(var(--vh) * 100 - 159.4px);
	    margin-top: 15px;
	}

	.linkContainer {
		flex-direction: column;
    	align-items: center;
		padding-bottom: 15px;
	}

	.link {
		background-color: darkcyan;
		margin-bottom: 15px;
	}

	.link:last-child {
		margin-bottom: 0;
	}
</style>
