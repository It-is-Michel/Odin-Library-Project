class Book {

  constructor(title, author, summary, pagesRead, totalPages, coverImageFile) {
    this.title = title;
    this.author = author;
    this.summary = summary;
    this.pagesRead = pagesRead;
    this.totalPages = totalPages;
    this.coverImageFile = coverImageFile;

    this.#bookElement.classList.add("book");

    this.#titleWrapper.classList.add("book__title-wrapper");
    this.#bookElement.appendChild(this.#titleWrapper);

    this.#titleElement.classList.add("book__title");
    this.#titleWrapper.appendChild(this.#titleElement);
    this.#setTitle(title);

    this.#authorElement.classList.add("book__author");
    this.#titleWrapper.appendChild(this.#authorElement);
    this.#setAuthor(author);

    this.#summaryElement.classList.add("book__summary");
    this.#bookElement.appendChild(this.#summaryElement);
    this.#setSummary(summary);

    this.#pagesElement.classList.add("book__pages");
    this.#bookElement.appendChild(this.#pagesElement);

    this.#setPages(totalPages, pagesRead);

    this.#coverElement.classList.add("book__cover");
    this.#bookElement.appendChild(this.#coverElement);
    this.#setCoverImg(coverImageFile);
  };

  #bookElement = document.createElement("article");
  
  get bookElement() {return this.#bookElement};

  #titleWrapper = document.createElement("div");
  #titleElement = document.createElement("h1");
  #authorElement = document.createElement("cite");
  #summaryElement = document.createElement("p");
  #pagesElement = document.createElement("span");
  #coverElement = document.createElement("div");

  #coverFileReader = new FileReader();

  #setTitle(title) {
    if (typeof title != "string" || title == "") title = "none";

    this.#titleElement.textContent = title;
  };

  #setAuthor(author) {
    if (typeof author != "string" || author == "") author = "none";

    this.#authorElement.textContent = `by ${author}`;
  };

  #setSummary(summary) {
    if (typeof summary != "string") summary = "...";

    this.#summaryElement.textContent = summary;
  };

  #setPages(totalPages, readPages) {
    const totalPagesIsNumber = typeof totalPages == "number";
    const totalPagesIsPositive = totalPages > 0;
    totalPages = totalPagesIsNumber && totalPagesIsPositive ? Math.trunc(totalPages) : NaN;

    const readPagesIsNumber = (typeof readPages == "number");
    const readPagesIsNotNegative = readPages >= 0;
    readPages = readPagesIsNumber && readPagesIsNotNegative ? Math.trunc(readPages) : NaN;
    
    const pagesTextContent = `${readPages} / ${totalPages} pages`;
    
    this.#pagesElement.textContent = pagesTextContent;

    const readStatus = (Number.isNaN(totalPages) || Number.isNaN(readPages) || readPages > totalPages) ? "Error"
    : readPages == totalPages ? "Read"
    : readPages == 0 ? "Not read"
    : "Reading";

    const readStatusElement = document.createElement("span");
    this.#pagesElement.prepend(readStatusElement);
    readStatusElement.textContent = readStatus;
    switch (readStatus) {
      case "Read":
        readStatusElement.classList.add("book__read-status-read");
        break;
      case "Reading":
        readStatusElement.classList.add("book__read-status-reading");
        break;
      case "Not read":
        readStatusElement.classList.add("book__read-status-not-read");
        break;
      case "Error":
        readStatusElement.classList.add("book__read-status-error");
        break;
      default:
        console.error(`There was a problem when adding a css class to readStatusElement; readStatus value: ${readStatus}; readStatusElement value: ${readStatusElement}`);
    };
  };

  #setCoverImg(coverImageFile) {
    const coverImageFileIsFile = coverImageFile instanceof File;
    const coverImageFileHasValidFormat = coverImageFileIsFile ? coverImageFile.type.startsWith("image/") : null;
    if (!coverImageFileIsFile || !coverImageFileHasValidFormat) {
      this.#coverElement.textContent = "No image";
      return;
    }

    this.#coverFileReader.onload = (e) => {
      const coverImageUrl = e.target.result;
      this.#coverElement.style.backgroundImage = `url("${coverImageUrl}")`;
    }
    this.#coverFileReader.readAsDataURL(coverImageFile);
  }
}

