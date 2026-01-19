// ================= CONFIG =================
const API_BASE = "https://doc-api.azure-api.net"; // ✅ FIXED
const SUBSCRIPTION_KEY = "PASTE_YOUR_APIM_SUBSCRIPTION_KEY_HERE";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// Common headers (USED ONLY FOR JSON REQUESTS)
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

    if (!docs.length) {
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
            <button onclick="downloadFile('${d.name}')">Download</button>
            <button onclick="confirmDelete('${d.id}','${d.name}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
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
      body: formData
      // ✅ NO HEADERS HERE (VERY IMPORTANT)
    });

    if (!res.ok) throw new Error(await res.text());

    fileInput.value = "";
    await loadDocuments();
    alert("Upload successful ✅");
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};

// ================= DOWNLOAD =================
function downloadFile(name) {
  window.location.href =
    `${API_BASE}/documents/download?name=${encodeURIComponent(name)}`
    + `&subscription-key=${SUBSCRIPTION_KEY}`;
}

// ================= DELETE =================
let deleteTarget = {};

function confirmDelete(id, name) {
  deleteTarget = { id, name };
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/documents?id=${deleteTarget.id}&name=${deleteTarget.name}`,
      {
        method: "DELETE",
        headers: apiHeaders()
      }
    );

    if (!res.ok) throw new Error(await res.text());

    document.getElementById("modalOverlay").classList.add("hidden");
    loadDocuments();
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
