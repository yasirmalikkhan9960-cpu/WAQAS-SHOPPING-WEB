require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, 'data');
const usersFilePath = path.join(dataDirectory, 'users.json');
const adminFilePath = path.join(dataDirectory, 'admin.json');
const supportMessagesFilePath = path.join(dataDirectory, 'support-messages.json');
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@waqas.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeThisPasswordNow!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'waqas-admin-session-secret';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 6
    }
  })
);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.static(path.join(__dirname)));

function ensureDirectory() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
}

function ensureUsersStore() {
  ensureDirectory();

  if (!fs.existsSync(usersFilePath)) {
    const initialUsers = [
      {
        name: 'Demo User',
        username: 'demo',
        email: 'demo@gmail.com',
        passwordHash: bcrypt.hashSync('demo123', 12),
        role: 'user'
      }
    ];

    fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2));
  }
}

function normalizeUser(user) {
  const safeUser = {
    ...user,
    email: String(user.email || '').trim().toLowerCase(),
    username: String(user.username || '').trim(),
    role: user.role || 'user'
  };

  if (!safeUser.passwordHash && user.password) {
    safeUser.passwordHash = bcrypt.hashSync(String(user.password), 12);
  }

  return safeUser;
}

function readUsersStore() {
  ensureUsersStore();

  try {
    const raw = fs.readFileSync(usersFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeUser) : [];
  } catch (error) {
    return [];
  }
}

function saveUsersStore(users) {
  ensureDirectory();
  fs.writeFileSync(usersFilePath, JSON.stringify(users.map(normalizeUser), null, 2));
}

function ensureAdminStore() {
  ensureDirectory();

  if (!fs.existsSync(adminFilePath)) {
    const initialAdmin = {
      name: 'Waqas Owner',
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
      role: 'admin'
    };

    fs.writeFileSync(adminFilePath, JSON.stringify(initialAdmin, null, 2));
  }
}

function readAdminStore() {
  ensureAdminStore();

  try {
    const raw = fs.readFileSync(adminFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    const admin = {
      name: parsed.name || 'Waqas Owner',
      email: String(parsed.email || ADMIN_EMAIL).trim().toLowerCase(),
      passwordHash: parsed.passwordHash || bcrypt.hashSync(parsed.password || ADMIN_PASSWORD, 12),
      role: 'admin'
    };

    if (!parsed.passwordHash && parsed.password) {
      admin.passwordHash = bcrypt.hashSync(parsed.password, 12);
    }

    return admin;
  } catch (error) {
    return {
      name: 'Waqas Owner',
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
      role: 'admin'
    };
  }
}

function saveAdminStore(admin) {
  ensureDirectory();
  fs.writeFileSync(
    adminFilePath,
    JSON.stringify(
      {
        ...admin,
        email: String(admin.email || ADMIN_EMAIL).trim().toLowerCase(),
        role: 'admin'
      },
      null,
      2
    )
  );
}

function ensureSupportStore() {
  ensureDirectory();

  if (!fs.existsSync(supportMessagesFilePath)) {
    fs.writeFileSync(supportMessagesFilePath, JSON.stringify([], null, 2));
  }
}

function readSupportMessages() {
  ensureSupportStore();

  try {
    const raw = fs.readFileSync(supportMessagesFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveSupportMessages(messages) {
  ensureSupportStore();
  fs.writeFileSync(supportMessagesFilePath, JSON.stringify(messages, null, 2));
}

let registeredUsers = readUsersStore();
let adminUser = readAdminStore();

let products = [
  {
    id: 1,
    name: 'Urban Pro Jacket',
    category: 'Fashion',
    price: 149.99,
    rating: 4.8,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    description: 'Premium casual outerwear designed for daily comfort and style.'
  },
  {
    id: 2,
    name: 'Aero Wireless Headphones',
    category: 'Electronics',
    price: 199.99,
    rating: 4.9,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    description: 'Immersive sound with noise cancellation and long battery life.'
  },
  {
    id: 3,
    name: 'Titan Smart Watch',
    category: 'Electronics',
    price: 249.99,
    rating: 4.7,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    description: 'Track health, workouts, and notifications from your wrist.'
  },
  {
    id: 4,
    name: 'Classic Leather Bag',
    category: 'Accessories',
    price: 129.99,
    rating: 4.6,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    description: 'Elegant storage for work, travel, and everyday essentials.'
  },
  {
    id: 5,
    name: 'Sport Runner Shoes',
    category: 'Footwear',
    price: 119.99,
    rating: 4.8,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    description: 'Lightweight support made for fast-paced everyday movement.'
  },
  {
    id: 6,
    name: 'Luna Skin Care Kit',
    category: 'Beauty',
    price: 89.99,
    rating: 4.5,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
    description: 'A glowing skincare bundle for hydration and daily freshness.'
  }
];

function formatPersonName(email) {
  return String(email)
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Customer';
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Admin login required.'
  });
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/user/signup', (req, res) => {
  const { name = '', username = '', email = '', password = '' } = req.body || {};
  const cleanName = String(name).trim();
  const cleanUsername = String(username).trim();
  const gmail = String(email).trim().toLowerCase();
  const pass = String(password).trim();

  if (!cleanName) {
    return res.status(400).json({ success: false, message: 'Please enter your name.' });
  }

  if (!cleanUsername) {
    return res.status(400).json({ success: false, message: 'Please create a username.' });
  }

  if (!gmail || !gmail.endsWith('@gmail.com')) {
    return res.status(400).json({ success: false, message: 'Use a valid Gmail address for new user sign up.' });
  }

  if (pass.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  const existingUser = registeredUsers.find(
    (user) => user.email.toLowerCase() === gmail || user.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ success: false, message: 'This Gmail address or username is already registered.' });
  }

  const newUser = {
    name: cleanName,
    username: cleanUsername,
    email: gmail,
    passwordHash: bcrypt.hashSync(pass, 12),
    role: 'user'
  };

  registeredUsers.push(newUser);
  saveUsersStore(registeredUsers);

  return res.json({
    success: true,
    message: 'Account created successfully. You are now signed in.',
    user: {
      role: 'user',
      name: cleanName,
      username: cleanUsername,
      email: gmail
    }
  });
});

