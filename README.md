# whatsapp-yt-reader-bot

## Descripción

`whatsapp-yt-reader-bot` es un bot de WhatsApp que permite a los usuarios guardar videos de YouTube en una base de datos MySQL a través de un comando en un grupo de WhatsApp. Los usuarios pueden usar el comando `!guardaVideo <titulo> <url>` para guardar el título y la URL de un video de YouTube.

## Funcionalidades

- Detecta el comando `!guardaVideo <titulo> <url>` en los mensajes de WhatsApp.
- Extrae el título y la URL del video de YouTube.
- Guarda la URL y el título en una base de datos MySQL.
- Envía una confirmación en el chat de WhatsApp una vez que el video ha sido guardado.

## Requisitos

- Node.js 14 o superior.
- MySQL 5.x o superior.
- XAMPP o cualquier servidor que te permita correr MySQL localmente.
- WhatsApp Business API o `baileys` para interactuar con WhatsApp.

### //TO DO