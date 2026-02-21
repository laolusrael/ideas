<template>
  <div class="editor-container">
    <input
      v-model="title"
      type="text"
      class="editor-title-input"
      placeholder="Title"
    />
    
    <editor-content :editor="editor" class="editor-content" />
    
    <bubble-menu :editor="editor" v-if="editor" :tippy-options="{ duration: 100 }" class="bubble-menu">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <Bold :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <Italic :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        <Strikethrough :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
        <Code :size="14" />
      </button>
      <span class="bubble-divider"></span>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        <Heading1 :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        <Heading2 :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        <List :size="14" />
      </button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
        <Quote :size="14" />
      </button>
    </bubble-menu>

    <div class="editor-tags">
      <input
        v-model="tagsInput"
        type="text"
        class="tags-input"
        placeholder="Tags (comma separated)"
      />
    </div>

    <div class="editor-actions">
      <button @click="saveNote" class="save-btn" :disabled="saving">
        <Check :size="16" />
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
      <button @click="cancel" class="cancel-btn">
        <X :size="16" />
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import SlashCommands from '../editor/slash';
import { fetchNote, createNote, updateNote } from '../composables/useNotes';
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, Quote, Check, X } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const noteId = route.params.id ? Number(route.params.id) : null;
const title = ref('');
const tagsInput = ref('');
const saving = ref(false);

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      taskList: false,
    }),
    Placeholder.configure({
      placeholder: "Type '/' for commands...",
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    SlashCommands,
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'editor-content',
    },
  },
});

function getTags(): string[] {
  return tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

async function saveNote() {
  if (!title.value.trim()) {
    alert('Please enter a title');
    return;
  }

  saving.value = true;
  try {
    const content = editor.value?.getHTML() || '';
    const tags = getTags();

    if (noteId) {
      await updateNote(noteId, { title: title.value, content, tags });
    } else {
      const result = await createNote({ title: title.value, content, tags });
      router.push(`/note/${result.id}`);
      return;
    }
    router.push(`/note/${noteId}`);
  } finally {
    saving.value = false;
  }
}

function cancel() {
  if (noteId) {
    router.push(`/note/${noteId}`);
  } else {
    router.push('/');
  }
}

onMounted(async () => {
  if (noteId) {
    const note = await fetchNote(noteId);
    title.value = note.title;
    tagsInput.value = note.tags.join(', ');
    editor.value?.commands.setContent(note.content || '');
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.bubble-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bubble-menu button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.bubble-menu button:hover {
  background: var(--tag-bg);
  color: var(--text-primary);
}

.bubble-menu button.is-active {
  background: var(--text-primary);
  color: var(--bg-card);
}

.bubble-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 4px;
}
</style>
