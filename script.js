let photos = [];
let photoId = 1;

let wishes = [];

function loadData() {
    const savedPhotos = localStorage.getItem('wisuda_photos');
    if (savedPhotos) {
        try {
            photos = JSON.parse(savedPhotos);
            if (photos.length > 0) {
                photoId = Math.max(...photos.map(p => p.id)) + 1;
            }
        } catch(e) {
            photos = [];
        }
    }

    const savedWishes = localStorage.getItem('wisuda_wishes');
    if (savedWishes) {
        try {
            wishes = JSON.parse(savedWishes);
            if (wishes.length > 0) {
                wishId = Math.max(...wishes.map(w => w.id)) + 1;
            }
        } catch(e) {
            wishes = [];
        }
    }

    if (wishes.length === 0) {
        wishes = [
            { id: 1, nama: 'anisa', hubungan: 'sahabat', pesan: 'selamat wisuda! kamu hebat' },
            { id: 2, nama: 'budi', hubungan: 'teman', pesan: 'akhirnya lulus! sukses selalu' },
            { id: 3, nama: 'ibu', hubungan: 'keluarga', pesan: 'bangga banget sama kamu' }
        ];
        wishId = 4;
        saveWishes();
    }
}

function savePhotos() {
    localStorage.setItem('wisuda_photos', JSON.stringify(photos));
}

function saveWishes() {
    localStorage.setItem('wisuda_wishes', JSON.stringify(wishes));
}

const grid = document.getElementById('galleryGrid');

function renderGallery() {
    grid.innerHTML = '';

    if (photos.length === 0) {
        grid.innerHTML = `<div class="empty-grid"><i class="fas fa-images"></i><p>belum ada foto</p></div>`;
        return;
    }

    photos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${p.url}" alt="${p.title}" loading="lazy" />
            <button class="del" data-id="${p.id}">&times;</button>
            <div class="info">
                <div class="title">${esc(p.title)}</div>
                <div class="date">${esc(p.date || 'tanpa tanggal')}</div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.card .del').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            if (confirm('hapus foto ini?')) {
                photos = photos.filter(p => p.id !== id);
                savePhotos();
                renderGallery();
            }
        });
    });
}

const wishList = document.getElementById('wishList');
const wishCount = document.getElementById('wishCount');

function renderWishes() {
    wishList.innerHTML = '';
    wishCount.textContent = wishes.length;

    if (wishes.length === 0) {
        wishList.innerHTML = `<div class="empty-list"><i class="fas fa-comment-dots"></i><p>belum ada ucapan</p></div>`;
        return;
    }

    const sorted = [...wishes].reverse();
    sorted.forEach(w => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div class="body">
                <span class="name">${esc(w.nama)}</span>
                ${w.hubungan ? `<span class="rel">(${esc(w.hubungan)})</span>` : ''}
                <span class="msg">${esc(w.pesan)}</span>
            </div>
            <button class="del-item" data-id="${w.id}">&times;</button>
        `;
        wishList.appendChild(item);
    });

    document.querySelectorAll('.del-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (confirm('hapus ucapan ini?')) {
                wishes = wishes.filter(w => w.id !== id);
                saveWishes();
                renderWishes();
            }
        });
    });
}

let wishId = 4;

document.getElementById('wishForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = document.getElementById('namaPengirim').value.trim();
    const hub = document.getElementById('hubungan').value.trim();
    const pesan = document.getElementById('isiUcapan').value.trim();

    if (!nama || !pesan) {
        alert('nama dan ucapan harus diisi');
        return;
    }

    wishes.push({
        id: wishId++,
        nama: nama.toLowerCase(),
        hubungan: hub.toLowerCase() || '',
        pesan: pesan.toLowerCase()
    });

    saveWishes();

    this.reset();
    renderWishes();
    document.querySelector('.list').scrollIntoView({ behavior: 'smooth' });
});

const modal = document.getElementById('photoModal');
const addBtn = document.getElementById('addPhotoBtn');
const closeBtn = document.getElementById('closeModal');
const fileInput = document.getElementById('photoFile');
const fileName = document.getElementById('fileName');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');

addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('photoForm').reset();
    previewContainer.style.display = 'none';
    fileName.textContent = '';
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

fileInput.addEventListener('change', function(e) {
    const file = this.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('file terlalu besar (max 5mb)');
            this.value = '';
            fileName.textContent = '';
            previewContainer.style.display = 'none';
            return;
        }

        const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!types.includes(file.type)) {
            alert('format tidak didukung');
            this.value = '';
            fileName.textContent = '';
            previewContainer.style.display = 'none';
            return;
        }

        fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(ev) {
            previewImage.src = ev.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        fileName.textContent = '';
        previewContainer.style.display = 'none';
    }
});

document.getElementById('photoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const file = fileInput.files[0];
    const title = document.getElementById('photoTitle').value.trim();
    const date = document.getElementById('photoDate').value.trim();

    if (!file || !title) {
        alert('pilih foto dan isi judul');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        photos.push({
            id: photoId++,
            url: ev.target.result,
            title: title,
            date: date || new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        });

        savePhotos();

        document.getElementById('photoForm').reset();
        previewContainer.style.display = 'none';
        fileName.textContent = '';
        modal.classList.remove('active');

        renderGallery();
        document.querySelector('.box').scrollIntoView({ behavior: 'smooth' });
    };

    reader.readAsDataURL(file);
});

function esc(str) {
    if (!str) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => m[c]);
}

loadData();
renderGallery();
renderWishes();