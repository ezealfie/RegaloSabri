// --- TUS CLAVES DE SUPABASE ---
// (Buscalas en Project Settings -> API)
const SUPABASE_URL = 'https://thchwfvkxwvsrkadgewp.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoY2h3ZnZreHd2c3JrYWRnZXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTMxMTksImV4cCI6MjA4NDg4OTExOX0.vSKbCIfVLpAoJb-lmLOnLwECfUZ9MgiAl0L1BaWxu1Y'; 
const DOMINIO_WEB = "https://regalo-sabri.vercel.app"; 

//cortar a partir de aca

const fechaInicio = new Date(2025, 6, 12, 21, 53); 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function cargarCupones() {
    const contenedor = document.getElementById('lista-cupones-render');
    const loading = document.getElementById('loading-msg');
    if(loading) loading.style.display = 'block';
    
    const { data: cupones, error } = await supabase.from('cupones').select('*').order('id');
    if (error) { if(loading) loading.innerText = "Error conexión"; return; }

    contenedor.innerHTML = "";
    if(loading) loading.style.display = 'none';

    cupones.forEach(cupon => {
        const div = document.createElement('div');
        div.className = 'cupon';
        div.innerHTML = cupon.usado ? `✅ ${cupon.nombre}` : `🎟️ ${cupon.nombre}`;
        div.onclick = () => cupon.usado ? mostrarQR(cupon.id) : canjearCupon(cupon.id, cupon.nombre);
        if (cupon.usado) div.classList.add('usado');
        contenedor.appendChild(div);
    });
}

async function canjearCupon(id, nombre) {
    if (!confirm(`¿Canjear "${nombre}"?`)) return;
    await supabase.from('cupones').update({ usado: true, fecha_uso: new Date() }).eq('id', id);
    await cargarCupones();
    mostrarQR(id);
}

function mostrarQR(idCupon) {
    document.getElementById('qr-container').classList.remove('hidden');
    document.getElementById('qrcode').innerHTML = "";
    const nombreLimpio = idCupon.replace('cupon_', '');
    new QRCode(document.getElementById('qrcode'), { 
        text: `${DOMINIO_WEB}/cupon/${nombreLimpio}.html`, 
        width: 128, height: 128, colorDark : "#e65100", colorLight : "#ffffff"
    });
}

function actualizarReloj() {
    const dif = new Date() - fechaInicio;
    const d = Math.floor(dif / 86400000).toString().padStart(3, '0');
    const h = Math.floor((dif / 3600000) % 24).toString().padStart(2, '0');
    const m = Math.floor((dif / 60000) % 60).toString().padStart(2, '0');
    const s = Math.floor((dif / 1000) % 60).toString().padStart(2, '0');
    
    const disp = document.getElementById('time-display');
    if (disp) disp.innerText = `${d}:${h}:${m}:${s}`;
    const det = document.getElementById('full-time-counter');
    if (det && !document.getElementById('modal-clock').classList.contains('hidden')) {
        det.innerHTML = `<h1 style="color:#ff3333;margin:0">${d}</h1> DÍAS <br>${h}:${m}:${s}`;
    }
}

window.mostrarDetalleReloj = () => document.getElementById('modal-clock').classList.remove('hidden');
window.abrirCuponera = () => { document.getElementById('modal-cupones').classList.remove('hidden'); cargarCupones(); };
window.cerrarModales = (e) => { if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden'); };
window.cerrarQR = () => { document.getElementById('qr-container').classList.add('hidden'); };

setInterval(actualizarReloj, 1000);