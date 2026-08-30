const products = [
  {
    id: 1,
    name: 'Beef Pastil',
    category: 'beef',
    price: 120,
    rating: 4.9,
    description: 'Seasoned ground beef with savory garlic and onion flavor.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Chicken Pastil',
    category: 'chicken',
    price: 110,
    rating: 4.8,
    description: 'Tender chicken bits wrapped in warm, fragrant rice.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Tuna Pastil',
    category: 'seafood',
    price: 130,
    rating: 4.9,
    description: 'A rich tuna blend with a smooth, flavorful finish.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Combo Box',
    category: 'combo',
    price: 260,
    rating: 5.0,
    description: 'Best value set with beef, chicken, and tuna pastil.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: 'Family Pack',
    category: 'combo',
    price: 420,
    rating: 4.9,
    description: 'Perfect for family lunch or office gatherings.Good For 6 - 5 person',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: 'Spicy Tuna Rice',
    category: 'seafood',
    price: 145,
    rating: 4.8,
    description: 'A hot and bold flavor profile with a spicy kick.',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80'
  }
];

const cart = [];
const SESSION_KEY = 'pastil_logged_user';

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartPanel = document.getElementById('cartPanel');
const showcase = document.querySelector('.product-showcase');
const showcaseImage = document.getElementById('showcaseImage');
const showcaseCategory = document.getElementById('showcaseCategory');
const showcaseName = document.getElementById('showcaseName');
const showcasePrice = document.getElementById('showcasePrice');
const showcaseDots = document.getElementById('showcaseDots');
let showcaseIndex = 0;
let showcaseTimer = null;
const appShell = document.getElementById('appShell');
const authOverlay = document.getElementById('authOverlay');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authMessage = document.getElementById('authMessage');
const nameField = document.getElementById('nameField');
const fullName = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const deliveryForm = document.getElementById('deliveryForm');
const deliveryMessage = document.getElementById('deliveryMessage');
const deliveryFullName = document.getElementById('deliveryFullName');
const deliveryPhone = document.getElementById('deliveryPhone');
const deliveryAddress = document.getElementById('deliveryAddress');
const deliveryLandmark = document.getElementById('deliveryLandmark');
const deliveryInstructions = document.getElementById('deliveryInstructions');
const deliveryPhoneDisplay = document.getElementById('deliveryPhoneDisplay');
const deliveryMapElement = document.getElementById('deliveryMap');
const orderStatusBadge = document.getElementById('orderStatusBadge');
const feedbackOverlay = document.getElementById('feedbackOverlay');
const feedbackText = document.getElementById('feedbackText');
const feedbackMessage = document.getElementById('feedbackMessage');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const orderAgainBtn = document.getElementById('orderAgainBtn');
const ratingStars = document.querySelectorAll('.rating-star');
const productDetailOverlay = document.getElementById('productDetailOverlay');
const productDetailClose = document.getElementById('productDetailClose');
const detailProductImage = document.getElementById('detailProductImage');
const detailProductCategory = document.getElementById('detailProductCategory');
const detailProductRating = document.getElementById('detailProductRating');
const detailProductName = document.getElementById('detailProductName');
const detailProductDescription = document.getElementById('detailProductDescription');
const detailProductPrice = document.getElementById('detailProductPrice');
const detailAddButton = document.getElementById('detailAddButton');
let selectedProductId = null;
const quantityOverlay = document.getElementById('quantityOverlay');
const quantityClose = document.getElementById('quantityClose');
const quantityProductImage = document.getElementById('quantityProductImage');
const quantityProductCategory = document.getElementById('quantityProductCategory');
const quantityProductName = document.getElementById('quantityProductName');
const quantityProductPrice = document.getElementById('quantityProductPrice');
const quantityValue = document.getElementById('quantityValue');
const quantityDecrease = document.getElementById('quantityDecrease');
const quantityIncrease = document.getElementById('quantityIncrease');
const quantityAddButton = document.getElementById('quantityAddButton');
let quantityProductId = null;
let selectedQuantity = 1;
const ORDER_STATUSES = ['Preparing', 'For Pickup', 'On the Way', 'Delivered'];
let orderStatusTimer = null;
let feedbackTimer = null;
let deliveryMap = null;
let routePath = null;
let routeShadowPath = null;
let driverMarker = null;
let destinationMarker = null;
let routePoints = [];
let driverAnimationFrame = null;

