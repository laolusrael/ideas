<template>
  <div class="detail-page">
    <router-link to="/" class="back-link">
      <ArrowLeft :size="16" /> Back to Notes
    </router-link>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="note">
      <header class="detail-header">
        <h1 class="detail-title">{{ note.title }}</h1>
        <div class="detail-meta">
          <span>{{ formatDate(note.created_at) }}</span>
          <span v-if="note.updated_at !== note.created_at">
            Updated {{ formatDate(note.updated_at) }}
          </span>
        </div>
      </header>

      <div class="detail-actions">
        <router-link :to="`/edit/${note.id}`" class="action-btn">
          <Pencil :size="16" /> Edit
        </router-link>
        <button @click="handleArchive" class="action-btn">
          <Archive :size="16" />
          {{ note.is_archived ? 'Unarchive' : 'Archive' }}
        </button>
      </div>

      <div class="detail-content" v-html="note.content"></div>

      <div v-if="note.tags.length" class="note-tags" style="margin-top: 32px;">
        <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchNote, toggleArchive, formatDate, type Note } from '../composables/useNotes';
import { ArrowLeft, Pencil, Archive } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const note = ref<Note | null>(null);
const loading = ref(true);
const error = ref('');

async function loadNote() {
  loading.value = true;
  error.value = '';
  try {
    note.value = await fetchNote(Number(route.params.id));
  } catch (e) {
    error.value = 'Note not found';
  } finally {
    loading.value = false;
  }
}

async function handleArchive() {
  if (!note.value) return;
  const updated = await toggleArchive(note.value.id);
  note.value.is_archived = updated.is_archived;
  if (updated.is_archived) {
    router.push('/archive');
  } else {
    router.push('/');
  }
}

onMounted(loadNote);
</script>
