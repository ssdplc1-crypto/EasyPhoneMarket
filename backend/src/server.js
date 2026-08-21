require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { query } = require('./db');
const {
  auth,
  admin,
  signToken,
  hashPassword,
  comparePassword,
  publicUser
} = require('./auth');

const {
  upload,
  configured: cloudinaryConfigured
} = require('./cloudinary');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(express.json({ limit: '2mb' }));

// =====================================================
// UPLOADS
// =====================================================

const uploadDir = path.join(__dirname, '../uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const uploader = multer({
  dest: uploadDir,
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', async (req, res) => {
  try {
    // Real database test
    await query('SELECT 1');

    res.json({
      ok: true,
      service: 'FULATAN COMMUNICATION API',
      database: 'PostgreSQL',
      imageStorage: cloudinaryConfigured
        ? 'Cloudinary'
        : 'local-ephemeral'
    });
  } catch (e) {
    console.error('Health check database error:', e);

    res.status(500).json({
      ok: false,
      service: 'FULATAN COMMUNICATION API',
      database: 'PostgreSQL',
      error: 'Database connection failed'
    });
  }
});

// =====================================================
// AUTH - REGISTER
// =====================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          'Name, email, phone and a 6+ character password are required'
      });
    }

    const exists = await query(
      'SELECT id FROM users WHERE email=$1',
      [email.toLowerCase()]
    );

    if (exists.rowCount) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hash = await hashPassword(password);

    const r = await query(
      `INSERT INTO users
      (name,email,phone,password_hash)
      VALUES($1,$2,$3,$4)
      RETURNING *`,
      [
        name,
        email.toLowerCase(),
        phone,
        hash
      ]
    );

    const user = await publicUser(r.rows[0]);

    res.status(201).json({
      user,
      token: signToken(r.rows[0])
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: 'Registration failed'
    });
  }
});

// =====================================================
// AUTH - LOGIN
// =====================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const {
      emailOrPhone,
      password
    } = req.body;

    const r = await query(
      `SELECT *
       FROM users
       WHERE lower(email)=lower($1)
       OR phone=$1
       LIMIT 1`,
      [emailOrPhone]
    );

    if (
      !r.rowCount ||
      !(await comparePassword(
        password,
        r.rows[0].password_hash
      ))
    ) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    res.json({
      user: await publicUser(r.rows[0]),
      token: signToken(r.rows[0])
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: 'Login failed'
    });
  }
});

// =====================================================
// CURRENT USER
// =====================================================

app.get('/api/me', auth, async (req, res) => {
  try {
    const r = await query(
      'SELECT * FROM users WHERE id=$1',
      [req.user.id]
    );

    if (!r.rowCount) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: await publicUser(r.rows[0])
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: 'Could not load user'
    });
  }
});

// =====================================================
// CATEGORIES
// =====================================================

app.get('/api/categories', async (req, res) => {
  try {
    const r = await query(
      'SELECT id,name,slug FROM categories ORDER BY name'
    );

    res.json(r.rows);

  } catch (e) {
    console.error('Categories error:', e);

    res.status(500).json({
      message: 'Could not load categories'
    });
  }
});

// =====================================================
// PHONE DTO
// =====================================================

function phoneDto(r) {
  return {
    id: r.id,
    title: r.title,
    brand: r.brand,
    model: r.model,
    price: Number(r.price),
    condition: r.condition,
    description: r.description,
    images: r.images || [],
    location: r.location,
    state: r.state,
    sellerId: r.seller_id,
    sellerName: r.seller_name,
    sellerPhone: r.seller_phone,
    sellerRating: Number(r.seller_rating || 5),
    createdAt: new Date(r.created_at)
      .toISOString()
      .split('T')[0],
    views: r.views,
    isPublished: r.is_published
  };
}

// =====================================================
// GET PHONES
// =====================================================

