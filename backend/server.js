import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(root, 'uploads');
fs.mkdirSync(dataDir, { recursive: true }); fs.mkdirSync(uploadDir, { recursive: true });
const dbPath = path.join(dataDir, 'wardrobe.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '[]');
const readItems = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeItems = (items) => fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
const app = express();
const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (_, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`) }), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_, file, cb) => cb(null, file.mimetype.startsWith('image/')) });
app.use(cors()); app.use(express.json()); app.use('/uploads', express.static(uploadDir)); app.use(express.static(path.join(root, 'frontend')));

app.get('/api/health', (_, res) => res.json({ ok: true, app: 'VESTIQ' }));
app.post('/api/auth/register', (req, res) => res.json({ ok: true, user: { name: req.body.name || 'Style curator', email: req.body.email } }));
app.post('/api/auth/login', (req, res) => res.json({ ok: true, user: { name: req.body.email?.split('@')[0] || 'Style curator', email: req.body.email } }));
app.get('/api/wardrobe', (_, res) => res.json({ items: readItems() }));
app.post('/api/wardrobe', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please choose an image file.' });
  const item = { id: crypto.randomUUID(), name: req.body.name || req.file.originalname.replace(/\.[^.]+$/, ''), category: req.body.category || 'Other', color: req.body.color || 'Unspecified', details: req.body.details || 'Curated piece', dateAdded: new Date().toISOString(), image: `/uploads/${req.file.filename}` };
  const items = [item, ...readItems()]; writeItems(items); res.status(201).json({ item });
});
app.delete('/api/wardrobe/:id', (req, res) => { const items = readItems(); const item = items.find((entry) => entry.id === req.params.id); if (item?.image?.startsWith('/uploads/')) { const file = path.join(root, item.image); if (fs.existsSync(file)) fs.unlinkSync(file); } writeItems(items.filter((entry) => entry.id !== req.params.id)); res.json({ ok: true }); });

const fallbackImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85';
function makeOutfit(items, seed = 0) {
  const pick = (terms) => items.find((item) => terms.some((term) => item.category.toLowerCase().includes(term))) || items[(seed + terms.length) % Math.max(items.length, 1)];
  return { top: pick(['shirt', 'top', 'jacket', 'dress']), bottom: pick(['pant', 'jean', 'skirt']), shoes: pick(['shoe', 'sneaker']), accessory: pick(['accessory', 'bag', 'hat']), image: fallbackImage, fallback: true };
}
async function aiSelection(items, seed = 0) {
  const fallback = makeOutfit(items, seed);
  if (!process.env.AI_API_KEY) return fallback;
  try {
    const response = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', temperature: 0.7, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a fashion stylist. Return JSON only with keys top,bottom,shoes,accessory containing wardrobe item IDs. Reuse an ID when a category is missing.' }, { role: 'user', content: JSON.stringify(items.map(({ id, name, category, color }) => ({ id, name, category, color }))) }] }) });
    if (!response.ok) return fallback;
    const result = JSON.parse((await response.json()).choices?.[0]?.message?.content || '{}');
    const byId = (id, fallbackItem) => items.find((item) => item.id === id) || fallbackItem;
    return { top: byId(result.top, fallback.top), bottom: byId(result.bottom, fallback.bottom), shoes: byId(result.shoes, fallback.shoes), accessory: byId(result.accessory, fallback.accessory), image: fallbackImage, fallback: false };
  } catch { return fallback; }
}
app.post('/api/ai/match', async (req, res) => { const items = readItems(); if (!items.length) return res.status(400).json({ error: 'Add at least one wardrobe item to find your match.' }); res.json({ outfit: await aiSelection(items, Number(req.body.seed) || 0), note: 'A balanced edit built from your wardrobe.' }); });
app.post('/api/ai/planner', async (_, res) => { const items = readItems(); if (!items.length) return res.status(400).json({ error: 'Add at least one wardrobe item to build your week.' }); const days = await Promise.all(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(async (day, index) => ({ day, outfit: await aiSelection(items, index), mood: ['Polished', 'Quiet confidence', 'Modern ease', 'After-hours', 'Fresh perspective', 'Off-duty', 'Soft tailoring'][index] }))); res.json({ days, aiConnected: Boolean(process.env.AI_API_KEY) }); });
app.get('*', (_, res) => res.sendFile(path.join(root, 'frontend', 'index.html')));
app.use((err, _, res, __) => res.status(500).json({ error: err.message || 'Something went wrong.' }));
app.listen(process.env.PORT || 3000, () => console.log(`VESTIQ running at http://localhost:${process.env.PORT || 3000}`));