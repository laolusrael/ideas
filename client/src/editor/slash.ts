import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import SlashMenu from './SlashMenu.vue';

const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      description: 'Plain text paragraph',
      icon: 'Text',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: 'Heading1',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: 'Heading2',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: 'Heading3',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list',
      icon: 'List',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Ordered List',
      description: 'Create a numbered list',
      icon: 'ListOrdered',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with checkboxes',
      icon: 'CheckSquare',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Blockquote',
      description: 'Capture a quote',
      icon: 'Quote',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet',
      icon: 'Code',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visual divider line',
      icon: 'Minus',
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ].filter((item) =>
    item.title.toLowerCase().startsWith(query.toLowerCase())
  );
};

const renderItems = {
  items: getSuggestionItems,
  render: () => {
    let component: any;
    let popup: any;
    let currentProps: any;

    return {
      onStart: (props: any) => {
        currentProps = props;
        component = new VueRenderer(SlashMenu, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        currentProps = props;
        if (!component) return;
        component.updateProps(props);

        if (!props.clientRect || !popup) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        const items = currentProps?.items || [];
        const selectedIndex = component?.ref?.selectedIndex ?? 0;

        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }

        if (props.event.key === 'ArrowUp') {
          props.event.preventDefault();
          if (component?.ref) {
            component.ref.selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          }
          return true;
        }

        if (props.event.key === 'ArrowDown') {
          props.event.preventDefault();
          if (component?.ref) {
            component.ref.selectedIndex = (selectedIndex + 1) % items.length;
          }
          return true;
        }

        if (props.event.key === 'Enter' && items.length > 0) {
          const item = items[selectedIndex];
          if (item) {
            item.command({ editor: currentProps.editor, range: currentProps.range });
            popup?.[0]?.hide();
            return true;
          }
        }

        return false;
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

export default Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.suggestion.char,
        command: this.options.suggestion.command,
        ...renderItems,
      }),
    ];
  },
});
