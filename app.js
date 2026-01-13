// ================================
// CONFIG
// ================================
const API_BASE = "https://doc-apim-gateway.azure-api.net/doc-functions-api";

// ================================
// DOM ELEMENTS
// ================================
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileTableBody = document.getElementById("fileTableBody");
const searchInput = document.getElementById("searchInput");

// ================================
// LOAD FILES ON PAGE LOAD
// ================================
document.addEventListener("DOMContentLoaded", loadDocuments);

// ================================
// LOAD DOCUMENTS
// ================================
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error("Failed to load documents");

    const files = await res.json();
    renderFiles(files);
  } catch (err) {
    alert("Failed to load documents");
    console.error(err);
  }
}

// ================================
// RENDER FILE TABLE
// ================================
function renderFiles(files) {
  fileTableBody.innerHTML = "";

  const search = searchInput.value.toLowerCase();

  files
    .filter(f => f.name.toLowerCase().includes(search))
    .forEach(file => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${file.name}</td>
        <td>${file.size ? formatSize(file.size) : "-"}</td>
        <td class="actions">
          <button class="btn download" onclick="downloadFile('${file.id}')">Download</button>
          <button class="btn delete" onclick="confirmDelete('${file.id}', '${file.name}')">Delete</button>
        </td>
      `;

      fileTableBody.appendChild(row);
    });
}

// ================================
// UPLOAD FILE
// ================================
uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    fileInput.value = "";
    loadDocuments();
  } catch (err) {
    alert("Upload failed");
    console.error(err);
  }
});

// ================================
// DOWNLOAD FILE
// ================================
function downloadFile(id) {
  window.open(`${API_BASE}/documents/${id}`, "_blank");
}

// ================================
// DELETE FILE
// ================================
function confirmDelete(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  deleteFile(id);
}

async function deleteFile(id) {
  try {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    loadDocuments();
  } catch (err) {
    alert("Delete failed");
    console.error(err);
  }
}

// ================================
// SEARCH
// ================================
searchInput.addEventListener("input", loadDocuments);

// ================================
// HELPERS
// ================================
function formatSize(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}
