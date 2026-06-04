document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token_simpasda");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

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

    document.getElementById("form-tambah-sampah").addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = document.getElementById("nama").value.trim();
        const kode_icon = document.getElementById("kode_icon").value.trim();
        const harga_per_kg = Number(document.getElementById("harga_per_kg").value);
        const status = document.getElementById("status").value;
        const btnSubmit = document.getElementById("btn-submit");
        const bank_sampah_id = document.getElementById("bank_sampah_id").value || getBankSampahIdFromToken(token);

        if (!nama || !kode_icon || !harga_per_kg || harga_per_kg <= 0 || !status || !bank_sampah_id) {
            alert("Mohon lengkapi semua kolom dengan benar sebelum menyimpan.");
            return;
        }

        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
        btnSubmit.disabled = true;

        const API_URL = "http://127.0.0.1:8000/api/jenis-sampah";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ nama, kode_icon, harga_per_kg, status, bank_sampah_id })
            });

            if (response.ok) {
                alert("Data jenis sampah berhasil ditambahkan!");
                window.location.href = "jenis_sampah.html";
                return;
            }

            const responseData = await response.json().catch(() => null);
            let message = "Gagal menambahkan data. Periksa kembali inputan Anda.";

            if (responseData) {
                if (responseData.message) {
                    message = responseData.message;
                } else if (responseData.errors) {
                    const errors = Object.values(responseData.errors)
                        .flat()
                        .join(" \n");
                    message = errors || message;
                }
            }

            alert(message);
        } catch (error) {
            alert(`Gagal terhubung ke server Laravel. ${error.message}`);
        } finally {
            btnSubmit.innerHTML = '<i class="bi bi-floppy"></i> Simpan Data';
            btnSubmit.disabled = false;
        }
    });
});