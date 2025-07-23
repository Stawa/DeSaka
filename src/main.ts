import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupGlobalErrorHandlers } from './utils/errorHandler'
import { useApi } from '@/composables/useApi'
import { Chart, Filler } from 'chart.js'

const { fetchFiles } = useApi()
Chart.register(Filler)

async function bootstrap() {
  try {
    await fetchFiles()

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    setupGlobalErrorHandlers(app)
    app.mount('#app')
  } catch (error) {
    console.error('❌ Failed to initialize file map:', error)
  }
}

bootstrap()
