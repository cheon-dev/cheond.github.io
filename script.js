const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput"); // NEW
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
const takePhotoBtn = document.getElementById("takePhoto");
const camera = document.getElementById("camera");
const canvas = document.getElementById("snapshotCanvas");
const prevSlideBtn = document.getElementById("prevSlide");
const nextSlideBtn = document.getElementById("nextSlide");
const playPauseBtn = document.getElementById("playPauseSlide");

let images = JSON.parse(localStorage.getItem("images")) || [];
let albums = JSON.parse(localStorage.getItem("albums")) || ["All"];
let currentAlbum = "All";
let currentSlideIndex = 0;
let slideshowInterval = null;
let stream = null;

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
cameraInput.addEventListener("change", handleFiles); // NEW

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
  cameraInput.value = "";
}

function renderGallery() {
  gallery.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();
  const filtered = images.filter(img => (currentAlbum === "All" || img.album === currentAlbum) && img.note.toLowerCase().includes(keyword));

  filtered.forEach(({ src, note }, index) => {
    const card = document.createElement("div");
    card.className = "image-card";

    const img = document.createElement("img");
    img.src = src;
    img.addEventListener("click", () => {
      openLightbox(index);
    });

    const textarea = document.createElement("textarea");
    textarea.value = note;
    textarea.placeholder = "Add description...";
    textarea.addEventListener("input", () => {
      const i = images.findIndex(i => i.src === src);
      if (i !== -1) {
        images[i].note = textarea.value;
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
      if (confirm("Are you sure you want to delete this photo?")) {
        images = images.filter(i => i.src !== src);
        save();
        renderGallery();
      }
    };

    card.append(img, textarea, downloadBtn, deleteBtn);
    gallery.appendChild(card);
  });
}

function openLightbox(index) {
  const filtered = images.filter(img => currentAlbum === "All" || img.album === currentAlbum);
  if (filtered.length === 0) return;
  currentSlideIndex = index;
  lightboxImg.src = filtered[currentSlideIndex].src;
  lightbox.style.display = "flex";
}

function changeSlide(offset) {
  const filtered = images.filter(img => currentAlbum === "All" || img.album === currentAlbum);
  if (filtered.length === 0) return;
  currentSlideIndex = (currentSlideIndex + offset + filtered.length) % filtered.length;
  lightboxImg.src = filtered[currentSlideIndex].src;
}

function toggleSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    playPauseBtn.textContent = "⏯️";
  } else {
    slideshowInterval = setInterval(() => {
      changeSlide(1);
    }, 3000);
    playPauseBtn.textContent = "⏸️";
  }
}

// ✅ NEW: Native camera input trigger
takePhotoBtn.addEventListener("click", () => {
  cameraInput.click();
});

// Existing getUserMedia-based camera remains untouched below
// You can remove this section if you no longer need it
takePhotoBtn.addEventListener("click", async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

  try {
    camera.style.display = "block";
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;

    camera.onclick = () => {
      const context = canvas.getContext("2d");
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      context.drawImage(camera, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg");

      images.unshift({ src: imageDataUrl, note: "", album: currentAlbum });
      save();
      renderGallery();
      stopCamera();
    };
  } catch (error) {
    console.error("Camera error:", error);
  }
});

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  camera.style.display = "none";
  camera.srcObject = null;
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

lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
  playPauseBtn.textContent = "⏯️";
});

prevSlideBtn.addEventListener("click", e => {
  e.stopPropagation();
  changeSlide(-1);
});

nextSlideBtn.addEventListener("click", e => {
  e.stopPropagation();
  changeSlide(1);
});

playPauseBtn.addEventListener("click", e => {
  e.stopPropagation();
  toggleSlideshow();
});

window.addEventListener("keydown", (e) => {
  if (lightbox.style.display === "flex") {
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "Escape") lightbox.style.display = "none";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  updateAlbumDropdown();
  renderGallery();
});
