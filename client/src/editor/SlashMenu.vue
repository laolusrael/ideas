<template>
  <div class="slash-menu">
    <div class="slash-menu-header" v-if="query">Results for "{{ query }}"</div>
    <div class="slash-menu-items">
      <button
        v-for="(item, index) in items"
        :key="index"
        :class="{ 'is-selected': index === selectedIndex }"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <div class="slash-menu-item-icon">
          <component :is="getIcon(item.icon)" :size="18" />
        </div>
        <div class="slash-menu-item-content">
          <div class="slash-menu-item-title">{{ item.title }}</div>
          <div class="slash-menu-item-description">{{ item.description }}</div>
        </div>
      </button>
      <div v-if="items.length === 0" class="slash-menu-empty">
        No results
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  Text,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
} from 'lucide-vue-next';

const props = defineProps<{
  items: Array<{
    title: string;
    description: string;
    icon: string;
    command: (props: any) => void;
  }>;
  command: (props: any) => void;
  query: string;
  clientRect: () => DOMRect | null;
}>();

const selectedIndex = ref(0);
const items = computed(() => props.items || []);

const icons: Record<string, any> = {
  Text,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
};

function getIcon(iconName: string) {
  return icons[iconName] || Text;
}

function selectItem(index: number) {
  const item = items.value[index];
  if (item) {
    item.command(props);
  }
}

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  }
);

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value - 1 + items.value.length) % items.value.length;
    return true;
  }

  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % items.value.length;
    return true;
  }

  if (event.key === 'Enter') {
    selectItem(selectedIndex.value);
    return true;
  }

  return false;
}

defineExpose({
  onKeyDown,
});
</script>

<style scoped>
.slash-menu {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 400px;
  overflow: hidden;
}

.slash-menu-header {
  padding: 10px 14px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.slash-menu-items {
  max-height: 300px;
  overflow-y: auto;
  padding: 6px;
}

.slash-menu-items button {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.slash-menu-items button:hover,
.slash-menu-items button.is-selected {
  background: var(--tag-bg);
}

.slash-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.slash-menu-item-content {
  flex: 1;
  min-width: 0;
}

.slash-menu-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.slash-menu-item-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.slash-menu-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
