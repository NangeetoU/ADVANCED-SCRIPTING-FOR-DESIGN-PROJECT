// อ้างอิง Element จาก HTML
const bookList = document.getElementById('book-list');
const typeFilter = document.getElementById('type-filter');
const emptyState = document.getElementById('empty-state');
const cartCount = document.getElementById('cart-count');
const cartFeedback = document.getElementById('cart-feedback');

// Key สำหรับบันทึกข้อมูลใน LocalStorage
const CART_STORAGE_KEY = 'bookbraly_cart';

let allBooks = [];
let cart = [];
let feedbackTimer = null;

// 1. ฟังก์ชันแสดงรายการหนังสือ
function renderBooks(books) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  books.forEach((book, index) => {
    const card = document.createElement('article');
    card.className = 'book-card catalog-card-enter group bg-white border border-[#BDC3C7] p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300';
    card.style.animationDelay = `${index * 50}ms`;

    card.innerHTML = `
      <div class="relative w-full h-72 bg-[#f3f3f3] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        <img src="${book.image}" alt="${book.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
             onerror="this.src='https://via.placeholder.com/300x400?text=No+Image';" />
        <div class="absolute top-2 right-2 bg-[#2C3E50]/80 text-white text-[10px] px-2 py-1 rounded uppercase tracking-widest">
            ${book.type}
        </div>
      </div>
      
      <h3 class="font-bold text-[#2C3E50] text-lg leading-tight h-14 line-clamp-2 mb-2 group-hover:text-[#E67E22] transition-colors">
        ${book.title}
      </h3>
      
      <p class="text-[#E67E22] font-bold text-xl mb-4">฿ ${book.price.toLocaleString()}.00</p>
      
      <div class="flex items-center gap-2 mt-auto">
        <input type="number" min="1" value="1" class="cart-qty w-14 border border-[#BDC3C7] rounded-lg px-2 py-2 text-center text-sm outline-none focus:border-[#E67E22]">
        <button class="cart-btn flex-1 bg-[#2C3E50] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#E67E22] transition-all" 
                data-book-id="${book.id}">
            ADD TO CART
        </button>
      </div>
    `;

    bookList.appendChild(card);
  });
}

// 2. ระบบกรองประเภทหนังสือ
function applyTypeFilter() {
  const selectedType = typeFilter.value;
  const filteredBooks = selectedType === 'all' 
    ? [...allBooks] 
    : allBooks.filter(book => book.type === selectedType);

  renderBooks(filteredBooks);
}

// 3. สร้างตัวเลือกหมวดหมู่ใน Select
function fillTypeOptions(books) {
  const types = [...new Set(books.map(book => book.type))].sort();
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });
}

// 4. จัดการ LocalStorage
function saveCartToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCartFromStorage() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

// 5. อัปเดตตัวเลขตะกร้า
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = total;
}

// 6. เพิ่มสินค้าลงตะกร้า
function addToCart(bookId, quantity) {
  const book = allBooks.find(b => b.id === bookId);
  if (!book) return;

  const existing = cart.find(item => item.id === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...book, quantity });
  }

  saveCartToStorage();
  updateCartCount();
  showCartFeedback(`Added ${quantity} item(s) to cart`);
}

function showCartFeedback(msg) {
  if (!cartFeedback) return;
  cartFeedback.textContent = msg;
  cartFeedback.classList.remove('hidden');
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => cartFeedback.classList.add('hidden'), 2000);
}

// 7. Event Listeners
function attachCartHandlers() {
  bookList.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-btn')) {
      const btn = e.target;
      const card = btn.closest('article');
      const qtyInput = card.querySelector('.cart-qty');
      const quantity = parseInt(qtyInput.value) || 1;
      const bookId = parseInt(btn.dataset.bookId);

      addToCart(bookId, quantity);
      
      // Animation Effect
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 300);
    }
  });
}

// 8. เริ่มต้นระบบ
async function initCatalog() {
  try {
    const response = await fetch('books.json');
    allBooks = await response.json();

    fillTypeOptions(allBooks);
    renderBooks(allBooks);
    
    cart = loadCartFromStorage();
    updateCartCount();
    
    typeFilter.addEventListener('change', applyTypeFilter);
    attachCartHandlers();
  } catch (error) {
    console.error('Error:', error);
    if (emptyState) emptyState.textContent = 'ไม่สามารถโหลดข้อมูลหนังสือได้';
  }
}

initCatalog();