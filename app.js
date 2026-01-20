// ================= CONFIG =================
const API_BASE = "https://doc-api.azure-api.net";
const SUBSCRIPTION_KEY = "REPLACE_WITH_YOUR_REAL_APIM_KEY";

// ================= DOM =================
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// ================= HEADERS =================
function apiHeaders(extra = {}) {
  return {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    ...extra
  };
}

// ================= LOAD DOCUMENTS =================
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: apiHeaders()
    });

    if (!res.ok) throw new Error(await res.text());

    const docs = await res.json();
    tableBody.innerHTML = "";

    if (!docs || docs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty">No documents found</td>
        </tr>`;
      return;
    }

    docs.forEach(d => {
      tableBody.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>${(d.size / 1024).toFixed(1)} KB</td>
          <td class="actions">
            <button onclick="downloadFile('${d.blobName}', '${d.name}')">
              Download
            </button>
            <button onclick="confirmDelete('${d.id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Load failed:", err);
    alert("Failed to load documents");
  }
}

// ================= UPLOAD =================
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      body: formData // ❗ NO HEADERS
    });

    if (!res.ok) throw new Error(await res.text());

    fileInput.value = "";
    await loadDocuments();
    alert("Upload successful ✅");

  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed");
  }
};

// ================= DOWNLOAD =================
async function downloadFile(blobName, fileName) {
  try {
    const res = await fetch(
      `${API_BASE}/documents/download?name=${encodeURIComponent(blobName)}`,
      {
        headers: apiHeaders()
      }
    );

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed");
  }
}

// ================= DELETE =================
let deleteId = null;

function confirmDelete(id) {
  deleteId = id;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/documents/${deleteId}`,
      {
        method: "DELETE",
        headers: apiHeaders()
      }
    );

    if (!res.ok) throw new Error(await res.text());

    document.getElementById("modalOverlay").classList.add("hidden");
    loadDocuments();

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed");
  }
};

document.getElementById("cancelDelete").onclick = () => {
  document.getElementById("modalOverlay").classList.add("hidden");
};

// ================= INIT =================
loadDocuments();