app.get('/api/phones', async (req, res) => {
  try {
    const {
      q,
      brand
    } = req.query;

    const params = [];

    let where = 'WHERE is_published=true';

    if (q) {
      params.push(`%${q}%`);

      where += `
        AND (
          title ILIKE $${params.length}
          OR model ILIKE $${params.length}
          OR brand ILIKE $${params.length}
        )
      `;
    }

    if (brand) {
      params.push(brand);

      where += `
        AND brand=$${params.length}
      `;
    }

    const r = await query(
      `SELECT *
       FROM phones
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    res.json(
      r.rows.map(phoneDto)
    );

  } catch (e) {
    console.error('Phones error:', e);

    res.status(500).json({
      message: 'Could not load phones'
    });
  }
});

// =====================================================
// ADMIN - GET ALL PHONES
// =====================================================

app.get(
  '/api/admin/phones',
  auth,
  admin,
  async (req, res) => {
    try {
      const r = await query(
        'SELECT * FROM phones ORDER BY created_at DESC'
      );

      res.json(
        r.rows.map(phoneDto)
      );

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not load phones'
      });
    }
  }
);

// =====================================================
// ADMIN - CREATE PHONE
// =====================================================

app.post(
  '/api/phones',
  auth,
  admin,
  uploader.array('images', 8),
  async (req, res) => {
    try {
      const b = req.body;

      const images = [];

      for (const f of req.files || []) {
        if (cloudinaryConfigured) {
          const result = await upload(f);

          images.push(result.secure_url);

          fs.unlinkSync(f.path);
        } else {
          images.push(
            `${req.protocol}://${req.get('host')}/uploads/${path.basename(f.path)}`
          );
        }
      }

      const imageUris = b.imageUris
        ? JSON.parse(b.imageUris)
        : [];

      images.push(...imageUris);

      const r = await query(
        `INSERT INTO phones
        (
          title,
          brand,
          model,
          price,
          condition,
          description,
          images,
          location,
          state,
          seller_id,
          seller_name,
          seller_phone,
          seller_rating,
          is_published
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,
          $10,$11,$12,$13,$14
        )
        RETURNING *`,
        [
          b.title,
          b.brand,
          b.model,
          Number(b.price),
          b.condition,
          b.description || '',
          JSON.stringify(images),
          b.location || '',
          b.state || '',
          req.user.id,
          'FULATAN COMMUNICATION',
          b.sellerPhone || '',
          5,
          true
        ]
      );

      res.status(201).json(
        phoneDto(r.rows[0])
      );

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not publish phone'
      });
    }
  }
);

// =====================================================
// ADMIN - UPDATE PHONE
// =====================================================

app.patch(
  '/api/phones/:id',
  auth,
  admin,
  async (req, res) => {
    try {
      const b = req.body;

      const r = await query(
        `UPDATE phones
         SET
           title=COALESCE($1,title),
           price=COALESCE($2,price),
           description=COALESCE($3,description),
           is_published=COALESCE($4,is_published)
         WHERE id=$5
         RETURNING *`,
        [
          b.title,
          b.price,
          b.description,
          b.isPublished,
          req.params.id
        ]
      );

      if (!r.rowCount) {
        return res.status(404).json({
          message: 'Phone not found'
        });
      }

      res.json(
        phoneDto(r.rows[0])
      );

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not update phone'
      });
    }
  }
);

// =====================================================
// ADMIN - DELETE PHONE
// =====================================================

app.delete(
  '/api/phones/:id',
  auth,
  admin,
  async (req, res) => {
    try {
      const r = await query(
        'DELETE FROM phones WHERE id=$1 RETURNING id',
        [req.params.id]
      );

      if (!r.rowCount) {
        return res.status(404).json({
          message: 'Phone not found'
        });
      }

      res.json({
        ok: true
      });

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not delete phone'
      });
    }
  }
);

// =====================================================
// CREATE CHAT
// =====================================================

app.post('/api/chats', auth, async (req, res) => {
  try {
    const {
      phoneId,
      phoneTitle,
      sellerId
    } = req.body;

    const r = await query(
      `SELECT id
       FROM chats
       WHERE phone_id=$1
       AND buyer_id=$2
       AND seller_id=$3
       LIMIT 1`,
      [
        phoneId,
        req.user.id,
        sellerId
      ]
    );

    if (r.rowCount) {
      return res.json({
        id: r.rows[0].id
      });
    }

    const n = await query(
      `INSERT INTO chats
      (phone_id,phone_title,buyer_id,seller_id)
      VALUES($1,$2,$3,$4)
      RETURNING id`,
      [
        phoneId,
        phoneTitle,
        req.user.id,
        sellerId
      ]
    );

    res.status(201).json({
      id: n.rows[0].id
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: 'Could not create chat'
    });
  }
});

// =====================================================
// CHAT MESSAGES - GET
// =====================================================

app.get(
  '/api/chats/:id/messages',
  auth,
  async (req, res) => {
    try {
      const c = await query(
        `SELECT buyer_id,seller_id
         FROM chats
         WHERE id=$1`,
        [req.params.id]
      );

      if (
        !c.rowCount ||
        (
          ![
            c.rows[0].buyer_id,
            c.rows[0].seller_id
          ].includes(req.user.id) &&
          req.user.role !== 'admin'
        )
      ) {
        return res.status(403).json({
          message: 'Chat access denied'
        });
      }

      const r = await query(
        `SELECT
          id,
          chat_id,
          sender_id,
          text,
          created_at,
          read
         FROM messages
         WHERE chat_id=$1
         ORDER BY created_at ASC`,
        [req.params.id]
      );

      res.json(
        r.rows.map(x => ({
          ...x,
          createdAt: new Date(
            x.created_at
          ).toISOString()
        }))
      );

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not load messages'
      });
    }
  }
);

// =====================================================
// CHAT MESSAGES - SEND
// =====================================================

