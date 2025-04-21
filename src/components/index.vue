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
	import { ref, onMounted, nextTick } from 'vue';
	import appHeader from '../components/pages/partials/header.vue';
	import appFooter from '../components/pages/partials/footer.vue';

	export default {
		components: {
			appHeader,
			appFooter
		},
	  	setup() {
	  		const initialLoadDone = ref(false)

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
