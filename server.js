/**
 * KIRAFOREX DIGITAL PLATFORM — UNIFIED PRODUCTION & LOCAL RUNTIME SERVER
 * Serves Public Frontend on port 3000 and Private Admin CMS Dashboard on port 3001.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DATA_FILE = path.join(__dirname, 'data', 'store.json');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

// Helper to read store
function getStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store:', err);
    return { 
      site_settings: {}, 
      events: [], 
      services: [], 
      youtube_videos: [], 
      enquiries: [],
      activity_log: [] 
    };
  }
}

// Helper to write store
function saveStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function logActivity(action, detail, type = 'general') {
  const store = getStore();
  const entry = {
    id: 'act_' + Date.now(),
    action,
    detail,
    timestamp: new Date().toISOString(),
    type
  };
  store.activity_log = [entry, ...(store.activity_log || [])].slice(0, 50);
  saveStore(store);
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// ==============================================================================
// 1. PUBLIC FRONTEND SERVER (PORT 3000)
// ==============================================================================
const frontendServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- Public APIs ---
  if (pathname === '/api/events') {
    const store = getStore();
    const now = Date.now();
    const activeEvents = store.events.filter(e => {
      const isPublished = e.status === 'published';
      const notExpired = new Date(e.expiry_date).getTime() > now;
      return isPublished && notExpired;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeEvents));
    return;
  }

  if (pathname === '/api/services') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.services.filter(s => s.status === 'published')));
    return;
  }

  if (pathname === '/api/settings') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.site_settings));
    return;
  }

  if (pathname === '/api/youtube') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.youtube_videos.slice(0, 3)));
    return;
  }

  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const store = getStore();
        const newEnquiry = {
          id: 'enq_' + Date.now(),
          full_name: payload.name || 'Anonymous',
          email: payload.email || '',
          phone: payload.phone || '',
          service_interest: payload.service || 'General Enquiry',
          message: payload.message || '',
          status: 'new',
          created_at: new Date().toISOString(),
        };
        store.enquiries = [newEnquiry, ...(store.enquiries || [])];
        saveStore(store);
        logActivity('New Lead Captured', `${newEnquiry.full_name} enquired about '${newEnquiry.service_interest}'`, 'lead');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Enquiry received successfully.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
    });
    return;
  }

  // Check static public assets
  const staticFilePath = path.join(PUBLIC_DIR, pathname);
  if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    serveStaticFile(res, staticFilePath);
    return;
  }

  // Serve Main Public Web Application
  const html = getFrontendHTML();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

// ==============================================================================
// 2. ADMIN CMS DASHBOARD SERVER (PORT 3001)
// ==============================================================================
const adminServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- Admin API Endpoints ---

  // 1. Analytics & Executive KPI API
  if (pathname === '/api/admin/analytics' && req.method === 'GET') {
    const store = getStore();
    const now = Date.now();
    const activeEvents = store.events.filter(e => e.status === 'published' && new Date(e.expiry_date).getTime() > now);
    const activePrograms = store.services.filter(s => s.status === 'published');
    const enquiries = store.enquiries || [];

    // Calculate approximate pipeline value
    let pipelineValue = 0;
    enquiries.forEach(enq => {
      const prog = store.services.find(s => s.title.toLowerCase().includes((enq.service_interest || '').toLowerCase()));
      if (prog) {
        pipelineValue += (prog.price_amount || 0);
      } else {
        pipelineValue += 75; // average default
      }
    });

    // Program demand breakdown
    const demand = {};
    enquiries.forEach(e => {
      const name = e.service_interest || 'General';
      demand[name] = (demand[name] || 0) + 1;
    });

    const enrolledCount = enquiries.filter(e => e.status === 'enrolled').length;
    const conversionRate = enquiries.length > 0 ? Math.round((enrolledCount / enquiries.length) * 100) : 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalLeads: enquiries.length,
      activePrograms: activePrograms.length,
      activeEvents: activeEvents.length,
      pipelineValue,
      conversionRate,
      demand,
      recentActivity: (store.activity_log || []).slice(0, 10),
    }));
    return;
  }

  // 2. Programs / Services (Courses & Mentorships) APIs
  if (pathname === '/api/admin/services' && req.method === 'GET') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.services || []));
    return;
  }

  if (pathname === '/api/admin/services' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const item = JSON.parse(body);
        const store = getStore();
        const newProgram = {
          id: 's_' + Date.now(),
          title: item.title,
          category: item.category || 'Course',
          slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          short_description: item.short_description || '',
          full_description: item.full_description || item.short_description || '',
          icon: item.icon || 'BookOpen',
          price_amount: Number(item.price_amount) || 0,
          price_currency: item.price_currency || 'USD',
          delivery_format: item.delivery_format || 'Live Online Masterclass',
          duration: item.duration || '4 Weeks',
          features: Array.isArray(item.features) ? item.features : (item.features ? item.features.split('\n').filter(Boolean) : []),
          cta_text: item.cta_text || 'Enroll via WhatsApp',
          cta_whatsapp_message: item.cta_whatsapp_message || `Hi Kira, I want to enroll in ${item.title}.`,
          status: item.status || 'published',
          display_order: Number(item.display_order) || (store.services.length + 1),
        };
        store.services.push(newProgram);
        saveStore(store);
        logActivity('Program Created', `Added '${newProgram.title}' (${newProgram.category})`, 'program');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, program: newProgram }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/admin/services/') && req.method === 'PUT') {
    const id = pathname.replace('/api/admin/services/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const store = getStore();
        const idx = store.services.findIndex(s => s.id === id);
        if (idx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Program not found' }));
          return;
        }
        if (typeof updates.features === 'string') {
          updates.features = updates.features.split('\n').filter(Boolean);
        }
        store.services[idx] = { ...store.services[idx], ...updates };
        saveStore(store);
        logActivity('Program Updated', `Modified '${store.services[idx].title}'`, 'program');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, program: store.services[idx] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/admin/services/') && req.method === 'DELETE') {
    const id = pathname.replace('/api/admin/services/', '');
    const store = getStore();
    const removed = store.services.find(s => s.id === id);
    store.services = store.services.filter(s => s.id !== id);
    saveStore(store);
    if (removed) {
      logActivity('Program Deleted', `Removed '${removed.title}'`, 'program');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 3. Events APIs
  if (pathname === '/api/admin/events' && req.method === 'GET') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.events));
    return;
  }

  if (pathname === '/api/admin/events' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const item = JSON.parse(body);
        const store = getStore();
        const newEvent = {
          id: 'e_' + Date.now(),
          title: item.title,
          slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          short_description: item.short_description,
          full_description: item.full_description || item.short_description,
          thumbnail_url: item.thumbnail_url || '/events/beginner_class_event_flyer.jpg',
          start_date: item.start_date || new Date().toISOString(),
          end_date: item.end_date || null,
          expiry_date: item.expiry_date || new Date(Date.now() + 86400000 * 7).toISOString(),
          time_zone: item.time_zone || 'GMT / UTC',
          venue_type: item.venue_type || 'Online',
          location_or_link: item.location_or_link || 'Academy Virtual Room',
          price_amount: Number(item.price_amount) || 0,
          price_currency: item.price_currency || 'USD',
          booking_whatsapp: item.booking_whatsapp || '+233 502 75 8608',
          booking_call: item.booking_call || '+233 594 86 2521',
          booking_url: item.booking_url || '',
          status: item.status || 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        store.events.unshift(newEvent);
        saveStore(store);
        logActivity('Event Created', `Created event '${newEvent.title}'`, 'event');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, event: newEvent }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/admin/events/') && req.method === 'PUT') {
    const id = pathname.replace('/api/admin/events/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const store = getStore();
        const idx = store.events.findIndex(e => e.id === id);
        if (idx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Event not found' }));
          return;
        }
        store.events[idx] = {
          ...store.events[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        saveStore(store);
        logActivity('Event Updated', `Updated event '${store.events[idx].title}'`, 'event');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, event: store.events[idx] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/admin/events/') && req.method === 'DELETE') {
    const id = pathname.replace('/api/admin/events/', '');
    const store = getStore();
    const removed = store.events.find(e => e.id === id);
    store.events = store.events.filter(e => e.id !== id);
    saveStore(store);
    if (removed) {
      logActivity('Event Deleted', `Deleted event '${removed.title}'`, 'event');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 4. Upload Event Thumbnail
  if (pathname === '/api/admin/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filename, dataUrl } = JSON.parse(body);
        if (!dataUrl || !dataUrl.includes(',')) {
          throw new Error('Invalid Base64 image payload');
        }
        const base64Data = dataUrl.split(',')[1];
        const safeName = 'upload_' + Date.now() + '_' + (filename || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '');
        const isHero = filename && filename.startsWith('hero_');
        const targetPath = isHero ? path.join(PUBLIC_DIR, safeName) : path.join(PUBLIC_DIR, 'events', safeName);
        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));

        const publicUrl = isHero ? ('/' + safeName) : ('/events/' + safeName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: publicUrl }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5. Inbound Leads / Enquiries APIs
  if (pathname === '/api/admin/enquiries' && req.method === 'GET') {
    const store = getStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.enquiries || []));
    return;
  }

  if (pathname.startsWith('/api/admin/enquiries/') && req.method === 'PUT') {
    const id = pathname.replace('/api/admin/enquiries/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { status } = JSON.parse(body);
        const store = getStore();
        const idx = store.enquiries.findIndex(e => e.id === id);
        if (idx !== -1) {
          store.enquiries[idx].status = status;
          saveStore(store);
          logActivity('Lead Status Changed', `${store.enquiries[idx].full_name} marked as '${status}'`, 'lead');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/admin/enquiries/') && req.method === 'DELETE') {
    const id = pathname.replace('/api/admin/enquiries/', '');
    const store = getStore();
    const lead = (store.enquiries || []).find(e => e.id === id);
    store.enquiries = (store.enquiries || []).filter(e => e.id !== id);
    saveStore(store);
    logActivity('Lead Deleted', lead ? `${lead.full_name} (${lead.service_interest}) removed` : `Lead ${id} removed`, 'lead');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 6. Site Settings & Copy
  if (pathname === '/api/admin/settings' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const store = getStore();
        store.site_settings = { ...store.site_settings, ...updates };
        saveStore(store);
        logActivity('Settings Updated', 'Website brand parameters and copy updated', 'settings');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, settings: store.site_settings }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve static assets from frontend public if requested
  const staticFilePath = path.join(PUBLIC_DIR, pathname);
  if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    serveStaticFile(res, staticFilePath);
    return;
  }

  // Serve Admin CMS Dashboard Application
  const adminHtml = getAdminDashboardHTML();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(adminHtml);
});

// ==============================================================================
// 3. FRONTEND PUBLIC HTML GENERATOR
// ==============================================================================
function getFrontendHTML() {
  const store = getStore();
  const settings = store.site_settings || {};
  const now = Date.now();
  const activeEvents = store.events.filter(e => e.status === 'published' && new Date(e.expiry_date).getTime() > now);
  const services = store.services.filter(s => s.status === 'published');
  const videos = (store.youtube_videos || []).slice(0, 3);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.site_title || 'KIRAFOREX — Trading Academy & Digital Platform'}</title>
  <meta name="description" content="KIRAFOREX TRADING ACADEMY — Institutional forex education, Deriv synthetics training, risk management tools, and Africa's Female Forex Traders movement.">
  
  <meta property="og:title" content="${settings.site_title || 'KIRAFOREX'}">
  <meta property="og:description" content="Master the financial markets with precision, discipline, and practical tools.">
  <meta property="og:image" content="/kira_forex_founder.jpg">
  <meta property="og:type" content="website">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            forest: {
              50: '#F5F5F5',
              100: '#E5E5E5',
              600: '#333333',
              700: '#1F2421',
              800: '#121212',
              900: '#0A0A0A',
              950: '#000000',
            },
            academy: {
              green: '#008751',
              dark: '#005734',
            },
            sage: {
              50: '#FBFBF9',
              100: '#F2F6F3',
              200: '#E2EBE5',
            },
          },
          fontFamily: {
            sans: ['${settings.font_body || "Inter"}', 'system-ui', 'sans-serif'],
            heading: ['${settings.font_heading || "Outfit"}', 'Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=Montserrat:wght@500;600;700;800;900&family=Outfit:wght@600;700;800;900&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Poppins:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&family=Urbanist:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-scale: ${settings.font_scale || '1'};
      --accent-color: ${settings.brand_accent_color || '#10B981'};
      --accent-dark: ${settings.brand_accent_dark || '#047857'};
      --hero-bg: ${settings.theme_mode === 'dark' ? '#0A0A0A' : (settings.theme_bg_color || '#FFFFFF')};
      --text-main: ${settings.theme_mode === 'dark' ? '#F9FAFB' : '#111814'};
      --card-bg: ${settings.theme_mode === 'dark' ? '#141414' : '#FFFFFF'};
      --border-color: ${settings.theme_mode === 'dark' ? '#262626' : '#E5E5E5'};
    }
    html {
      font-size: calc(16px * var(--font-scale));
    }
    body { 
      font-family: '${settings.font_body || "Inter"}', sans-serif; 
      background-color: var(--hero-bg); 
      color: var(--text-main); 
    }
    h1, h2, h3, h4, h5 { font-family: '${settings.font_heading || "Outfit"}', sans-serif; }
    .hero-parallax-badge { transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }

    /* ── Orbiting neon comet ─────────────────────────────── */
    @keyframes neon-orbit {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* Outer comet: bright hot-spot sweeping the full 360° using dynamic accent */
    .hero-orbit-comet {
      position: absolute;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        transparent 280deg,
        rgba(16,185,129,0.08) 300deg,
        var(--accent-color) 340deg,
        #A7F3D0 352deg,
        var(--accent-color) 357deg,
        rgba(16,185,129,0.08) 360deg
      );
      animation: neon-orbit 3.6s linear infinite;
      filter: blur(18px);
      pointer-events: none;
      will-change: transform;
    }

    /* Inner echo: dimmer, offset 180° */
    .hero-orbit-echo {
      position: absolute;
      border-radius: 50%;
      background: conic-gradient(
        from 180deg,
        transparent 0deg,
        transparent 300deg,
        rgba(16,185,129,0.04) 320deg,
        var(--accent-color) 350deg,
        #A7F3D0 357deg,
        var(--accent-color) 360deg
      );
      animation: neon-orbit 3.6s linear infinite;
      filter: blur(10px);
      pointer-events: none;
      will-change: transform;
    }

    /* Static ambient pool that gives the portrait a base glow */
    .hero-glow-ring {
      background: radial-gradient(ellipse at center,
        rgba(16,185,129,0.14) 0%,
        rgba(16,185,129,0.05) 55%,
        transparent 78%
      );
    }

    /* Keep a gentle base drop-shadow on the portrait itself */
    .hero-portrait-img {
      filter: drop-shadow(0 16px 30px rgba(7,43,25,0.15));
    }
  </style>
