<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <Lightbulb :size="20" /> Ideas
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">
            <FileText :size="16" /> Notes
          </router-link>
          <router-link to="/archive" class="nav-link">
            <Archive :size="16" /> Archive
          </router-link>
          <router-link to="/edit" class="nav-link new-note">
            <Plus :size="16" /> New
          </router-link>
        </nav>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, FileText, Archive, Plus } from 'lucide-vue-next';
</script>