const getCurrency = (amount) => `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PastilDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('clients')) {
        const store = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
        store.createIndex('email', 'email', { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAccounts() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('clients', 'readonly');
      const store = transaction.objectStore('clients');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB access failed:', error);
    return [];
  }
}

async function saveAccount(account) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clients', 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.add(account);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function findAccountByEmail(email) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clients', 'readonly');
    const store = transaction.objectStore('clients');
    const index = store.index('email');
    const request = index.get(email.toLowerCase());

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function setAuthMode(mode) {
  const isSignup = mode === 'signup';
  nameField.style.display = isSignup ? 'grid' : 'none';
  authTitle.textContent = isSignup ? 'Create account' : 'Welcome back';
  authSubtitle.textContent = isSignup
    ? 'Create a client account to continue to the dashboard.'
    : 'Sign in to access the Pastil Rice Davao dashboard.';
  authSubmitBtn.textContent = isSignup ? 'Create Account' : 'Log In';
  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  authMessage.textContent = '';
  authMessage.className = 'auth-message';
  fullName.value = '';
  emailInput.value = '';
  passwordInput.value = '';
}

function showDashboard() {
  appShell.classList.remove('hidden');
  authOverlay.classList.add('hidden');
}

function showLoginScreen() {
  appShell.classList.add('hidden');
  authOverlay.classList.remove('hidden');
  setAuthMode('login');
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const mode = document.querySelector('.mode-btn.active')?.dataset.mode || 'login';
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authMessage.textContent = 'Please fill in all required fields.';
    authMessage.className = 'auth-message error';
    return;
  }

  if (mode === 'signup') {
    const name = fullName.value.trim();
    if (!name) {
      authMessage.textContent = 'Please enter your full name.';
      authMessage.className = 'auth-message error';
      return;
    }

    const existingAccount = await findAccountByEmail(email);
    if (existingAccount) {
      authMessage.textContent = 'An account with this email already exists.';
      authMessage.className = 'auth-message error';
      return;
    }

    const newAccount = { name, email: email.toLowerCase(), password };
    await saveAccount(newAccount);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name, email: newAccount.email }));
    authMessage.textContent = 'Account created successfully!';
    authMessage.className = 'auth-message success';
    showDashboard();
    return;
  }

  const existingAccount = await findAccountByEmail(email);
  if (!existingAccount || existingAccount.password !== password) {
    authMessage.textContent = 'Invalid email or password. Please try again.';
    authMessage.className = 'auth-message error';
    return;
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: existingAccount.name, email: existingAccount.email }));
  showDashboard();
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showLoginScreen();
}

async function initAuthFlow() {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (sessionData) {
    showDashboard();
  } else {
    showLoginScreen();
  }

  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.addEventListener('click', () => setAuthMode(button.dataset.mode));
  });

  document.getElementById('authForm').addEventListener('submit', handleLoginSubmit);
  logoutBtn.addEventListener('click', handleLogout);
  deliveryForm.addEventListener('submit', handlePlaceOrder);
}

function renderProducts(selectedCategory = 'all') {
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card" tabindex="0" data-product-id="${product.id}" aria-label="View details for ${product.name}">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div class="product-topline">
              <span class="product-category">${product.category}</span>
              <span class="rating">★ ${product.rating}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-bottom">
              <span class="product-price">${getCurrency(product.price)}</span>
              <button class="add-btn" type="button" data-id="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  attachAddButtons();
}

function renderShowcase(index) {
  const product = products[index];
  if (!product || !showcaseImage) return;

  showcaseIndex = index;
  showcase.classList.add('is-changing');
  window.setTimeout(() => {
    showcaseImage.src = product.image;
    showcaseImage.alt = product.name;
    showcaseCategory.textContent = product.category === 'combo' ? 'Best Value' : 'Featured Today';
    showcaseName.textContent = product.name;
    showcasePrice.textContent = getCurrency(product.price);
    showcase.classList.remove('is-changing');
  }, 220);

  showcaseDots.querySelectorAll('.showcase-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === showcaseIndex);
    dot.setAttribute('aria-current', dotIndex === showcaseIndex ? 'true' : 'false');
  });
}

function initializeShowcase() {
  if (!showcase || !showcaseDots) return;

  showcaseDots.innerHTML = products
    .map((product, index) => `<button type="button" class="showcase-dot${index === 0 ? ' active' : ''}" aria-label="Show ${product.name}" aria-current="${index === 0 ? 'true' : 'false'}"></button>`)
    .join('');

  const moveShowcase = (step) => {
    renderShowcase((showcaseIndex + step + products.length) % products.length);
    clearInterval(showcaseTimer);
    showcaseTimer = setInterval(() => renderShowcase((showcaseIndex + 1) % products.length), 4500);
  };

  document.getElementById('showcasePrev').addEventListener('click', () => moveShowcase(-1));
  document.getElementById('showcaseNext').addEventListener('click', () => moveShowcase(1));
  showcaseDots.querySelectorAll('.showcase-dot').forEach((dot, index) => {
    dot.addEventListener('click', () => renderShowcase(index));
  });
  showcaseTimer = setInterval(() => renderShowcase((showcaseIndex + 1) % products.length), 4500);
}

function attachAddButtons() {
  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      openQuantitySelector(productId);
    });
  });

  document.querySelectorAll('.product-card').forEach((card) => {
    const openDetails = () => {
      const product = products.find((item) => item.id === Number(card.dataset.productId));
      if (!product) return;
      selectedProductId = product.id;
      detailProductImage.src = product.image;
      detailProductImage.alt = product.name;
      detailProductCategory.textContent = product.category;
      detailProductRating.textContent = `★ ${product.rating}`;
      detailProductName.textContent = product.name;
      detailProductDescription.textContent = product.description;
      detailProductPrice.textContent = getCurrency(product.price);
      productDetailOverlay.classList.remove('hidden');
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('.add-btn')) return;
      openDetails();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails();
      }
    });
  });
}

function openQuantitySelector(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  quantityProductId = product.id;
  selectedQuantity = 1;
  quantityProductImage.src = product.image;
  quantityProductImage.alt = product.name;
  quantityProductCategory.textContent = product.category;
  quantityProductName.textContent = product.name;
  quantityProductPrice.textContent = `${getCurrency(product.price)} each`;
  quantityValue.textContent = String(selectedQuantity);
  quantityOverlay.classList.remove('hidden');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const itemInCart = cart.find((item) => item.id === productId);

  if (itemInCart) {
    itemInCart.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = String(totalItems);
  cartSubtotal.textContent = getCurrency(subtotal);

  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty. Add a few pastils to get started.</div>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h4>${item.name}</h4>
            <p>${getCurrency(item.price)} each</p>
            <div class="item-actions">
              <div>
                <button class="qty-btn" type="button" data-action="decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" type="button" data-action="increase" data-id="${item.id}">+</button>
              </div>
              <span class="item-price">${getCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      const action = button.dataset.action;
      changeQuantity(productId, action === 'increase' ? 1 : -1);
    });
  });
}

function bindFilters() {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderProducts(button.dataset.category);
    });
  });
}

function getDeliveryFormData() {
  return {
    fullName: deliveryFullName.value.trim(),
    phone: deliveryPhone.value.trim(),
    address: deliveryAddress.value.trim(),
    landmark: deliveryLandmark.value.trim(),
    instructions: deliveryInstructions.value.trim()
  };
}

function getDavaoAreaPosition(addressText) {
  const normalized = addressText.toLowerCase();
  const knownAreas = {
    bajada: { x: 64, y: 45 },
    toril: { x: 78, y: 72 },
    matina: { x: 52, y: 53 },
    agdao: { x: 58, y: 39 },
    mintal: { x: 38, y: 66 },
    talomo: { x: 43, y: 41 },
    tugbok: { x: 30, y: 60 },
    sasa: { x: 74, y: 32 },
    poblation: { x: 57, y: 48 },
    'davao city': { x: 55, y: 52 },
    davao: { x: 55, y: 52 }
  };

  const matchedArea = Object.keys(knownAreas).find((area) => normalized.includes(area));
  if (matchedArea) {
    return knownAreas[matchedArea];
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = normalized.charCodeAt(index) + ((hash << 5) - hash);
  }

  const safeHash = Math.abs(hash) % 100;
  return { x: 25 + (safeHash % 55), y: 22 + ((safeHash * 7) % 50) };
}

function getDavaoMapPosition(addressText) {
  const normalized = (addressText || '').toLowerCase();
  const areas = {
    bajada: [7.0974, 125.6134],
    toril: [7.0194, 125.5001],
    matina: [7.0501, 125.5941],
    agdao: [7.0844, 125.6247],
    mintal: [7.1069, 125.5048],
    talomo: [7.0492, 125.5826],
    tugbok: [7.1016, 125.5294],
    sasa: [7.1128, 125.6532],
    poblation: [7.0731, 125.6128]
  };
  const matchedArea = Object.keys(areas).find((area) => normalized.includes(area));
  return areas[matchedArea] || [7.0731, 125.6128];
}

function createMapMarker(label, className) {
  return L.divIcon({
    className: 'gps-marker-wrapper',
    html: `<div class="gps-marker ${className}"><span>${label}</span></div>`,
    iconSize: [110, 34],
    iconAnchor: [12, 17]
  });
}

function buildRoute(destination) {
  const store = [7.0731, 125.6128];
  const midpoint = [(store[0] + destination[0]) / 2 + 0.006, (store[1] + destination[1]) / 2 - 0.008];
  routePoints = [store, [store[0] + (midpoint[0] - store[0]) * 0.45, store[1] + (midpoint[1] - store[1]) * 0.45], midpoint, [destination[0] + (midpoint[0] - destination[0]) * 0.45, destination[1] + (midpoint[1] - destination[1]) * 0.45], destination];

  if (!deliveryMap) return;
  if (routePath) routePath.remove();
  if (routeShadowPath) routeShadowPath.remove();
  routePath = L.polyline(routePoints, {
    color: '#2563eb',
    weight: 7,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(deliveryMap);
  routeShadowPath = L.polyline(routePoints, { color: '#ffffff', weight: 2, opacity: 0.9, dashArray: '2 10', lineCap: 'round' }).addTo(deliveryMap);
}

function initializeDeliveryMap() {
  if (!deliveryMapElement || typeof L === 'undefined' || deliveryMap) return;
  deliveryMap = L.map(deliveryMapElement, { zoomControl: false, attributionControl: true }).setView([7.0731, 125.6128], 12);
  L.control.zoom({ position: 'bottomright' }).addTo(deliveryMap);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(deliveryMap);

  const store = [7.0731, 125.6128];
  const destination = [7.061, 125.624];
  L.marker(store, { icon: createMapMarker('Start', 'store-gps-marker') }).addTo(deliveryMap);
  destinationMarker = L.marker(destination, { icon: createMapMarker('Destination', 'customer-gps-marker') }).addTo(deliveryMap);
  buildRoute(destination);
  driverMarker = L.marker(store, {
    icon: L.divIcon({ className: 'gps-car-wrapper', html: '<div class="gps-car" aria-label="Driver location">&#128663;</div>', iconSize: [34, 34], iconAnchor: [17, 17] }),
    zIndexOffset: 500
  }).addTo(deliveryMap);
}

function interpolateRoute(progress) {
  const scaled = Math.min(0.999, Math.max(0, progress)) * (routePoints.length - 1);
  const segment = Math.floor(scaled);
  const fraction = scaled - segment;
  const start = routePoints[segment] || routePoints[0];
  const end = routePoints[segment + 1] || routePoints[routePoints.length - 1];
  return [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction];
}

function animateDriver(progress) {
  if (!driverMarker || routePoints.length < 2) return;
  if (driverAnimationFrame) cancelAnimationFrame(driverAnimationFrame);
  const startProgress = routePoints.progress || 0;
  const startedAt = performance.now();
  const duration = 900;
  function step(now) {
    const amount = Math.min(1, (now - startedAt) / duration);
    const eased = amount * (2 - amount);
    driverMarker.setLatLng(interpolateRoute(startProgress + (progress - startProgress) * eased));
    if (amount < 1) driverAnimationFrame = requestAnimationFrame(step);
    else routePoints.progress = progress;
  }
  requestAnimationFrame(step);
}

async function updateMapMarker(addressText) {
  initializeDeliveryMap();
  if (!deliveryMap) return;
  const query = `${addressText}, Davao City, Philippines`;
  const requestGeocode = async (searchQuery) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=${encodeURIComponent(searchQuery)}`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Address lookup failed');
    const results = await response.json();
    return results[0];
  };

  let result = await requestGeocode(query);
  const barangayMatch = addressText.match(/(?:brgy|barangay)\s+([^,]+)/i);
  if (!result && barangayMatch) {
    result = await requestGeocode(`${barangayMatch[1].trim()}, Davao City, Philippines`);
  }

  const latitude = Number(result?.lat);
  const longitude = Number(result?.lon);
  const isDavaoCity = latitude >= 6.85 && latitude <= 7.35 && longitude >= 125.40 && longitude <= 125.80;
  if (!result || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !isDavaoCity) {
    throw new Error('Address is outside Davao City or could not be found');
  }
  const destination = [latitude, longitude];
  if (destinationMarker) destinationMarker.remove();
  destinationMarker = L.marker(destination, { icon: createMapMarker('Destination', 'customer-gps-marker') }).addTo(deliveryMap);
  buildRoute(destination);
  deliveryMap.fitBounds(L.latLngBounds(routePoints), { padding: [28, 28], maxZoom: 14 });
  animateDriver(0);
  return result.display_name;
}

