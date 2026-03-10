const bookList = document.getElementById('book-list');
const typeFilter = document.getElementById('type-filter');
const emptyState = document.getElementById('empty-state');
const cartCount = document.getElementById('cart-count');
const cartFeedback = document.getElementById('cart-feedback');

const CART_STORAGE_KEY = 'bookbraly_cart';

let allBooks = [];
let cart = [];
let feedbackTimer = null;

function renderBooks(books) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  books.forEach((book, index) => {
    const card = document.createElement('article');
    card.className = 'book-card catalog-card-enter text-center block group bg-[#FDFCF0] border border-[#BDC3C7] p-4 rounded transition-transform duration-300 hover:-translate-y-1';
    card.style.animationDelay = `${index * 60}ms`;

    card.innerHTML = `
      <div class="w-full h-72 bg-[#BDC3C7] rounded mb-4 flex items-center justify-center text-[#1A1A1A] overflow-hidden shadow-md">
        <img src="${book.image}" alt="${book.title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.textContent='No Image';" />
      </div>
      <h3 class="font-bold text-[#2C3E50] group-hover:text-[#E67E22] transition-colors">${book.title}</h3>
      <p class="text-[#2C3E50] text-sm mt-1">${book.type}</p>
      <p class="text-[#E67E22] font-semibold mt-1">&#3647; ${book.price.toFixed(2)}</p>
      <div class="mt-4 flex items-center justify-center gap-2">
        <input type="number" min="1" value="1" class="cart-qty w-16 border border-[#BDC3C7] rounded px-2 py-1 text-center" aria-label="Quantity for ${book.title}">
        <button class="cart-btn border border-[#2C3E50] text-[#2C3E50] px-3 py-1 rounded font-semibold hover:bg-[#2C3E50] hover:text-white transition" data-book-id="${book.id}">Add to Cart</button>
      </div>
    `;

    bookList.appendChild(card);
  });
}

function applyTypeFilter() {
  const selectedType = typeFilter.value;

  const filteredBooks =
    selectedType === 'all'
      ? [...allBooks]
      : allBooks.filter((book) => book.type === selectedType);

  const sortedBooks = filteredBooks.sort((a, b) => a.type.localeCompare(b.type));
  renderBooks(sortedBooks);
}

function fillTypeOptions(books) {
  const types = [...new Set(books.map((book) => book.type))].sort();

  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

function loadCartFromStorage() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveCartToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total.toString();
}

function showCartFeedback(message) {
  if (!cartFeedback) return;

  cartFeedback.textContent = message;
  cartFeedback.classList.remove('hidden');

  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }

  feedbackTimer = setTimeout(() => {
    cartFeedback.classList.add('hidden');
  }, 1600);
}

function addToCart(bookId, quantity) {
  const book = allBooks.find((item) => item.id === bookId);
  if (!book) return;

  const existing = cart.find((item) => item.id === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      price: book.price,
      type: book.type,
      image: book.image,
      quantity,
    });
  }

  saveCartToStorage();
  updateCartCount();
  showCartFeedback(`Added ${quantity} to cart`);
}

function attachCartHandlers() {
  bookList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('cart-btn')) return;

    const card = target.closest('article');
    if (!card) return;

    const qtyInput = card.querySelector('.cart-qty');
    const rawQty = qtyInput ? Number(qtyInput.value) : 1;
    const quantity = Number.isFinite(rawQty) && rawQty > 0 ? Math.floor(rawQty) : 1;

    const bookId = Number(target.dataset.bookId);
    if (!Number.isFinite(bookId)) return;

    addToCart(bookId, quantity);
    target.classList.add('is-pressed');
    setTimeout(() => target.classList.remove('is-pressed'), 350);
  });
}

async function initCatalog() {
  try {
    const response = await fetch('books.json');
    allBooks = await response.json();

    fillTypeOptions(allBooks);
    applyTypeFilter();

    const storedCart = loadCartFromStorage();
    if (storedCart) {
      cart = storedCart;
    } else {
      const cartResponse = await fetch('cart.json');
      const cartData = await cartResponse.json();
      cart = Array.isArray(cartData) ? cartData : [];
      saveCartToStorage();
    }

    updateCartCount();
  } catch (error) {
    emptyState.classList.remove('hidden');
    emptyState.textContent = 'Could not load books right now.';
    console.error('Error loading books:', error);
  }
}

typeFilter.addEventListener('change', applyTypeFilter);
attachCartHandlers();

initCatalog();


