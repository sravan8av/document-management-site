const API_BASE =
  "https://doc-apim-gateway.azure-api.net/doc-functions-api";

const tableBody = document.getElementById("documentsTable");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

document.addEventListener("DOMContentLoaded", loadDocuments);

// =====================
// LOAD DOCUMENTS
// =====================
async function loadDocuments() {
  tableBody.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/documents`);
    const docs = await res.json();

    if (docs.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="4" class="empty">No documents uploaded</td></tr>`;
      return;
    }

    docs.forEach(doc => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${doc.name}</td>
        <td>${doc.size || "-"}</td>
        <td>
          <a class="link" href="${doc.url}" target="_blank">Download</a>
        </td>
        <td>
          <button class="danger" onclick="deleteDocument('${doc.id}')">
            Delete
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    alert("Failed to load documents");
    console.error(err);
  }
}

// =====================
// UPLOAD DOCUMENT
// =====================
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please choose a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  await fetch(`${API_BASE}/documents`, {
    method: "POST",
    body: formData
  });

  fileInput.value = "";
  loadDocuments();
};

// =====================
// DELETE DOCUMENT
// =====================
async function deleteDocument(id) {
  if (!confirm("Delete this document?")) return;

  await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE"
  });

  loadDocuments();
}