async function validateDeliveryForm() {
  const { fullName, phone, address, landmark, instructions } = getDeliveryFormData();

  if (!fullName || !phone || !address || !landmark) {
    deliveryMessage.textContent = 'Please complete all delivery details before placing your order.';
    deliveryMessage.className = 'delivery-message error';
    return null;
  }

  const cityValue = `${address} ${landmark}`.toLowerCase();
  if (!cityValue.includes('davao')) {
    deliveryMessage.textContent = 'Please enter a valid delivery address in Davao City.';
    deliveryMessage.className = 'delivery-message error';
    return null;
  }

  if (phone.length < 10) {
    deliveryMessage.textContent = 'Please enter a valid mobile number.';
    deliveryMessage.className = 'delivery-message error';
    return null;
  }

  const formattedAddress = `${address}, ${landmark}.`;
  let resolvedAddress;
  try {
    resolvedAddress = await updateMapMarker(formattedAddress);
  } catch (error) {
    deliveryMessage.textContent = 'We could not find that exact Davao City address. Please add a street or barangay.';
    deliveryMessage.className = 'delivery-message error';
    return null;
  }
  deliveryMessage.textContent = 'Order placed successfully!';
  deliveryMessage.className = 'delivery-message success';
  deliveryPhoneDisplay.textContent = phone;
  document.getElementById('checkoutAddressDisplay').textContent = resolvedAddress || formattedAddress;
  renderSummary();
  document.getElementById('checkoutSummaryCard').classList.remove('hidden');
  return formattedAddress;
}

