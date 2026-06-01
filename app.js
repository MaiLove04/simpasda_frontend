document.addEventListener("DOMContentLoaded", () => {
    // === TAMBAHAN UNTUK LOAD SIDEBAR DINAMIS ===
    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;
            // Membuat menu 'Jenis Sampah' di sidebar otomatis menyala (aktif)
            document.getElementById("menu-jenis-sampah").classList.add("active");
        })
        .catch(err => console.error("Gagal memuat sidebar:", err));
        
    // ... sisa kode cek token dan fetch API jenis sampah milikmu tetap di bawahnya ...

    // ==========================================
    // TAMBAHAN: CEK STATUS LOGIN & AMBIL TOKEN
    // ==========================================
    const token = localStorage.getItem("token_simpasda");

    // Jika token tidak ada, langsung paksa pindah ke halaman login
    if (!token) {
        window.location.href = "login.html";
        return; // Hentikan sisa eksekusi kode di bawah
    }

    // 1. Alamat API Laravel Simpasda
    const API_URL = "http://127.0.0.1:8000/api/jenis-sampah"; 
    const containerTabel = document.getElementById("tabel-sampah");

    // Fungsi untuk memformat angka ke Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    // 2. Ambil data menggunakan Fetch API (Sudah disisipkan token)
    fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Kirim token untuk nembak API yang dikunci middleware
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            // Jaga-jaga kalau tokennya kedaluwarsa atau tidak valid (unauthorized)
            if (response.status === 401) {
                localStorage.removeItem("token_simpasda");
                window.location.href = "login.html";
            }
            return response.json();
        })
        .then(hasil => {
            const jenisSampahs = hasil.data || hasil;

            // Jika datanya kosong
            if (jenisSampahs.length === 0) {
                containerTabel.innerHTML = `
                    <tr>
                        <td colspan="5">
                            <div class="py-4 text-muted">Belum ada data jenis sampah</div>
                        </td>
                    </tr>`;
                return;
            }

            let barisHtml = "";

            // 3. Lakukan Looping Data
            jenisSampahs.forEach((item, index) => {
                const badgeStatus = item.status === 'aktif' 
                    ? `<span class="badge bg-success">Aktif</span>` 
                    : `<span class="badge bg-danger">Nonaktif</span>`;

                barisHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <span class="fw-semibold">${item.nama}</span>
                        </td>
                        <td>
                            <span class="fw-bold text-success">${formatRupiah(item.harga_per_kg)}</span>
                        </td>
                        <td>${badgeStatus}</td>
                        <td>
                            <div class="d-flex justify-content-center gap-2">
                                <a href="edit_jenis_sampah.html?id=${item.id}" class="btn btn-warning btn-sm">
                                    Edit
                                </a>
                                <button class="btn btn-danger btn-sm" onclick="hapusData(${item.id})">
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            // 4. Masukkan barisHtml ke dalam tbody tabel
            containerTabel.innerHTML = barisHtml;
        })
        .catch(error => {
            console.error("Gagal memuat data:", error);
            containerTabel.innerHTML = `
                <tr>
                    <td colspan="5" class="text-danger py-4">
                        Gagal memuat data dari server. Pastikan Backend Laravel sudah berjalan!
                    </td>
                </tr>`;
        });
});

// Fungsi jika tombol hapus diklik (Sudah ditambahkan method DELETE dengan Token)
function hapusData(id) {
    const token = localStorage.getItem("token_simpasda");

    if (confirm('Yakin ingin menghapus data ini?')) {
        const DELETE_URL = `http://127.0.0.1:8000/api/jenis-sampah/${id}`;

        fetch(DELETE_URL, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        })
        .then(response => response.json())
        .then(hasil => {
            alert("Data berhasil dihapus!");
            window.location.reload(); // Refresh halaman agar tabel update
        })
        .catch(error => {
            console.error("Gagal menghapus data:", error);
            alert("Gagal menghapus data dari server.");
        });
    }
}