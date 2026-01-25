// --- TUS CLAVES DE SUPABASE ---
// (Buscalas en Project Settings -> API)
const SUPABASE_URL = 'https://thchwfvkxwvsrkadgewp.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoY2h3ZnZreHd2c3JrYWRnZXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTMxMTksImV4cCI6MjA4NDg4OTExOX0.vSKbCIfVLpAoJb-lmLOnLwECfUZ9MgiAl0L1BaWxu1Y'; 


// --- CONFIGURACIÓN DE TU WEB ---
// Cuando subas a Vercel, copiá el link acá (sin la barra al final)
// Ejemplo: "https://regalo-sabri.vercel.app"
const DOMINIO_WEB = "https:/regalo-sabri.vercel.app"; 

// Inicializamos Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const fechaInicio = new Date(2025, 6, 12, 21, 53); 

// --- 1. CARGAR CUPONES ---
async function cargarCupones() {
    const contenedor = document.getElementById('lista-cupones-render');
    const loading = document.getElementById('loading-msg');
    if(loading) loading.style.display = 'block';
    
    const { data: cupones, error } = await supabase
        .from('cupones')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error:", error);
        if(loading) loading.innerText = "Error de conexión 🔴";
        return;
    }

    contenedor.innerHTML = "";
    if(loading) loading.style.display = 'none';

    cupones.forEach(cupon => {
        const div = document.createElement('div');
        div.className = 'cupon';
        div.innerText = cupon.usado ? "✅ CANJEADO - " + cupon.nombre : "🎁 " + cupon.nombre;
        
        if (cupon.usado) {
            div.classList.add('usado');
            div.onclick = () => mostrarQR(cupon.id);
        } else {
            div.onclick = () => canjearCupon(cupon.id, cupon.nombre);
        }
        contenedor.appendChild(div);
    });
}

// --- 2. CANJEAR CUPÓN ---
async function canjearCupon(id, nombre) {
    if (!confirm(`¿Seguro que querés gastar el "${nombre}"?`)) return;

    const { error } = await supabase
        .from('cupones')
        .update({ usado: true, fecha_uso: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        alert("Error al guardar.");
    } else {
        await cargarCupones();
        mostrarQR(id);
    }
}

// --- 3. GENERAR EL QR PERSONALIZADO ---
function mostrarQR(idCupon) {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = "";
    qrContainer.classList.remove('hidden');

    // TRUCO DE URL LIMPIA:
    // Si el ID en la base de datos es "cupon_cena", le sacamos "cupon_"
    // para que la URL quede ".../cupon/cena"
    const nombreLimpio = idCupon.replace('cupon_', '');
    
    // Armamos la URL final
    const urlDestino = `${DOMINIO_WEB}/cupon/${nombreLimpio}`; 

    new QRCode(qrcodeDiv, { 
        text: urlDestino, 
        width: 128, height: 128, 
        colorDark : "#e65100", 
        colorLight : "#ffffff", 
        correctLevel : QRCode.CorrectLevel.H 
    });
    
    // Opcional: Mostrar el link abajo del QR por si quiere hacer click
    console.log("QR Generado para:", urlDestino);
}

// --- RELOJ ---
function actualizarReloj() {
    const ahora = new Date();
    const dif = ahora - fechaInicio;
    const dias = Math.floor(dif / (1000 * 60 * 60 * 24)).toString().padStart(3, '0');
    const horas = Math.floor((dif / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const min = Math.floor((dif / (1000 * 60)) % 60).toString().padStart(2, '0');
    const seg = Math.floor((dif / 1000) % 60).toString().padStart(2, '0');

    const display = document.getElementById('time-display');
    if (display) display.innerText = `${dias}:${horas}:${min}:${seg}`;
    
    const displayDetalle = document.getElementById('full-time-counter');
    if (displayDetalle && !document.getElementById('modal-clock').classList.contains('hidden')) {
        displayDetalle.innerHTML = `<h1 style="color:#d32f2f; margin:0">${dias}</h1> DÍAS <br> ${horas}:${min}:${seg}`;
    }
}

// EXPORTS
window.mostrarDetalleReloj = () => document.getElementById('modal-clock').classList.remove('hidden');
window.abrirCuponera = () => {
    document.getElementById('modal-cupones').classList.remove('hidden');
    cargarCupones();
};
window.cerrarModales = (e) => { if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden'); };
window.cerrarQR = () => { document.getElementById('qr-container').classList.add('hidden'); document.getElementById('qrcode').innerHTML = ""; };

setInterval(actualizarReloj, 1000);