// --- TUS CLAVES DE SUPABASE ---
// (Buscalas en Project Settings -> API)
const SUPABASE_URL = 'https://thchwfvkxwvsrkadgewp.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoY2h3ZnZreHd2c3JrYWRnZXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTMxMTksImV4cCI6MjA4NDg4OTExOX0.vSKbCIfVLpAoJb-lmLOnLwECfUZ9MgiAl0L1BaWxu1Y'; 
const DOMINIO_WEB = "https://regalo-sabri.vercel.app"; 

const fechaInicio = new Date(2025, 6, 12, 21, 53); // 12 julio 2025, 21:53

const supabase = (typeof window !== 'undefined' && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// CARGAR CUPONES
async function cargarCupones() {
    const contenedor = document.getElementById('lista-cupones-render');
    if (!contenedor || !supabase) return;
    const { data: cupones, error } = await supabase.from('cupones').select('*').order('id');
    
    if (error) return;

    contenedor.innerHTML = "";
    (cupones || []).forEach(cupon => {
        const div = document.createElement('div');
        div.className = `cupon ${cupon.usado ? 'usado' : ''}`;
        div.innerHTML = cupon.usado ? `✅ Canjeado: ${cupon.nombre}` : `🎟️ Cupón: ${cupon.nombre}`;
        
        div.onclick = () => cupon.usado ? mostrarQR(cupon.id) : canjearCupon(cupon.id, cupon.nombre);
        contenedor.appendChild(div);
    });
}

// CANJEAR
async function canjearCupon(id, nombre) {
    if (!confirm(`¿Querés usar el cupón de "${nombre}"?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from('cupones').update({ usado: true, fecha_uso: new Date() }).eq('id', id);
    if (!error) { await cargarCupones(); mostrarQR(id); }
}

function mostrarQR(idCupon) {
    document.getElementById('qr-container').classList.remove('hidden');
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = "";
    const idLimpio = idCupon.replace('cupon_', '');
    new QRCode(qrDiv, {
        text: `${DOMINIO_WEB}/cupon/${idLimpio}.html`,
        width: 130, height: 130, colorDark: "#bf360c"
    });
}

function actualizarReloj() {
    const el = document.getElementById('time-display');
    if (!el) return;
    const dif = new Date() - fechaInicio;
    if (dif < 0) {
        el.innerText = '000:00:00:00';
        return;
    }
    const d = Math.floor(dif / 86400000).toString().padStart(3, '0');
    const h = Math.floor((dif / 3600000) % 24).toString().padStart(2, '0');
    const m = Math.floor((dif / 60000) % 60).toString().padStart(2, '0');
    const s = Math.floor((dif / 1000) % 60).toString().padStart(2, '0');
    el.innerText = `${d}:${h}:${m}:${s}`;
}

window.mostrarDetalleReloj = () => {
    const modal = document.getElementById('modal-clock');
    const fullEl = document.getElementById('full-time-counter');
    if (modal) modal.classList.remove('hidden');
    if (fullEl) fullEl.textContent = document.getElementById('time-display')?.innerText || '000:00:00:00';
};
window.abrirCuponera = () => { document.getElementById('modal-cupones').classList.remove('hidden'); cargarCupones(); };
window.cerrarModales = (e) => { if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden'); };
window.cerrarQR = () => document.getElementById('qr-container').classList.add('hidden');

// Reloj: iniciar en cuanto exista el DOM
const timeEl = document.getElementById('time-display');
if (timeEl) {
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}