const LibraryController = {
  _library: document.querySelector("#library"),

  _buttons: {
    addBook: document.querySelector("#libraryAddBookButton"),
    editBook: document.querySelector("#libraryEditBookButton"),
    deleteBook: document.querySelector("#libraryDeleteBookButton")
  },

  _BookForm: {
    _bookForm: document.querySelector("#modifyBookForm"),

    _fields: {
      coverDropBox: document.querySelector("#modifyBookFormCoverDropBox"),
      coverInput: document.querySelector("#modifyBookFormCoverInput"),
      titleInput: document.querySelector("#modifyBookFormTitleInput"),
      authorInput: document.querySelector("#modifyBookFormAuthorInput"),
      summaryTextarea: document.querySelector("#modifyBookFormEditSummaryTextarea"),
      pagesReadInput: document.querySelector("#modifyBookFormPagesReadInput"),
      totalPagesInput: document.querySelector("#modifyBookFormTotalPagesInput"),
    },

    _buttons: {
      cancelButton: document.querySelector("#modifyBookFormCancelButton"),
      acceptButton: document.querySelector("#modifyBookFormAcceptButton")
    },

    _overlay: document.querySelector("#overlay"),

    _openForm() {
      this._overlay.style.removeProperty("display");
      this._bookForm.style.removeProperty("display");
    },

    _closeForm() {
      this._overlay.style.display = "none";
      this._bookForm.style.display = "none";
      this._cleanForm();
    },

    _currentResolve: null,
    _currentReject: null,
    getNewBookData() {
      this._openForm();

      return new Promise((resolve, reject) => {
        this._currentResolve = resolve;
        this._currentReject = reject;
      });
    },

    _loadBookData(bookData) {
      this._fields.titleInput.value = bookData.title;
      this._fields.authorInput.value = bookData.author;
      this._fields.summaryTextarea.value = bookData.summary;
      this._fields.pagesReadInput.value = bookData.pagesRead;
      this._fields.totalPagesInput.value = bookData.totalPages;
      this._fields.coverInput.files[0] = bookData.coverImageFile;
    },

    getUpdatedBookData(bookData) {
      this._loadBookData(bookData);
      const newBookData = this.getNewBookData();
      return newBookData;
    },

    _formDataIsValid() {
      const titleValue = this._fields.titleInput.value;
      const authorValue = this._fields.authorInput.value;
      const pagesReadValue = this._fields.pagesReadInput.value;
      const totalPagesValue = this._fields.totalPagesInput.value;

      const titleIsEmpty = titleValue == "";
      if (titleIsEmpty) {
        console.error("Title can't be empty");
        return false;
      }
      const titleIsString = typeof titleValue === "string";
      if (!titleIsString) {
        console.error("Title has to be string");
        return false;
      }

      const authorIsEmpty = authorValue == "";
      if (authorIsEmpty) {
        console.error("Author can't be empty");
        return false;
      }
      const authorIsString = typeof authorValue === "string";
      if (!authorIsString) {
        console.error("Author has to be string");
        return false;
      }

      const pagesReadIsNumber = !isNaN(pagesReadValue);
      if (!pagesReadIsNumber) {
        console.error("Pages read has to be a number");
        return false;
      }
      const pagesReadHas1To4Digits = pagesReadValue.length > 0 && pagesReadValue.length < 5;
      if (!pagesReadHas1To4Digits) {
        console.error("Pages read need 1 to 4 digits. Ej: '0', '9999'");
        return false;
      }

      const totalPagesIsNumber = !isNaN(totalPagesValue);
      if (!totalPagesIsNumber) {
        console.error("Total pages has to be a number");
        return false;
      }
      const totalPagesHas1To4Digits = totalPagesValue.length > 0 && totalPagesValue.length < 5;
      if (!totalPagesHas1To4Digits) {
        console.error("Total pages need 1 to 4 digits. Ej: '0', '9999'");
        return false;
      }
      const totalPagesIsZero = totalPagesValue == 0;
      if (totalPagesIsZero) {
        console.error("Total pages has to be greater than 0");
        return false;
      }

      const pagesReadIsLessOrEqualToTotalPages = Number(pagesReadValue) <= Number(totalPagesValue);
      if (!pagesReadIsLessOrEqualToTotalPages) {
        console.error("Pages read have to be less or equal to book's pages");
        return false;
      }

      return true;
    },

    _getFormData() {
      const formData = {
      title: this._fields.titleInput.value,
      author: this._fields.authorInput.value,
      summary: this._fields.summaryTextarea.value,
      pagesRead: Number(this._fields.pagesReadInput.value),
      totalPages: Number(this._fields.totalPagesInput.value),
      coverImageFile: this._fields.coverInput.files[0],
      };
      return formData;
    },

    _submitNewBookData() {
      const formDataIsInvalid = !this._formDataIsValid();
      if(formDataIsInvalid) {
        console.error("Form data is invalid");
        return;
      }

      const newBookData = this._getFormData();

      this._currentResolve(newBookData);
      this._currentResolve = null;

      this._closeForm();
    },

    _rejectSubmit() {
      this._closeForm();
      try {
        this._currentReject(new Error("Form rejected"));
        this._currentReject = null;
      } catch {
        console.error("Error rejecting form");
      }
    },

    _cleanForm() {
      this._fields.titleInput.value = "";
      this._fields.authorInput.value = "";
      this._fields.summaryTextarea.value = "";
      this._fields.pagesReadInput.value = "";
      this._fields.totalPagesInput.value = "";
      this._fields.coverInput.files[0] = "";
    },

    init() {
      this._closeForm();

      const clickEventHandler = (e) => {
        if (e.target.closest(`#${this._buttons.acceptButton.id}`)) {
          this._submitNewBookData();
          return;
        };
        if (e.target.closest(`#${this._buttons.cancelButton.id}`)) {
          this._rejectSubmit();
          return;
        };
        if (e.target.closest(`#${this._fields.coverDropBox.id}`)) {
          this._fields.coverInput.click();
          return;
        }
      };
      this._bookForm.addEventListener("click", clickEventHandler);

      // this._fields.coverInput.addEventListener("drop", drop);
    }
  },

  _LibraryStorage: {
    _libraryStorage: document.querySelector("#libraryBooksContainer"),
    
    _books: {},

    getBook(bookUUID) {
      return this._books[bookUUID];
    },

    addBook(book) {
      const bookUUID = crypto.randomUUID();
      this._books[bookUUID] = book;
      this._books[bookUUID].bookElement.setAttribute("UUID", bookUUID);
      this._libraryStorage.appendChild(book.bookElement);
    },

    editBook(bookUUID, updatedBook) {
      const oldBook = this._books[bookUUID].bookElement;
      this._books[bookUUID] = updatedBook;
      this._books[bookUUID].bookElement.setAttribute("UUID", bookUUID);
      this._libraryStorage.appendChild(updatedBook.bookElement);
      this._libraryStorage.removeChild(oldBook);
    },

    deleteBook(bookUUID) {
      const bookToDelete = this._books[bookUUID].bookElement;
      this._libraryStorage.removeChild(bookToDelete);
      delete this._books[bookUUID];
    },
  },

  _generateBook(bookData) {
    let title = bookData.title;
    let author = bookData.author;
    let summary = bookData.summary;
    let pagesRead = bookData.pagesRead;
    let totalPages = bookData.totalPages;
    let coverImageFile = bookData.coverImageFile;
    return new Book(title, author, summary, pagesRead, totalPages, coverImageFile);
  },

  async _addBook() {
    try {
      const newBookData = await this._BookForm.getNewBookData();
      const newBook = this._generateBook(newBookData);
      this._LibraryStorage.addBook(newBook);
    } catch (err) {
      console.log(err);
    }
  },

  _selectBookMode: false,
  _submitSelectedBookUUIID: null,
  _sendCancelSelectBook: null,
  _getSelectedBookUUID() {
    this._selectBookMode = true;
    return new Promise((sendSelectedBook, sendCancelSelectBook) => {
      this._submitSelectedBookUUIID = sendSelectedBook;
      this._sendCancelSelectBook = sendCancelSelectBook;
    });
  },

  _retrieveSelectedBookUUID(selectedBook) {
    this._submitSelectedBookUUIID(selectedBook.getAttribute("uuid"));
  },

  _cancelBookSelection() {
    this._selectBookMode = false;
    this._sendCancelSelectBook();
  },

  _extractBookData(book) {
    const bookData = {
      title: book.title,
      author: book.author,
      summary: book.summary,
      pagesRead: book.pagesRead,
      totalPages: book.totalPages,
      coverImageFile: book.coverImageFile,
    };
    return bookData
  },

  async _editBook() {
    let bookUUID = null;
    try {
      bookUUID = await this._getSelectedBookUUID();
    } catch {
      console.log("Book selection canceled");
      return;
    }

    const oldBook = this._LibraryStorage.getBook(bookUUID);
    const oldBookData = this._extractBookData(oldBook);
    let updatedBookData = null;
    try {
      updatedBookData = await this._BookForm.getUpdatedBookData(oldBookData);
    } catch {
      console.error("There was an error");
      return;
    }
    const updatedBook = this._generateBook(updatedBookData);
    this._LibraryStorage.editBook(bookUUID, updatedBook);
  },

  async _deleteBook() {
    try {
      let bookUUID = await this._getSelectedBookUUID();
      this._LibraryStorage.deleteBook(bookUUID);
    } catch {
      console.log("Error deleting book");
    }
  },

  init() {
    this._BookForm.init();
    const clickEventHandler = (e) => {
      if (this._selectBookMode) {
        if (e.target.closest(".book")) {
          const selectedBook = e.target.closest(".book");
          this._retrieveSelectedBookUUID(selectedBook);
        }
        this._cancelBookSelection();
      }
      if (e.target.closest(`#${this._buttons.addBook.id}`)) {
        this._addBook();
        return;
      }
      if (e.target.closest(`#${this._buttons.editBook.id}`)) {
        this._editBook();
        return;
      }
      if (e.target.closest(`#${this._buttons.deleteBook.id}`)) {
        this._deleteBook();
        return;
      }
    };
    this._library.addEventListener("click", clickEventHandler);
  },
}

LibraryController.init();