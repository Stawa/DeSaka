import { createRouter, createWebHistory } from 'vue-router'

/**
 * Vue Router Configuration
 *
 * Defines the application's routing structure with the following hierarchy:
 * - `/dashboard` - Main dashboard (with sidebar, sensor monitoring)
 * - `/soil` - Soil monitoring page
 * - `/air` - Air quality monitoring page
 * - `/history` - Historical data analysis
 * - `/settings` - Application settings
 * - Error handling routes for 404 and general errors
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        title: 'Dashboard - DeSaka',
        description: 'Real-time environmental monitoring dashboard',
        requiresSidebar: true,
      },
    },
    {
      path: '/soil',
      name: 'soil',
      component: () => import('../views/SoilView.vue'),
      meta: {
        title: 'Soil Monitoring - DeSaka',
        description: 'Comprehensive soil health monitoring and analysis',
        requiresSidebar: true,
      },
    },
    {
      path: '/air',
      name: 'air',
      component: () => import('../views/AirView.vue'),
      meta: {
        title: 'Air Quality - DeSaka',
        description: 'Real-time air quality monitoring and analysis',
        requiresSidebar: true,
      },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: {
        title: 'Historical Data - DeSaka',
        description: 'Historical environmental data analysis and trends',
        requiresSidebar: true,
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        title: 'Settings - DeSaka',
        description: 'Application settings and configuration',
        requiresSidebar: true,
      },
    },
    {
      path: '/error',
      name: 'error',
      component: () => import('../views/ErrorView.vue'),
      props: (route) => ({
        code: route.query.code || '500',
        message: route.query.message || 'Server Error',
        description: route.query.description || 'Something went wrong on our servers.',
      }),
      meta: {
        title: 'Error - DeSaka',
        description: 'Error page',
        requiresSidebar: false,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: '404 - Page Not Found',
        description: 'The requested page could not be found',
        requiresSidebar: false,
      },
    },
  ],
})

/**
 * Global navigation guard for error handling
 * Catches router errors and redirects to appropriate error page
 */
router.onError((error) => {
  console.error('Router error:', error)
  router.push({
    name: 'error',
    query: {
      code: '500',
      message: 'Navigation Error',
      description: 'An error occurred while loading the page.',
    },
  })
})

/**
 * Global before guard for meta data handling
 * Updates document title and meta description based on route meta
 */
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  next()
})

export default router
