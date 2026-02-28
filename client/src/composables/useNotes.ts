const API_BASE = window.__TAURI__ ? 'http://localhost:3100/api' : '/api';

export interface Note {
  id: number;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export async function fetchNotes(search?: string): Promise<Note[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/notes${params}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function fetchArchivedNotes(search?: string): Promise<Note[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/notes/archived${params}`);
  if (!res.ok) throw new Error('Failed to fetch archived notes');
  return res.json();
}

export async function fetchNote(id: number): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${id}`);
  if (!res.ok) throw new Error('Note not found');
  return res.json();
}

export async function createNote(note: { title: string; content: string; tags: string[] }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(id: number, note: { title: string; content: string; tags: string[] }): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error('Failed to update note');
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete note');
}

export async function toggleArchive(id: number): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${id}/archive`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to archive note');
  return res.json();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