</head>
<body class="bg-white text-neutral-900 antialiased selection:bg-emerald-100 selection:text-forest-900">

  <!-- HEADER -->
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <a href="/" class="flex items-center gap-3.5 group">
        <img src="/kira_academy_logo.jpg" alt="Kiraforex Logo" class="w-12 h-12 rounded-full border border-neutral-200 object-contain p-0.5 shadow-sm">
        <div>
          <span class="block font-heading font-extrabold text-xl text-forest-900 tracking-tight">KIRAFOREX</span>
          <span class="block text-[11px] font-bold text-forest-600 uppercase tracking-wider">Trading Academy</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-700">
        <a href="#hero" class="hover:text-forest-800 transition">Home</a>
        <a href="#about" class="hover:text-forest-800 transition">About Kira</a>
        <a href="#services" class="hover:text-forest-800 transition">Academy Courses</a>
        <a href="#tools" class="hover:text-forest-800 transition">Trading Tools</a>
        <a href="#youtube" class="hover:text-forest-800 transition">YouTube</a>
        <a href="#events" class="hover:text-forest-800 transition">Events</a>
        <a href="#contact" class="hover:text-forest-800 transition">Contact</a>
      </nav>

      <div class="flex items-center gap-3">
        <a 
          href="${settings.primary_telegram_url || 'https://t.me/kira_forex'}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition active:scale-[0.98]"
        >
          <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>
          <span>Join Telegram Community</span>
        </a>
      </div>

    </div>
  </header>

  <!-- 1. SIGNATURE HERO SECTION WITH PARALLAX -->
  <section id="hero" class="relative pt-4 pb-10 lg:pt-6 lg:pb-14 overflow-hidden bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div class="lg:col-span-7 space-y-6 text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-forest-950 tracking-tight leading-[1.1]">
            ${settings.hero_headline || 'Master the Financial Markets with Precision & Discipline'}
          </h1>

          <p class="text-lg sm:text-xl text-neutral-600 max-w-xl font-normal leading-relaxed">
            ${settings.hero_subheadline || 'Institutional trading education, proven risk management tools, and an empowering community built for serious traders.'}
          </p>

          <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a 
              href="${settings.primary_telegram_url || 'https://t.me/kira_forex'}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-base shadow-elevated transition active:scale-[0.98]"
            >
              <span>${settings.hero_btn1_text || 'Join the Telegram Community'}</span>
              <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>

            <a 
              href="${settings.hero_btn2_url || settings.deriv_affiliate_url || 'https://track.deriv.com/_eBEGHBqxmKyDrNOKR4fSNGNd7ZgqdRLk/1/'}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-red-50 text-neutral-900 font-bold text-base border border-neutral-300 hover:border-red-300 shadow-sm transition active:scale-[0.98]"
            >
              <img src="/logos/deriv.webp" alt="Deriv" class="w-5 h-5 object-contain">
              <span>${settings.hero_btn2_text || 'Open a Deriv Account'}</span>
            </a>
          </div>

          <div class="pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4 text-left">
            <div>
              <span class="block text-2xl font-heading font-extrabold text-forest-900">${settings.hero_stat1_val || '100%'}</span>
              <span class="block text-xs font-semibold text-neutral-500">${settings.hero_stat1_lbl || 'Pure Price Action'}</span>
            </div>
            <div>
              <span class="block text-2xl font-heading font-extrabold text-forest-900">${settings.hero_stat2_val || '24/7'}</span>
              <span class="block text-xs font-semibold text-neutral-500">${settings.hero_stat2_lbl || 'Deriv Synthetics'}</span>
            </div>
            <div>
              <span class="block text-2xl font-heading font-extrabold text-forest-900">${settings.hero_stat3_val || 'Zero'}</span>
              <span class="block text-xs font-semibold text-neutral-500">${settings.hero_stat3_lbl || 'Guaranteed Hype'}</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 flex justify-center">
          <div 
            id="hero-parallax-container" 
            class="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none cursor-default"
          >
            <div class="absolute inset-4 rounded-full hero-glow-ring -z-10"></div>
            <!-- 360 degree orbiting neon lights -->
            <div class="absolute inset-0 hero-orbit-comet -z-10"></div>
            <div class="absolute inset-2 hero-orbit-echo -z-10"></div>
            <div class="absolute inset-8 rounded-full border border-emerald-400/40 -z-10"></div>

            <div class="relative w-[92%] h-[92%] flex items-end justify-center">
              <img 
                src="${settings.hero_image_url || '/kira_forex_portrait_transparent.png'}" 
                alt="Kira — Founder and CEO of Kiraforex Trading Academy" 
                class="w-full h-full object-contain object-bottom hero-portrait-img relative z-10"
              />
            </div>

            <div 
              id="badge-tv" 
              class="hero-parallax-badge absolute -top-1 right-2 sm:right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center">
                <img src="/logos/tradingview.webp" alt="TradingView" class="w-10 h-10 object-contain">
              </div>
              <div class="text-left">
                <span class="block text-[10px] uppercase font-bold tracking-wider text-forest-700">Official Charts</span>
                <span class="block text-xs font-bold text-neutral-900">TradingView</span>
              </div>
            </div>

            <div 
              id="badge-deriv" 
              class="hero-parallax-badge absolute bottom-4 -left-2 sm:left-2 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-white border border-neutral-200 flex items-center justify-center">
                <img src="/logos/deriv.webp" alt="Deriv" class="w-10 h-10 object-contain">
              </div>
              <div class="text-left">
                <span class="block text-[10px] uppercase font-bold tracking-wider text-red-600">Broker Partner</span>
                <span class="block text-xs font-bold text-neutral-900">Deriv Synthetics</span>
              </div>
            </div>

            <div 
              id="badge-mt5" 
              class="hero-parallax-badge absolute -bottom-1 right-2 sm:right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-white border border-neutral-200 flex items-center justify-center">
                <img src="/logos/metatrader5.webp" alt="MetaTrader 5" class="w-10 h-10 object-contain">
              </div>
              <div class="text-left">
                <span class="block text-[10px] uppercase font-bold tracking-wider text-emerald-700">Platform</span>
                <span class="block text-xs font-bold text-neutral-900">MetaTrader 5</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- 2. SHORT INTRODUCTION & ABOUT KIRA -->
  <section id="about" class="py-14 bg-sage-50/70 border-y border-neutral-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-forest-700">${settings.about_badge || 'Founder & Leader'}</span>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 mt-1">
            ${settings.about_heading || 'Empowering the Next Generation of African Traders'}
          </h2>
          <p class="mt-4 text-neutral-700 text-base leading-relaxed">
            ${settings.about_snippet || ''}
          </p>
          <div class="mt-6 space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">✓</div>
              <span class="text-sm font-semibold text-neutral-800">${settings.about_point1 || 'CEO of KIRAFOREX TRADING ACADEMY'}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">✓</div>
              <span class="text-sm font-semibold text-neutral-800">${settings.about_point2 || "Founder of AFRICA'S FEMALE FOREX TRADERS"}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">✓</div>
              <span class="text-sm font-semibold text-neutral-800">${settings.about_point3 || 'Certified Deriv Synthetics & Price Action Specialist'}</span>
            </div>
          </div>
        </div>

        <div class="p-8 rounded-3xl bg-white border border-neutral-200 shadow-card">
          <h3 class="font-heading font-bold text-xl text-forest-900 mb-3">${settings.philosophy_title || 'The Kiraforex Core Philosophy'}</h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            "${settings.philosophy_quote || 'Trading is not a lottery or an overnight fortune. It is an intellectual discipline governed by asymmetric risk-to-reward ratios, deep understanding of liquidity pools, and unmatched emotional control.'}"
          </p>
          <div class="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-4">
            <img src="/kira_forex_founder.jpg" alt="Kira" class="w-12 h-12 rounded-full object-cover border border-emerald-300">
            <div>
              <span class="block font-heading font-bold text-sm text-forest-950">${settings.philosophy_author || 'Kira'}</span>
              <span class="block text-xs text-neutral-500">${settings.philosophy_author_title || 'Lead Mentor & Founder'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. ACADEMY SERVICES & LEARNING OPPORTUNITIES (DYNAMIC CMS SYNC) -->
  <section id="services" class="py-14 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs font-bold uppercase tracking-wider text-forest-700">${settings.programs_badge || 'Academy Programs'}</span>
        <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 mt-1">
          ${settings.programs_heading || 'Structured Education Built for Mastery'}
        </h2>
        <p class="mt-2 text-neutral-600 text-base">
          ${settings.programs_subheading || 'From beginner bootcamps to private 1-on-1 VIP mentorship and 24/7 Deriv synthetics training.'}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${services.map(s => `
          <div class="bg-white rounded-3xl border border-neutral-200 p-8 shadow-card hover:shadow-elevated hover:border-forest-500 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div class="flex justify-between items-start mb-6">
                <span class="px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-bold text-forest-800">
                  ${s.category || s.duration || 'Comprehensive'}
                </span>
                <span class="text-2xl font-heading font-extrabold text-forest-900">
                  $${Number(s.price_amount).toFixed(2)} <span class="text-xs text-neutral-500 font-normal">USD</span>
                </span>
              </div>
              <h3 class="font-heading font-bold text-xl text-forest-950 mb-2">${s.title}</h3>
              <p class="text-neutral-600 text-sm leading-relaxed mb-4">${s.short_description}</p>
              
              <div class="mb-5 text-xs text-neutral-500 font-semibold flex items-center gap-2">
                <span>⏱️ Duration: <strong>${s.duration || 'Ongoing'}</strong></span>
                <span>•</span>
                <span>💻 <strong>${s.delivery_format || 'Online'}</strong></span>
              </div>

              <ul class="space-y-2 text-xs text-neutral-700 font-medium mb-6">
                ${(s.features || []).map(f => `
                  <li class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span>${f}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="pt-6 border-t border-neutral-100">
              <a 
                href="https://wa.me/233502758608?text=${encodeURIComponent(s.cta_whatsapp_message || 'Hi Kira, I want to enroll in ' + s.title)}"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition active:scale-[0.98]"
              >
                <span>${s.cta_text || 'Enroll via WhatsApp'}</span>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- 4. UPCOMING EVENTS (NATIVE 818:1024 FULL FLYER COVER) -->
  <section id="events" class="py-14 bg-sage-50/60 border-y border-neutral-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-forest-700">${settings.events_badge || 'Upcoming Academy Events'}</span>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 mt-1">
            ${settings.events_heading || 'Live Interactive Sessions & Workshops'}
          </h2>
          <p class="mt-2 text-neutral-600 text-base max-w-xl">
            ${settings.events_subheading || 'Register for live training classes. Event flyers display in their full native proportions.'}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${activeEvents.map(e => `
          <div class="bg-white rounded-2xl border border-neutral-200/90 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col group">
            <!-- NATIVE 818:1024 RATIO FULL PICTURE DISPLAY -->
            <div class="relative w-full aspect-[818/1024] bg-neutral-900/5 overflow-hidden border-b border-neutral-100 flex items-center justify-center">
              <img 
                src="${e.thumbnail_url}" 
                alt="${e.title}" 
                class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/90 text-white font-heading font-bold text-xs shadow-md">
                ${e.price_currency} ${Number(e.price_amount).toFixed(2)}
              </div>
              <div class="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/95 text-[11px] font-bold text-forest-900 shadow-sm">
                ${e.venue_type}
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="text-xs font-bold text-forest-700 mb-2">
                  📅 ${new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${e.time_zone}
                </div>
                <h3 class="font-heading font-extrabold text-xl text-forest-950 group-hover:text-forest-700 transition">
                  ${e.title}
                </h3>
                <p class="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-3">
                  ${e.short_description}
                </p>
              </div>

              <div class="mt-6 pt-5 border-t border-neutral-100 space-y-2.5">
                <a 
                  href="https://wa.me/${(e.booking_whatsapp || '233502758608').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello KiraForex, I want to book my seat for ' + e.title)}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition"
                >
                  <span>Book via WhatsApp (${e.booking_whatsapp})</span>
                </a>
                <div class="flex items-center justify-between text-xs px-1 text-neutral-500">
                  <span>Direct Hotline:</span>
                  <a href="tel:${(e.booking_call || '+233594862521').replace(/\s+/g, '')}" class="font-bold text-forest-800 hover:underline">
                    ${e.booking_call}
                  </a>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- 5. MANDATORY YOUTUBE SECTION (1 ROW × 3 COLUMNS DESKTOP) -->
  <section id="youtube" class="py-14 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>${settings.youtube_badge || 'Official YouTube Channel'}</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 tracking-tight">
            ${settings.youtube_heading || 'Latest Market Breakdowns & Lessons'}
          </h2>
          <p class="mt-2 text-neutral-600 text-base max-w-xl">
            ${settings.youtube_subheading || "Watch actual price action reviews and setups straight from Kira's channel (@kiraforexgh)."}
          </p>
        </div>

        <div>
          <a 
            href="${settings.youtube_url || 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U'}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 font-semibold text-sm shadow-sm hover:border-red-500 hover:text-red-600 transition"
          >
            <span>${settings.youtube_btn_text || 'View All Videos on YouTube'}</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${videos.map(v => `
          <a 
            href="${v.videoUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-subtle hover:shadow-card hover:border-forest-500 transition-all flex flex-col"
          >
            <div class="relative aspect-video w-full overflow-hidden bg-neutral-900">
              <img src="${v.thumbnailUrl}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                  ▶
                </div>
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <h3 class="font-heading font-bold text-base text-neutral-900 group-hover:text-forest-700 transition line-clamp-2">
                ${v.title}
              </h3>
              <div class="mt-4 pt-3 border-t border-neutral-100 text-xs text-forest-700 font-semibold flex justify-between">
                <span>Watch Breakdown</span>
                <span>&rarr;</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- 6. 8 TRADING TOOLS HUB -->
  <section id="tools" class="py-14 bg-sage-50/70 border-y border-neutral-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Practical Utilities</span>
        <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 mt-1">
          The KIRAFOREX Trading Suite
        </h2>
        <p class="mt-2 text-neutral-600 text-base">
          8 verified calculation engines and utilities engineered to protect your capital and audit your edge.
        </p>
      </div>

      <div id="interactive-tool-root" class="bg-white rounded-3xl border border-neutral-200 shadow-card p-6 sm:p-10">
        <div class="flex flex-wrap gap-2 border-b border-neutral-200 pb-4 mb-8">
          <button onclick="switchTool('pos')" id="tab-pos" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-forest-800 text-white">1. Position Sizing</button>
          <button onclick="switchTool('rr')" id="tab-rr" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200">2. Risk-to-Reward</button>
          <button onclick="switchTool('pip')" id="tab-pip" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200">3. Pip Calculator</button>
          <button onclick="switchTool('sentiment')" id="tab-sentiment" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200">4. Sentiment Gauge</button>
          <button onclick="switchTool('clock')" id="tab-clock" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200">5. Session Clock</button>
          <button onclick="switchTool('checklist')" id="tab-checklist" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200">6. Checklist</button>
        </div>

        <div id="panel-pos" class="max-w-3xl mx-auto space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Account Balance ($)</label>
              <input type="number" id="pos-bal" value="5000" oninput="calcPos()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Risk Percentage (%)</label>
              <input type="number" id="pos-risk" value="2" oninput="calcPos()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Entry Price</label>
              <input type="number" step="0.0001" id="pos-entry" value="1.0850" oninput="calcPos()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Stop Loss Price</label>
              <input type="number" step="0.0001" id="pos-sl" value="1.0825" oninput="calcPos()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
          </div>

          <div class="bg-black text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span class="text-xs text-neutral-300 font-bold uppercase tracking-wider block">Calculated Lot Size</span>
              <span id="pos-lots" class="text-4xl font-heading font-extrabold text-white mt-1 block">0.40 Lots</span>
              <span id="pos-risk-amt" class="text-xs text-neutral-300 mt-1 block">Monetary Risk: $100.00 (25 Pips)</span>
            </div>
            <div class="text-xs text-neutral-300 max-w-xs text-right">
              Assumes standard 100,000 unit contract ($10/pip). Never exceed 1-2% account exposure.
            </div>
          </div>
        </div>

        <div id="panel-rr" class="max-w-3xl mx-auto space-y-6 hidden">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Entry Price</label>
              <input type="number" step="0.0001" id="rr-entry" value="1.1000" oninput="calcRR()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Stop Loss</label>
              <input type="number" step="0.0001" id="rr-sl" value="1.0950" oninput="calcRR()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Take Profit</label>
              <input type="number" step="0.0001" id="rr-tp" value="1.1150" oninput="calcRR()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
          </div>

          <div class="bg-black text-white p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-xs text-neutral-300 font-bold uppercase block">Risk to Reward Ratio</span>
              <span id="rr-ratio" class="text-4xl font-heading font-extrabold text-white mt-1 block">1 : 3.00</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-neutral-400 block">Required Breakeven Win Rate</span>
              <span id="rr-winrate" class="text-2xl font-bold text-white">25.0%</span>
            </div>
          </div>
        </div>

        <div id="panel-pip" class="max-w-3xl mx-auto space-y-6 hidden">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Start Price</label>
              <input type="number" step="0.0001" id="pip-s" value="1.0800" oninput="calcPip()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">End Price</label>
              <input type="number" step="0.0001" id="pip-e" value="1.0875" oninput="calcPip()" class="w-full px-4 py-2 rounded-xl border border-neutral-300 font-semibold text-sm">
            </div>
          </div>
          <div class="bg-black text-white p-6 rounded-2xl text-center">
            <span class="text-xs text-neutral-300 font-bold uppercase block">Total Pips Moved</span>
            <span id="pip-out" class="text-4xl font-heading font-extrabold text-white mt-1 block">75.0 Pips</span>
          </div>
        </div>

        <div id="panel-sentiment" class="max-w-3xl mx-auto space-y-6 hidden">
          <div class="p-6 rounded-2xl bg-sage-50/50 border border-neutral-200 text-center">
            <span class="text-xs font-bold text-forest-700 uppercase block mb-2">Trend Strength Percentage</span>
            <input type="range" min="0" max="100" value="78" id="sent-slider" oninput="calcSent()" class="w-full max-w-md accent-forest-800">
            <div class="mt-4">
              <span id="sent-val" class="text-4xl font-heading font-extrabold text-forest-950 block">78%</span>
              <span id="sent-badge" class="inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">Strong Trend Conviction</span>
            </div>
          </div>
        </div>

        <div id="panel-clock" class="max-w-3xl mx-auto space-y-6 hidden">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl border border-neutral-200 text-center">
              <span class="block font-bold text-sm text-neutral-900">London</span>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">OPEN</span>
              <span class="block text-xs text-neutral-500 mt-1">08:00 - 16:30 GMT</span>
            </div>
            <div class="p-4 rounded-xl border border-neutral-200 text-center">
              <span class="block font-bold text-sm text-neutral-900">New York</span>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">OVERLAP</span>
              <span class="block text-xs text-neutral-500 mt-1">13:00 - 21:00 GMT</span>
            </div>
            <div class="p-4 rounded-xl border border-neutral-200 text-center">
              <span class="block font-bold text-sm text-neutral-900">Tokyo</span>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500">CLOSED</span>
              <span class="block text-xs text-neutral-500 mt-1">00:00 - 09:00 GMT</span>
            </div>
            <div class="p-4 rounded-xl border border-neutral-200 text-center">
              <span class="block font-bold text-sm text-neutral-900">Sydney</span>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500">CLOSED</span>
              <span class="block text-xs text-neutral-500 mt-1">22:00 - 07:00 GMT</span>
            </div>
          </div>
        </div>

        <div id="panel-checklist" class="max-w-3xl mx-auto space-y-3 hidden">
          <label class="flex items-center gap-3 p-3.5 rounded-xl border bg-white cursor-pointer hover:border-forest-600">
            <input type="checkbox" checked class="w-4 h-4 accent-forest-800">
            <span class="text-xs font-semibold text-neutral-800">1. Higher Timeframe Market Bias Aligned</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border bg-white cursor-pointer hover:border-forest-600">
            <input type="checkbox" checked class="w-4 h-4 accent-forest-800">
            <span class="text-xs font-semibold text-neutral-800">2. Validated Order Block / Support & Resistance Tested</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border bg-white cursor-pointer hover:border-forest-600">
            <input type="checkbox" checked class="w-4 h-4 accent-forest-800">
            <span class="text-xs font-semibold text-neutral-800">3. Verified Candlestick Rejection / Breakout Trigger</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border bg-white cursor-pointer hover:border-forest-600">
            <input type="checkbox" checked class="w-4 h-4 accent-forest-800">
            <span class="text-xs font-semibold text-neutral-800">4. Position Size Strictly Within 1-2% Max Capital Risk</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border bg-white cursor-pointer hover:border-forest-600">
            <input type="checkbox" checked class="w-4 h-4 accent-forest-800">
            <span class="text-xs font-semibold text-neutral-800">5. No High-Impact News Within 30 Minutes</span>
          </label>
        </div>

      </div>
    </div>
  </section>

  <!-- 7. TELEGRAM COMMUNITY CALLOUT -->
  <section class="py-12 bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
      <h2 class="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
        ${settings.community_heading || 'Join the Official KIRAFOREX Community'}
      </h2>
      <p class="mt-3 text-neutral-300 text-base leading-relaxed">
        ${settings.community_subheading || 'Connect with like-minded traders, receive live educational trade breakdowns, and stay updated on our upcoming academy workshops.'}
      </p>

      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a 
          href="${settings.primary_telegram_url || 'https://t.me/kira_forex'}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-bold text-sm shadow-elevated transition"
        >
          ${settings.community_btn1_text || 'Join General Telegram (Primary)'}
        </a>
        <a 
          href="${settings.synthetics_telegram_url || 'https://t.me/kiraforexsynth'}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-sm transition"
        >
          ${settings.community_btn2_text || 'Join Synthetics Telegram'}
        </a>
      </div>

      <div class="mt-6 text-xs text-neutral-400">
        Transparent partner disclosure: Looking to trade synthetics 24/7? 
        <a href="${settings.deriv_partner_url || 'https://t.deriv.link/?t=642J9K6PYXX5'}" target="_blank" rel="noopener noreferrer" class="text-white underline font-semibold hover:text-neutral-200">
          Create an official Deriv account via our link
        </a>.
      </div>
    </div>
  </section>

  <!-- 8. CONTACT SECTION -->
  <section id="contact" class="py-14 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Get In Touch</span>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-forest-950 mt-1">
            Connect Directly with the Academy
          </h2>
          <p class="mt-3 text-neutral-600 text-base leading-relaxed">
            Have questions about beginner classes, mentorship, or our trading tools? Reach out via WhatsApp, phone, or the enquiry form.
          </p>

          <div class="mt-8 space-y-4">
            <a 
              href="${settings.whatsapp_general_url || 'https://wa.me/message/WELLF6ZJDKQXA1'}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-sage-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">WA</div>
              <div>
                <span class="block text-xs font-bold text-neutral-500 uppercase">WhatsApp Help Desk</span>
                <span class="block text-base font-bold text-forest-900">${settings.whatsapp_phone || '+233 502 75 8608'}</span>
              </div>
            </a>

            <a 
              href="tel:${(settings.call_phone || '+233594862521').replace(/\s+/g, '')}"
              class="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-sage-50/50 hover:bg-forest-50 hover:border-forest-300 transition"
            >
              <div class="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center font-bold">TEL</div>
              <div>
                <span class="block text-xs font-bold text-neutral-500 uppercase">Direct Telephone Call</span>
                <span class="block text-base font-bold text-forest-900">${settings.call_phone || '+233 594 86 2521'}</span>
              </div>
            </a>
          </div>
        </div>

        <div class="bg-sage-50/70 p-8 rounded-3xl border border-neutral-200 shadow-card">
          <h3 class="font-heading font-bold text-xl text-forest-950 mb-4">Send an Enquiry</h3>
          <form id="contact-form" onsubmit="submitContact(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Your Full Name</label>
              <input type="text" id="contact-name" required class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Email Address</label>
              <input type="email" id="contact-email" required class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Phone / WhatsApp</label>
              <input type="text" id="contact-phone" class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Service of Interest</label>
              <select id="contact-service" class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white">
                ${services.map(s => `<option value="${s.title}">${s.title}</option>`).join('')}
                <option value="Beginner Class">Beginner Forex Trading Class</option>
                <option value="General Enquiry">General Enquiry</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Message</label>
              <textarea id="contact-msg" rows="3" required class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white"></textarea>
            </div>
            <button type="submit" id="contact-btn" class="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition">
              Submit Enquiry
            </button>
            <div id="contact-status" class="text-xs font-semibold text-center mt-2 hidden"></div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-sage-50 border-t border-neutral-200/90 pt-16 pb-12 text-neutral-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-neutral-200">
        <div class="flex items-center gap-3">
          <img src="/kira_academy_logo.jpg" alt="Kiraforex" class="w-10 h-10 rounded-full border">
          <span class="font-heading font-extrabold text-lg text-forest-950">KIRAFOREX TRADING ACADEMY</span>
        </div>
        <div class="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
          <!-- Telegram -->
          <a href="${settings.primary_telegram_url || '#'}" target="_blank" rel="noopener noreferrer"
             title="Telegram" aria-label="Telegram"
             class="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#229ED9] hover:bg-[#229ED9]/10 hover:border-[#229ED9]/40 hover:scale-105 transition shadow-sm">
            <svg class="w-4 h-4 fill-[#229ED9]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>
          </a>
          <!-- YouTube -->
          <a href="${settings.youtube_url || '#'}" target="_blank" rel="noopener noreferrer"
             title="YouTube" aria-label="YouTube"
             class="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#FF0000] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/40 hover:scale-105 transition shadow-sm">
            <svg class="w-4 h-4 fill-[#FF0000]" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <!-- WhatsApp -->
          <a href="${settings.whatsapp_general_url || '#'}" target="_blank" rel="noopener noreferrer"
             title="WhatsApp" aria-label="WhatsApp"
             class="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:scale-105 transition shadow-sm">
            <svg class="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <!-- Facebook -->
          <a href="${settings.facebook_url || '#'}" target="_blank" rel="noopener noreferrer"
             title="Facebook" aria-label="Facebook"
             class="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:scale-105 transition shadow-sm">
            <svg class="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <!-- Instagram -->
          <a href="${settings.instagram_url || '#'}" target="_blank" rel="noopener noreferrer"
             title="Instagram" aria-label="Instagram"
             class="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C]/10 hover:border-[#E1306C]/40 hover:scale-105 transition shadow-sm">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>

      <div class="mt-8 text-xs text-neutral-500 leading-relaxed">
        <strong>Risk Warning:</strong> Forex and CFD trading carry substantial risk of loss. Only trade with risk capital you can afford to lose. All content provided by KIRAFOREX TRADING ACADEMY is strictly educational.
      </div>
      <div class="mt-4 text-xs text-neutral-400">
        © ${new Date().getFullYear()} KIRAFOREX TRADING ACADEMY. All rights reserved.
      </div>
    </div>
  </footer>

  <!-- FLOATING WHATSAPP LIVE CHAT WIDGET -->
  <div id="whatsapp-live-chat" class="fixed bottom-6 right-6 z-50 flex items-center group">
    <!-- Tooltip Bubble on Hover -->
    <div class="hidden sm:flex items-center mr-3 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-xl border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
      <span>Chat with Kiraforex Support</span>
      <span class="inline-block w-2 h-2 rounded-full bg-[#25D366] ml-2 animate-pulse"></span>
    </div>

    <!-- Floating Circular WhatsApp Action Button with Ping Animation -->
    <a 
      href="${settings.whatsapp_general_url || 'https://wa.me/message/WELLF6ZJDKQXA1'}" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contact Support on WhatsApp"
      class="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300"
    >
      <!-- Pulsing radar wave -->
      <span class="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10"></span>

      <!-- Official WhatsApp SVG Icon -->
      <svg class="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  </div>

  <script>
    (function() {
      const container = document.getElementById('hero-parallax-container');
      const badgeTv = document.getElementById('badge-tv');
      const badgeDeriv = document.getElementById('badge-deriv');
      const badgeMt5 = document.getElementById('badge-mt5');

      if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      container.addEventListener('pointermove', function(e) {
        if (e.pointerType === 'touch') return;
        const rect = container.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        badgeTv.style.transform = 'translate3d(' + (dx * 18) + 'px, ' + (dy * 18) + 'px, 0)';
        badgeDeriv.style.transform = 'translate3d(' + (-dx * 16) + 'px, ' + (-dy * 16) + 'px, 0)';
        badgeMt5.style.transform = 'translate3d(' + (dx * 12) + 'px, ' + (-dy * 12) + 'px, 0)';
      });

      container.addEventListener('pointerleave', function() {
        badgeTv.style.transform = 'translate3d(0, 0, 0)';
        badgeDeriv.style.transform = 'translate3d(0, 0, 0)';
        badgeMt5.style.transform = 'translate3d(0, 0, 0)';
      });
    })();

    function switchTool(id) {
      ['pos', 'rr', 'pip', 'sentiment', 'clock', 'checklist'].forEach(t => {
        const p = document.getElementById('panel-' + t);
        const b = document.getElementById('tab-' + t);
        if (p) p.classList.add('hidden');
        if (b) {
          b.classList.remove('bg-forest-800', 'text-white');
          b.classList.add('bg-neutral-100', 'text-neutral-700');
        }
      });
      const activeP = document.getElementById('panel-' + id);
      const activeB = document.getElementById('tab-' + id);
      if (activeP) activeP.classList.remove('hidden');
      if (activeB) {
        activeB.classList.add('bg-forest-800', 'text-white');
        activeB.classList.remove('bg-neutral-100', 'text-neutral-700');
      }
    }

    function calcPos() {
      const bal = parseFloat(document.getElementById('pos-bal').value) || 0;
      const risk = parseFloat(document.getElementById('pos-risk').value) || 0;
      const entry = parseFloat(document.getElementById('pos-entry').value) || 0;
      const sl = parseFloat(document.getElementById('pos-sl').value) || 0;

      const riskDollar = (bal * risk) / 100;
      const pips = Math.abs(entry - sl) / 0.0001;
      const lots = pips > 0 ? (riskDollar / (pips * 10)) : 0;

      document.getElementById('pos-lots').innerText = lots.toFixed(2) + ' Lots';
      document.getElementById('pos-risk-amt').innerText = 'Monetary Risk: $' + riskDollar.toFixed(2) + ' (' + pips.toFixed(1) + ' Pips)';
    }

    function calcRR() {
      const entry = parseFloat(document.getElementById('rr-entry').value) || 0;
      const sl = parseFloat(document.getElementById('rr-sl').value) || 0;
      const tp = parseFloat(document.getElementById('rr-tp').value) || 0;

      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      const ratio = risk > 0 ? (reward / risk) : 0;
      const winRate = ratio > 0 ? ((1 / (1 + ratio)) * 100) : 0;

      document.getElementById('rr-ratio').innerText = '1 : ' + ratio.toFixed(2);
      document.getElementById('rr-winrate').innerText = winRate.toFixed(1) + '%';
    }

    function calcPip() {
      const s = parseFloat(document.getElementById('pip-s').value) || 0;
      const e = parseFloat(document.getElementById('pip-e').value) || 0;
      const pips = Math.abs(e - s) / 0.0001;
      document.getElementById('pip-out').innerText = pips.toFixed(1) + ' Pips';
    }

    function calcSent() {
      const v = document.getElementById('sent-slider').value;
      document.getElementById('sent-val').innerText = v + '%';
      const badge = document.getElementById('sent-badge');
      if (v < 40) {
        badge.innerText = 'Weak / Choppy Bias';
        badge.className = 'inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-red-600 text-white';
      } else if (v < 70) {
        badge.innerText = 'Consolidating / Moderate Trend';
        badge.className = 'inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-amber-500 text-white';
      } else {
        badge.innerText = 'High Conviction Trend Impulse';
        badge.className = 'inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white';
      }
    }

    function submitContact(e) {
      e.preventDefault();
      const btn = document.getElementById('contact-btn');
      const status = document.getElementById('contact-status');
      btn.disabled = true;
      btn.innerText = 'Sending...';

      const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        service: document.getElementById('contact-service').value,
        message: document.getElementById('contact-msg').value,
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(d => {
        status.classList.remove('hidden');
        status.innerText = '✓ Thank you! Your message has been received by Kiraforex Academy.';
        status.className = 'text-xs font-bold text-center mt-2 text-emerald-700';
        document.getElementById('contact-form').reset();
      })
      .catch(err => {
        status.classList.remove('hidden');
        status.innerText = 'Error submitting. Please contact via WhatsApp directly.';
        status.className = 'text-xs font-bold text-center mt-2 text-red-600';
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerText = 'Submit Enquiry';
      });
    }
  </script>
</body>
</html>`;
}

// ==============================================================================
// 4. ADMIN CMS DASHBOARD HTML GENERATOR (PROFESSIONAL MULTI-PAGE & ANALYTICS)
// ==============================================================================
function getAdminDashboardHTML() {
  const store = getStore();
  const events = store.events || [];
  const enquiries = store.enquiries || [];
  const services = store.services || [];
  const settings = store.site_settings || {};
  const activity = store.activity_log || [];

  // Compute stats
  const activeEventsCount = events.filter(e => e.status === 'published' && new Date(e.expiry_date).getTime() > Date.now()).length;
  const activeProgramsCount = services.filter(s => s.status === 'published').length;
  let pipelineSum = 0;
  enquiries.forEach(e => {
    const s = services.find(srv => srv.title.toLowerCase().includes((e.service_interest || '').toLowerCase()));
    pipelineSum += s ? Number(s.price_amount) : 100;
  });
  const enrolledCount = enquiries.filter(e => e.status === 'enrolled').length;
  const conversionRate = enquiries.length > 0 ? Math.round((enrolledCount / enquiries.length) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KIRAFOREX CMS — Executive Administration</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            forest: {
              700: '#1F2421',
              800: '#121212',
              900: '#0A0A0A',
              950: '#000000',
            },
            emerald: {
              500: '#10B981',
              600: '#008751',
            }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F8FAF9; }
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="bg-[#F8FAF9] text-neutral-900 antialiased">

  <div class="min-h-screen flex flex-col md:flex-row">
    
    <!-- SIDEBAR NAVIGATION -->
    <aside class="w-full md:w-72 bg-black text-white p-6 flex flex-col justify-between border-r border-neutral-800 shadow-xl">
      <div>
        <!-- Brand Header -->
        <div class="flex items-center gap-3.5 pb-6 border-b border-forest-900">
          <img src="/kira_academy_logo.jpg" alt="Logo" class="w-11 h-11 rounded-full border border-neutral-700 p-0.5 object-contain bg-white">
          <div>
            <span class="block font-heading font-extrabold text-lg text-white tracking-tight">KIRAFOREX</span>
            <span class="block text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Executive CMS</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="mt-6 space-y-1.5 text-sm font-semibold">
          <button 
            type="button" 
            onclick="showTab('analytics')" 
            id="nav-analytics" 
            class="w-full text-left px-4 py-3 rounded-xl bg-forest-800 text-white flex items-center justify-between transition-all"
          >
            <span class="flex items-center gap-3">
              <span class="text-base">📊</span>
              <span>Analytics & KPIs</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">LIVE</span>
          </button>

          <button 
            type="button" 
            onclick="showTab('programs')" 
            id="nav-programs" 
            class="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-forest-900 hover:text-white transition-all flex items-center justify-between"
          >
            <span class="flex items-center gap-3">
              <span class="text-base">🎓</span>
              <span>Academy Programs</span>
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 font-bold" id="badge-programs-count">${services.length}</span>
          </button>

          <button 
            type="button" 
            onclick="showTab('events')" 
            id="nav-events" 
            class="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-forest-900 hover:text-white transition-all flex items-center justify-between"
          >
            <span class="flex items-center gap-3">
              <span class="text-base">📅</span>
              <span>Events & Workshops</span>
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 font-bold" id="badge-events-count">${events.length}</span>
          </button>

          <button 
            type="button" 
            onclick="showTab('enquiries')" 
            id="nav-enquiries" 
            class="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-forest-900 hover:text-white transition-all flex items-center justify-between"
          >
            <span class="flex items-center gap-3">
              <span class="text-base">📬</span>
              <span>Student Leads & CRM</span>
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">${enquiries.length}</span>
          </button>

          <button 
            type="button" 
            onclick="showTab('customize')" 
            id="nav-customize" 
            class="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-between"
          >
            <span class="flex items-center gap-3">
              <span class="text-base">🎨</span>
              <span>Full Site Customizer</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">ALL SECTIONS</span>
          </button>

          <button 
            type="button" 
            onclick="showTab('settings')" 
            id="nav-settings" 
            class="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-3"
          >
            <span class="text-base">⚙️</span>
            <span>Brand & Social Links</span>
          </button>
        </nav>
      </div>

      <!-- User Profile Badge & Quick Preview -->
      <div class="pt-6 border-t border-forest-900 text-xs">
        <div class="flex items-center gap-3 mb-3">
          <img src="/kira_forex_founder.jpg" alt="Kira" class="w-9 h-9 rounded-full object-cover border border-neutral-600">
          <div>
            <span class="block text-white font-bold text-sm">Kira (Founder)</span>
            <span class="block text-neutral-300 text-[11px] font-semibold">Super Administrator</span>
          </div>
        </div>

        <a 
          href="http://localhost:3000" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs shadow-sm transition"
        >
          <span>View Live Public Site</span>
          <span>&rarr;</span>
        </a>
      </div>
    </aside>

    <!-- MAIN DASHBOARD CONTENT AREA -->
    <main class="flex-1 p-6 md:p-10 overflow-y-auto">

      <!-- ================= 1. ANALYTICS & KPIS ================= -->
      <section id="tab-analytics" class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Executive Overview</span>
            <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Platform Performance & Analytics</h1>
          </div>
          <span class="text-xs font-semibold text-neutral-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
            Live Database Synced
          </span>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Inbound Leads</span>
              <span class="text-4xl font-heading font-extrabold text-forest-950 block mt-2">${enquiries.length}</span>
            </div>
            <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span class="text-emerald-600 font-bold">● Active Inquiries</span>
              <span>${enquiries.filter(e => e.status === 'new').length} New</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Academy Programs</span>
              <span class="text-4xl font-heading font-extrabold text-forest-950 block mt-2">${activeProgramsCount}</span>
            </div>
            <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span class="text-forest-700 font-bold">● Published Courses</span>
              <span>${services.length} Total</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Estimated Pipeline Value</span>
              <span class="text-4xl font-heading font-extrabold text-emerald-700 block mt-2">$${pipelineSum.toLocaleString()}</span>
            </div>
            <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span class="text-emerald-600 font-bold">USD Admissions Volume</span>
              <span>${conversionRate}% Enrolled</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Live Scheduled Events</span>
              <span class="text-4xl font-heading font-extrabold text-forest-950 block mt-2">${activeEventsCount}</span>
            </div>
            <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span class="text-amber-600 font-bold">● Non-Expired</span>
              <span>${events.length} Recorded</span>
            </div>
          </div>
        </div>

        <!-- Analytics Visuals & Activity Stream -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Program Interest Breakdown -->
          <div class="lg:col-span-7 bg-white p-7 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 class="font-heading font-bold text-lg text-forest-950">Student Demand by Academy Program</h3>
                <p class="text-xs text-neutral-500 mt-0.5">Distribution of student enquiries across courses and mentorship.</p>
              </div>
            </div>

            <div class="space-y-4">
              ${services.map((s, idx) => {
                const count = enquiries.filter(e => (e.service_interest || '').toLowerCase().includes(s.title.toLowerCase())).length;
                const pct = enquiries.length > 0 ? Math.round((count / enquiries.length) * 100) : 0;
                return `
                  <div>
                    <div class="flex justify-between text-xs font-bold text-neutral-800 mb-1.5">
                      <span>${s.title}</span>
                      <span class="text-forest-700">${count} Leads (${pct}%)</span>
                    </div>
                    <div class="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                      <div class="h-full bg-forest-800 rounded-full transition-all duration-700" style="width: ${Math.max(12, pct)}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Real-Time Activity Log Audit Stream -->
          <div class="lg:col-span-5 bg-white p-7 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <div class="pb-3 border-b border-neutral-100">
              <h3 class="font-heading font-bold text-lg text-forest-950">Real-Time Activity Audit</h3>
              <p class="text-xs text-neutral-500">Live operational log of system events.</p>
            </div>

            <div class="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              ${activity.map(act => `
                <div class="p-3.5 rounded-xl bg-sage-50/70 border border-neutral-200/60 text-xs flex flex-col justify-between">
                  <div class="flex items-center justify-between font-bold text-neutral-900">
                    <span>${act.action}</span>
                    <span class="text-[10px] text-neutral-400 font-normal">${new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p class="text-neutral-600 mt-1">${act.detail}</p>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </section>

      <!-- ================= 2. ACADEMY PROGRAMS (COURSES & MENTORSHIPS) ================= -->
      <section id="tab-programs" class="hidden space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Course Catalog & Coaching</span>
            <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Academy Programs & Mentorships</h1>
            <p class="text-sm text-neutral-500 mt-0.5">Manage courses, syllabus features, pricing, and WhatsApp booking triggers.</p>
          </div>

          <button 
            type="button" 
            onclick="openProgramModal()" 
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition"
          >
            <span>+ Create New Program</span>
          </button>
        </div>

        <!-- Programs Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="programs-grid">
          ${services.map(p => `
            <div class="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-card transition">
              <div>
                <div class="flex items-start justify-between mb-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
                    ${p.category || 'Course'}
                  </span>
                  <span class="text-xl font-heading font-extrabold text-forest-950">
                    $${Number(p.price_amount).toFixed(2)}
                  </span>
                </div>

                <h3 class="font-heading font-bold text-lg text-forest-950 mb-1">${p.title}</h3>
                <p class="text-xs text-neutral-600 leading-relaxed mb-4">${p.short_description}</p>

                <div class="mb-4 text-xs text-neutral-500 font-semibold space-y-1">
                  <div>⏱️ Duration: <strong>${p.duration || 'Flexible'}</strong></div>
                  <div>💻 Format: <strong>${p.delivery_format || 'Online'}</strong></div>
                </div>

                <div class="mb-4">
                  <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Key Curriculum Points:</span>
                  <ul class="text-xs text-neutral-700 space-y-1">
                    ${(p.features || []).slice(0, 3).map(f => `
                      <li class="flex items-center gap-1.5">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span class="line-clamp-1">${f}</span>
                      </li>
                    `).join('')}
                    ${(p.features || []).length > 3 ? `<li class="text-[11px] text-neutral-400">+${(p.features || []).length - 3} more curriculum modules</li>` : ''}
                  </ul>
                </div>
              </div>

              <div class="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button 
                  type="button" 
                  onclick="editProgram('${p.id}')"
                  class="text-xs font-bold text-forest-800 hover:underline"
                >
                  ✏️ Edit Program
                </button>
                <button 
                  type="button" 
                  onclick="deleteProgram('${p.id}')"
                  class="text-xs font-bold text-red-600 hover:underline"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ================= 3. EVENTS & WORKSHOPS ================= -->
      <section id="tab-events" class="hidden space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Workshops & Live Classes</span>
            <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Events & Workshops Manager</h1>
            <p class="text-sm text-neutral-500 mt-0.5">Upload flyers with standard 818:1024 aspect ratio, set pricing and auto-expiry.</p>
          </div>

          <button 
            type="button" 
            onclick="openNewEventModal()" 
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition"
          >
            <span>+ Create New Event</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${events.map(e => `
            <div class="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div class="relative w-full aspect-[818/1024] bg-neutral-900/5 overflow-hidden border-b flex items-center justify-center">
                <img src="${e.thumbnail_url}" alt="${e.title}" class="w-full h-full object-contain">
                <div class="absolute top-2 right-2 px-2.5 py-1 rounded-md text-[11px] font-bold ${e.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-white'}">
                  ${e.status.toUpperCase()}
                </div>
              </div>

              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span class="text-xs font-semibold text-neutral-500 block mb-1">
                    Start: ${new Date(e.start_date).toLocaleDateString()} • Expiry: ${new Date(e.expiry_date).toLocaleDateString()}
                  </span>
                  <h3 class="font-heading font-bold text-lg text-forest-950">${e.title}</h3>
                  <p class="text-xs text-neutral-600 mt-1 line-clamp-2">${e.short_description}</p>
                  
                  <div class="mt-3 flex items-center justify-between text-xs font-bold text-forest-800">
                    <span>Fee: $${e.price_amount} ${e.price_currency}</span>
                    <span>Venue: ${e.venue_type}</span>
                  </div>
                </div>

                <div class="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <button 
                    type="button" 
                    onclick="editEvent('${e.id}')"
                    class="text-xs font-bold text-forest-800 hover:underline"
                  >
                    ✏️ Edit Event
                  </button>
                  <button 
                    type="button" 
                    onclick="deleteEvent('${e.id}')"
                    class="text-xs font-bold text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ================= 4. STUDENT LEADS & CRM ================= -->
      <section id="tab-enquiries" class="hidden space-y-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Inbound Admissions</span>
          <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Student Leads & Enquiries</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Direct student contact submissions with one-click WhatsApp chat triggers.</p>
        </div>

        <div class="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
          <!-- Header and search/summary bar -->
          <div class="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span class="font-heading font-bold text-sm text-neutral-900">Total Enquiries Captured</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800 font-bold">${enquiries.length} Leads</span>
            </div>
            <div class="text-xs text-neutral-500 font-medium">
              Horizontal scroll enabled on mobile screens &bull; Status updates automatically saved
            </div>
          </div>

          <!-- Responsive Scroll Wrapper with distinct borders -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead class="bg-neutral-100 border-b border-neutral-300 font-heading font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Date</th>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Student Name</th>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Program Interest</th>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Contact Phone / Email</th>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Message</th>
                  <th class="py-3.5 px-4 border-r border-neutral-200">Status</th>
                  <th class="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 font-medium bg-white">
                ${enquiries.map((enq, idx) => `
                  <tr id="lead-row-${enq.id}" class="hover:bg-neutral-50/80 transition-colors ${idx % 2 === 1 ? 'bg-neutral-50/30' : ''}">
                    <td class="py-3.5 px-4 text-neutral-500 border-r border-neutral-200 whitespace-nowrap">
                      ${new Date(enq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td class="py-3.5 px-4 font-bold text-neutral-950 border-r border-neutral-200 whitespace-nowrap">
                      ${enq.full_name}
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-emerald-800 border-r border-neutral-200 whitespace-nowrap">
                      <span class="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200">${enq.service_interest}</span>
                    </td>
                    <td class="py-3.5 px-4 text-neutral-700 border-r border-neutral-200 whitespace-nowrap font-mono text-[11px]">
                      ${enq.phone || enq.email}
                    </td>
                    <td class="py-3.5 px-4 text-neutral-600 border-r border-neutral-200 max-w-xs truncate" title="${enq.message}">
                      ${enq.message}
                    </td>
                    <td class="py-3.5 px-4 border-r border-neutral-200 whitespace-nowrap">
                      <select onchange="updateLeadStatus('${enq.id}', this.value)" class="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-neutral-300 bg-white shadow-sm hover:border-neutral-400">
                        <option value="new" ${enq.status === 'new' ? 'selected' : ''}>🟡 New</option>
                        <option value="contacted" ${enq.status === 'contacted' ? 'selected' : ''}>🔵 Contacted</option>
                        <option value="enrolled" ${enq.status === 'enrolled' ? 'selected' : ''}>🟢 Enrolled</option>
                        <option value="archived" ${enq.status === 'archived' ? 'selected' : ''}>⚪ Archived</option>
                      </select>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-2">
                        ${enq.phone ? `
                          <a 
                            href="https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + enq.full_name + ', Kira here from Kiraforex Trading Academy regarding your enquiry.')}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                            title="Chat on WhatsApp"
                          >
                            <span>💬 Chat</span>
                          </a>
                        ` : ''}
                        <button 
                          type="button" 
                          onclick="deleteLead('${enq.id}', '${enq.full_name.replace(/'/g, "\\'")}')" 
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition"
                          title="Delete Lead"
                        >
                          <span>🗑️ Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ================= 5. FULL SITE CUSTOMIZER ================= -->
      <section id="tab-customize" class="hidden max-w-5xl space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Visual Engine & Brand CMS</span>
            <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Full Website Customizer</h1>
            <p class="text-sm text-neutral-500 mt-0.5">Edit copy, buttons, links, statistics, and photo assets across every section.</p>
          </div>
          <button type="button" onclick="document.getElementById('customizer-form').requestSubmit()" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-sm shadow-sm hover:bg-forest-900 transition">
            <span>💾 Save All Changes</span>
          </button>
        </div>

        <form id="customizer-form" onsubmit="saveFullCustomizer(event)" class="space-y-8">

          <!-- 0A. THEME & COLOR CUSTOMIZER (NEW) -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b pb-3">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">🎨</span>
                <div>
                  <h3 class="font-heading font-bold text-lg text-forest-950">Theme Mode & Brand Color Palette</h3>
                  <p class="text-xs text-neutral-500">Switch color modes, adjust the primary accent and customize canvas background</p>
                </div>
              </div>
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">LIVE COLOR ENGINE</span>
            </div>

            <!-- Quick Theme Preset Pills -->
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-2">Preset Color Themes</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button type="button" onclick="applyColorPreset('emerald', '#10B981', '#047857', '#FFFFFF', 'light')" class="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 bg-white text-left transition flex items-center gap-2.5 group">
                  <span class="w-5 h-5 rounded-full bg-emerald-500 border border-neutral-300 flex-shrink-0"></span>
                  <div>
                    <span class="block text-xs font-bold text-neutral-900 group-hover:text-emerald-700">Emerald Classic</span>
                    <span class="block text-[10px] text-neutral-500">Green & White</span>
                  </div>
                </button>

                <button type="button" onclick="applyColorPreset('gold', '#D97706', '#92400E', '#FFFFFF', 'light')" class="p-3 rounded-xl border border-neutral-200 hover:border-amber-500 bg-white text-left transition flex items-center gap-2.5 group">
                  <span class="w-5 h-5 rounded-full bg-amber-500 border border-neutral-300 flex-shrink-0"></span>
                  <div>
                    <span class="block text-xs font-bold text-neutral-900 group-hover:text-amber-700">Imperial Gold</span>
                    <span class="block text-[10px] text-neutral-500">Gold & Ivory</span>
                  </div>
                </button>

                <button type="button" onclick="applyColorPreset('cyan', '#06B6D4', '#0E7490', '#FFFFFF', 'light')" class="p-3 rounded-xl border border-neutral-200 hover:border-cyan-500 bg-white text-left transition flex items-center gap-2.5 group">
                  <span class="w-5 h-5 rounded-full bg-cyan-500 border border-neutral-300 flex-shrink-0"></span>
                  <div>
                    <span class="block text-xs font-bold text-neutral-900 group-hover:text-cyan-700">Synthetics Cyan</span>
                    <span class="block text-[10px] text-neutral-500">Cyan & Slate</span>
                  </div>
                </button>

                <button type="button" onclick="applyColorPreset('obsidian', '#10B981', '#047857', '#0A0A0A', 'dark')" class="p-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-neutral-900 text-left transition flex items-center gap-2.5 group">
                  <span class="w-5 h-5 rounded-full bg-emerald-400 border border-neutral-600 flex-shrink-0"></span>
                  <div>
                    <span class="block text-xs font-bold text-white">Obsidian Dark</span>
                    <span class="block text-[10px] text-neutral-400">Deep Black</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <!-- Theme Mode -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Display Mode</label>
                <select id="cust-theme-mode" class="w-full px-3 py-2 rounded-lg border text-sm font-semibold bg-white" onchange="previewColorChange()">
                  <option value="light" ${(settings.theme_mode !== 'dark') ? 'selected' : ''}>☀️ Light Canvas (Pure White)</option>
                  <option value="dark" ${(settings.theme_mode === 'dark') ? 'selected' : ''}>🌙 Dark Mode (Obsidian Black)</option>
                </select>
                <span class="block text-[11px] text-neutral-500">Switches page canvas, contrast borders, and card elevations.</span>
              </div>

              <!-- Primary Accent Color -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Primary Accent Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="cust-accent-color-picker" value="${settings.brand_accent_color || '#10B981'}" oninput="document.getElementById('cust-accent-color').value = this.value; previewColorChange()" class="w-10 h-10 p-1 rounded-lg border bg-white cursor-pointer">
                  <input type="text" id="cust-accent-color" value="${settings.brand_accent_color || '#10B981'}" oninput="document.getElementById('cust-accent-color-picker').value = this.value; previewColorChange()" class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono uppercase font-bold">
                </div>
                <span class="block text-[11px] text-neutral-500">Controls 360° neon comet, icons, glow rings, and live badges.</span>
              </div>

              <!-- Page Background Color -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Canvas Background Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="cust-bg-color-picker" value="${settings.theme_bg_color || '#FFFFFF'}" oninput="document.getElementById('cust-bg-color').value = this.value; previewColorChange()" class="w-10 h-10 p-1 rounded-lg border bg-white cursor-pointer">
                  <input type="text" id="cust-bg-color" value="${settings.theme_bg_color || '#FFFFFF'}" oninput="document.getElementById('cust-bg-color-picker').value = this.value; previewColorChange()" class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono uppercase font-bold">
                </div>
                <span class="block text-[11px] text-neutral-500">Default is pure white (#FFFFFF) per brand specification.</span>
              </div>
            </div>

            <!-- Live Color Preview Box -->
            <div id="color-preview-box" class="p-5 rounded-xl border border-neutral-300 transition-all flex flex-col sm:flex-row items-center justify-between gap-4" style="background-color: ${settings.theme_bg_color || '#FFFFFF'};">
              <div class="flex items-center gap-3">
                <div id="color-preview-indicator" class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md" style="background-color: ${settings.brand_accent_color || '#10B981'};">
                  ✓
                </div>
                <div>
                  <span id="color-preview-title" class="block font-heading font-bold text-base text-neutral-900">Brand Color Accent in Action</span>
                  <span class="block text-xs text-neutral-500">Button highlights, neon sweep, and border active states</span>
                </div>
              </div>
              <button type="button" id="color-preview-btn" class="px-5 py-2 rounded-full font-bold text-xs text-white shadow-sm transition" style="background-color: ${settings.brand_accent_color || '#10B981'};">
                Sample Live Button
              </button>
            </div>
          </div>

          <!-- 0. TYPOGRAPHY & FONT STYLES (NEW) -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b pb-3">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">Aa</span>
                <div>
                  <h3 class="font-heading font-bold text-lg text-forest-950">Typography Engine & Global Font Sizes</h3>
                  <p class="text-xs text-neutral-500">Customize brand typeface pairings and global scale for headings and body</p>
                </div>
              </div>
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">GOOGLE FONTS ENGINE</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <!-- Heading Font -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Heading Font Family</label>
                <select id="cust-font-heading" class="w-full px-3 py-2 rounded-lg border text-sm font-semibold bg-white" onchange="previewFontChange()">
                  ${['Outfit', 'Plus Jakarta Sans', 'Montserrat', 'Syne', 'Cinzel', 'Poppins', 'Playfair Display', 'Space Grotesk', 'Urbanist'].map(f => `
                    <option value="${f}" ${(settings.font_heading || 'Outfit') === f ? 'selected' : ''}>${f}</option>
                  `).join('')}
                </select>
                <span class="block text-[11px] text-neutral-500">Applied to all page titles, hero headers, section titles & cards.</span>
              </div>

              <!-- Body Font -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Body & Paragraph Font</label>
                <select id="cust-font-body" class="w-full px-3 py-2 rounded-lg border text-sm font-medium bg-white" onchange="previewFontChange()">
                  ${['Inter', 'Plus Jakarta Sans', 'DM Sans', 'Manrope', 'Montserrat', 'Urbanist', 'Poppins'].map(f => `
                    <option value="${f}" ${(settings.font_body || 'Inter') === f ? 'selected' : ''}>${f}</option>
                  `).join('')}
                </select>
                <span class="block text-[11px] text-neutral-500">Applied to descriptions, lists, cards, buttons and body text.</span>
              </div>

              <!-- Font Scale Size -->
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <label class="block text-xs font-bold text-forest-900 uppercase">Global Font Scale</label>
                <select id="cust-font-scale" class="w-full px-3 py-2 rounded-lg border text-sm font-bold bg-white" onchange="previewFontChange()">
                  <option value="0.90" ${(settings.font_scale === '0.90') ? 'selected' : ''}>Compact (90% — sleek & dense)</option>
                  <option value="0.95" ${(settings.font_scale === '0.95') ? 'selected' : ''}>Slightly Compact (95%)</option>
                  <option value="1" ${(!settings.font_scale || settings.font_scale === '1') ? 'selected' : ''}>Default (100% — standard)</option>
                  <option value="1.05" ${(settings.font_scale === '1.05') ? 'selected' : ''}>Comfortable (105%)</option>
                  <option value="1.10" ${(settings.font_scale === '1.10') ? 'selected' : ''}>Large & Bold (110% — high legibility)</option>
                </select>
                <span class="block text-[11px] text-neutral-500">Scales the root rem size across the entire public platform.</span>
              </div>
            </div>

            <!-- Live Typography Preview Card -->
            <div id="font-preview-box" class="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block mb-1">Live Preview</span>
              <h4 id="font-preview-h" class="text-2xl font-bold text-neutral-900" style="font-family: '${settings.font_heading || 'Outfit'}', sans-serif;">
                Master the Financial Markets with Precision & Discipline
              </h4>
              <p id="font-preview-p" class="text-sm text-neutral-600 mt-1" style="font-family: '${settings.font_body || 'Inter'}', sans-serif;">
                Institutional trading education, proven risk management tools, and an empowering community built for serious traders.
              </p>
            </div>
          </div>

          <!-- 1. HERO SECTION -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b pb-3">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">1</span>
                <div>
                  <h3 class="font-heading font-bold text-lg text-forest-950">Hero Section & Founder Portrait</h3>
                  <p class="text-xs text-neutral-500">Main value proposition, hero image cutout, CTA buttons, and key stats</p>
                </div>
              </div>
            </div>

            <!-- Hero Image Asset Management -->
            <div class="p-5 rounded-2xl bg-sage-50/60 border border-neutral-200 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="block text-xs font-bold text-forest-800 uppercase">Hero Section Portrait Photo</span>
                  <span class="text-xs text-neutral-500">Upload a transparent PNG/WebP portrait or enter an image URL directly</span>
                </div>
                <div class="w-14 h-14 rounded-full border border-neutral-300 overflow-hidden bg-white flex items-center justify-center shadow-sm">
                  <img id="hero-img-preview" src="${settings.hero_image_url || '/kira_forex_portrait_transparent.png'}" alt="Preview" class="w-full h-full object-contain">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Upload New Transparent Photo</label>
                  <input type="file" id="hero-img-file" accept="image/*" onchange="uploadHeroImage(event)" class="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest-800 file:text-white hover:file:bg-forest-900 file:cursor-pointer">
                </div>
                <div>
                  <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Or Direct Photo URL</label>
                  <input type="text" id="cust-hero-img-url" value="${settings.hero_image_url || '/kira_forex_portrait_transparent.png'}" oninput="document.getElementById('hero-img-preview').src = this.value" class="w-full px-4 py-2 rounded-xl border text-sm font-mono">
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Hero Main Headline</label>
              <input type="text" id="cust-hero-headline" value="${settings.hero_headline || 'Master the Financial Markets with Precision & Discipline'}" class="w-full px-4 py-2.5 rounded-xl border text-sm font-semibold">
            </div>

            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Hero Sub-Headline Description</label>
              <textarea id="cust-hero-sub" rows="3" class="w-full px-4 py-2.5 rounded-xl border text-sm font-medium leading-relaxed">${settings.hero_subheadline || 'Institutional trading education, proven risk management tools, and an empowering community built for serious traders.'}</textarea>
            </div>

            <!-- Hero Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <span class="block text-xs font-bold text-forest-800 uppercase">Primary Hero Button</span>
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Button Text</label>
                  <input type="text" id="cust-hero-btn1-text" value="${settings.hero_btn1_text || 'Join the Telegram Community'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Destination URL</label>
                  <input type="url" id="cust-hero-btn1-url" value="${settings.primary_telegram_url || 'https://t.me/kira_forex'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
              </div>

              <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <span class="block text-xs font-bold text-forest-800 uppercase">Secondary Hero Button (Deriv Partner)</span>
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Button Text</label>
                  <input type="text" id="cust-hero-btn2-text" value="${settings.hero_btn2_text || 'Open a Deriv Account'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Destination URL</label>
                  <input type="url" id="cust-hero-btn2-url" value="${settings.hero_btn2_url || settings.deriv_affiliate_url || 'https://track.deriv.com/_eBEGHBqxmKyDrNOKR4fSNGNd7ZgqdRLk/1/'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
              </div>
            </div>

            <!-- Hero Stat Counters -->
            <div class="pt-2">
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-2">3 Highlight Statistics</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3 rounded-xl border bg-white space-y-2">
                  <input type="text" id="cust-stat1-val" value="${settings.hero_stat1_val || '100%'}" placeholder="Value" class="w-full px-3 py-1.5 rounded-lg border text-sm font-bold">
                  <input type="text" id="cust-stat1-lbl" value="${settings.hero_stat1_lbl || 'Pure Price Action'}" placeholder="Label" class="w-full px-3 py-1.5 rounded-lg border text-xs">
                </div>
                <div class="p-3 rounded-xl border bg-white space-y-2">
                  <input type="text" id="cust-stat2-val" value="${settings.hero_stat2_val || '24/7'}" placeholder="Value" class="w-full px-3 py-1.5 rounded-lg border text-sm font-bold">
                  <input type="text" id="cust-stat2-lbl" value="${settings.hero_stat2_lbl || 'Deriv Synthetics'}" placeholder="Label" class="w-full px-3 py-1.5 rounded-lg border text-xs">
                </div>
                <div class="p-3 rounded-xl border bg-white space-y-2">
                  <input type="text" id="cust-stat3-val" value="${settings.hero_stat3_val || 'Zero'}" placeholder="Value" class="w-full px-3 py-1.5 rounded-lg border text-sm font-bold">
                  <input type="text" id="cust-stat3-lbl" value="${settings.hero_stat3_lbl || 'Guaranteed Hype'}" placeholder="Label" class="w-full px-3 py-1.5 rounded-lg border text-xs">
                </div>
              </div>
            </div>
          </div>

          <!-- 2. ABOUT KIRA & PHILOSOPHY SECTION -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center gap-3 border-b pb-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <h3 class="font-heading font-bold text-lg text-forest-950">About Kira & Academy Philosophy</h3>
                <p class="text-xs text-neutral-500">Founder credentials, bio story, and philosophy quotation box</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Badge Tag</label>
                <input type="text" id="cust-about-badge" value="${settings.about_badge || 'Founder & Leader'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Section Heading</label>
                <input type="text" id="cust-about-heading" value="${settings.about_heading || 'Empowering the Next Generation of African Traders'}" class="w-full px-4 py-2 rounded-xl border text-sm font-semibold">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Founder Bio / Academy Story</label>
              <textarea id="cust-about-snippet" rows="3" class="w-full px-4 py-2.5 rounded-xl border text-sm leading-relaxed">${settings.about_snippet || ''}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bullet 1</label>
                <input type="text" id="cust-about-pt1" value="${settings.about_point1 || 'CEO of KIRAFOREX TRADING ACADEMY'}" class="w-full px-3 py-2 rounded-lg border text-xs font-medium">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bullet 2</label>
                <input type="text" id="cust-about-pt2" value="${settings.about_point2 || "Founder of AFRICA'S FEMALE FOREX TRADERS"}" class="w-full px-3 py-2 rounded-lg border text-xs font-medium">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bullet 3</label>
                <input type="text" id="cust-about-pt3" value="${settings.about_point3 || 'Certified Deriv Synthetics & Price Action Specialist'}" class="w-full px-3 py-2 rounded-lg border text-xs font-medium">
              </div>
            </div>

            <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <span class="block text-xs font-bold text-forest-800 uppercase">Core Philosophy Card</span>
              <div>
                <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Card Title</label>
                <input type="text" id="cust-phil-title" value="${settings.philosophy_title || 'The Kiraforex Core Philosophy'}" class="w-full px-3 py-2 rounded-lg border text-sm">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Quote Body</label>
                <textarea id="cust-phil-quote" rows="2" class="w-full px-3 py-2 rounded-lg border text-sm leading-relaxed">${settings.philosophy_quote || 'Trading is not a lottery or an overnight fortune. It is an intellectual discipline governed by asymmetric risk-to-reward ratios, deep understanding of liquidity pools, and unmatched emotional control.'}</textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" id="cust-phil-author" value="${settings.philosophy_author || 'Kira'}" placeholder="Author Name" class="w-full px-3 py-2 rounded-lg border text-xs font-bold">
                <input type="text" id="cust-phil-author-title" value="${settings.philosophy_author_title || 'Lead Mentor & Founder'}" placeholder="Author Title" class="w-full px-3 py-2 rounded-lg border text-xs">
              </div>
            </div>
          </div>

          <!-- 3. SECTION HEADINGS (COURSES, EVENTS, YOUTUBE) -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center gap-3 border-b pb-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <h3 class="font-heading font-bold text-lg text-forest-950">Section Headers & YouTube Callout</h3>
                <p class="text-xs text-neutral-500">Headers for Academy Courses, Workshops, and YouTube Showcases</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Courses Section Heading</label>
                <input type="text" id="cust-prog-heading" value="${settings.programs_heading || 'Structured Education Built for Mastery'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Events Section Heading</label>
                <input type="text" id="cust-event-heading" value="${settings.events_heading || 'Live Interactive Sessions & Workshops'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
            </div>

            <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <span class="block text-xs font-bold text-forest-800 uppercase">YouTube Section & Button</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Headline</label>
                  <input type="text" id="cust-yt-heading" value="${settings.youtube_heading || 'Latest Market Breakdowns & Lessons'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Button Text</label>
                  <input type="text" id="cust-yt-btn-text" value="${settings.youtube_btn_text || 'View All Videos on YouTube'}" class="w-full px-3 py-2 rounded-lg border text-sm">
                </div>
              </div>
            </div>
          </div>

          <!-- 4. COMMUNITY CALLOUT (BLACK SECTION) -->
          <div class="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div class="flex items-center gap-3 border-b pb-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">4</span>
              <div>
                <h3 class="font-heading font-bold text-lg text-forest-950">Black Community Callout Banner</h3>
                <p class="text-xs text-neutral-500">The high-impact black section with community invitation & Telegram buttons</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Headline</label>
                <input type="text" id="cust-comm-heading" value="${settings.community_heading || 'Join the Official KIRAFOREX Community'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Subheadline</label>
                <input type="text" id="cust-comm-sub" value="${settings.community_subheading || 'Connect with like-minded traders, receive live educational trade breakdowns, and stay updated on our upcoming academy workshops.'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Primary Button Text (General Telegram)</label>
                <input type="text" id="cust-comm-btn1-text" value="${settings.community_btn1_text || 'Join General Telegram (Primary)'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Secondary Button Text (Synthetics Telegram)</label>
                <input type="text" id="cust-comm-btn2-text" value="${settings.community_btn2_text || 'Join Synthetics Telegram'}" class="w-full px-4 py-2 rounded-xl border text-sm">
              </div>
            </div>
          </div>

          <!-- SUBMIT BUTTON -->
          <div class="pt-4 flex items-center justify-end gap-4">
            <button type="submit" class="px-8 py-3.5 rounded-xl bg-forest-800 text-white font-bold text-sm shadow-md hover:bg-forest-900 transition">
              Save All Customizations
            </button>
          </div>

        </form>
      </section>

      <!-- ================= 6. BRAND & SOCIAL SETTINGS ================= -->
      <section id="tab-settings" class="hidden max-w-3xl space-y-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Configuration</span>
          <h1 class="text-3xl font-heading font-extrabold text-forest-950 mt-1">Brand Links & Social Channels</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Manage community destinations, telephone hotline, and partner referral links.</p>
        </div>

        <form id="settings-form" onsubmit="saveBrandSettings(event)" class="bg-white p-7 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Primary Telegram Community URL</label>
            <input type="url" id="set-telegram" value="${settings.primary_telegram_url || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Synthetics Telegram Community URL</label>
            <input type="url" id="set-synth" value="${settings.synthetics_telegram_url || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Official Deriv Partner Referral URL</label>
            <input type="url" id="set-deriv" value="${settings.deriv_partner_url || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">WhatsApp Hotline Phone Number</label>
            <input type="text" id="set-wa-phone" value="${settings.whatsapp_phone || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Direct Call Phone Number</label>
            <input type="text" id="set-phone" value="${settings.call_phone || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">YouTube Channel URL</label>
            <input type="url" id="set-youtube" value="${settings.youtube_url || ''}" class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-sm shadow-sm hover:bg-forest-900 transition">
            Save Settings
          </button>
        </form>
      </section>

    </main>

  </div>

  <!-- PROGRAM MODAL (COURSES & MENTORSHIPS) -->
  <div id="program-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
        <h3 id="prog-modal-title" class="font-heading font-extrabold text-2xl text-forest-950">Add Academy Program</h3>
        <button onclick="closeProgramModal()" class="text-neutral-400 hover:text-neutral-900 font-bold text-xl">✕</button>
      </div>

      <form id="program-form" onsubmit="submitProgramForm(event)" class="space-y-4">
        <input type="hidden" id="prog-id">

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Program Title</label>
          <input type="text" id="prog-title" required class="w-full px-4 py-2.5 rounded-xl border text-sm font-semibold" placeholder="e.g. 1-on-1 VIP Mentorship">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Category / Badge</label>
            <select id="prog-category" class="w-full px-4 py-2.5 rounded-xl border text-sm font-semibold bg-white">
              <option value="Foundational Course">Foundational Course</option>
              <option value="Synthetics Specialization">Synthetics Specialization</option>
              <option value="Private Coaching">Private Coaching</option>
              <option value="Advanced Masterclass">Advanced Masterclass</option>
              <option value="Intensive Bootcamp">Intensive Bootcamp</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Tuition Fee ($ USD)</label>
            <input type="number" step="0.01" id="prog-price" value="150.00" required class="w-full px-4 py-2.5 rounded-xl border text-sm font-semibold">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Short Description</label>
          <textarea id="prog-short-desc" rows="2" required class="w-full px-4 py-2 rounded-xl border text-sm" placeholder="Concise overview for course card"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Duration</label>
            <input type="text" id="prog-duration" value="6 Weeks" required class="w-full px-4 py-2 rounded-xl border text-sm font-medium">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Delivery Format</label>
            <input type="text" id="prog-delivery" value="Live Interactive Masterclass & Video Vault" required class="w-full px-4 py-2 rounded-xl border text-sm font-medium">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Curriculum Features / Modules (1 per line)</label>
          <textarea id="prog-features" rows="4" required class="w-full px-4 py-2 rounded-xl border text-sm font-medium" placeholder="Platform Mastery (MT5 & TradingView)&#10;Risk-to-Reward Protocols&#10;Live Weekly Q&A"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">CTA Button Text</label>
            <input type="text" id="prog-cta-text" value="Enroll via WhatsApp" required class="w-full px-4 py-2 rounded-xl border text-sm font-medium">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Publication Status</label>
            <select id="prog-status" class="w-full px-4 py-2 rounded-xl border text-sm font-semibold bg-white">
              <option value="published">Published (Visible on site)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t">
          <button type="button" onclick="closeProgramModal()" class="px-5 py-2.5 rounded-xl border text-sm font-bold text-neutral-600 hover:bg-neutral-100">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-bold shadow-sm hover:bg-forest-900 transition">
            Save Program
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- EVENT MODAL (CREATE / EDIT) -->
  <div id="event-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
        <h3 id="modal-title" class="font-heading font-extrabold text-2xl text-forest-950">Create New Event</h3>
        <button onclick="closeEventModal()" class="text-neutral-400 hover:text-neutral-900 font-bold text-xl">✕</button>
      </div>

      <form id="event-form" onsubmit="submitEventForm(event)" class="space-y-4">
        <input type="hidden" id="event-id">

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Event Title</label>
          <input type="text" id="evt-title" required class="w-full px-4 py-2 rounded-xl border text-sm font-semibold" placeholder="e.g. Beginner Forex Trading Class">
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Short Description</label>
          <textarea id="evt-desc" rows="2" required class="w-full px-4 py-2 rounded-xl border text-sm" placeholder="Summary for event card"></textarea>
        </div>

        <div class="p-4 rounded-2xl bg-sage-50 border border-neutral-200 space-y-3">
          <label class="block text-xs font-bold text-forest-800 uppercase">
            Event Cover Image / Thumbnail (Uniform Flyer Ratio: 818×1024 / 4:5 Portrait)
          </label>
          <div class="flex items-center gap-4">
            <input type="file" id="evt-file" accept="image/*" onchange="previewThumbnailFile(event)" class="text-xs text-neutral-600">
          </div>
          <div class="relative w-full aspect-[818/1024] bg-neutral-100 rounded-xl overflow-hidden border border-neutral-300 flex items-center justify-center">
            <img id="evt-thumb-preview" src="/events/beginner_class_event_flyer.jpg" alt="Preview" class="w-full h-full object-contain">
          </div>
          <input type="hidden" id="evt-thumb-url" value="/events/beginner_class_event_flyer.jpg">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Fee Amount ($ USD)</label>
            <input type="number" step="0.01" id="evt-price" value="50.00" required class="w-full px-4 py-2 rounded-xl border text-sm font-semibold">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Venue Format</label>
            <select id="evt-venue" class="w-full px-4 py-2 rounded-xl border text-sm font-semibold bg-white">
              <option value="Online (Live Interactive Masterclass)">Online (Live Interactive Masterclass)</option>
              <option value="In-Person (Accra, Ghana)">In-Person (Accra, Ghana)</option>
              <option value="Hybrid Workshop">Hybrid Workshop</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Start Date & Time</label>
            <input type="datetime-local" id="evt-start" required class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Automatic Expiry Date & Time</label>
            <input type="datetime-local" id="evt-expiry" required class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Booking WhatsApp Number</label>
            <input type="text" id="evt-wa" value="+233 502 75 8608" required class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Booking Call Hotline</label>
            <input type="text" id="evt-call" value="+233 594 86 2521" required class="w-full px-4 py-2 rounded-xl border text-sm">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase mb-1">Status</label>
          <select id="evt-status" class="w-full px-4 py-2 rounded-xl border text-sm font-semibold bg-white">
            <option value="published">Published (Visible on site until expiry)</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t">
          <button type="button" onclick="closeEventModal()" class="px-5 py-2.5 rounded-xl border text-sm font-bold text-neutral-600 hover:bg-neutral-100">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-bold shadow-sm hover:bg-forest-900 transition">
            Save Event
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const eventsData = ${JSON.stringify(events)};
    const programsData = ${JSON.stringify(services)};

    function showTab(tab) {
      ['analytics', 'programs', 'events', 'enquiries', 'customize', 'settings'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const btn = document.getElementById('nav-' + t);
        if (el) el.classList.add('hidden');
        if (btn) {
          btn.classList.remove('bg-forest-800', 'text-white');
          btn.classList.add('text-neutral-300');
        }
      });
      const activeEl = document.getElementById('tab-' + tab);
      const activeBtn = document.getElementById('nav-' + tab);
      if (activeEl) activeEl.classList.remove('hidden');
      if (activeBtn) {
        activeBtn.classList.add('bg-forest-800', 'text-white');
        activeBtn.classList.remove('text-neutral-300');
      }
    }

    // --- Programs CRUD ---
    function openProgramModal() {
      document.getElementById('prog-modal-title').innerText = 'Add Academy Program';
      document.getElementById('prog-id').value = '';
      document.getElementById('prog-title').value = '';
      document.getElementById('prog-category').value = 'Foundational Course';
      document.getElementById('prog-price').value = '150.00';
      document.getElementById('prog-short-desc').value = '';
      document.getElementById('prog-duration').value = '6 Weeks';
      document.getElementById('prog-delivery').value = 'Live Interactive Masterclass & Video Vault';
      document.getElementById('prog-features').value = 'Platform Mastery (MT5 & TradingView)\\nInstitutional Risk Protocols\\nLive Weekly Q&A';
      document.getElementById('prog-cta-text').value = 'Enroll via WhatsApp';
      document.getElementById('prog-status').value = 'published';

      document.getElementById('program-modal').classList.remove('hidden');
    }

    function editProgram(id) {
      const p = programsData.find(item => item.id === id);
      if (!p) return;
      document.getElementById('prog-modal-title').innerText = 'Edit Program: ' + p.title;
      document.getElementById('prog-id').value = p.id;
      document.getElementById('prog-title').value = p.title;
      document.getElementById('prog-category').value = p.category || 'Foundational Course';
      document.getElementById('prog-price').value = p.price_amount;
      document.getElementById('prog-short-desc').value = p.short_description;
      document.getElementById('prog-duration').value = p.duration;
      document.getElementById('prog-delivery').value = p.delivery_format;
      document.getElementById('prog-features').value = (p.features || []).join('\\n');
      document.getElementById('prog-cta-text').value = p.cta_text || 'Enroll via WhatsApp';
      document.getElementById('prog-status').value = p.status || 'published';

      document.getElementById('program-modal').classList.remove('hidden');
    }

    function closeProgramModal() {
      document.getElementById('program-modal').classList.add('hidden');
    }

    function submitProgramForm(e) {
      e.preventDefault();
      const id = document.getElementById('prog-id').value;
      const featuresRaw = document.getElementById('prog-features').value;
      const payload = {
        title: document.getElementById('prog-title').value,
        category: document.getElementById('prog-category').value,
        price_amount: parseFloat(document.getElementById('prog-price').value) || 0,
        short_description: document.getElementById('prog-short-desc').value,
        duration: document.getElementById('prog-duration').value,
        delivery_format: document.getElementById('prog-delivery').value,
        features: featuresRaw.split('\\n').map(s => s.trim()).filter(Boolean),
        cta_text: document.getElementById('prog-cta-text').value,
        status: document.getElementById('prog-status').value,
      };

      const endpoint = id ? '/api/admin/services/' + id : '/api/admin/services';
      const method = id ? 'PUT' : 'POST';

      fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(d => {
        alert('Academy program saved successfully!');
        location.reload();
      });
    }

    function deleteProgram(id) {
      if (!confirm('Are you sure you want to delete this program?')) return;
      fetch('/api/admin/services/' + id, { method: 'DELETE' })
        .then(r => r.json())
        .then(d => {
          alert('Program deleted.');
          location.reload();
        });
    }

    // --- Events CRUD ---
    function openNewEventModal() {
      document.getElementById('modal-title').innerText = 'Create New Event';
      document.getElementById('event-id').value = '';
      document.getElementById('evt-title').value = '';
      document.getElementById('evt-desc').value = '';
      document.getElementById('evt-price').value = '50.00';
      document.getElementById('evt-thumb-url').value = '/events/beginner_class_event_flyer.jpg';
      document.getElementById('evt-thumb-preview').src = '/events/beginner_class_event_flyer.jpg';
      
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 86400000);
      document.getElementById('evt-start').value = now.toISOString().slice(0, 16);
      document.getElementById('evt-expiry').value = nextWeek.toISOString().slice(0, 16);

      document.getElementById('event-modal').classList.remove('hidden');
    }

    function editEvent(id) {
      const e = eventsData.find(item => item.id === id);
      if (!e) return;
      document.getElementById('modal-title').innerText = 'Edit Event: ' + e.title;
      document.getElementById('event-id').value = e.id;
      document.getElementById('evt-title').value = e.title;
      document.getElementById('evt-desc').value = e.short_description;
      document.getElementById('evt-price').value = e.price_amount;
      document.getElementById('evt-thumb-url').value = e.thumbnail_url;
      document.getElementById('evt-thumb-preview').src = e.thumbnail_url;
      document.getElementById('evt-venue').value = e.venue_type;
      document.getElementById('evt-wa').value = e.booking_whatsapp;
      document.getElementById('evt-call').value = e.booking_call;
      document.getElementById('evt-status').value = e.status;
      document.getElementById('evt-start').value = new Date(e.start_date).toISOString().slice(0, 16);
      document.getElementById('evt-expiry').value = new Date(e.expiry_date).toISOString().slice(0, 16);

      document.getElementById('event-modal').classList.remove('hidden');
    }

    function closeEventModal() {
      document.getElementById('event-modal').classList.add('hidden');
    }

    function previewThumbnailFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        document.getElementById('evt-thumb-preview').src = dataUrl;

        fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl: dataUrl })
        })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            document.getElementById('evt-thumb-url').value = d.url;
          }
        });
      };
      reader.readAsDataURL(file);
    }

    function submitEventForm(e) {
      e.preventDefault();
      const id = document.getElementById('event-id').value;
      const payload = {
        title: document.getElementById('evt-title').value,
        short_description: document.getElementById('evt-desc').value,
        price_amount: parseFloat(document.getElementById('evt-price').value) || 0,
        thumbnail_url: document.getElementById('evt-thumb-url').value,
        venue_type: document.getElementById('evt-venue').value,
        booking_whatsapp: document.getElementById('evt-wa').value,
        booking_call: document.getElementById('evt-call').value,
        start_date: new Date(document.getElementById('evt-start').value).toISOString(),
        expiry_date: new Date(document.getElementById('evt-expiry').value).toISOString(),
        status: document.getElementById('evt-status').value,
      };

      const endpoint = id ? '/api/admin/events/' + id : '/api/admin/events';
      const method = id ? 'PUT' : 'POST';

      fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(d => {
        alert('Event successfully saved!');
        location.reload();
      });
    }

    function deleteEvent(id) {
      if (!confirm('Are you sure you want to delete this event?')) return;
      fetch('/api/admin/events/' + id, { method: 'DELETE' })
        .then(r => r.json())
        .then(d => {
          alert('Event deleted.');
          location.reload();
        });
    }

    // --- Leads Status & Delete ---
    function updateLeadStatus(id, newStatus) {
      fetch('/api/admin/enquiries/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      .then(r => r.json())
      .then(d => {
        alert('Lead status updated to ' + newStatus);
      });
    }

    function deleteLead(id, name) {
      if (!confirm('Are you sure you want to permanently delete lead from "' + name + '"?')) return;
      fetch('/api/admin/enquiries/' + id, { method: 'DELETE' })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            const row = document.getElementById('lead-row-' + id);
            if (row) {
              row.style.transition = 'all 0.3s ease';
              row.style.opacity = '0';
              setTimeout(() => row.remove(), 300);
            } else {
              location.reload();
            }
          } else {
            alert('Error deleting lead: ' + (d.error || 'Unknown error'));
          }
        })
        .catch(err => alert('Network error: ' + err.message));
    }

    // --- Content & Copy ---
    // --- Hero Image Upload ---
    function uploadHeroImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'hero_' + file.name, dataUrl: evt.target.result })
        })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            document.getElementById('cust-hero-img-url').value = d.url;
            document.getElementById('hero-img-preview').src = d.url;
            alert('Hero portrait uploaded! Click Save All Changes to persist it.');
          } else {
            alert('Upload error: ' + d.error);
          }
        });
      };
      reader.readAsDataURL(file);
    }

    // --- Theme & Color Engine ---
    function applyColorPreset(name, accent, darkAccent, bg, mode) {
      document.getElementById('cust-accent-color').value = accent;
      document.getElementById('cust-accent-color-picker').value = accent;
      document.getElementById('cust-bg-color').value = bg;
      document.getElementById('cust-bg-color-picker').value = bg;
      document.getElementById('cust-theme-mode').value = mode;
      previewColorChange();
    }

    function previewColorChange() {
      const accent = document.getElementById('cust-accent-color').value;
      const bg = document.getElementById('cust-bg-color').value;
      const mode = document.getElementById('cust-theme-mode').value;

      const previewBox = document.getElementById('color-preview-box');
      const ind = document.getElementById('color-preview-indicator');
      const btn = document.getElementById('color-preview-btn');
      const title = document.getElementById('color-preview-title');

      if (previewBox) {
        previewBox.style.backgroundColor = mode === 'dark' ? '#0A0A0A' : bg;
      }
      if (ind) ind.style.backgroundColor = accent;
      if (btn) btn.style.backgroundColor = accent;
      if (title) {
        title.style.color = mode === 'dark' ? '#FFFFFF' : '#111814';
      }
    }

    // --- Typography Live Preview ---
    function previewFontChange() {
      const hFont = document.getElementById('cust-font-heading').value;
      const bFont = document.getElementById('cust-font-body').value;
      const scale = document.getElementById('cust-font-scale').value;
      
      const hEl = document.getElementById('font-preview-h');
      const pEl = document.getElementById('font-preview-p');
      if (hEl) {
        hEl.style.fontFamily = hFont + ', sans-serif';
        hEl.style.fontSize = 'calc(1.5rem * ' + scale + ')';
      }
      if (pEl) {
        pEl.style.fontFamily = bFont + ', sans-serif';
        pEl.style.fontSize = 'calc(0.875rem * ' + scale + ')';
      }
    }

    // --- Full Site Customizer Save ---
    function saveFullCustomizer(e) {
      e.preventDefault();
      const payload = {
        // Theme & Color Palette
        theme_mode: document.getElementById('cust-theme-mode').value,
        brand_accent_color: document.getElementById('cust-accent-color').value,
        theme_bg_color: document.getElementById('cust-bg-color').value,

        // Typography & Global Font Sizing
        font_heading: document.getElementById('cust-font-heading').value,
        font_body: document.getElementById('cust-font-body').value,
        font_scale: document.getElementById('cust-font-scale').value,

        // Hero Section
        hero_image_url: document.getElementById('cust-hero-img-url').value,
        hero_headline: document.getElementById('cust-hero-headline').value,
        hero_subheadline: document.getElementById('cust-hero-sub').value,
        hero_btn1_text: document.getElementById('cust-hero-btn1-text').value,
        primary_telegram_url: document.getElementById('cust-hero-btn1-url').value,
        hero_btn2_text: document.getElementById('cust-hero-btn2-text').value,
        hero_btn2_url: document.getElementById('cust-hero-btn2-url').value,
        hero_stat1_val: document.getElementById('cust-stat1-val').value,
        hero_stat1_lbl: document.getElementById('cust-stat1-lbl').value,
        hero_stat2_val: document.getElementById('cust-stat2-val').value,
        hero_stat2_lbl: document.getElementById('cust-stat2-lbl').value,
        hero_stat3_val: document.getElementById('cust-stat3-val').value,
        hero_stat3_lbl: document.getElementById('cust-stat3-lbl').value,

        // About & Philosophy
        about_badge: document.getElementById('cust-about-badge').value,
        about_heading: document.getElementById('cust-about-heading').value,
        about_snippet: document.getElementById('cust-about-snippet').value,
        about_point1: document.getElementById('cust-about-pt1').value,
        about_point2: document.getElementById('cust-about-pt2').value,
        about_point3: document.getElementById('cust-about-pt3').value,
        philosophy_title: document.getElementById('cust-phil-title').value,
        philosophy_quote: document.getElementById('cust-phil-quote').value,
        philosophy_author: document.getElementById('cust-phil-author').value,
        philosophy_author_title: document.getElementById('cust-phil-author-title').value,

        // Section Headers
        programs_heading: document.getElementById('cust-prog-heading').value,
        events_heading: document.getElementById('cust-event-heading').value,
        youtube_heading: document.getElementById('cust-yt-heading').value,
        youtube_btn_text: document.getElementById('cust-yt-btn-text').value,

        // Community Callout
        community_heading: document.getElementById('cust-comm-heading').value,
        community_subheading: document.getElementById('cust-comm-sub').value,
        community_btn1_text: document.getElementById('cust-comm-btn1-text').value,
        community_btn2_text: document.getElementById('cust-comm-btn2-text').value,
      };

      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          alert('✓ Website customizations saved successfully! Both public site and CMS are synced.');
        } else {
          alert('Error saving customizations: ' + (d.error || 'Unknown error'));
        }
      })
      .catch(err => alert('Network error: ' + err.message));
    }

    function saveBrandSettings(e) {
      e.preventDefault();
      const payload = {
        primary_telegram_url: document.getElementById('set-telegram').value,
        synthetics_telegram_url: document.getElementById('set-synth').value,
        deriv_partner_url: document.getElementById('set-deriv').value,
        whatsapp_phone: document.getElementById('set-wa-phone').value,
        call_phone: document.getElementById('set-phone').value,
        youtube_url: document.getElementById('set-youtube').value,
      };

      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(d => {
        alert('Settings saved!');
      });
    }
  </script>
</body>
</html>`;
}

// ==============================================================================
// START SERVERS & SERVERLESS EXPORTS
// ==============================================================================
const FRONTEND_PORT = process.env.PORT || process.env.FRONTEND_PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

// Standalone local execution check
if (require.main === module) {
  frontendServer.listen(FRONTEND_PORT, () => {
    console.log('✓ KIRAFOREX Public Website running at http://localhost:' + FRONTEND_PORT);
  });

  adminServer.listen(ADMIN_PORT, () => {
    console.log('✓ KIRAFOREX Admin CMS Dashboard running at http://localhost:' + ADMIN_PORT);
  });
}

// Serverless handler export for Vercel
module.exports = (req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  // Route admin subdomains or /admin prefix to adminServer
  if (host.startsWith('admin.') || host.startsWith('cms.') || req.url.startsWith('/admin')) {
    if (req.url.startsWith('/admin')) {
      req.url = req.url.replace(/^\/admin/, '') || '/';
    }
    return adminServer.emit('request', req, res);
  }
  return frontendServer.emit('request', req, res);
};
