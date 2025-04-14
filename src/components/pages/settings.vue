<template>
    <main class="mainContainer">
    	<div class="settingsContainer">
	    	<div>
	    		<div class="label-container">
				  	<label class="toggle">
				    	<input type="checkbox" ref="buttonsCheckbox" @change="toggleButtons">

				    	<span class="slider"></span>
				  	</label>

				  	<span class="label-text">Enable buttons</span>
				</div>
				<div class="label-container">
				  	<label class="toggle">
				    	<input type="checkbox" ref="soundsCheckbox" @change="toggleSounds">

				    	<span class="slider"></span>
				  	</label>

				  	<span class="label-text">Enable sounds</span>
				</div>
	    	</div>
	    </div>

	    <div class="linkContainer">
	    	<router-link class="link" :to="{name: 'Home'}">Back</router-link>
	    </div>
    </main>
</template>

<script>
	import { ref, onMounted } from 'vue';
	import { Preferences } from '@capacitor/preferences';
	import { encrypt, decrypt } from "../../js/crypto.js";

	export default {
		setup() {
			const enableButtons = ref(true)
        	const enableSounds = ref(true)
	        const buttonsCheckbox = ref(null)
	        const soundsCheckbox = ref(null)

	        const toggleButtons = async() => {
	            enableButtons.value = !enableButtons.value

	            await Preferences.set({
	                key: 'enableButtons',
	                value: encrypt(enableButtons.value)
	            })
	        }

	        const toggleSounds = async() => {
	            enableSounds.value = !enableSounds.value

	            await Preferences.set({
	                key: 'enableSounds',
	                value: encrypt(enableSounds.value)
	            })
	        }

	        onMounted(async() => {
	            if (localStorage.getItem('CapacitorStorage.enableButtons') !== null) {
		            enableButtons.value = JSON.parse(decrypt(localStorage.getItem('CapacitorStorage.enableButtons')))
	            }

	            if (localStorage.getItem('CapacitorStorage.enableSounds') !== null) {
	            	enableSounds.value = JSON.parse(decrypt(localStorage.getItem('CapacitorStorage.enableSounds')))
	            }

	            buttonsCheckbox.value.checked = enableButtons.value
	            
	            soundsCheckbox.value.checked = enableSounds.value
	        })

	        return {
	            buttonsCheckbox,
	            soundsCheckbox,
	            toggleButtons,
	            toggleSounds
	        }
		}
	}
</script>

<style scoped>
	.mainContainer {
	    min-height: calc(var(--vh) * 100 - 174.4px);
	    margin-top: 30px;
	}

	.settingsContainer {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30px;
	}

	.label-container {
    	display: flex;
    	align-items: center;
    	gap: 10px;
    	margin-bottom: 15px;
  	}

  	.label-container:last-child {
  		margin-bottom: 0;
  	}

  	.toggle {
  		height: 26px;
  		width: 52px;
    	display: inline-block;
    	position: relative;
  	}

  	.toggle input {
  		height: 0;
  		width: 0;
    	opacity: 0;
  	}

  	.slider {
    	position: absolute;
    	background-color: #cccccc;
    	cursor: pointer;
    	border-radius: 26px;
    	left: 0;
    	right: 0;
    	top: 0;
    	bottom: 0;
    	transition: 0.4s;
    	-webkit-tap-highlight-color: transparent;
  	}

  	.slider:before {
    	content: "";
    	height: 24px;
    	width: 24px;
    	position: absolute;
    	background-color: white;
    	border-radius: 50%;
    	left: 1px;
    	bottom: 1px;
    	transition: 0.4s;
  	}

  	input:checked + .slider {
    	background-color: darkcyan;
  	}

  	input:checked + .slider:before {
    	transform: translateX(26px);
  	}

  	.label-text {
  		font-size: 24px;
	    color: darkcyan;
		text-align: center;
  	}

	.linkContainer {
		flex-direction: column;
    	align-items: center;
		padding-bottom: 15px;
	}

	.link {
		background-color: darkred;
	}
</style>
