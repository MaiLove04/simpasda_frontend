document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token_simpasda");

    // 1. Proteksi Login
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 2. Muat Sidebar Dinamis
    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;
            document.getElementById("menu-nasabah").classList.add("active");
        })
        .catch(err => console.error("Gagal memuat sidebar:", err));

    const API_URL = "http://127.0.0.1:8000/api/nasabah"; 
    const containerTabel = document.getElementById("tabel-nasabah");
    const inputSearch = document.getElementById("input-search");
    const btnClearSearch = document.getElementById("btn-clear-search");
    
    let masterDataNasabah = []; // Menyimpan cadangan data asli dari server

    // Format mata uang Rupiah untuk kolom saldo jika dibutuhkan
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka || 0);
    };

    // 3. Ambil Data dari API Laravel
    fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token_simpasda");
            window.location.href = "login.html";
        }
        return response.json();
    })
    .then(hasil => {
        masterDataNasabah = hasil.data || hasil;
        renderTabel(masterDataNasabah);
    })
    .catch(error => {
        console.error("Error data nasabah:", error);
        containerTabel.innerHTML = `
            <tr>
                <td colspan="7" class="text-danger py-4 fw-bold">
                    Gagal mengambil data dari server. Pastikan API Laravel aktif.
                </td>
            </tr>`;
    });

    // 4. Fungsi Utama Render Data ke HTML Tabel
    function renderTabel(data) {
        if (data.length === 0) {
            containerTabel.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        Tidak ditemukan data akun nasabah yang cocok.
                    </td>
                </tr>`;
            return;
        }

        let barisHtml = "";
        data.forEach((item, index) => {
            const nama = item.name || item.nama || 'Tanpa Nama';
            const alamat = item.alamat || 'Alamat belum diisi';
            
            // Logika Bagde Kode Nasabah
            const kodeBadge = item.kode_nasabah 
                ? `<span class="badge" style="background-color: #e8f5e9; color: #1e521e; font-weight: 700; font-size: 12px; padding: 5px 10px; border: 1px solid #c8e6c9; border-radius: 6px;">${item.kode_nasabah}</span>` 
                : `<span class="text-muted font-italic" style="font-size: 11px;">-</span>`;
            
            // Logika QR Code Dinamis Menggunakan API Online Terpercaya (goqr.me)
            const qrCodeGambar = item.kode_nasabah
                ? `<div class="p-2 d-inline-block bg-white border rounded shadow-sm" style="border-radius: 8px !important;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=${item.kode_nasabah}" alt="QR" width="55" height="55">
                   </div>`
                : `<span class="badge bg-light text-danger border" style="font-size: 11px; font-weight: 500;">Belum Generate</span>`;

            // 🔥 FIX: Mengarahkan halaman print ke file print_qr.html lokal dengan parameter ID nasabah
            const tombolPrint = item.kode_nasabah
                ? `<a href="print_qr.html?id=${item.id}" target="_blank" class="btn btn-sm text-white px-2 py-1" style="font-size: 11px; font-weight: 600; border-radius: 6px; height: 28px; background-color: #1E521E; border: none; display: inline-flex; align-items: center; gap: 4px;" title="Cetak QR Rumah Nasabah">
                        <i class="fas fa-print"></i> Print
                   </a>`
                : '';

            // Dinamis Styling Warna Dropdown Select Status Verifikasi
            let selectStyle = "background-color: #fee2e2; color: #dc2626; border-color: #fecaca;";
            if (item.status === 'aktif') selectStyle = "background-color: #dcfce7; color: #16a34a; border-color: #bbf7d0;";
            if (item.status === 'pending') selectStyle = "background-color: #fef3c7; color: #d97706; border-color: #fde68a;";

            barisHtml += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td class="py-3 text-muted">${index + 1}</td>
                    <td class="py-3 text-start ps-3 fw-bold" style="color: #0f172a;">${nama}</td>
                    <td class="py-3 text-start text-muted" style="font-size: 12px; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${alamat}">
                        <i class="fas fa-map-marker-alt text-danger me-1" style="font-size: 11px;"></i> ${alamat}
                    </td>
                    <td class="py-3">${kodeBadge}</td>
                    <td class="py-3">${qrCodeGambar}</td>
                    <td class="py-3">
                        <select onchange="ubahStatus(${item.id}, this.value)" class="form-select form-select-sm fw-bold px-2 py-1 mx-auto" 
                            style="font-size: 12px; border-radius: 6px; width: 125px; cursor: pointer; ${selectStyle}">
                            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="aktif" ${item.status === 'aktif' ? 'selected' : ''}>Aktif</option>
                            <option value="nonaktif" ${item.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </td>
                    <td class="py-3 pe-3">
                        <div class="d-flex justify-content-center align-items-center gap-1">
                            ${tombolPrint}
                            <a href="show_nasabah.html?id=${item.id}" class="btn btn-sm text-white px-2 py-1" style="font-size: 11px; font-weight: 600; border-radius: 6px; height: 28px; background-color: #0284c7; border: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fas fa-eye"></i> Detail
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });
        containerTabel.innerHTML = barisHtml;
    }

    // 5. Fitur Live Search Dinamis (Tanpa reload halaman)
    inputSearch.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        
        if (keyword !== "") {
            btnClearSearch.classList.remove("d-none");
        } else {
            btnClearSearch.classList.add("d-none");
        }

        const hasilFilter = masterDataNasabah.filter(nasabah => {
            const matchNama = (nasabah.name || nasabah.nama || "").toLowerCase().includes(keyword);
            const matchKode = (nasabah.kode_nasabah || "").toLowerCase().includes(keyword);
            return matchNama || matchKode;
        });

        renderTabel(hasilFilter);
    });

    // Reset Pencarian
    btnClearSearch.addEventListener("click", () => {
        inputSearch.value = "";
        btnClearSearch.classList.add("d-none");
        renderTabel(masterDataNasabah);
    });
});

// 6. Fungsi Mengubah Status Verifikasi via API Laravel
function ubahStatus(id, statusBaru) {
    const token = localStorage.getItem("token_simpasda");
    const API_STATUS_URL = `http://127.0.0.1:8000/api/nasabah/${id}/status`; // Sesuaikan endpoint route POST kamu

    fetch(API_STATUS_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ status: statusBaru })
    })
    .then(res => {
        if(res.ok) {
            alert("Status verifikasi nasabah berhasil diperbarui!");
            window.location.reload();
        } else {
            alert("Gagal memperbarui status di server.");
        }
    })
    .catch(err => console.error("Error update status:", err));
}