function setOrderStatus(statusText) {
  const selectedStatus = statusText || 'Preparing';
  if (!orderStatusBadge) return;

  orderStatusBadge.dataset.status = selectedStatus;
  orderStatusBadge.textContent = selectedStatus;
  orderStatusBadge.classList.add('active');

  const progressByStatus = {
    Preparing: 0,
    'For Pickup': 0.42,
    'On the Way': 0.78,
    Delivered: 1
  };
  initializeDeliveryMap();
  animateDriver(progressByStatus[selectedStatus] || 0);

  const statusColorMap = {
    Preparing: 'rgba(34,197,94,0.12)',
    'For Pickup': 'rgba(245,158,11,0.12)',
    'On the Way': 'rgba(59,130,246,0.12)',
    Delivered: 'rgba(22,163,74,0.14)'
  };

  orderStatusBadge.style.background = statusColorMap[selectedStatus] || statusColorMap.Preparing;
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  if (feedbackOverlay && selectedStatus !== 'Delivered') feedbackOverlay.classList.add('hidden');
  if (feedbackOverlay && selectedStatus === 'Delivered') {
    feedbackOverlay.classList.remove('hidden');
  }
}

function advanceOrderStatusSequence() {
  if (!orderStatusBadge) return;

  const currentIndex = ORDER_STATUSES.indexOf(orderStatusBadge.dataset.status || 'Preparing');
  const nextStatus = ORDER_STATUSES[(currentIndex + 1) % ORDER_STATUSES.length];
  setOrderStatus(nextStatus);
}

