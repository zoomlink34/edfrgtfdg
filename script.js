const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com",
    projectId: "m-legacy-5cf2b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas'), ctx = cv.getContext('2d');
const mover = document.getElementById('mover'), viewport = document.getElementById('viewport');
const blockW = 60, blockH = 40, cols = 100, rows = 100; // 100x100 = 10,000
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.1, pX = 0, pY = 0, pixels = {};
const imgCache = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#444"; ctx.lineWidth = 1.2; // গাঢ় গ্রিড লাইন
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            if (!imgCache[p.imageUrl]) {
                const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
                img.onload = () => { imgCache[p.imageUrl] = img; ctx.drawImage(img, p.x, p.y, blockW, blockH); };
            } else { ctx.drawImage(imgCache[p.imageUrl], p.x, p.y, blockW, blockH); }
        }
    });
}

function updateUI() { mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`; }

viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(scale * (e.deltaY > 0 ? 0.85 : 1.15), 0.05), 8);
    updateUI();
}, { passive: false });

viewport.onmousedown = (e) => { this.isDown = true; this.sX = e.clientX - pX; this.sY = e.clientY - pY; };
window.onmouseup = () => { this.isDown = false; };
window.onmousemove = (e) => { if (this.isDown) { pX = e.clientX - this.sX; pY = e.clientY - this.sY; updateUI(); } };

function searchPlot() {
    const id = parseInt(document.getElementById('searchInput').value);
    if (id < 1 || id > 10000) return alert("ID: 1-10000");
    const r = Math.floor((id-1)/cols), c = (id-1)%cols;
    scale = 3.5;
    pX = (viewport.clientWidth/2) - (c*blockW*scale) - (blockW*scale/2);
    pY = (viewport.clientHeight/2) - (r*blockH*scale) - (blockH*scale/2);
    updateUI();
}

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 10000 - Object.keys(pixels).length;
    render();
});
function copyVal(v) { navigator.clipboard.writeText(v).then(() => alert("Copied: " + v)); }
updateUI();
