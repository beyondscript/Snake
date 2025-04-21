<template>
    <main class="mainContainer">
    	<div class="linkContainer">
	    	<button class="link selectMode" type="button" @click="selectMode">Play</button>
	    	<router-link class="link" :to="{name: 'Scores'}">Scores</router-link>
	    	<router-link class="link" :to="{name: 'Settings'}">Settings</router-link>
	    </div>
    </main>
</template>

<script>
	import Swal from 'sweetalert2';
	import { useRouter } from 'vue-router';

	export default {
		setup() {
			const router = useRouter()

			const popStateHandler = async() => {
				await Swal.close()

				history.back()

				window.removeEventListener('popstate', popStateHandler)
		    }

			const selectMode = () => {
				history.pushState({ ...history.state }, '', location.href)

				window.addEventListener('popstate', popStateHandler)

				Swal.fire({
					title: 'Select mode',
					html: `
						<div class="swalText" style="display: block;">Do you want to select classic or mission?</div>
						<div class="swalButtonsContainer">
						    <button id="swalClassicButton" class="swalButtons swalRestartButton">Classic</button>
						    <button id="swalMissionButton" class="swalButtons swalRestartButton">Mission</button>
						</div>
					`,
					showConfirmButton: false,
  					showCancelButton: false,
					allowEscapeKey: false,
					allowOutsideClick: false,
					backdrop: true,
					didOpen: () => {
						const classicButton = document.getElementById('swalClassicButton')

						classicButton.addEventListener('click', async() => {
						    await Swal.close()

							window.removeEventListener('popstate', popStateHandler)

						    router.push({ name: 'Play Classic' })
						})

						const missionButton = document.getElementById('swalMissionButton')

						missionButton.addEventListener('click', async() => {
						    await Swal.close()

							window.removeEventListener('popstate', popStateHandler)

						    router.push({ name: 'Play Mission' })
						})
					}
				})
			}

	        return {
	        	selectMode
	        }
		}
	}
</script>

<style scoped>
	.mainContainer {
	    min-height: calc(100vh - 159.4px);
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

	.selectMode {
		cursor: pointer;
		border: none;
		-webkit-tap-highlight-color: transparent;
	}
</style>
