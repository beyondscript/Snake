<template>
	<router-view v-slot="{ Component }">
		<appHeader />

		<Transition :name="initialLoadDone ? $route.meta.transitionName : ''" mode="out-in">
			<component :is="Component" />
		</Transition>

		<appFooter />
	</router-view>
</template>

<script>
	import { ref, onBeforeMount, onMounted, nextTick } from 'vue';
	import appHeader from '../components/pages/partials/header.vue';
	import appFooter from '../components/pages/partials/footer.vue';

	export default {
		components: {
			appHeader,
			appFooter
		},
	  	setup() {
	  		const initialLoadDone = ref(false)

	  		const fixViewportHeight = () => {
				const vh = window.innerHeight * 0.01

				document.documentElement.style.setProperty('--vh', `${vh}px`)
			}

	  		onBeforeMount(() => {
				fixViewportHeight()

				window.addEventListener('resize', fixViewportHeight)
				window.addEventListener('orientationchange', fixViewportHeight)
	        })

	        onMounted(async() => {
			    await nextTick()
			    
			    requestAnimationFrame(() => {
			        initialLoadDone.value = true
			    })
			})

	        return {
	        	initialLoadDone
	        }
	  	}
	}
</script>
