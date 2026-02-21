<template>
  <div>
    <h1 class="page-title">Archive</h1>
    <div class="search-box">
      <Search :size="18" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search archived notes..."
        @input="handleSearch"
      />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="notes.length === 0" class="empty-state">
      <p>No archived notes</p>
    </div>
    <div v-else class="notes-list">
      <router-link
        v-for="note in notes"
        :key="note.id"
        :to="`/note/${note.id}`"
        class="note-item"
      >
        <h2 class="note-title">{{ note.title }}</h2>
        <p class="note-summary">{{ note.summary }}</p>
        <div class="note-meta">
          <span>{{ formatDate(note.created_at) }}</span>
          <div v-if="note.tags.length" class="note-tags">
            <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchArchivedNotes, formatDate, type Note } from '../composables/useNotes';
import { Search } from 'lucide-vue-next';

const notes = ref<Note[]>([]);
const loading = ref(true);
const searchQuery = ref('');

async function loadNotes() {
  loading.value = true;
  try {
    notes.value = await fetchArchivedNotes(searchQuery.value || undefined);
  } finally {
    loading.value = false;
  }
}

let searchTimeout: number;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(loadNotes, 300);
}

onMounted(loadNotes);
</script>
