import {
    createApp
} from 'vue'
import App from './App.vue'
import axios from './axios'

let app = createApp(App);
app.provide('$axios', axios)
app.mount(document.body)