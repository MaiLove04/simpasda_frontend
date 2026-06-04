document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token_simpasda");
    if (!token) { window.location.href = "login.html"; return; }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    function getBankSampahIdFromToken(token) {
        const payload = parseJwt(token);
        if (!payload) return null;
        return payload.bank_sampah_id || payload.bank_id || payload.id_bank || payload.bank?.id || payload.bank?.bank_sampah_id || null;
    }

    const bankSampahIdInput = document.getElementById("bank_sampah_id");
    const savedBankSampahId = localStorage.getItem("bank_sampah_id") || getBankSampahIdFromToken(token);
    if (bankSampahIdInput && savedBankSampahId) {
        bankSampahIdInput.value = savedBankSampahId;
    }

    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;
            document.getElementById("menu-jenis-sampah").classList.add("active");
        });

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const errorAlert = document.getElementById("error-alert");

    if (!id) {
        alert("ID Jenis Sampah tidak ditemukan.");
        window.location.href = "jenis_sampah.html";
        return;
    }

    // Ambil Data Sampah
    fetch(`http://127.0.0.1:8000/api/jenis-sampah/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
    })
    .then(res => res.json())
    .then(hasil => {
        const data = hasil.data || hasil;
        document.getElementById("id_sampah").value = data.id;
        document.getElementById("nama").value = data.nama || data.name;
        document.getElementById("kode_icon").value = data.kode_icon || '';
        document.getElementById("harga_per_kg").value = data.harga_per_kg;
        document.getElementById("status").value = data.status;
        if (bankSampahIdInput && data.bank_sampah_id) {
            bankSampahIdInput.value = data.bank_sampah_id;
        }
    })
    .catch(() => { alert("Gagal memuat data sampah dari server."); });

    // Form Submit Update
    document.getElementById("form-edit-sampah").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        errorAlert.classList.add("d-none");
        const id_sampah = document.getElementById("id_sampah").value;
        const btnSubmit = document.getElementById("btn-submit");
        
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
        btnSubmit.disabled = true;

        try {
            const kode_icon = document.getElementById("kode_icon").value.trim();
            const bank_sampah_id = document.getElementById("bank_sampah_id").value || getBankSampahIdFromToken(token);
            const response = await fetch(`http://127.0.0.1:8000/api/jenis-sampah/${id_sampah}`, {
                method: "PUT", // Atau sesuaikan jika Laravel Anda mengharapkan PATCH
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    nama: document.getElementById("nama").value,
                    kode_icon,
                    harga_per_kg: document.getElementById("harga_per_kg").value,
                    bank_sampah_id,
                    status: document.getElementById("status").value
                })
            });

            if (response.ok) {
                alert("Perubahan berhasil disimpan!");
                window.location.href = "jenis_sampah.html";
            } else { errorAlert.innerText = "Gagal menyimpan perubahan. Cek kembali form Anda."; errorAlert.classList.remove("d-none"); }
        } catch (error) {
            errorAlert.innerText = "Terjadi masalah dengan koneksi server."; errorAlert.classList.remove("d-none");
        } finally { btnSubmit.innerHTML = '<i class="bi bi-pencil-square"></i> Perbarui Data'; btnSubmit.disabled = false; }
    });
});