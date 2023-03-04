import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register';
import ToastPlugin, { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';

import './style.css'
import App from './App.vue'


const app = createApp(App);

const toastConfig = {
    position: 'top',
}

const toast = useToast(toastConfig);

if ('serviceWorker' in navigator) {
    registerSW();
}

app
    .use(ToastPlugin, toastConfig)
    .provide('toast', toast)
    .mount('#app')
