import express from 'express';
import db from './db.js';

const router = express.Router();

function generateSummary(content) {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= 180) return text;
  return text.substring(0, 180).trim() + '...';
}

router.get('/notes', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM notes WHERE is_archived = 0';
  let params = [];

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    params = [`%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  const notes = params.length ? stmt.all(...params) : stmt.all();
  res.json(notes.map(n => ({ ...n, tags: n.tags ? JSON.parse(n.tags) : [] })));
});

router.get('/notes/archived', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM notes WHERE is_archived = 1';
  let params = [];

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    params = [`%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  const notes = params.length ? stmt.all(...params) : stmt.all();
  res.json(notes.map(n => ({ ...n, tags: n.tags ? JSON.parse(n.tags) : [] })));
});

router.get('/notes/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
  const note = stmt.get(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  note.tags = note.tags ? JSON.parse(note.tags) : [];
  res.json(note);
});

router.post('/notes', (req, res) => {
  const { title, content, tags } = req.body;
  const summary = generateSummary(content);
  const tagsJson = JSON.stringify(tags || []);

  const stmt = db.prepare(`
    INSERT INTO notes (title, content, summary, tags)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(title, content, summary, tagsJson);
  res.json({ id: result.lastInsertRowid });
});

router.put('/notes/:id', (req, res) => {
  const { title, content, tags } = req.body;
  const summary = generateSummary(content);
  const tagsJson = JSON.stringify(tags || []);

  const stmt = db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, summary = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(title, content, summary, tagsJson, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json({ success: true });
});

router.delete('/notes/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json({ success: true });
});

router.post('/notes/:id/archive', (req, res) => {
  const stmt = db.prepare(`
    UPDATE notes
    SET is_archived = NOT is_archived, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  note.tags = note.tags ? JSON.parse(note.tags) : [];
  res.json(note);
});

export default router;