app.post('/api/user/login', (req, res) => {
  const { email = '', username = '', password = '' } = req.body || {};
  const identifier = String(email || username).trim().toLowerCase();
  const pass = String(password).trim();

  if (!identifier) {
    return res.status(401).json({ success: false, message: 'Enter your email or username to login.' });
  }

  if (pass.length < 6) {
    return res.status(401).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  const userMatch = registeredUsers.find(
    (user) =>
      (user.email.toLowerCase() === identifier || user.username.toLowerCase() === identifier) &&
      bcrypt.compareSync(pass, user.passwordHash)
  );

  if (userMatch) {
    return res.json({
      success: true,
      message: 'Customer login successful. Welcome to WAQAS SHOPPING SITE.',
      user: {
        role: 'user',
        name: userMatch.name,
        username: userMatch.username,
        email: userMatch.email
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Incorrect email/username or password.'
  });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    success: true,
    user: {
      role: 'admin',
      name: req.session.admin.name,
      email: req.session.admin.email
    }
  });
});

app.get('/api/admin/profile', requireAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    }
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const enteredEmail = String(email).trim().toLowerCase();
  const enteredPassword = String(password).trim();

  if (!enteredEmail || !enteredPassword) {
    return res.status(400).json({ success: false, message: 'Please enter your admin email and password.' });
  }

  const isValidEmail = enteredEmail === adminUser.email;
  const isValidPassword = bcrypt.compareSync(enteredPassword, adminUser.passwordHash);

  if (!isValidEmail || !isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Admin login failed. Email or password is incorrect.'
    });
  }

  req.session.admin = {
    name: adminUser.name,
    email: adminUser.email,
    role: 'admin'
  };

  return res.json({
    success: true,
    message: 'Admin login successful. Welcome, Waqas Owner.',
    user: {
      role: 'admin',
      name: adminUser.name,
      email: adminUser.email
    }
  });
});

app.post('/api/admin/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.json({ success: true, message: 'Admin logged out.' });
    });
    return;
  }

  res.json({ success: true, message: 'Admin logged out.' });
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const newEmail = String(email).trim().toLowerCase();
  const newPassword = String(password).trim();

  if (!newEmail || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please enter both admin email and password.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }

  adminUser = {
    ...adminUser,
    email: newEmail,
    passwordHash: bcrypt.hashSync(newPassword, 12)
  };

  saveAdminStore(adminUser);
  req.session.admin = {
    name: adminUser.name,
    email: adminUser.email,
    role: 'admin'
  };

  return res.json({
    success: true,
    message: 'Admin email and password updated successfully.',
    admin: {
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    }
  });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { name, category, price, description, image, stock } = req.body || {};

  if (!name || !category || !price || !description || !image) {
    return res.status(400).json({ success: false, message: 'Please complete all product fields before publishing.' });
  }

  const newProduct = {
    id: Date.now(),
    name: String(name).trim(),
    category: String(category).trim(),
    price: Number(price),
    stock: Number(stock) || 10,
    rating: 4.8,
    image: String(image).trim(),
    description: String(description).trim()
  };

  products = [newProduct, ...products];

  return res.json({
    success: true,
    message: 'Product published successfully.',
    product: newProduct
  });
});

app.post('/api/support/send', (req, res) => {
  const { name = '', username = '', message = '' } = req.body || {};
  const cleanName = String(name).trim();
  const cleanUsername = String(username).trim();
  const cleanMessage = String(message).trim();

  if (!cleanMessage) {
    return res.status(400).json({
      success: false,
      message: 'Please write your message before sending it to the owner.'
    });
  }

  const messages = readSupportMessages();
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: cleanName || 'Guest customer',
    username: cleanUsername || 'guest',
    message: cleanMessage,
    status: 'unread',
    reply: '',
    createdAt: new Date().toISOString(),
    repliedAt: null
  };

  messages.unshift(newMessage);
  saveSupportMessages(messages);

  return res.json({
    success: true,
    message: 'Your message has been sent to the owner successfully.'
  });
});

app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const messages = readSupportMessages().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    success: true,
    messages
  });
});

app.post('/api/admin/messages/:id/reply', requireAdmin, (req, res) => {
  const { reply = '' } = req.body || {};
  const cleanReply = String(reply).trim();

  if (!cleanReply) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a reply before sending it.'
    });
  }

  const messages = readSupportMessages();
  const itemIndex = messages.findIndex((message) => message.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'The selected message was not found.'
    });
  }

  messages[itemIndex].reply = cleanReply;
  messages[itemIndex].status = 'replied';
  messages[itemIndex].repliedAt = new Date().toISOString();
  saveSupportMessages(messages);

  return res.json({
    success: true,
    message: 'Your reply has been sent successfully.',
    messageRecord: messages[itemIndex]
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WAQAS SHOPPING SITE is running on http://localhost:${PORT}`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
});
