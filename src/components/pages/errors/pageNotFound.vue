<template>
	<main class="mainContainer">
	    <div class="pageNotFound">
			<h2 class="title">Page Not Found</h2>
			<p class="description">The page you are looking for might have been removed or temporarily unavailable.</p>
		</div>

	    <div class="linkContainer">
	    	<router-link class="link" :to="{name: 'Home'}">Home</router-link>
	    </div>
	</main>
</template>

<style scoped>
	.mainContainer {
	    min-height: calc(var(--vh) * 100 - 159.4px);
	    margin-top: 15px;
	}

	.pageNotFound {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 15px;
	}

	.title {
		color: darkcyan;
		text-transform: uppercase;
		margin: 0 0 15px 0;
	}

	.description {
		color: darkcyan;
		font-size: 20px;
		text-align: center;
		padding: 0 5px 0 5px;
		margin: 0;
	}

	.linkContainer {
		justify-content: center;
		margin-bottom: 10px;
	}

	.link {
		background-color: darkcyan;
	}
</style>
