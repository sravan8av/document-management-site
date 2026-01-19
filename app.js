// ================= CONFIG =================
// ⚠️ Replace ONLY the APIM name if different
const API_BASE_URL = "https://doc-api.azure-api.net";

// ================= ELEMENTS =================
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// ================= LOAD DOCUMENTS =================
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE_URL}/documents`);
    if (!res.ok) throw new Error("Failed to load documents");

    const docs = await res.json();
    tableBody.innerHTML = "";

    if (!docs || docs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty">No documents found</td>
        </tr>`;
      return;
    }

    docs.forEach(doc => {
      tableBody.innerHTML += `
        <tr>
          <td>${doc.name}</td>
          <td>${(doc.size / 1024).toFixed(1)} KB</td>
          <td class="actions">
            <button class="download" onclick="downloadFile('${doc.name}')">
              Download
            </button>
            <button class="delete" onclick="confirmDelete('${doc.id}','${doc.name}')">
              Delete
            </button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    alert("Error loading documents");
  }
}

// ================= UPLOAD DOCUMENT =================
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/documents`, {
      method: "POST",
      body: formData // 🚨 DO NOT SET Content-Type
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(errorText);
      alert("Upload failed");
      return;
    }

    fileInput.value = "";
    await loadDocuments();
    alert("Upload successful ✅");
  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
};

// ================= DOWNLOAD DOCUMENT =================
function downloadFile(name) {
  window.location.href =
    `${API_BASE_URL}/documents/download?name=${encodeURIComponent(name)}`;
}

// ================= DELETE DOCUMENT =================
let deleteTarget = {};

function confirmDelete(id, name) {
  deleteTarget = { id, name };
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/documents?id=${deleteTarget.id}&name=${encodeURIComponent(deleteTarget.name)}`,
      { method: "DELETE" }
    );

    if (!res.ok) throw new Error("Delete failed");

    document.getElementById("modalOverlay").classList.add("hidden");
    await loadDocuments();
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

document.getElementById("cancelDelete").onclick = () => {
  document.getElementById("modalOverlay").classList.add("hidden");
};

// ================= INIT =================
loadDocuments();
