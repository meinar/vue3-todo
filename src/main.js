import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';
import './style.css'
import App from './App.vue'

import ToastPlugin, { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

const app = createApp(App);

const toastConfig = {
    position: 'top',
}

const toast = useToast(toastConfig);

app
    .use(ToastPlugin, toastConfig)
    .provide('toast', toast)
    .mount('#app')
