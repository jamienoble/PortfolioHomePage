const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve the static site (root of repo) so existing HTML/CSS/JS work
app.use(express.static(path.join(__dirname)));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const projectsPath = path.join(dataDir, 'projects.json');
if (!fs.existsSync(projectsPath)) fs.writeFileSync(projectsPath, '[]', 'utf8');

// API: get all projects
app.get('/api/projects', (req, res) => {
  try {
    const raw = fs.readFileSync(projectsPath, 'utf8');
    const projects = JSON.parse(raw || '[]');
    res.json(projects);
  } catch (err) {
    console.error('Failed to read projects.json', err);
    res.status(500).json([]);
  }
});

// API: upload a new project (supports one or more media files and an optional thumbnail)
// Form fields: title, description, category
// File fields: media (one or multiple), thumbnail (optional)
app.post('/api/upload', upload.fields([{ name: 'media' }, { name: 'thumbnail' }]), (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !category) return res.status(400).json({ error: 'Missing title or category' });

    const mediaFiles = (req.files && req.files.media) ? req.files.media.map(f => `uploads/${f.filename}`) : [];
    const thumbnailFiles = (req.files && req.files.thumbnail) ? req.files.thumbnail.map(f => `uploads/${f.filename}`) : [];
    const thumbnail = thumbnailFiles[0] || mediaFiles[0] || null;

    const project = {
      id: Date.now(),
      title,
      description: description || '',
      category,
      media: mediaFiles,
      thumbnail,
      createdAt: new Date().toISOString()
    };

    const raw = fs.readFileSync(projectsPath, 'utf8');
    let projects = [];
    try { projects = JSON.parse(raw || '[]'); } catch (e) { projects = []; }
    // Prepend new project so newest appear first
    projects.unshift(project);
    fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf8');

    res.json({ success: true, project });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});
