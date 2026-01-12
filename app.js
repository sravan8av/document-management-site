const API_BASE = "https://doc-apim-gateway.azure-api.net/doc-functions-api";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("documentsTable");

window.onload = () => {
  loadDocuments();
};

/* ---------------------------
   LOAD DOCUMENTS
---------------------------- */
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error();

    const docs = await res.json();
    renderDocuments(docs);
  } catch {
    alert("Failed to load documents");
  }
}

/* ---------------------------
   RENDER DOCUMENTS
---------------------------- */
function renderDocuments(docs) {
  tableBody.innerHTML = "";

  if (docs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty">No documents found</td>
      </tr>`;
    return;
  }

  docs.forEach(doc => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${doc.name}</td>
      <td>${formatSize(doc.size || 0)}</td>
      <td class="actions">
        <button class="download" onclick="downloadDoc('${doc.id}')">⬇ Download</button>
        <button class="delete" onclick="deleteDoc('${doc.id}')">🗑 Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

/* ---------------------------
   UPLOAD DOCUMENT
---------------------------- */
uploadBtn.onclick = async () => {
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

    if (!res.ok) throw new Error();

    fileInput.value = "";
    loadDocuments();
  } catch {
    alert("Upload failed");
  }
};

/* ---------------------------
   DOWNLOAD
---------------------------- */
function downloadDoc(id) {
  window.open(`${API_BASE}/documents/${id}/download`, "_blank");
}

/* ---------------------------
   DELETE
---------------------------- */
async function deleteDoc(id) {
  if (!confirm("Delete this document?")) return;

  try {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error();

    loadDocuments();
  } catch {
    alert("Delete failed");
  }
}

/* ---------------------------
   UTIL
---------------------------- */
function formatSize(bytes) {
  if (bytes === 0) return "-";
  const kb = bytes / 1024;
  return kb > 1024
    ? (kb / 1024).toFixed(1) + " MB"
    : kb.toFixed(1) + " KB";
}
