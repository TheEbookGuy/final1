// ============================================================
// Urban Mining Connect - app.js
// ============================================================
// IMPORTANT:
// API configuration is handled by config.js.
// Make sure config.js is loaded BEFORE app.js.
// ============================================================


// ============================================================
// MATERIALS
// ============================================================

const materials = [
  {
    id: 'iron',
    group: 'Ferrous',
    name: 'Iron',
    icon: '🔩',
    rate: 38,
    unit: 'kg',
    trend: 'up',
    delta: '+₹2'
  },

  {
    id: 'steel',
    group: 'Ferrous',
    name: 'Steel',
    icon: '🏗️',
    rate: 42,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady'
  },

  {
    id: 'aluminium',
    group: 'Non-Ferrous',
    name: 'Aluminium',
    icon: '🥫',
    rate: 155,
    unit: 'kg',
    trend: 'up',
    delta: '+₹5'
  },

  {
    id: 'copper',
    group: 'Non-Ferrous',
    name: 'Copper',
    icon: '🟠',
    rate: 690,
    unit: 'kg',
    trend: 'up',
    delta: '+₹12'
  },

  {
    id: 'brass',
    group: 'Non-Ferrous',
    name: 'Brass',
    icon: '🟡',
    rate: 510,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady'
  },

  {
    id: 'lithium',
    group: 'Critical Minerals',
    name: 'Lithium-bearing battery',
    icon: '🔋',
    rate: 125,
    unit: 'kg',
    trend: 'up',
    delta: '+₹4'
  },

  {
    id: 'magnet',
    group: 'Critical Minerals',
    name: 'Magnet / rare-earth bearing',
    icon: '🧲',
    rate: 180,
    unit: 'kg',
    trend: 'flat',
    delta: 'indicative'
  },

  {
    id: 'pcb',
    group: 'E-Waste',
    name: 'PCB',
    icon: '🟩',
    rate: 310,
    unit: 'kg',
    trend: 'up',
    delta: '+₹8'
  },

  {
    id: 'cable',
    group: 'E-Waste',
    name: 'Copper cable & wire',
    icon: '🔌',
    rate: 265,
    unit: 'kg',
    trend: 'up',
    delta: '+₹6'
  },

  {
    id: 'panel',
    group: 'E-Waste',
    name: 'LCD / LED panel',
    icon: '🖥️',
    rate: 72,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady'
  },

  {
    id: 'battery',
    group: 'E-Waste',
    name: 'Battery',
    icon: '🔋',
    rate: 92,
    unit: 'kg',
    trend: 'down',
    delta: '−₹3'
  },

  {
    id: 'mixedmetal',
    group: 'Mixed Scrap',
    name: 'Mixed metal',
    icon: '🧰',
    rate: 55,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady'
  }
];


// ============================================================
// FACILITIES
// ============================================================

const facilities = [];


// ============================================================
// APPLICATION STATE
// ============================================================

const state = {

  lots: JSON.parse(
    localStorage.getItem('um_lots') || '[]'
  ),

  lang: localStorage.getItem('um_lang') || 'Hindi',

  ready: false,

  user: null

};


// ============================================================
// SAVE LOCAL DATA
// ============================================================

function save() {

  localStorage.setItem(
    'um_lots',
    JSON.stringify(state.lots)
  );

}


// ============================================================
// FORMAT MONEY
// ============================================================

function fmt(n) {

  return '₹' +
    Number(n || 0).toLocaleString('en-IN');

}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speak(text) {

  if ('speechSynthesis' in window) {

    speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      state.lang === 'Marathi'
        ? 'mr-IN'
        : 'hi-IN';

    speechSynthesis.speak(utterance);

  }

}


// ============================================================
// API
// ============================================================
// IMPORTANT:
// The actual api() function is now inside config.js.
// Do NOT define another api() function here.
// ============================================================


// ============================================================
// LOAD BACKEND DATA
// ============================================================

async function hydrate() {

  try {

    const data = await api('/bootstrap');

    if (
      data &&
      Array.isArray(data.materials) &&
      data.materials.length
    ) {

      materials.splice(
        0,
        materials.length,
        ...data.materials
      );

    }


    if (
      data &&
      Array.isArray(data.facilities) &&
      data.facilities.length
    ) {

      facilities.splice(
        0,
        facilities.length,
        ...data.facilities
      );

    }


    if (
      data &&
      Array.isArray(data.lots)
    ) {

      state.lots = data.lots;

      save();

    }


    state.user =
      data && data.user
        ? data.user
        : null;

    state.ready = true;


    window.dispatchEvent(
      new CustomEvent(
        'um:ready',
        {
          detail: data
        }
      )
    );


    updateAuthUI();

  }

  catch (error) {

    console.error(
      'Urban Mining Connect bootstrap error:',
      error
    );


    state.ready = false;


    window.dispatchEvent(
      new CustomEvent(
        'um:ready',
        {
          detail: null
        }
      )
    );


    updateAuthUI();

  }

}


// ============================================================
// WAIT UNTIL APPLICATION IS READY
// ============================================================

