```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(__dirname, 'data');
const DB = path.join(DATA, 'db.json');
const UP = path.join(DATA, 'uploads');

fs.mkdirSync(UP, { recursive: true });

/* =========================================================
   CORS
   Frontend:
   https://theebookguy.github.io/final1/

   IMPORTANT:
   CORS uses the ORIGIN only, not /final1/
========================================================= */

const ALLOWED_ORIGINS = [
  'https://theebookguy.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function corsHeaders(req) {
  const origin = req.headers.origin;

  const headers = {
    'Access-Control-Allow-Methods':
      'GET,POST,PUT,OPTIONS',

    'Access-Control-Allow-Headers':
      'Content-Type',

    'Access-Control-Allow-Credentials':
      'true',

    'Vary': 'Origin'
  };

  if (
    origin &&
    ALLOWED_ORIGINS.includes(origin)
  ) {
    headers['Access-Control-Allow-Origin'] =
      origin;
  }

  return headers;
}

/* =========================================================
   MATERIALS
========================================================= */

const seedMaterials = [
  {
    id: 'iron',
    group: 'Ferrous',
    name: 'Iron',
    icon: '🔩',
    rate: 38,
    unit: 'kg',
    trend: 'up',
    delta: '+₹2',
    source_type: 'seed'
  },
  {
    id: 'steel',
    group: 'Ferrous',
    name: 'Steel',
    icon: '🏗️',
    rate: 42,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady',
    source_type: 'seed'
  },
  {
    id: 'aluminium',
    group: 'Non-Ferrous',
    name: 'Aluminium',
    icon: '🥫',
    rate: 155,
    unit: 'kg',
    trend: 'up',
    delta: '+₹5',
    source_type: 'seed'
  },
  {
    id: 'copper',
    group: 'Non-Ferrous',
    name: 'Copper',
    icon: '🟠',
    rate: 690,
    unit: 'kg',
    trend: 'up',
    delta: '+₹12',
    source_type: 'seed'
  },
  {
    id: 'brass',
    group: 'Non-Ferrous',
    name: 'Brass',
    icon: '🟡',
    rate: 510,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady',
    source_type: 'seed'
  },
  {
    id: 'lithium',
    group: 'Critical Minerals',
    name: 'Lithium-bearing battery',
    icon: '🔋',
    rate: 125,
    unit: 'kg',
    trend: 'up',
    delta: '+₹4',
    source_type: 'seed'
  },
  {
    id: 'magnet',
    group: 'Critical Minerals',
    name: 'Magnet / rare-earth bearing',
    icon: '🧲',
    rate: 180,
    unit: 'kg',
    trend: 'flat',
    delta: 'indicative',
    source_type: 'seed'
  },
  {
    id: 'pcb',
    group: 'E-Waste',
    name: 'PCB',
    icon: '🟩',
    rate: 310,
    unit: 'kg',
    trend: 'up',
    delta: '+₹8',
    source_type: 'seed'
  },
  {
    id: 'cable',
    group: 'E-Waste',
    name: 'Copper cable & wire',
    icon: '🔌',
    rate: 265,
    unit: 'kg',
    trend: 'up',
    delta: '+₹6',
    source_type: 'seed'
  },
  {
    id: 'panel',
    group: 'E-Waste',
    name: 'LCD / LED panel',
    icon: '🖥️',
    rate: 72,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady',
    source_type: 'seed'
  },
  {
    id: 'battery',
    group: 'E-Waste',
    name: 'Battery',
    icon: '🔋',
    rate: 92,
    unit: 'kg',
    trend: 'down',
    delta: '−₹3',
    source_type: 'seed'
  },
  {
    id: 'mixedmetal',
    group: 'Mixed Scrap',
    name: 'Mixed metal',
    icon: '🧰',
    rate: 55,
    unit: 'kg',
    trend: 'flat',
    delta: 'steady',
    source_type: 'seed'
  }
];

/* =========================================================
   FACILITIES
========================================================= */

const seedFacilities = [
  {
    id: 'FAC-GREENLOOP',
    name: 'GreenLoop Materials',
    type: 'Authorized Recycler',
    dist: '8 km',
    rate: 320,
    auth: 'Authorization verified',
    score: 96,
    pickup: true,
    materials: 'E-waste • PCB • Cable',
    authorization_status: 'active'
  },
  {
    id: 'FAC-SHAKTI',
    name: 'Shakti Metal Recovery',
    type: 'Authorized Processor',
    dist: '12 km',
    rate: 48,
    auth: 'Authorization verified',
    score: 92,
    pickup: true,
    materials: 'Iron • Steel • Aluminium',
    authorization_status: 'active'
  },
  {
    id: 'FAC-URBANMET',
    name: 'UrbanMet Secondarys',
    type: 'Aggregator',
    dist: '5 km',
    rate: 44,
    auth: 'Registration verified',
    score: 88,
    pickup: false,
    materials: 'Ferrous • Mixed metal',
    authorization_status: 'active'
  },
  {
    id: 'FAC-CIRCULAR',
    name: 'Circular Minerals Hub',
    type: 'Authorized Processor',
    dist: '21 km',
    rate: 710,
    auth: 'Authorization verified',
    score: 94,
    pickup: true,
    materials: 'Copper • Critical mineral streams',
    authorization_status: 'active'
  }
];

/* =========================================================
   DATABASE
========================================================= */

function load() {
  if (!fs.existsSync(DB)) {
    const x = {
      materials: seedMaterials,
      facilities: seedFacilities,
      users: [],
      lots: [],
      handovers: [],
      events: []
    };

    fs.writeFileSync(
      DB,
      JSON.stringify(x, null, 2)
    );

    return x;
  }

  const x = JSON.parse(
    fs.readFileSync(DB, 'utf8')
  );

  x.materials ??= seedMaterials;
  x.facilities ??= seedFacilities;
  x.users ??= [];
  x.lots ??= [];
  x.handovers ??= [];
  x.events ??= [];

  return x;
}

let db = load();

function persist() {
  fs.writeFileSync(
    DB,
    JSON.stringify(db, null, 2)
  );
}

/* =========================================================
   SESSIONS
========================================================= */

const sessions = new Map();

/* =========================================================
   JSON RESPONSE
========================================================= */

function json(
  res,
  status,
  obj,
  extra = {}
) {
  const body = JSON.stringify(obj);

  res.writeHead(status, {
    'Content-Type':
      'application/json; charset=utf-8',

    'Cache-Control':
      'no-store',

    ...extra
  });

  res.end(body);
}

/* =========================================================
   CSV
========================================================= */

function csvEscape(v) {
  return '"' +
    String(v ?? '')
      .replaceAll('"', '""') +
    '"';
}

/* =========================================================
   REQUEST BODY
========================================================= */

function body(req) {
  return new Promise(
    (resolve, reject) => {

      let b = '';

      req.on('data', chunk => {

        b += chunk;

        if (b.length > 15e6) {
          req.destroy();
        }
      });

      req.on('end', () => {

        try {
          resolve(
            b
              ? JSON.parse(b)
              : {}
          );
        } catch (e) {
          reject(e);
        }
      });

      req.on('error', reject);
    }
  );
}

/* =========================================================
   ID
========================================================= */

function id(prefix = 'UM') {
  return prefix +
    '-' +
    crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase();
}

/* =========================================================
   PASSWORD
========================================================= */

function hashPassword(
  password,
  salt =
    crypto
      .randomBytes(16)
      .toString('hex')
) {
  return {
    salt,

    hash:
      crypto
        .scryptSync(
          password,
          salt,
          64
        )
        .toString('hex')
  };
}

function verifyPassword(
  password,
  user
) {

  const calculated =
    Buffer.from(
      hashPassword(
        password,
        user.password_salt
      ).hash,
      'hex'
    );

  const stored =
    Buffer.from(
      user.password_hash,
      'hex'
    );

  if (
    calculated.length !==
    stored.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    calculated,
    stored
  );
}

/* =========================================================
   COOKIES
========================================================= */

function cookies(req) {

  const out = {};

  for (
    const part of
    (req.headers.cookie || '')
      .split(';')
  ) {

    const i =
      part.indexOf('=');

    if (i > 0) {

      out[
        part
          .slice(0, i)
          .trim()
      ] =
        decodeURIComponent(
          part
            .slice(i + 1)
            .trim()
        );
    }
  }

  return out;
}

/* =========================================================
   CURRENT USER
========================================================= */

function currentUser(req) {

  const sid =
    cookies(req).um_session;

  const uid =
    sid &&
    sessions.get(sid);

  return uid
    ? db.users.find(
        u => u.id === uid
      ) || null
    : null;
}

/* =========================================================
   PUBLIC USER
========================================================= */

function publicUser(u) {

  return u
    ? {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        collector_id:
          u.collector_id ||
          null,
        facility_id:
          u.facility_id ||
          null,
        created: u.created
      }
    : null;
}

/* =========================================================
   AUTHORIZATION
========================================================= */

function requireUser(
  req,
  res,
  role
) {

  const u =
    currentUser(req);

  if (!u) {

    json(
      res,
      401,
      {
        error:
          'Login required'
      }
    );

    return null;
  }

  if (
    role &&
    u.role !== role
  ) {

    json(
      res,
      403,
      {
        error:
          'This account does not have access to this area'
      }
    );

    return null;
  }

  return u;
}

/* =========================================================
   API ROUTES
========================================================= */

async function api(
  req,
  res,
  url
) {

  const p =
    url.pathname;

  /* -------------------------
     SIGNUP
  ------------------------- */

  if (
    req.method === 'POST' &&
    p === '/api/auth/signup'
  ) {

    const x =
      await body(req);

    const name =
      String(
        x.name || ''
      ).trim();

    const email =
      String(
        x.email || ''
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        x.password || ''
      );

    const role =
      x.role === 'buyer'
        ? 'buyer'
        : 'collector';

    if (
      name.length < 2 ||
      !email.includes('@') ||
      password.length < 6
    ) {

      return json(
        res,
        400,
        {
          error:
            'Enter a name, valid email and password of at least 6 characters'
        }
      );
    }

    if (
      db.users.some(
        u => u.email === email
      )
    ) {

      return json(
        res,
        409,
        {
          error:
            'An account with this email already exists'
        }
      );
    }

    const hp =
      hashPassword(password);

    const u = {
      id: id('USR'),
      name,
      email,
      phone:
        String(
          x.phone || ''
        ).trim(),
      role,
      password_salt:
        hp.salt,
      password_hash:
        hp.hash,
      created:
        new Date().toISOString()
    };

    if (
      role === 'collector'
    ) {

      u.collector_id =
        id('COL');

    } else {

      const f =
        db.facilities.find(
          f =>
            f.authorization_status ===
            'active'
        );

      u.facility_id =
        f?.id ||
        'FAC-GREENLOOP';
    }

    db.users.push(u);

    persist();

    const sid =
      crypto
        .randomBytes(32)
        .toString('hex');

    sessions.set(
      sid,
      u.id
    );

    return json(
      res,
      201,
      {
        user:
          publicUser(u)
      },
      {
        /*
          Required for:
          GitHub Pages -> Render
        */
        'Set-Cookie':
          `um_session=${sid}; HttpOnly; Secure; SameSite=None; Path=/`
      }
    );
  }

  /* -------------------------
     LOGIN
  ------------------------- */

  if (
    req.method === 'POST' &&
    p === '/api/auth/login'
  ) {

    const x =
      await body(req);

    const email =
      String(
        x.email || ''
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        x.password || ''
      );

    const u =
      db.users.find(
        a => a.email === email
      );

    if (
      !u ||
      !verifyPassword(
        password,
        u
      )
    ) {

      return json(
        res,
        401,
        {
          error:
            'Invalid email or password'
        }
      );
    }

    const sid =
      crypto
        .randomBytes(32)
        .toString('hex');

    sessions.set(
      sid,
      u.id
    );

    return json(
      res,
      200,
      {
        user:
          publicUser(u)
      },
      {
        'Set-Cookie':
          `um_session=${sid}; HttpOnly; Secure; SameSite=None; Path=/`
      }
    );
  }

  /* -------------------------
     LOGOUT
  ------------------------- */

  if (
    req.method === 'POST' &&
    p === '/api/auth/logout'
  ) {

    const sid =
      cookies(req).um_session;

    if (sid) {
      sessions.delete(sid);
    }

    return json(
      res,
      200,
      {
        ok: true
      },
      {
        'Set-Cookie':
          'um_session=; Max-Age=0; HttpOnly; Secure; SameSite=None; Path=/'
      }
    );
  }

  /* -------------------------
     ME
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/auth/me'
  ) {

    return json(
      res,
      200,
      {
        user:
          publicUser(
            currentUser(req)
          )
      }
    );
  }

  /* -------------------------
     BOOTSTRAP
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/bootstrap'
  ) {

    const u =
      currentUser(req);

    const lots =
      u &&
      u.role === 'collector'
        ? db.lots.filter(
            l =>
              l.user_id === u.id
          )
        : [];

    return json(
      res,
      200,
      {
        materials:
          db.materials,

        facilities:
          db.facilities,

        lots,

        profile:
          u &&
          u.role === 'collector'
            ? {
                collector_id:
                  u.collector_id,

                name:
                  u.name,

                preferred_language:
                  u.preferred_language ||
                  'Hindi',

                operating_area:
                  u.operating_area ||
                  'Demo area'
              }
            : null,

        user:
          publicUser(u)
      }
    );
  }

  /* -------------------------
     MATERIALS
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/materials'
  ) {

    return json(
      res,
      200,
      db.materials
    );
  }

  /* -------------------------
     FACILITIES
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/facilities'
  ) {

    return json(
      res,
      200,
      db.facilities.filter(
        f =>
          f.authorization_status ===
          'active'
      )
    );
  }

  /* -------------------------
     GET LOTS
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/lots'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    return json(
      res,
      200,
      db.lots.filter(
        l =>
          l.user_id === u.id
      )
    );
  }

  /* -------------------------
     CREATE LOT
  ------------------------- */

  if (
    req.method === 'POST' &&
    p === '/api/lots'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const x =
      await body(req);

    const m =
      db.materials.find(
        a =>
          a.id === x.category
      ) ||
      db.materials.find(
        a =>
          a.name === x.name
      );

    if (!m) {

      return json(
        res,
        400,
        {
          error:
            'Unknown material'
        }
      );
    }

    const weight =
      Number(x.weight);

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {

      return json(
        res,
        400,
        {
          error:
            'Weight must be greater than zero'
        }
      );
    }

    const lot = {
      id:
        x.id ||
        id(),

      user_id:
        u.id,

      collector_id:
        u.collector_id,

      category:
        m.id,

      group:
        m.group,

      name:
        m.name,

      weight,

      rate:
        Number(x.rate) ||
        m.rate,

      status:
        'created',

      created:
        x.created ||
        new Date().toISOString(),

      photo_ref:
        null,

      quoted_price:
        null,

      facility_id:
        null,

      payment_status:
        'pending',

      transaction_status:
        'open',

      events:
        []
    };

    if (
      x.photoData &&
      typeof x.photoData ===
        'string' &&
      x.photoData.startsWith(
        'data:image/'
      )
    ) {

      const mt =
        x.photoData.match(
          /^data:image\/(png|jpeg|jpg|webp);base64,/i
        );

      if (mt) {

        const ext =
          mt[1] === 'jpeg'
            ? 'jpg'
            : mt[1];

        const file =
          lot.id +
          '.' +
          ext;

        fs.writeFileSync(
          path.join(
            UP,
            file
          ),
          Buffer.from(
            x.photoData
              .split(',')[1],
            'base64'
          )
        );

        lot.photo_ref =
          '/server/data/uploads/' +
          file;
      }
    }

    lot.events.push({
      type:
        'captured',

      at:
        new Date().toISOString(),

      by:
        u.id
    });

    db.lots.unshift(lot);

    persist();

    return json(
      res,
      201,
      lot
    );
  }

  /* -------------------------
     SINGLE LOT
  ------------------------- */

  if (
    req.method === 'GET' &&
    p.startsWith('/api/lots/')
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const lot =
      db.lots.find(
        x =>
          x.id ===
            decodeURIComponent(
              p.slice(10)
            ) &&
          x.user_id === u.id
      );

    if (!lot) {

      return json(
        res,
        404,
        {
          error:
            'Lot not found'
        }
      );
    }

    return json(
      res,
      200,
      lot
    );
  }

  /* -------------------------
     HANDOVER
  ------------------------- */

  if (
    req.method === 'POST' &&
    p === '/api/handovers'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const x =
      await body(req);

    const lot =
      db.lots.find(
        l =>
          l.id === x.lot_id &&
          l.user_id === u.id
      ) ||
      db.lots.find(
        l =>
          l.user_id === u.id
      );

    if (!lot) {

      return json(
        res,
        400,
        {
          error:
            'No lot available'
        }
      );
    }

    const buyer =
      x.facility_id
        ? db.facilities.find(
            f =>
              f.name ===
                x.facility_id ||
              f.id ===
                x.facility_id
          )
        : db.facilities[0];

    const now =
      new Date().toISOString();

    const h = {
      handover_id:
        id('HO'),

      lot_id:
        lot.id,

      collector_id:
        u.collector_id,

      facility_id:
        buyer?.id ||
        'FAC-GREENLOOP',

      facility_name:
        buyer?.name ||
        'GreenLoop Materials',

      weight:
        lot.weight,

      quoted_price:
        x.quoted_price ??
        lot.rate,

      final_price:
        x.final_price ??
        x.quoted_price ??
        lot.rate,

      confirmed_at:
        now,

      payment_status:
        x.payment_status ||
        'pending',

      reference:
        crypto
          .randomBytes(3)
          .toString('hex')
          .toUpperCase(),

      append_only:
        true
    };

    db.handovers.push(h);

    lot.status =
      'confirmed';

    lot.transaction_status =
      'completed';

    lot.facility_id =
      h.facility_id;

    lot.quoted_price =
      h.quoted_price;

    lot.final_price =
      h.final_price;

    lot.payment_status =
      h.payment_status;

    lot.handover_at =
      now;

    lot.events.push({
      type:
        'handover_confirmed',

      at:
        now,

      reference:
        h.reference,

      by:
        u.id
    });

    persist();

    return json(
      res,
      201,
      h
    );
  }

  /* -------------------------
     EARNINGS
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/earnings'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const tx =
      db.lots.filter(
        l =>
          l.user_id === u.id &&
          l.transaction_status ===
            'completed'
      );

    const paid =
      tx
        .filter(
          l =>
            l.payment_status ===
            'paid'
        )
        .reduce(
          (a, l) =>
            a +
            (l.final_price ||
              l.rate) *
              l.weight,
          0
        );

    const pending =
      tx
        .filter(
          l =>
            l.payment_status !==
            'paid'
        )
        .reduce(
          (a, l) =>
            a +
            (l.final_price ||
              l.rate) *
              l.weight,
          0
        );

    return json(
      res,
      200,
      {
        earned:
          paid,

        pending,

        average:
          tx.length
            ? tx.reduce(
                (a, l) =>
                  a +
                  (l.final_price ||
                    l.rate) *
                    l.weight,
                0
              ) / tx.length
            : 0,

        lots:
          tx
      }
    );
  }

  /* -------------------------
     RECOVERY
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/recovery'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const lots =
      db.lots.filter(
        l =>
          l.user_id === u.id
      );

    const captured =
      lots.reduce(
        (a, l) =>
          a + l.weight,
        0
      );

    const recovered =
      lots
        .filter(
          l =>
            l.transaction_status ===
            'completed'
        )
        .reduce(
          (a, l) =>
            a + l.weight,
          0
        );

    const by = {};

    for (
      const l of lots.filter(
        l =>
          l.transaction_status ===
          'completed'
      )
    ) {

      by[l.group] =
        (by[l.group] || 0) +
        l.weight;
    }

    return json(
      res,
      200,
      {
        captured,
        recovered,

        traceable:
          lots.length
            ? Math.round(
                lots.filter(
                  l =>
                    l.transaction_status ===
                    'completed'
                ).length /
                  lots.length *
                  100
              )
            : 0,

        authorizedRoute:
          lots.length
            ? Math.round(
                lots.filter(
                  l =>
                    l.facility_id
                ).length /
                  lots.length *
                  100
              )
            : 0,

        by
      }
    );
  }

  /* -------------------------
     BUYER CONSOLE
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/console'
  ) {

    const u =
      requireUser(
        req,
        res,
        'buyer'
      );

    if (!u) return;

    const incoming =
      db.lots.filter(
        l =>
          l.transaction_status ===
          'open'
      );

    const confirmedToday =
      db.lots.filter(
        l =>
          l.transaction_status ===
            'completed' &&
          l.facility_id ===
            u.facility_id
      ).length;

    return json(
      res,
      200,
      {
        incoming,

        confirmedToday,

        facilities:
          db.facilities,

        traceability:
          db.lots.length
            ? Math.round(
                db.lots.filter(
                  l =>
                    l.transaction_status ===
                    'completed'
                ).length /
                  db.lots.length *
                  100
              )
            : 0,

        buyer:
          publicUser(u)
      }
    );
  }

  /* -------------------------
     PROFILE
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/profile'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    return json(
      res,
      200,
      {
        collector_id:
          u.collector_id,

        name:
          u.name,

        preferred_language:
          u.preferred_language ||
          'Hindi',

        operating_area:
          u.operating_area ||
          'Demo area'
      }
    );
  }

  /* -------------------------
     UPDATE PROFILE
  ------------------------- */

  if (
    req.method === 'PUT' &&
    p === '/api/profile'
  ) {

    const u =
      requireUser(
        req,
        res,
        'collector'
      );

    if (!u) return;

    const x =
      await body(req);

    u.name =
      String(
        x.name || u.name
      ).trim();

    u.preferred_language =
      x.preferred_language ||
      u.preferred_language ||
      'Hindi';

    u.operating_area =
      x.operating_area ||
      u.operating_area ||
      'Demo area';

    persist();

    return json(
      res,
      200,
      {
        collector_id:
          u.collector_id,

        name:
          u.name,

        preferred_language:
          u.preferred_language,

        operating_area:
          u.operating_area
      }
    );
  }

  /* -------------------------
     CSV EXPORT
  ------------------------- */

  if (
    req.method === 'GET' &&
    p === '/api/export/custody.csv'
  ) {

    const u =
      requireUser(
        req,
        res,
        'buyer'
      );

    if (!u) return;

    const rows = [
      [
        'lot_id',
        'stream',
        'material',
        'weight',
        'timestamp',
        'status',
        'facility',
        'payment_status'
      ]
    ];

    for (
      const l of db.lots
    ) {

      rows.push([
        l.id,
        l.group,
        l.name,
        l.weight,
        l.handover_at ||
          l.created,
        l.transaction_status,
        l.facility_id || '',
        l.payment_status ||
          ''
      ]);
    }

    const csv =
      rows
        .map(
          r =>
            r
              .map(csvEscape)
              .join(',')
        )
        .join('\n');

    res.writeHead(
      200,
      {
        ...corsHeaders(req),

        'Content-Type':
          'text/csv; charset=utf-8',

        'Content-Disposition':
          'attachment; filename="urban-mining-custody-trail.csv"'
      }
    );

    return res.end(csv);
  }

  return json(
    res,
    404,
    {
      error:
        'API route not found'
    }
  );
}

/* =========================================================
   STATIC FILE SECURITY
========================================================= */

function safePath(p) {

  const base =
    path.resolve(ROOT);

  const target =
    path.resolve(
      ROOT,
      p
    );

  return target.startsWith(
    base + path.sep
  ) ||
  target === base
    ? target
    : null;
}

const mime = {
  '.html':
    'text/html; charset=utf-8',

  '.js':
    'text/javascript; charset=utf-8',

  '.css':
    'text/css; charset=utf-8',

  '.svg':
    'image/svg+xml',

  '.json':
    'application/json',

  '.png':
    'image/png',

  '.jpg':
    'image/jpeg',

  '.jpeg':
    'image/jpeg',

  '.webp':
    'image/webp'
};

/* =========================================================
   HTTP SERVER
========================================================= */

const server =
  http.createServer(
    async (req, res) => {

      try {

        /* CORS */

        const ch =
          corsHeaders(req);

        Object.entries(ch)
          .forEach(
            ([key, value]) => {
              res.setHeader(
                key,
                value
              );
            }
          );

        /* PREFLIGHT */

        if (
          req.method ===
          'OPTIONS'
        ) {

          res.writeHead(
            204,
            ch
          );

          return res.end();
        }

        const url =
          new URL(
            req.url,
            'http://localhost'
          );

        /* API */

        if (
          url.pathname.startsWith(
            '/api/'
          )
        ) {

          return await api(
            req,
            res,
            url
          );
        }

        /* STATIC FILES */

        let rel =
          decodeURIComponent(
            url.pathname === '/'
              ? 'index.html'
              : url.pathname.replace(
                  /^\/+/,
                  ''
                )
          );

        const file =
          safePath(rel);

        if (!file) {

          return json(
            res,
            403,
            {
              error:
                'Forbidden'
            }
          );
        }

        fs.stat(
          file,
          (err, st) => {

            if (
              err ||
              !st.isFile()
            ) {

              return json(
                res,
                404,
                {
                  error:
                    'Not found'
                }
              );
            }

            res.writeHead(
              200,
              {
                'Content-Type':
                  mime[
                    path
                      .extname(
                        file
                      )
                      .toLowerCase()
                  ] ||
                  'application/octet-stream'
              }
            );

            fs.createReadStream(
              file
            ).pipe(res);
          }
        );

      } catch (e) {

        console.error(e);

        json(
          res,
          500,
          {
            error:
              'Server error',

            detail:
              e.message
          }
        );
      }
    }
  );

/* =========================================================
   PORT
========================================================= */

const PORT =
  process.env.PORT || 8000;

server.listen(
  PORT,
  () => {
    console.log(
      `Urban Mining Connect running on port ${PORT}`
    );
  }
);
```
