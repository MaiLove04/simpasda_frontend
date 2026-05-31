document.addEventListener("DOMContentLoaded", () => {
    // 1. Alamat API Laravel Simpasda (Sesuaikan port-nya jika berbeda)
    const API_URL = "http://127.0.0.1:8000/api/jenis-sampah"; 

    const containerTabel = document.getElementById("tabel-sampah");

    // Fungsi untuk memformat angka ke Rupiah agar sama dengan format 'number_format' di Laravel
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    // 2. Ambil data menggunakan Fetch API
    fetch(API_URL)
        .then(response => response.json())
        .then(hasil => {
            // Sesuai kode Laravelmu: $jenisSampahs. 
            // Kita cek apakah datanya dibungkus dalam properti 'data' (bawaan API Laravel) atau langsung array
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

            // 3. Lakukan Looping Data (Menggantikan fungsi @forelse)
            jenisSampahs.forEach((item, index) => {
                
                // Logika penentuan badge status (Menggantikan @if($item->status == 'aktif'))
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

            // 4. Masukkan barisHtml yang sudah dibuat ke dalam tbody tabel
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

// Fungsi opsional jika tombol hapus diklik
function hapusData(id) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        console.log("Proses hapus ID:", id);
        // Nanti logic Fetch dengan method DELETE ke API Laravel ditempatkan di sini
    }
}