function whenReady(fn) {

  if (state.ready) {

    fn();

  }

  else {

    window.addEventListener(
      'um:ready',
      fn,
      {
        once: true
      }
    );

  }

}


// ============================================================
// WEBSITE HEADER / NAVIGATION
// ============================================================

function shell(active) {

  document.write(`

    <header class="topbar">

      <a
        class="brand"
        href="index.html"
      >

        <span class="brandmark">
          ♻
        </span>

        <span>
          Urban Mining Connect
        </span>

      </a>


      <div class="profile">

        <span class="badge blue">
          SECONDARY RAW MATERIALS
        </span>

        <span id="authArea">

          <a
            class="btn btn-soft"
            href="login.html"
          >
            Login
          </a>

        </span>

      </div>

    </header>


    <nav class="nav">

      <a
        href="index.html"
        class="${active === 'Home' ? 'active' : ''}"
      >
        ⌂ Home
      </a>


      <a
        href="capture.html"
        class="${active === 'Capture' ? 'active' : ''}"
      >
        ＋ Capture
      </a>


      <a
        href="materials.html"
        class="${active === 'Materials' ? 'active' : ''}"
      >
        ◈ Materials
      </a>


      <a
        href="prices.html"
        class="${active === 'Valuation' ? 'active' : ''}"
      >
        ₹ Valuation
      </a>


      <a
        href="matches.html"
        class="${active === 'Buyers' ? 'active' : ''}"
      >
        ✓ Buyers
      </a>


      <a
        href="handover.html"
        class="${active === 'Traceability' ? 'active' : ''}"
      >
        ⌁ Traceability
      </a>


      <a
        href="recovery.html"
        class="${active === 'Recovery' ? 'active' : ''}"
      >
        ◔ Recovery
      </a>


      <a
        href="earnings.html"
        class="${active === 'Earnings' ? 'active' : ''}"
      >
        ▣ Ledger
      </a>

    </nav>

  `);

}


// ============================================================
// UPDATE LOGIN / USER AREA
// ============================================================

function updateAuthUI() {

  const element =
    document.getElementById('authArea');


  if (!element) {

    return;

  }


  if (state.user) {

    const label =
      state.user.role === 'buyer'
        ? 'Buyer'
        : 'Collector';


    element.innerHTML = `

      <span class="badge ok">

        ${label}:
        ${escapeHTML(state.user.name || '')}

      </span>

      <button
        class="btn btn-soft"
        onclick="logout()"
      >
        Logout
      </button>

    `;

  }

  else {

    element.innerHTML = `

      <a
        class="btn btn-soft"
        href="login.html"
      >
        Login
      </a>

      <a
        class="btn btn-primary"
        href="signup.html"
      >
        Sign up
      </a>

    `;

  }

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {

    await api(
      '/auth/logout',
      {
        method: 'POST'
      }
    );

  }

  catch (error) {

    console.warn(
      'Logout request failed:',
      error
    );

  }


  state.user = null;

  localStorage.removeItem('um_lots');

  location.href = 'login.html';

}


// ============================================================
// REQUIRE AUTHENTICATION
// ============================================================

async function requireAuth(role) {

  try {

    const data =
      await api('/auth/me');


    state.user =
      data && data.user
        ? data.user
        : null;


    if (!state.user) {

      location.href =
        'login.html?next=' +
        encodeURIComponent(
          location.pathname +
          location.search
        );

      return false;

    }


    if (
      role &&
      state.user.role !== role
    ) {

      if (
        state.user.role === 'buyer'
      ) {

        location.href =
          'console.html';

      }

      else {

        location.href =
          'index.html';

      }

      return false;

    }


    updateAuthUI();

    return true;

  }

  catch (error) {

    console.error(
      'Authentication check failed:',
      error
    );


    location.href =
      'login.html';

    return false;

  }

}


// ============================================================
// INITIALIZE APPLICATION
// ============================================================

hydrate();


// ============================================================
// OPTIONAL GLOBAL EXPORTS
// ============================================================

window.materials = materials;
window.facilities = facilities;
window.state = state;
window.save = save;
window.fmt = fmt;
window.speak = speak;
window.whenReady = whenReady;
window.shell = shell;
window.updateAuthUI = updateAuthUI;
window.logout = logout;
window.requireAuth = requireAuth;

Very important

Your files should now be:

your-project/
│
├── index.html
├── signup.html
├── login.html
├── config.js       ← Render URL + api()
├── app.js          ← code above
├── style.css
├── console.html
├── capture.html
├── materials.html
├── prices.html
├── matches.html
├── handover.html
├── recovery.html
└── earnings.html

And in "signup.html", keep these in this exact order:

<script src="config.js"></script>
<script src="app.js"></script>

Your signup request will then use:

POST https://final1-2.onrender.com/api/auth/signup

instead of the old "/api/auth/signup" being sent to the frontend itself.

One important point: if you still get "405 Not Allowed" after this change, the remaining issue is almost certainly in your Render backend route/deployment, not this "app.js". In that case, send me your "server.js", and I'll fix the backend route too.
