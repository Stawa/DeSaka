import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupGlobalErrorHandlers } from './utils/errorHandler'

import { Chart, Filler } from 'chart.js'

Chart.register(Filler)

const app = createApp(App)

app.use(createPinia())
app.use(router)

setupGlobalErrorHandlers(app)

app.mount('#app')
