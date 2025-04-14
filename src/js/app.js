import {createApp} from 'vue';
import router from '../js/router.js';
import index from '../components/index.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/style.css';

const app = createApp({})

app.component('index', index)
app.use(router)
app.mount('#app')
