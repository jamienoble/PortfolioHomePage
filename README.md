# PortfolioHomePage

A dynamic portfolio website with a backend system for managing and uploading content.

## Features

- **Admin Upload System** – Upload new portfolio items via `admin.html`
- **Dynamic Content** – Heading pages auto-populate from JSON data store
- **Category Support** – Projects organized by category (3D Modelling, Animation, Architecture Vis, Web Design)
- **File Upload** – Media files and thumbnails stored in `uploads/`

## Setup

1. **Install dependencies**
   ```powershell
   npm install
   ```

2. **Start the backend server**
   ```powershell
   npm start
   ```
   Server runs on [http://localhost:3000](http://localhost:3000)

3. **Use the admin uploader**
   - Navigate to [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
   - Fill in the form (title, description, category, media file, optional thumbnail)
   - Click "Upload"

4. **View your portfolio**
   - Visit [http://localhost:3000](http://localhost:3000) or heading pages
   - Projects will auto-populate on the respective category pages

## Structure

- `server.js` – Express backend with upload & projects API
- `admin.html` – Admin upload form
- `content-loader.js` – Client-side script to load projects
- `data/projects.json` – JSON data store for all projects
- `uploads/` – Uploaded media and thumbnails
- Heading pages: `3d-modelling.html`, `animation.html`, `architecture-vis.html`, `web-design.html`

## API Endpoints

- `GET /api/projects` – Returns all projects
- `POST /api/upload` – Upload a new project (multipart form)
