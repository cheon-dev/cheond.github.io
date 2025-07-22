const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const clearAll = document.getElementById("clearAll");
const dropZone = document.getElementById("dropZone");
const toggleTheme = document.getElementById("toggleTheme");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let images = JSON.parse(localStorage.getItem("images")) || [];

// Load images from localStorage
window.addEventListener("DOMContentLoaded", () => {
  images.forEach(img => addImageToGallery(img.src, img.note));
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});

// Upload handler
fileInput.addEventListener("change", () => {
  Array.from(fileInput.files).forEach(file => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target.result;
        images.push({ src, note: "" });
        saveImages();
        addImageToGallery(src, "");
      };
      reader.readAsDataURL(file);
    }
  });
  fileInput.value = "";
});

// Drag and drop
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.style.borderColor = "#4CAF50";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#aaa";
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.style.borderColor = "#aaa";
  Array.from(e.dataTransfer.files).forEach(file => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target.result;
        images.push({ src, note: "" });
        saveImages();
        addImageToGallery(src, "");
      };
      reader.readAsDataURL(file);
    }
  });
});

// Add image card
function addImageToGallery(src, note) {
  const card = document.createElement("div");
  card.className = "image-card";

  const img = document.createElement("img");
  img.src = src;
  img.addEventListener("click", () => {
    lightboxImg.src = src;
    lightbox.style.display = "flex";
  });

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Add a description...";
  textarea.value = note;
  textarea.addEventListener("input", () => {
    const index = images.findIndex(i => i.src === src);
    if (index !== -1) {
      images[index].note = textarea.value;
      saveImages();
    }
  });

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "⬇️ Download";
  downloadBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = "image.jpg";
    a.click();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌ Delete";
  deleteBtn.addEventListener("click", () => {
    card.remove();
    images = images.filter(i => i.src !== src);
    saveImages();
  });

  card.appendChild(img);
  card.appendChild(textarea);
  card.appendChild(downloadBtn);
  card.appendChild(deleteBtn);
  gallery.appendChild(card);
}

// Save to localStorage
function saveImages() {
  localStorage.setItem("images", JSON.stringify(images));
}

// Clear all
clearAll.addEventListener("click", () => {
  if (confirm("Clear all images?")) {
    images = [];
    saveImages();
    gallery.innerHTML = "";
  }
});

// Toggle dark mode
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Lightbox close
lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
});