function startOrderTracking() {
  clearTimeout(orderStatusTimer);
  clearTimeout(feedbackTimer);
  feedbackTimer = null;
  setOrderStatus('Preparing');

  orderStatusTimer = setTimeout(() => {
    setOrderStatus('For Pickup');
  }, 3500);

  orderStatusTimer = setTimeout(() => {
    setOrderStatus('On the Way');
  }, 7000);

  setTimeout(() => {
    setOrderStatus('Delivered');
  }, 10500);
}

async function handlePlaceOrder(event) {
  event.preventDefault();

  if (!cart.length) {
    deliveryMessage.textContent = 'Your cart is empty. Add a product before placing the order.';
    deliveryMessage.className = 'delivery-message error';
    return;
  }

  const formattedAddress = await validateDeliveryForm();
  if (!formattedAddress) return;

  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  document.getElementById('summaryOrderNumber').textContent = orderNumber;
  document.getElementById('checkoutOrderNumber').textContent = orderNumber;
  document.getElementById('checkoutTitle').textContent = 'Order Placed';
  startOrderTracking();
  document.getElementById('checkoutAddressDisplay').textContent = formattedAddress;
  cart.length = 0;
  renderCart();
  deliveryForm.reset();
}

function renderSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = 145.5;
  const discount = 0;
  const total = subtotal + serviceCharge - discount;

  document.getElementById('summaryItems').innerHTML = cart
    .map(
      (item) => `
        <div class="summary-item">
          <div>
            <h4>${item.name}</h4>
            <div class="qty">Qty - ${item.quantity}</div>
          </div>
          <div class="item-total">${getCurrency(item.price * item.quantity)}</div>
        </div>
      `
    )
    .join('');

  document.getElementById('discountValue').textContent = `-Rs. ${discount.toFixed(2)}`;
  document.getElementById('serviceCharge').textContent = `Rs. ${serviceCharge.toFixed(2)}`;
  document.getElementById('grandTotal').textContent = `Rs. ${total.toFixed(2)}`;
  document.getElementById('summaryOrderNumber').textContent = '454332';
  document.getElementById('checkoutOrderNumber').textContent = '454332';
  document.getElementById('checkoutAddressDisplay').textContent = 'Please complete the form before placing the order.';
}

