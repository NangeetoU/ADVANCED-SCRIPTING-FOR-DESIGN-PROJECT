const bookList = document.getElementById('book-list');
const typeFilter = document.getElementById('type-filter');
const emptyState = document.getElementById('empty-state');

let allBooks = [];

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

async function initCatalog() {
  try {
    const response = await fetch('books.json');
    allBooks = await response.json();

    fillTypeOptions(allBooks);
    applyTypeFilter();
  } catch (error) {
    emptyState.classList.remove('hidden');
    emptyState.textContent = 'Could not load books right now.';
    console.error('Error loading books:', error);
  }
}

typeFilter.addEventListener('change', applyTypeFilter);

initCatalog();