import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import IndexPage from './views/IndexPage.vue';
import ArchivePage from './views/ArchivePage.vue';
import DetailPage from './views/DetailPage.vue';
import EditorPage from './views/EditorPage.vue';
import './style.css';

const routes = [
  { path: '/', component: IndexPage },
  { path: '/archive', component: ArchivePage },
  { path: '/note/:id', component: DetailPage },
  { path: '/edit/:id?', component: EditorPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');
