const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const clearAll = document.getElementById("clearAll");
const dropZone = document.getElementById("dropZone");
const toggleTheme = document.getElementById("toggleTheme");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const searchInput = document.getElementById("searchInput");
const albumSelect = document.getElementById("albumSelect");
const newAlbumName = document.getElementById("newAlbumName");
const createAlbumBtn = document.getElementById("createAlbum");

let images = JSON.parse(localStorage.getItem("images")) || [];
let albums = JSON.parse(localStorage.getItem("albums")) || ["All"];
let currentAlbum = "All";

function save() {
  localStorage.setItem("images", JSON.stringify(images));
  localStorage.setItem("albums", JSON.stringify(albums));
}

function updateAlbumDropdown() {
  albumSelect.innerHTML = "";
  albums.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    albumSelect.appendChild(option);
  });
  albumSelect.value = currentAlbum;
}

createAlbumBtn.addEventListener("click", () => {
  const newName = newAlbumName.value.trim();
  if (newName && !albums.includes(newName)) {
    albums.push(newName);
    newAlbumName.value = "";
    updateAlbumDropdown();
    save();
  }
});

albumSelect.addEventListener("change", () => {
  currentAlbum = albumSelect.value;
  renderGallery();
});

searchInput.addEventListener("input", renderGallery);

fileInput.addEventListener("change", handleFiles);
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("highlight");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("highlight"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("highlight");
  handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(e) {
  Array.from(e.target.files).forEach(file => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = ev => {
        images.unshift({ src: ev.target.result, note: "", album: currentAlbum });
        save();
        renderGallery();
      };
      reader.readAsDataURL(file);
    }
  });
  fileInput.value = "";
}

function renderGallery() {
  gallery.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();
  images
    .filter(img => (currentAlbum === "All" || img.album === currentAlbum) && img.note.toLowerCase().includes(keyword))
    .forEach(({ src, note }) => {
      const card = document.createElement("div");
      card.className = "image-card";

      const img = document.createElement("img");
      img.src = src;
      img.addEventListener("click", () => {
        lightboxImg.src = src;
        lightbox.style.display = "flex";
      });

      const textarea = document.createElement("textarea");
      textarea.value = note;
      textarea.placeholder = "Add description...";
      textarea.addEventListener("input", () => {
        const index = images.findIndex(i => i.src === src);
        if (index !== -1) {
          images[index].note = textarea.value;
          save();
        }
      });

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "⬇️ Download";
      downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = src;
        a.download = "photo.jpg";
        a.click();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌ Delete";
      deleteBtn.onclick = () => {
        images = images.filter(i => i.src !== src);
        save();
        renderGallery();
      };

      card.append(img, textarea, downloadBtn, deleteBtn);
      gallery.appendChild(card);
    });
}

clearAll.addEventListener("click", () => {
  if (confirm("Clear all images?")) {
    images = [];
    save();
    renderGallery();
  }
});

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

lightbox.addEventListener("click", () => lightbox.style.display = "none");

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  updateAlbumDropdown();
  renderGallery();
});
