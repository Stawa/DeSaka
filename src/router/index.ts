import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/soil',
      name: 'soil',
      component: () => import('../views/SoilView.vue'),
    },
    {
      path: '/air',
      name: 'air',
      component: () => import('../views/AirView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/test-errors',
      name: 'test-errors',
      component: () => import('../views/TestErrorsView.vue'),
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
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

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

export default router
