let detailData = null;
let subDetailData = null;

const preloader = document.querySelector(".preloader");
const progress = document.querySelector(".progress");

function showPreloader() {
    preloader.style.display = "flex";
    progress.style.width = "0"; // Reset progress bar
    setTimeout(() => {
        progress.style.width = "100%"; // Animasikan progress bar
    }, 10);
}

function hidePreloader() {
    preloader.style.display = "none";
}

// Fungsi untuk memuat data JSON (Detail dan Subdetail)
async function loadAllData() {
    try {
        if (!detailData) {
            const response = await fetch("assets/data/data.json");
            if (!response.ok) throw new Error("Gagal memuat detail data.");
            detailData = await response.json();
        }

        if (!subDetailData) {
            const response = await fetch("assets/data/detailData.json");
            if (!response.ok) throw new Error("Gagal memuat subdetail data.");
            subDetailData = await response.json();
        }
    } catch (error) {
        console.error("Error saat memuat data:", error);
        alert("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
    }
}

// Fungsi untuk menampilkan kategori detail
async function loadDetail(category, event = null) {
    if (event) event.preventDefault(); // Mencegah perilaku default jika dipanggil dari link
    showPreloader();

    try {
        await loadAllData();

        if (!detailData || !detailData[category] || !Array.isArray(detailData[category])) {
            throw new Error(`Data untuk kategori "${category}" tidak tersedia.`);
        }

        document.getElementById("mainHeader").style.display = "none";
        document.getElementById("main").style.display = "none";
        document.getElementById("aboutCard").style.display = "none";

        const title = document.getElementById("detailTitle");
        const list = document.getElementById("detailList");
        title.textContent = capitalizeFirstLetter(category);
        list.innerHTML = detailData[category]
            .map(item => `<div class="detail-item" onclick="loadSubDetail('${category}', '${item}')">${item}</div>`)
            .join("");

        document.getElementById("details").style.display = "block";

        // Simpan state ke sessionStorage
        sessionStorage.setItem("currentView", JSON.stringify({ view: "detail", category }));
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setTimeout(hidePreloader, 3000); // Sembunyikan preloader setelah 1 detik
    }
}

// Fungsi untuk menampilkan sub-detail
async function loadSubDetail(category, item, event = null) {
    if (event) event.preventDefault(); // Mencegah perilaku default jika dipanggil dari link
    showPreloader();

    try {
        await loadAllData();

        if (!detailData || !detailData[category]?.includes(item)) {
            throw new Error(`Item "${item}" tidak ditemukan dalam kategori "${category}".`);
        }

        const title = document.getElementById("detailTitle");
        const list = document.getElementById("detailList");

        const subDetail = subDetailData?.[item];
        if (subDetail) {
            title.textContent = item;
            list.innerHTML = generateSubDetailHTML(subDetail);
        } else {
            list.innerHTML = `<p>Detail untuk ${item} tidak tersedia.</p>`;
        }

        // Simpan state ke sessionStorage
        sessionStorage.setItem("currentView", JSON.stringify({ view: "subDetail", category, item }));
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setTimeout(hidePreloader, 3000); // Sembunyikan preloader setelah 1 detik
    }
}

// Helper untuk kapitalisasi string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Generate HTML sub-detail
function generateSubDetailHTML(subDetail) {
    let htmlContent = `
        <div class="detail-card">
            <h2>Kode Diagnosa: ${subDetail.kodeDiagnosa || "Tidak tersedia"}</h2>
            <h3>Definisi</h3>
            <p>${subDetail.definisi || "Tidak tersedia"}</p>
    `;

    // Menambahkan bagian Penyebab
    if (subDetail.penyebab) {
        if (typeof subDetail.penyebab === "object" && !Array.isArray(subDetail.penyebab)) {
            const categories = Object.entries(subDetail.penyebab).filter(([_, items]) => items.length > 0);
            if (categories.length > 0) {
                htmlContent += `<h3>Penyebab</h3>`;
                categories.forEach(([category, items]) => {
                    htmlContent += generateSection(category, items, "ul");
                });
            }
        } else if (Array.isArray(subDetail.penyebab) && subDetail.penyebab.length > 0) {
            htmlContent += generateSection("Penyebab", subDetail.penyebab, "ul");
        }
    }

    // Menambahkan bagian Gejala dan Tanda Mayor
    if (subDetail.gejalaTandaMayor) {
        htmlContent += `<h3>Gejala dan Tanda Mayor</h3>`;
        if (subDetail.gejalaTandaMayor.subjektif?.length > 0) {
            htmlContent += generateSection("Subjektif", subDetail.gejalaTandaMayor.subjektif, "ul");
        }
        if (subDetail.gejalaTandaMayor.objektif?.length > 0) {
            htmlContent += generateSection("Objektif", subDetail.gejalaTandaMayor.objektif, "ul");
        }
    }

    // Menambahkan bagian Gejala dan Tanda Minor
    if (subDetail.gejalaTandaMinor) {
        htmlContent += `<h3>Gejala dan Tanda Minor</h3>`;
        if (subDetail.gejalaTandaMinor.subjektif?.length > 0) {
            htmlContent += generateSection("Subjektif", subDetail.gejalaTandaMinor.subjektif, "ul");
        }
        if (subDetail.gejalaTandaMinor.objektif?.length > 0) {
            htmlContent += generateSection("Objektif", subDetail.gejalaTandaMinor.objektif, "ul");
        }
    }

    // Menambahkan bagian Faktor Risiko
    if (subDetail.faktorRisiko) {
        if (typeof subDetail.faktorRisiko === "object" && !Array.isArray(subDetail.faktorRisiko)) {
            const categories = Object.entries(subDetail.faktorRisiko).filter(([_, items]) => items.length > 0);
            if (categories.length > 0) {
                htmlContent += `<h3>Faktor Risiko</h3>`;
                categories.forEach(([category, items]) => {
                    htmlContent += generateSection(category, items, "ul");
                });
            }
        } else if (Array.isArray(subDetail.faktorRisiko) && subDetail.faktorRisiko.length > 0) {
            htmlContent += generateSection("Faktor Risiko", subDetail.faktorRisiko, "ul");
        }
    }

    // Menambahkan bagian Keterangan
    if (subDetail.keterangan) {
        if (typeof subDetail.keterangan === "object" && !Array.isArray(subDetail.keterangan)) {
            const categories = Object.entries(subDetail.keterangan).filter(([_, items]) => items.length > 0);
            if (categories.length > 0) {
                htmlContent += `<h3>Keterangan</h3>`;
                categories.forEach(([category, items]) => {
                    htmlContent += generateSection(category, items, "ul");
                });
            }
        } else if (Array.isArray(subDetail.keterangan) && subDetail.keterangan.length > 0) {
            htmlContent += generateSection("Keterangan", subDetail.keterangan, "ul");
        } else if (typeof subDetail.keterangan === "string") {
            htmlContent += `<h3>Keterangan</h3><p>${subDetail.keterangan}</p>`;
        }
    }

    // Menambahkan bagian Kondisi Klinis Terkait
    if (subDetail.kondisiKlinisTerkait?.length > 0) {
        htmlContent += generateSection("Kondisi Klinis Terkait", subDetail.kondisiKlinisTerkait, "ul");
    }

    // Menambahkan bagian Hiperglikemia dan Hipoglikemia
    if (subDetail.hiperglikemia || subDetail.hipoglikemia) {
        if (subDetail.hiperglikemia?.length > 0) {
            htmlContent += `<h3>Faktor Risiko Hiperglikemia</h3>`;
            htmlContent += generateSection("Hiperglikemia", subDetail.hiperglikemia, "ul");
        }
        if (subDetail.hipoglikemia?.length > 0) {
            htmlContent += `<h3>Faktor Risiko Hipoglikemia</h3>`;
            htmlContent += generateSection("Hipoglikemia", subDetail.hipoglikemia, "ul");
        }
    }

// Menambahkan bagian Ketidakadekuatan pertahanan tubuh primer dan sekunder
if (subDetail.KetidakadekuatanPertahananTubuhPrimer?.length > 0) {
    htmlContent += generateSection("Ketidakadekuatan Pertahanan Tubuh Primer", subDetail.KetidakadekuatanPertahananTubuhPrimer, "ul");
}

if (subDetail.KetidakadekuatanPertahananTubuhSekunder?.length > 0) {
    htmlContent += generateSection("Ketidakadekuatan Pertahanan Tubuh Sekunder", subDetail.KetidakadekuatanPertahananTubuhSekunder, "ul");
}

       // Menambahkan referensi
       htmlContent += `
           <div class="referensi">
               <h3>Referensi:</h3>
               <p>PPNI (2016). Standar Diagnosis Keperawatan Indonesia: Definisi dan Indikator Diagnostik, Edisi 1. Jakarta: DPP PPNI.</p>
           </div>
       `;a
    // Menutup div
    htmlContent += `</div>`;

    return htmlContent;
}

// Helper untuk generate section HTML
function generateSection(title, content, type = "ul") {
    if (!content || (Array.isArray(content) && content.length === 0)) {
        return ""; // Jangan render jika data tidak ada atau kosong
    }

    const items = Array.isArray(content) ? content.map(item => `<li>${item}</li>`).join("") : content;
    return `<h4>${title}:</h4><${type}>${items}</${type}>`;
}

// Fungsi untuk navigasi menggunakan sessionStorage
async function handleNavigation() {
    showPreloader();
    try {
        await loadAllData();

        // Cek apakah ada state yang disimpan di sessionStorage
        const savedView = JSON.parse(sessionStorage.getItem("currentView"));

        if (savedView?.view === "subDetail") {
            loadSubDetail(savedView.category, savedView.item);
        } else if (savedView?.view === "detail") {
            loadDetail(savedView.category);
        } else {
            // Reset ke halaman utama jika tidak ada state tersimpan
            sessionStorage.removeItem("currentView");
            document.getElementById("mainHeader").style.display = "block";
            document.getElementById("main").style.display = "grid";
            document.getElementById("details").style.display = "none";
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setTimeout(hidePreloader, 3000); // Sembunyikan preloader setelah 1 detik
    }
}

// Fungsi untuk tombol kembali
function goBack() {
    showPreloader();
    setTimeout(() => {
        const savedView = JSON.parse(sessionStorage.getItem("currentView"));
        if (savedView?.view === "subDetail") {
            // Kembali ke halaman detail
            sessionStorage.setItem("currentView", JSON.stringify({ view: "detail", category: savedView.category }));
            loadDetail(savedView.category);
        } else {
            // Kembali ke halaman utama
            sessionStorage.removeItem("currentView");
            document.getElementById("mainHeader").style.display = "block";
            document.getElementById("aboutCard").style.display = "block";
            document.getElementById("main").style.display = "grid";
            document.getElementById("details").style.display = "none";
        }
        hidePreloader();
    }, 3000);
}

// Fungsi untuk menampilkan modal tentang pembuat
function loadAbout(event) {
    event.preventDefault();
    const aboutModal = document.getElementById('aboutModal');
    aboutModal.style.display = 'flex';
}

// Fungsi untuk menyembunyikan modal tentang pembuat
function closeAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    aboutModal.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function () {
    // Tunggu preloader selesai
    setTimeout(() => {
        document.querySelectorAll(".card").forEach((card, index) => {
            setTimeout(() => {
                card.classList.add("show");
            }, index * 200); // Delay tiap kartu 200ms
        });
    }, 3000); // Waktu preloader (3 detik, sesuaikan dengan preloader kamu)
});

// Saat halaman dimuat
window.onload = handleNavigation;