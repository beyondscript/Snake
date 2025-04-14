<template>
    <main class="mainContainer">
    	<div class="scoresContainer">
	    	<div class="scores">
	    		<Transition name="fade" mode="out-in">
	    			<div class="loaderContainer" v-if="loading">
	    				<div class="loader"></div>
	    			</div>
	    			<div v-else>
	    				<div v-if="Object.keys(scores).length >= 1">
			    			<p class="highestScore">
			    				Highest Score: {{ Math.max(...scores.map(item => item.score)) }}
			    			</p>
			    			<p class="recentScoresText">Recent Scores:</p>

			    			<div class="recentScores">
			    				<p class="score" v-for="(item, index) in scores" :key="index">
								    {{ item.score }}
								</p>
			    			</div>
			    		</div>

				    	<p class="noScoreText" v-else>No scores to show</p>
	    			</div>
			    </Transition>
		    </div>
	    </div>

	    <div class="linkContainer">
	    	<Transition :name="mounted ? 'bounce' : ''" mode="out-in">
	    		<button class="scoreResetButton" type="button" @click="resetScore" v-if="scores.length">Reset</button>
	    	</Transition>

	    	<router-link class="link" :to="{name: 'Home'}">Back</router-link>
	    </div>
    </main>
</template>

<script>
	import { ref, onMounted, nextTick } from 'vue';
	import { Preferences } from '@capacitor/preferences';
	import { decrypt } from "../../js/crypto.js";

	export default {
		setup() {
			const scores = ref([])
			const excludedKeys = ['enableButtons', 'enableSounds']
			const mounted = ref(false)
			const loading = ref(true)

			const getSortedScores = async(excludedKeys) => {
			  	const { keys } = await Preferences.keys()
			  	const filteredKeys = keys.filter(key => !excludedKeys.includes(key))
			  	const results = []

			  	for (const key of filteredKeys) {
			    	const { value } = await Preferences.get({ key })

			    	results.push({ key, score: decrypt(value) })
			  	}

			  	results.sort((a, b) => b.key.localeCompare(a.key))

			  	return results
			}

			const resetScore = async() => {
    			const { keys } = await Preferences.keys()

				const keysToDelete = keys.filter(key => !excludedKeys.includes(key))

				for (const key of keysToDelete) {
					await Preferences.remove({ key })
				}

    			scores.value = []
			}

			onMounted(async() => {
			    const items = await getSortedScores(excludedKeys)

			    scores.value = items

			    await nextTick()

			    mounted.value = true

			    setTimeout(() => {
			    	loading.value = false
			    }, 250)
			})

			return {
				scores,
				resetScore,
				mounted,
				loading
			}
		}
	}
</script>

<style scoped>
	.mainContainer {
	    min-height: calc(var(--vh) * 100 - 159.4px);
	    margin-top: 15px;
	}

	.scoresContainer {
		display: flex;
		justify-content: center;
		margin-bottom: 15px;
	}

	.scores {
		height: 288px;
		width: 288px;
		background-color: #8DA259;
	}

	.highestScore,
	.recentScoresText,
	.score,
	.noScoreText {
		font-size: 24px;
	    color: darkred;
		text-align: center;
	}

	.highestScore {
		margin: 5px 0 0 0;
	}

	.recentScoresText {
		margin: 15px 0 0 0;
	}

	.recentScores {
		max-height: calc(288px - 80px);
    	overflow-y: auto;
    	scrollbar-width: none;
    	-ms-overflow-style: none;
	}

	.recentScores::-webkit-scrollbar {
	    display: none;
	}

	.score {
		margin: 5px 0 0 0;
	}

	.score:last-child {
		margin-bottom: 5px;
	}

	.scoreResetButton {
		height: 36px;
	    width: 108px;
	    display: flex;
	    background-color: darkcyan;
	    color: #ffffff;
	    font-size: 18px;
	    text-decoration: none;
	    justify-content: center;
	    align-items: center;
	    border: none;
	    border-radius: 5px;
	    cursor: pointer;
	    margin-bottom: 15px;
	    -webkit-tap-highlight-color: transparent;
	}

	.linkContainer {
		flex-direction: column;
    	align-items: center;
		padding-bottom: 15px;
	}

	.link {
		background-color: darkred;
	}

	.loaderContainer {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loader {
	  	width: 30px;
	  	height: 30px;
	  	border: 5px solid #ffffff;
	  	border-top: 5px solid darkred;
	  	border-radius: 50%;
	  	animation: spin 1s linear infinite;
	}

	@keyframes spin {
  		0% {
  			transform: rotate(0deg);
  		}

  		100% {
  			transform: rotate(360deg);
  		}
	}
</style>
