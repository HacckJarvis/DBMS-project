const API = "http://localhost:4000";
let allBooks = []; // store fetched books globally

// ---------- SWEETALERT2 HELPER FUNCTIONS ----------
function showSuccess(message) {
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: message,
    confirmButtonColor: '#3085d6',
  });
}

function showError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    confirmButtonColor: '#d33',
  });
}

function confirmAction(message, callback) {
  Swal.fire({
    title: 'Are you sure?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, do it!'
  }).then((result) => {
    if (result.isConfirmed) callback();
  });
}

// ---------- LOGIN ----------
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        window.location = "dashboard.html";
      } else {
        showError("Invalid username or password!");

      }
    });
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location = "index.html";
}

// ---------- LOAD BOOKS ----------
if (window.location.pathname.includes("dashboard.html")) {
  if (!localStorage.getItem("isLoggedIn")) {
    window.location = "index.html";
  }
  loadBooks();
}

function loadBooks() {
  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      allBooks = data;
      displayBooks(data);
    });
}

function displayBooks(books) {
  const tbody = document.querySelector("#bookTable tbody");
  tbody.innerHTML = "";
  books.forEach(book => {
    tbody.innerHTML += `
      <tr>
        <td>${book.id}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.copies}</td>
        <td>
          <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', '${book.isbn}', ${book.copies})">Edit</button>
          <button onclick="deleteBook(${book.id})" style="background:red;">Delete</button>
        </td>
      </tr>`;
  });
}

// ---------- ADD BOOK ----------
function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const isbn = document.getElementById("isbn").value;
  const copies = document.getElementById("copies").value;

  fetch(`${API}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, isbn, copies })
  })
    .then(res => res.json())
    .then(data => {
      showSuccess(data.message);

      loadBooks();
    });
}

// ---------- DELETE BOOK ----------
function deleteBook(id) {
  confirmAction("Do you really want to delete this book?", () => {
  fetch(`${API}/books/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      showSuccess(data.message);
      loadBooks();
    });
});

}

// ---------- EDIT BOOK ----------
function editBook(id, title, author, isbn, copies) {
  const newTitle = prompt("Enter new title:", title);
  const newAuthor = prompt("Enter new author:", author);
  const newIsbn = prompt("Enter new ISBN:", isbn);
  const newCopies = prompt("Enter new number of copies:", copies);

  if (newTitle && newAuthor && newIsbn && newCopies) {
    fetch(`${API}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        author: newAuthor,
        isbn: newIsbn,
        copies: parseInt(newCopies)
      })
    })
      .then(res => res.json())
      .then(data => {
        showSuccess(data.message);

        loadBooks();
      });
  }
}

// ---------- FILTER / SEARCH ----------
function filterBooks() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  );
  displayBooks(filtered);
}

// ---------- TAB SWITCH ----------
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  if (tabId === "issuedList") loadIssuedBooks();
}

// ---------- ISSUE BOOK ----------
function issueBook() {
  const book_id = document.getElementById("bookIdIssue").value;
  const student_name = document.getElementById("studentName").value;

  fetch(`${API}/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id, student_name })
  })
    .then(res => res.json())
    .then(data => {
      showSuccess(data.message);

      document.getElementById("bookIdIssue").value = "";
      document.getElementById("studentName").value = "";
      loadBooks();
    });
}

// ---------- LOAD ISSUED BOOKS ----------
function loadIssuedBooks() {
  fetch(`${API}/issued`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#issuedTable tbody");
      tbody.innerHTML = "";
      data.forEach(item => {
        tbody.innerHTML += `
          <tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.student_name}</td>
            <td>${item.issue_date}</td>
            <td>${item.return_date ? item.return_date : '-'}</td>
            <td>${item.status}</td>
            <td>${
              item.status === "Issued"
                ? `<button onclick="returnBook(${item.id})">Return</button>`
                : "-"
            }</td>
          </tr>`;
      });
    });
}

// ---------- RETURN BOOK ----------
function returnBook(id) {
  fetch(`${API}/return/${id}`, { method: "PUT" })
    .then(res => res.json())
    .then(data => {
      showSuccess(data.message);

      loadIssuedBooks();
      loadBooks();
    });
}
