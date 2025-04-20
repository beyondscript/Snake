import {createWebHistory, createRouter} from 'vue-router';
import home from '../components/pages/home.vue';
import playClassic from '../components/pages/playClassic.vue';
import playMission from '../components/pages/playMission.vue';
import scores from '../components/pages/scores.vue';
import settings from '../components/pages/settings.vue';
import pageNotFound from '../components/pages/errors/pageNotFound.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: home,
		meta: {
			transitionName: 'slide-left-to-right'
		}
	},
	{
		path: '/play-classic',
		name: 'Play Classic',
		component: playClassic,
		meta: {
			transitionName: 'slide-right-to-left'
		}
	},
	{
		path: '/play-mission',
		name: 'Play Mission',
		component: playMission,
		meta: {
			transitionName: 'slide-right-to-left'
		}
	},
    {
		path: '/scores',
		name: 'Scores',
		component: scores,
		meta: {
			transitionName: 'slide-right-to-left'
		}
	},
	{
		path: '/settings',
		name: 'Settings',
		component: settings,
		meta: {
			transitionName: 'slide-right-to-left'
		}
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'Page Not Found',
		component: pageNotFound,
		meta: {
			transitionName: 'slide-right-to-left'
		}
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router