import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Entity from '../views/Entity.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/people/:qid',
    name: 'people',
    component: Entity
  },
  {
    path: '/document/:qid',
    name: 'document',
    component: Entity
  },
  {
    path: '/publisher/:qid',
    name: 'publisher',
    component: Entity
  },
  {
    path: '/published/:qid',
    name: 'published',
    component: Entity
  },
]

const router = new VueRouter({
  routes
})

export default router
