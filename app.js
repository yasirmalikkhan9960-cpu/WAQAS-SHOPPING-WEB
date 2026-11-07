const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('waqasCart') || '[]'),
  user: JSON.parse(localStorage.getItem('waqasAuth') || 'null'),
  authMode: 'user',
  search: '',
  category: 'All',
  sort: 'featured'
};

const homeSection = document.getElementById('homePage');
const authSection = document.getElementById('authPage');
const dashboardSection = document.getElementById('dashboardPage');
const userTab = document.querySelector('[data-role="user"]');
const signupTab = document.querySelector('[data-role="signup"]');
const adminTab = document.querySelector('[data-role="admin"]');
const userLoginForm = document.getElementById('userLoginForm');
const userSignupForm = document.getElementById('userSignupForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const authMessage = document.getElementById('authMessage');
const topUserBadge = document.getElementById('topUserBadge');
const homeLoginBtn = document.getElementById('homeLoginBtn');
const headerSignInBtn = document.getElementById('headerSignInBtn');
const dashboardLoginBtn = document.getElementById('dashboardLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const homeProductGrid = document.getElementById('homeProductGrid');
const userProductGrid = document.getElementById('userProductGrid');
const adminProductList = document.getElementById('adminProductList');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const userWelcome = document.getElementById('userWelcome');
const userEmailLabel = document.getElementById('userEmailLabel');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const subtotalValue = document.getElementById('subtotalValue');
const userCartTotal = document.getElementById('userCartTotal');
const adminProductForm = document.getElementById('adminProductForm');
const homeSearchInput = document.getElementById('homeSearchInput');
const homeCategoryFilter = document.getElementById('homeCategoryFilter');
const homeSortFilter = document.getElementById('homeSortFilter');
const adminSettingsForm = document.getElementById('adminSettingsForm');
const ownerEmailInput = document.getElementById('ownerEmailInput');
const ownerPasswordInput = document.getElementById('ownerPasswordInput');
const helplineForm = document.getElementById('helplineForm');
const helplineMessage = document.getElementById('helplineMessage');
const adminSupportMessages = document.getElementById('adminSupportMessages');

function showMessage(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function showSection(sectionName) {
  const sectionMap = {
    home: homeSection,
    auth: authSection,
    dashboard: dashboardSection
  };

  Object.entries(sectionMap).forEach(([key, section]) => {
    section.classList.toggle('active', key === sectionName);
  });
}

function toggleAuthTab(role) {
  state.authMode = role;
  userTab.classList.toggle('active', role === 'user');
  signupTab.classList.toggle('active', role === 'signup');
  adminTab.classList.toggle('active', role === 'admin');
  userLoginForm.classList.toggle('active', role === 'user');
  userSignupForm.classList.toggle('active', role === 'signup');
  adminLoginForm.classList.toggle('active', role === 'admin');
  showMessage(authMessage, '', false);
}

function setupPasswordToggles() {
  document.querySelectorAll('[data-password-target]').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      const target = document.getElementById(toggle.dataset.passwordTarget);
      if (!target) return;
      target.type = toggle.checked ? 'text' : 'password';
    });
  });
}

function updateHeader() {
  const isLoggedIn = Boolean(state.user);

  if (isLoggedIn) {
    topUserBadge.textContent = state.user.name;
    topUserBadge.classList.remove('hidden');
    homeLoginBtn.textContent = 'Dashboard';
    dashboardLoginBtn.textContent = 'Dashboard';
    headerSignInBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    topUserBadge.textContent = 'Guest';
    topUserBadge.classList.add('hidden');
    homeLoginBtn.textContent = 'Login';
    dashboardLoginBtn.textContent = 'Login';
    headerSignInBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

function renderHomeProducts() {
  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    homeProductGrid.innerHTML = '<div class="empty-card">No products match your filters.</div>';
    return;
  }

  homeProductGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-content">
            <div class="card-topline">
              <span class="tag">${product.category}</span>
              <span class="rating">★ ${product.rating}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="card-footer">
              <span class="price">$${Number(product.price).toFixed(2)}</span>
              <button class="primary-btn add-cart-btn" data-product-id="${product.id}">Add to cart</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.add-cart-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.productId)));
  });
}

function renderUserDashboardProducts() {
  if (!state.products.length) {
    userProductGrid.innerHTML = '<div class="empty-card">No products available.</div>';
    return;
  }

  userProductGrid.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card small-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-content">
            <div class="card-topline">
              <span class="tag">${product.category}</span>
              <span class="rating">★ ${product.rating}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="card-footer">
              <span class="price">$${Number(product.price).toFixed(2)}</span>
              <button class="primary-btn add-cart-btn" data-product-id="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.add-cart-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.productId)));
  });
}

