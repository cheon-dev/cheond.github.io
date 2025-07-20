const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");

// Load from localStorage when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const savedImages = JSON.parse(localStorage.getItem("images")) || [];
  savedImages.forEach(src => addImageToGallery(src));
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  const savedImages = JSON.parse(localStorage.getItem("images")) || [];

  Array.from(files).forEach(file => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        addImageToGallery(base64Image);

        // Save to localStorage
        savedImages.push(base64Image);
        localStorage.setItem("images", JSON.stringify(savedImages));
      };
      reader.readAsDataURL(file);
    }
  });

  fileInput.value = ""; // reset the file input
});

function addImageToGallery(src) {
  const img = document.createElement("img");
  img.src = src;
  gallery.appendChild(img);
}

