const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function iniciarBot() {
    // Conexión a MySQL
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Muestra el código QR en la terminal
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true }); // Muestra el QR en la terminal
        }

        if (connection === 'open') {
            console.log('✅ Bot conectado a WhatsApp');
        } else if (connection === 'close') {
            console.log('❌ Conexión cerrada, reconectando...');
            setTimeout(iniciarBot, 5000); // Reintenta la conexión en 5 segundos
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        // Muestra el mensaje recibido en la consola para depurar
        console.log('Mensaje recibido:', msg);
    
        // Verifica si el mensaje es un texto extendido y contiene el comando !guardaVideo
        if (msg.message?.extendedTextMessage?.text?.startsWith('!guardaVideo')) {
            const texto = msg.message.extendedTextMessage.text;
            const partes = texto.split(' '); // Dividir el texto en partes
    
            if (partes.length < 3) {
                // Si no tiene título y URL 
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Uso incorrecto. El formato correcto es: !guardaVideo <titulo> <url>' });
                return;
            }
    
            const titulo = partes.slice(1, partes.length - 1).join(' '); // Extrae el título
            const url = partes[partes.length - 1]; // La última parte será la URL
    
            // Validación simple para la URL de YouTube
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|e\/|.*\/videos\/)([a-zA-Z0-9_-]+)($|\&)/;
            if (!youtubeRegex.test(url)) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL no válida. Asegúrate de que sea un enlace de YouTube.' });
                return;
            }
    
            // Guardar la URL y el título en la base de datos
            try {
                await db.execute('INSERT INTO videos (url, titulo) VALUES (?, ?)', [url, titulo]);
                console.log('✅ Video guardado en MySQL');
    
                // Confirmación en el chat donde se mandó el comando
                await sock.sendMessage(msg.key.remoteJid, { text: `✅ Video guardado correctamente en la base de datos:\nTítulo: ${titulo}\nURL: ${url}` });
            } catch (error) {
                console.error('❌ Error al guardar en MySQL:', error);
            }
        }
    });
    

    
}

iniciarBot().catch(console.error);