app.post(
  '/api/chats/:id/messages',
  auth,
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({
          message: 'Message required'
        });
      }

      const c = await query(
        `SELECT buyer_id,seller_id
         FROM chats
         WHERE id=$1`,
        [req.params.id]
      );

      if (
        !c.rowCount ||
        (
          ![
            c.rows[0].buyer_id,
            c.rows[0].seller_id
          ].includes(req.user.id) &&
          req.user.role !== 'admin'
        )
      ) {
        return res.status(403).json({
          message: 'Chat access denied'
        });
      }

      const r = await query(
        `INSERT INTO messages
        (chat_id,sender_id,text)
        VALUES($1,$2,$3)
        RETURNING *`,
        [
          req.params.id,
          req.user.id,
          text.trim()
        ]
      );

      await query(
        `UPDATE chats
         SET
           last_message=$1,
           updated_at=NOW()
         WHERE id=$2`,
        [
          text.trim(),
          req.params.id
        ]
      );

      res.status(201).json({
        ...r.rows[0],
        createdAt: new Date(
          r.rows[0].created_at
        ).toISOString()
      });

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Could not send message'
      });
    }
  }
);

// =====================================================
// ORDERS
// =====================================================

app.post('/api/orders', auth, async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      phoneNumber
    } = req.body;

    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    if (
      !phoneNumber ||
      (!deliveryAddress &&
        deliveryAddress !== '')
    ) {
      return res.status(400).json({
        message: 'Delivery details are required'
      });
    }

    const ids = items.map(
      x => x.phoneId
    );

    const r = await query(
      `SELECT id,title,price
       FROM phones
       WHERE id=ANY($1::uuid[])
       AND is_published=true`,
      [ids]
    );

    const map = new Map(
      r.rows.map(x => [
        x.id,
        x
      ])
    );

    let total = 0;

    const normalized = [];

    for (const item of items) {
      const p = map.get(
        item.phoneId
      );

      const qty = Math.max(
        1,
        Number(item.quantity || 1)
      );

      if (!p) {
        return res.status(400).json({
          message:
            'One of the selected phones is no longer available'
        });
      }

      total +=
        Number(p.price) * qty;

      normalized.push({
        phoneId: p.id,
        title: p.title,
        unitPrice: Number(p.price),
        quantity: qty
      });
    }

    const o = await query(
      `INSERT INTO orders
      (
        buyer_id,
        total,
        delivery_address,
        phone_number
      )
      VALUES($1,$2,$3,$4)
      RETURNING *`,
      [
        req.user.id,
        total,
        deliveryAddress,
        phoneNumber
      ]
    );

    for (const x of normalized) {
      await query(
        `INSERT INTO order_items
        (
          order_id,
          phone_id,
          title,
          unit_price,
          quantity
        )
        VALUES($1,$2,$3,$4,$5)`,
        [
          o.rows[0].id,
          x.phoneId,
          x.title,
          x.unitPrice,
          x.quantity
        ]
      );
    }

    res.status(201).json({
      id: o.rows[0].id,
      status: o.rows[0].status,
      total
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: 'Could not create order'
    });
  }
});

// =====================================================
// CONTACT SETTINGS - GET
// =====================================================

app.get(
  '/api/settings/contact',
  async (req, res) => {
    try {
      const r = await query(
        `SELECT value
         FROM app_settings
         WHERE key='contact'`
      );

      res.json(
        r.rowCount
          ? r.rows[0].value
          : {
              phone: '',
              whatsapp: '',
              chatEnabled: true,
              callEnabled: true,
              whatsappEnabled: true,
              supportLabel:
                'FULATAN COMMUNICATION'
            }
      );

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message:
          'Could not load contact settings'
      });
    }
  }
);

// =====================================================
// CONTACT SETTINGS - UPDATE
// =====================================================

app.put(
  '/api/settings/contact',
  auth,
  admin,
  async (req, res) => {
    try {
      await query(
        `INSERT INTO app_settings(key,value)
         VALUES('contact',$1)
         ON CONFLICT(key)
         DO UPDATE SET value=EXCLUDED.value`,
        [JSON.stringify(req.body)]
      );

      res.json(req.body);

    } catch (e) {
      console.error(e);

      res.status(500).json({
        message:
          'Could not update contact settings'
      });
    }
  }
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  '/uploads',
  express.static(uploadDir)
);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });
  }
);

// =====================================================
// DATABASE MIGRATION + START SERVER
// =====================================================

const port = Number(
  process.env.PORT || 10000
);

async function startServer() {
  try {
    console.log(
      'Starting FULATAN COMMUNICATION API...'
    );

    // Check database connection
    await query('SELECT 1');

    console.log(
      'PostgreSQL connection successful.'
    );

    // Load database schema
    const schemaPath = path.join(
      __dirname,
      '../db/schema.sql'
    );

    if (!fs.existsSync(schemaPath)) {
      throw new Error(
        `Database schema not found: ${schemaPath}`
      );
    }

    const schema = fs.readFileSync(
      schemaPath,
      'utf8'
    );

    console.log(
      'Running database migration...'
    );

    await query(schema);

    console.log(
      'FULATAN database migrated successfully.'
    );

    // Start server only after database is ready
    app.listen(
      port,
      () => {
        console.log(
          `FULATAN API running on :${port}`
        );
      }
    );

  } catch (error) {
    console.error(
      'STARTUP / DATABASE MIGRATION FAILED:'
    );

    console.error(error);

    process.exit(1);
  }
}

startServer();