function bindCartToggle() {
  const cartButton = document.querySelector('.cart-btn');
  const closeCart = document.querySelector('.close-cart');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');
  const summaryClose = document.getElementById('summaryClose');
  const checkoutBackBtn = document.getElementById('checkoutBackBtn');

  const closeProductDetails = () => {
    productDetailOverlay.classList.add('hidden');
    selectedProductId = null;
  };

  productDetailClose.addEventListener('click', closeProductDetails);
  productDetailOverlay.addEventListener('click', (event) => {
    if (event.target === productDetailOverlay) closeProductDetails();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !productDetailOverlay.classList.contains('hidden')) {
      closeProductDetails();
    }
  });
  detailAddButton.addEventListener('click', () => {
    if (selectedProductId === null) return;
    closeProductDetails();
    openQuantitySelector(selectedProductId);
  });

  const closeQuantitySelector = () => {
    quantityOverlay.classList.add('hidden');
    quantityProductId = null;
  };

  quantityClose.addEventListener('click', closeQuantitySelector);
  quantityOverlay.addEventListener('click', (event) => {
    if (event.target === quantityOverlay) closeQuantitySelector();
  });
  quantityDecrease.addEventListener('click', () => {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    quantityValue.textContent = String(selectedQuantity);
  });
  quantityIncrease.addEventListener('click', () => {
    selectedQuantity = Math.min(99, selectedQuantity + 1);
    quantityValue.textContent = String(selectedQuantity);
  });
  quantityAddButton.addEventListener('click', () => {
    if (quantityProductId === null) return;
    for (let count = 0; count < selectedQuantity; count += 1) addToCart(quantityProductId);
    closeQuantitySelector();
  });

  ratingStars.forEach((star) => {
    star.addEventListener('click', () => {
      const rating = Number(star.dataset.rating);
      ratingStars.forEach((item) => item.classList.toggle('selected', Number(item.dataset.rating) <= rating));
      feedbackOverlay.dataset.rating = String(rating);
    });
  });

  submitFeedbackBtn.addEventListener('click', () => {
    if (!feedbackOverlay.dataset.rating) {
      feedbackMessage.textContent = 'Please choose a star rating first.';
      feedbackMessage.style.color = '#b45309';
      return;
    }
    feedbackMessage.textContent = 'Thank you for your feedback!';
    feedbackMessage.style.color = '#15803d';
    submitFeedbackBtn.disabled = true;
  });

  orderAgainBtn.addEventListener('click', () => {
    feedbackOverlay.classList.add('hidden');
    checkoutOverlay.classList.add('hidden');
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  });

  cartButton.addEventListener('click', () => {
    cartPanel.classList.add('open');
  });

  closeCart.addEventListener('click', () => {
    cartPanel.classList.remove('open');
  });

  const openCheckout = () => {
    if (!cart.length) {
      alert('Your cart is empty. Add a product before checkout.');
      return;
    }

    document.getElementById('checkoutSummaryCard').classList.add('hidden');
    feedbackOverlay.classList.add('hidden');
    feedbackOverlay.removeAttribute('data-rating');
    feedbackMessage.textContent = '';
    feedbackText.value = '';
    ratingStars.forEach((star) => star.classList.remove('selected'));
    submitFeedbackBtn.disabled = false;
    document.getElementById('deliveryMessage').textContent = '';
    document.getElementById('deliveryMessage').className = 'delivery-message';
    checkoutOverlay.classList.remove('hidden');
    cartPanel.classList.remove('open');
    initializeDeliveryMap();
    setTimeout(() => deliveryMap?.invalidateSize(), 0);
  };

  document.querySelector('.checkout-btn').addEventListener('click', openCheckout);
  proceedCheckoutBtn.addEventListener('click', openCheckout);

  function closeCheckout() {
    checkoutOverlay.classList.add('hidden');
    document.getElementById('checkoutSummaryCard').classList.add('hidden');
  }

  summaryClose.addEventListener('click', closeCheckout);
  checkoutBackBtn.addEventListener('click', closeCheckout);
}

initAuthFlow();
renderProducts();
bindFilters();
bindCartToggle();
renderCart();
initializeDeliveryMap();
initializeShowcase();
