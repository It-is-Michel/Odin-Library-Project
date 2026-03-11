function Book(title, author, summary, pagesRead, totalPages, coverImageFile) {
  this.bookElement = document.createElement("article");
  this.bookElement.classList.add("book");

  this.titleWrapper = document.createElement("div");
  this.titleWrapper.classList.add("book__title-wrapper");
  this.bookElement.appendChild(this.titleWrapper);
  
  this.titleElement = document.createElement("h1");
  this.titleElement.classList.add("book__title");
  this.titleWrapper.appendChild(this.titleElement);
  this.setTitle(title);

  this.authorElement = document.createElement("cite");
  this.authorElement.classList.add("book__author");
  this.titleWrapper.appendChild(this.authorElement);
  this.setAuthor(author);

  this.summaryElement = document.createElement("p");
  this.summaryElement.classList.add("book__summary");
  this.bookElement.appendChild(this.summaryElement);
  this.setSummary(summary);

  this.pagesElement = document.createElement("span");
  this.pagesElement.classList.add("book__pages");
  this.bookElement.appendChild(this.pagesElement);

  this.setPages(totalPages, pagesRead);

  this.coverElement = document.createElement("div");
  this.coverElement.classList.add("book__cover");
  this.bookElement.appendChild(this.coverElement);
  this.setCoverImg(coverImageFile);
}

Book.prototype.setTitle = function(title) {
  if (typeof title != "string" || title == "") title = "none";

  this.titleElement.textContent = title;
}

Book.prototype.setAuthor = function(author) {
  if (typeof author != "string" || author == "") author = "none";

  this.authorElement.textContent = `by ${author}`;
}

Book.prototype.setSummary = function(summary) {
  if (typeof summary != "string") summary = "...";

  this.summaryElement.textContent = summary;
}

Book.prototype.setPages = function(totalPages, readPages) {
  const totalPagesIsNumber = typeof totalPages == "number";
  const totalPagesIsPositive = totalPages > 0;
  totalPages = totalPagesIsNumber && totalPagesIsPositive ? Math.trunc(totalPages) : NaN;

  const readPagesIsNumber = (typeof readPages == "number");
  const readPagesIsNotNegative = readPages >= 0;
  readPages = readPagesIsNumber && readPagesIsNotNegative ? Math.trunc(readPages) : NaN;
  
  const pagesTextContent = `${readPages} / ${totalPages} pages`;
  
  this.pagesElement.textContent = pagesTextContent;

  const readStatus = (Number.isNaN(totalPages) || Number.isNaN(readPages) || readPages > totalPages) ? "Error"
  : readPages == totalPages ? "Read"
  : readPages == 0 ? "Not read"
  : "Reading";

  const readStatusElement = document.createElement("span");
  this.pagesElement.prepend(readStatusElement);
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
  }
}

Book.prototype.coverFileReader = new FileReader();
Book.prototype.setCoverImg = function(coverImageFile) {
  const coverImageFileIsFile = coverImageFile instanceof File;
  const coverImageFileHasValidFormat = coverImageFileIsFile ? coverImageFile.type.startsWith("image/") : null;
  if (!coverImageFileIsFile || !coverImageFileHasValidFormat) {
    this.coverElement.textContent = "No image";
    return;
  }

  this.coverFileReader.onload = (e) => {
    const coverImageUrl = e.target.result;
    this.coverElement.style.backgroundImage = coverImageUrl;
  }
  this.coverFileReader.readAsDataURL(coverImageFile);
}