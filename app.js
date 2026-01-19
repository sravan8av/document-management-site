// ================= CONFIG =================
const API_BASE = "https://doc-api.azure-api.net/doc-functions";
const SUBSCRIPTION_KEY = "PASTE_YOUR_APIM_SUBSCRIPTION_KEY_HERE";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// Common headers (DO NOT set Content-Type for uploads)
const jsonHeaders = {
  "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
};

// ================= LOAD DOCUMENTS =================
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/ListDocuments`, {
      headers: jsonHeaders
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
            <button class="download" onclick="downloadFile('${d.name}')">
              Download
            </button>
            <button class="delete" onclick="confirmDelete('${d.id}','${d.name}')">
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
    const res = await fetch(`${API_BASE}/UploadDocument`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
        // ❌ DO NOT SET Content-Type
      },
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
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

// ================= DOWNLOAD =================
function downloadFile(name) {
  const url =
    `${API_BASE}/DownloadDocument?name=${encodeURIComponent(name)}`;

  fetch(url, {
    headers: jsonHeaders
  })
    .then(res => {
      if (!res.ok) throw new Error("Download failed");
      return res.blob();
    })
    .then(blob => {
      const a = docum