function renderAdminProductList() {
  if (!state.products.length) {
    adminProductList.innerHTML = '<div class="empty-card">No products published yet.</div>';
    return;
  }

  adminProductList.innerHTML = state.products
    .map(
      (product) => `
        <div class="admin-product-item">
          <div class="product-preview">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-meta">
            <h4>${product.name}</h4>
            <p>${product.category}</p>
            <strong>$${Number(product.price).toFixed(2)}</strong>
          </div>
        </div>
      `
    )
    .join('');
}

function getFilteredProducts() {
  let filtered = [...state.products];

  if (state.search) {
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(state.search.toLowerCase()) ||
      product.category.toLowerCase().includes(state.search.toLowerCase())
    );
  }

  if (state.category !== 'All') {
    filtered = filtered.filter((product) => product.category === state.category);
  }

  switch (state.sort) {
    case 'price-low':
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-high':
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'rating':
      filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
    default:
      filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
  }

  return filtered;
}

function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
    cartCount.textContent = '0 items';
    subtotalValue.textContent = '$0.00';
    userCartTotal.textContent = '$0.00';
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h4>${item.name}</h4>
            <span>$${Number(item.price).toFixed(2)}</span>
            <small>Qty: ${item.quantity}</small>
          </div>
          <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      `
    )
    .join('');

  cartCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
  subtotalValue.textContent = `$${subtotal.toFixed(2)}`;
  userCartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('waqasCart', JSON.stringify(state.cart));
  renderCart();
}

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    state.products = products;
    renderHomeProducts();
    renderUserDashboardProducts();
    renderAdminProductList();
    renderCart();
  } catch (error) {
    console.error(error);
    homeProductGrid.innerHTML = '<div class="empty-card">Unable to load products right now.</div>';
  }
}

async function refreshAdminSettings() {
  try {
    const response = await fetch('/api/admin/profile', { credentials: 'include' });
    const data = await response.json();

    if (response.ok && data.success && data.admin) {
      ownerEmailInput.value = data.admin.email || 'admin@waqas.com';
      ownerPasswordInput.value = '';
    }
  } catch (error) {
    console.error(error);
  }
}

async function refreshSupportMessages() {
  if (!adminSupportMessages) return;

  try {
    const response = await fetch('/api/admin/messages', { credentials: 'include' });
    const data = await response.json();

    if (!response.ok || !data.success) {
      adminSupportMessages.innerHTML = '<div class="empty-card">Login as admin to view messages from customers.</div>';
      return;
    }

    const messages = Array.isArray(data.messages) ? data.messages : [];

    if (!messages.length) {
      adminSupportMessages.innerHTML = '<div class="empty-card">No messages yet. Customer support requests will appear here.</div>';
      return;
    }

    adminSupportMessages.innerHTML = messages
      .map(
        (message) => `
          <div class="message-item">
            <div class="message-header">
              <div>
                <strong>${message.name}</strong>
                <small>@${message.username || 'guest'}</small>
              </div>
              <span class="message-status ${message.status || 'unread'}">${message.status || 'unread'}</span>
            </div>
            <p>${message.message}</p>
            ${message.reply ? `
              <div class="reply-box">
                <strong>Owner reply:</strong>
                <p>${message.reply}</p>
              </div>
            ` : `
              <form class="reply-form" data-message-id="${message.id}">
                <textarea name="reply" placeholder="Reply to this customer..." required></textarea>
                <button type="submit" class="btn btn-secondary">Reply</button>
              </form>
            `}
          </div>
        `
      )
      .join('');

    document.querySelectorAll('.reply-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const messageId = form.dataset.messageId;
        const textarea = form.querySelector('textarea');
        const replyText = textarea.value.trim();

        if (!replyText) return;

        try {
          const response = await fetch(`/api/admin/messages/${messageId}/reply`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: replyText })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            alert(data.message || 'Unable to send reply.');
            return;
          }

          await refreshSupportMessages();
        } catch (error) {
          alert('Unable to send reply right now.');
        }
      });
    });
  } catch (error) {
    console.error(error);
    adminSupportMessages.innerHTML = '<div class="empty-card">Unable to load support messages right now.</div>';
  }
}

function renderDashboard() {
  const isUser = state.user && state.user.role === 'user';
  const isAdmin = state.user && state.user.role === 'admin';

  if (isUser) {
    userDashboard.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    userWelcome.textContent = `Welcome, ${state.user.name}`;
    userEmailLabel.textContent = state.user.email;
    renderCart();
    renderUserDashboardProducts();
  } else if (isAdmin) {
    adminDashboard.classList.remove('hidden');
    userDashboard.classList.add('hidden');
    refreshAdminSettings();
    renderAdminProductList();
    refreshSupportMessages();
  }

  updateHeader();
}

async function handleLoginRequest(endpoint, formData, role) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(authMessage, data.message || 'Login failed.', true);
      return;
    }

    state.user = data.user;
    localStorage.setItem('waqasAuth', JSON.stringify(data.user));
    showMessage(authMessage, data.message, false);
    renderDashboard();
    showSection('dashboard');
  } catch (error) {
    showMessage(authMessage, 'Unable to login right now. Please retry.', true);
  }
}

userLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const identifier = document.getElementById('userIdentifier').value.trim();
  const formData = {
    email: identifier,
    username: identifier,
    password: document.getElementById('userPassword').value
  };
  handleLoginRequest('/api/user/login', formData, 'user');
});

userSignupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    name: document.getElementById('newUserName').value,
    username: document.getElementById('newUserUsername').value,
    email: document.getElementById('newUserEmail').value,
    password: document.getElementById('newUserPassword').value
  };

  try {
    const response = await fetch('/api/user/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(authMessage, data.message || 'Sign up failed.', true);
      return;
    }

    state.user = data.user;
    localStorage.setItem('waqasAuth', JSON.stringify(data.user));
    renderDashboard();
    showSection('dashboard');
    showMessage(authMessage, data.message, false);
  } catch (error) {
    showMessage(authMessage, 'Unable to create your account right now.', true);
  }
});

adminLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = {
    email: document.getElementById('adminEmail').value,
    password: document.getElementById('adminPassword').value
  };
  handleLoginRequest('/api/admin/login', formData, 'admin');
});

adminProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    price: document.getElementById('productPrice').value,
    description: document.getElementById('productDescription').value,
    image: document.getElementById('productImage').value,
    stock: document.getElementById('productStock').value
  };

  try {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(document.getElementById('adminFormMessage'), data.message || 'Publish failed.', true);
      return;
    }

    showMessage(document.getElementById('adminFormMessage'), data.message, false);
    adminProductForm.reset();
    await fetchProducts();
  } catch (error) {
    showMessage(document.getElementById('adminFormMessage'), 'Unable to publish product right now.', true);
  }
});

adminSettingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    email: ownerEmailInput.value.trim(),
    password: ownerPasswordInput.value.trim()
  };

  try {
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(document.getElementById('adminSettingsMessage'), data.message || 'Unable to save admin info.', true);
      return;
    }

    showMessage(document.getElementById('adminSettingsMessage'), data.message, false);
    document.getElementById('adminEmail').value = data.admin.email;
    document.getElementById('adminPassword').value = data.admin.password;
  } catch (error) {
    showMessage(document.getElementById('adminSettingsMessage'), 'Unable to save admin info right now.', true);
  }
});

if (helplineForm) {
  helplineForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      name: document.getElementById('helplineName').value.trim(),
      username: document.getElementById('helplineUsername').value.trim(),
      message: document.getElementById('helplineMessageText').value.trim()
    };

    try {
      const response = await fetch('/api/support/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage(helplineMessage, data.message || 'Unable to send the message.', true);
        return;
      }

      helplineForm.reset();
      showMessage(helplineMessage, data.message, false);
    } catch (error) {
      showMessage(helplineMessage, 'Unable to send the message right now.', true);
    }
  });
}

async function logout() {
  const isAdmin = state.user && state.user.role === 'admin';

  if (isAdmin) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error(error);
    }
  }

  state.user = null;
  localStorage.removeItem('waqasAuth');
  showSection('home');
  showMessage(authMessage, '', false);
  updateHeader();
  if (state.products.length) {
    renderHomeProducts();
  }
}

userTab.addEventListener('click', () => toggleAuthTab('user'));
signupTab.addEventListener('click', () => toggleAuthTab('signup'));
adminTab.addEventListener('click', () => toggleAuthTab('admin'));

homeLoginBtn.addEventListener('click', () => {
  if (state.user) {
    showSection('dashboard');
    renderDashboard();
    return;
  }

  showSection('auth');
  toggleAuthTab('user');
});

headerSignInBtn.addEventListener('click', () => {
  showSection('auth');
  toggleAuthTab('signup');
});

dashboardLoginBtn.addEventListener('click', () => {
  if (state.user) {
    showSection('dashboard');
    renderDashboard();
    return;
  }

  showSection('auth');
  toggleAuthTab('user');
});

logoutBtn.addEventListener('click', logout);

document.getElementById('goHomeBtn').addEventListener('click', () => showSection('home'));

document.getElementById('dashboardBackHomeBtn').addEventListener('click', () => showSection('home'));
setupPasswordToggles();

homeSearchInput.addEventListener('input', (event) => {
  state.search = event.target.value.trim();
  renderHomeProducts();
});

homeCategoryFilter.addEventListener('change', (event) => {
  state.category = event.target.value;
  renderHomeProducts();
});

homeSortFilter.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderHomeProducts();
});

if (state.user) {
  renderDashboard();
  showSection('dashboard');
} else {
  showSection('home');
}

updateHeader();
fetchProducts();
renderCart();
