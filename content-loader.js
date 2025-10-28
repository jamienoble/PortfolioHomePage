// Fetch projects from the backend and render into containers with id="portfolio-list"
async function loadPortfolio() {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const projects = await res.json();

    // Find all containers that should be populated
    const containers = document.querySelectorAll('#portfolio-list');
    containers.forEach(container => {
      const category = container.dataset.category;
      const filtered = projects.filter(p => p.category === category);
      renderProjects(container, filtered);
    });
  } catch (err) {
    console.error('Error loading projects', err);
  }
}

function renderProjects(container, projects) {
  container.innerHTML = '';
  if (!projects || projects.length === 0) {
    container.innerHTML = '<p class="text-center text-white/70">No projects yet. Use the admin uploader to add content.</p>';
    return;
  }

  // Create cards using existing Tailwind classes in the site
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300';

    const mediaSrc = (p.thumbnail || (p.media && p.media[0])) || '';
    const mediaHtml = mediaSrc ? `<div class="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center"><img src="/${mediaSrc}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover"/></div>` : `<div class="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center"><div class="text-6xl">🖼️</div></div>`;

    const info = `
      <div class="p-6">
        <h3 class="text-2xl font-bold mb-2">${escapeHtml(p.title)}</h3>
        <p class="text-white/70 mb-4">${escapeHtml(p.description || '')}</p>
      </div>
    `;

    card.innerHTML = mediaHtml + info;
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', loadPortfolio);
