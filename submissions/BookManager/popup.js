document.addEventListener('DOMContentLoaded', function() {
  const bookForm = document.getElementById('add-book-form');
  const booksList = document.getElementById('books-list');
  const totalBooksEl = document.getElementById('total-books');
  const completedBooksEl = document.getElementById('completed-books');
  const inProgressBooksEl = document.getElementById('in-progress-books');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  let books = [];
  let currentFilter = 'all';
  
  // Load books from storage
  loadBooks();
  
  // Event listeners
  bookForm.addEventListener('submit', addBook);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      
      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Render books with the selected filter
      renderBooks();
    });
  });
  
  // Functions
  function loadBooks() {
    chrome.storage.sync.get('books', function(data) {
      if (data.books) {
        books = data.books;
        renderBooks();
        updateStats();
      }
    });
  }
  
  function saveBooks() {
    chrome.storage.sync.set({books: books}, function() {
      renderBooks();
      updateStats();
    });
  }
  
  function addBook(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const totalPages = parseInt(document.getElementById('total-pages').value);
    const currentPage = parseInt(document.getElementById('current-page').value);
    
    if (currentPage > totalPages) {
      alert('Current page cannot be greater than total pages');
      return;
    }
    
    const book = {
      id: Date.now(),
      title,
      author,
      totalPages,
      currentPage,
      dateAdded: new Date().toISOString(),
      isCompleted: currentPage === totalPages
    };
    
    books.push(book);
    saveBooks();
    
    // Reset form
    bookForm.reset();
  }
  
  function renderBooks() {
    booksList.innerHTML = '';
    
    let filteredBooks = books;
    
    if (currentFilter === 'completed') {
      filteredBooks = books.filter(book => book.isCompleted);
    } else if (currentFilter === 'in-progress') {
      filteredBooks = books.filter(book => !book.isCompleted);
    }
    
    if (filteredBooks.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No books found.';
      booksList.appendChild(emptyMessage);
      return;
    }
    
    filteredBooks.forEach(book => {
      const bookItem = document.createElement('li');
      bookItem.className = `book-item ${book.isCompleted ? 'completed' : ''}`;
      
      const progress = Math.round((book.currentPage / book.totalPages) * 100);
      
      bookItem.innerHTML = `
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
        <div class="book-progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="book-stats">
          <span>${book.currentPage} of ${book.totalPages} pages</span>
          <span>${progress}% complete</span>
        </div>
        <div class="book-actions">
          <button class="update-btn" data-id="${book.id}">Update Progress</button>
          <button class="delete-btn" data-id="${book.id}">Delete</button>
        </div>
      `;
      
      booksList.appendChild(bookItem);
    });
    
    // Add event listeners to newly created buttons
    document.querySelectorAll('.update-btn').forEach(button => {
      button.addEventListener('click', updateBookProgress);
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', deleteBook);
    });
  }
  
  function updateBookProgress(e) {
    const bookId = parseInt(e.target.dataset.id);
    const book = books.find(book => book.id === bookId);
    
    if (!book) return;
    
    const newPage = prompt(`Current page (1-${book.totalPages}):`, book.currentPage);
    
    if (newPage === null) return;
    
    const newPageNum = parseInt(newPage);
    
    if (isNaN(newPageNum) || newPageNum < 0 || newPageNum > book.totalPages) {
      alert(`Please enter a valid page number between 0 and ${book.totalPages}`);
      return;
    }
    
    book.currentPage = newPageNum;
    book.isCompleted = newPageNum === book.totalPages;
    
    saveBooks();
  }
  
  function deleteBook(e) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    const bookId = parseInt(e.target.dataset.id);
    books = books.filter(book => book.id !== bookId);
    
    saveBooks();
  }
  
  function updateStats() {
    const totalBooks = books.length;
    const completedBooks = books.filter(book => book.isCompleted).length;
    const inProgressBooks = totalBooks - completedBooks;
    
    totalBooksEl.textContent = totalBooks;
    completedBooksEl.textContent = completedBooks;
    inProgressBooksEl.textContent = inProgressBooks;
  }
});
