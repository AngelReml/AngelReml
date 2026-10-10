# Osos de rosas · página de pedido

Web de una sola página. Sin instalar nada: HTML, CSS y JavaScript.

## Rellenar los datos

1. Abre `config.js`.
2. Cambia cada `null` por el dato real, entre comillas si es texto: `SELLER_NIF: "12345678Z",`
3. El número de WhatsApp va solo con números y el 34 delante: `"34600111222"`.
4. El precio va sin comillas ni símbolo: `PRICE_EUR: 35,`
5. Mientras un dato sea `null`, la web muestra `[FALTA DATO: …]` en amarillo.
6. Sin número de WhatsApp, el botón «Pedir mi oso» no funciona.

## Cambiar la foto y el vídeo

- Foto: guarda cada foto real como `img/oso-1.jpg`, `img/oso-2.jpg`… (vertical 4:5, 1200 × 1500 px, menos de 300 KB).
  En `index.html` (sección «Osos que ya han salido de aquí») cambia cada `img/foto-pendiente.svg` por su foto.
- Vídeo: guarda el vídeo como `img/proceso.mp4` (vertical 9:16, corto y comprimido).
  En `index.html` cambia la línea `<img class="video" …>` por:
  `<video class="video" src="img/proceso.mp4" controls playsinline preload="metadata"></video>`

## Enlaces para compartir

- Estados de WhatsApp: `https://TU-WEB/?src=estado`
- Instagram: `https://TU-WEB/?src=ig`

El mensaje de pedido dice de dónde viene cada cliente.
- `formulario.html` es la versión sencilla, solo con el formulario.
