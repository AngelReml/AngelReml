// Datos de la tienda. Cambia solo lo que va después de los dos puntos.
// Mientras un dato valga null, la web muestra "[FALTA DATO: …]" en su lugar.
window.CONFIG = {
  BRAND_NAME: null,               // Ejemplo: "Osos de Cassandra"
  WHATSAPP_NUMBER: null,          // Solo números, con 34 delante. Ejemplo: "34600000000"
  PRICE_EUR: null,                // Precio final con entrega en mano. Ejemplo: 35
  DELIVERY_ZONE_TEXT: "Padrón y alrededores",
  LEAD_DAYS: null,                // Días que tardas en hacer un oso. Ejemplo: 5
  COLORS: [
    { name: "Rosa", hex: "#F2A7B0" },
    { name: "Rojo", hex: "#B3132B" },
    { name: "Blanco", hex: "#F7F7F5" },
    { name: "Azul", hex: "#8DB3D9" }
  ],
  SELLER_LEGAL_NAME: null,        // Nombre y apellidos
  SELLER_NIF: null,               // NIF
  SELLER_ADDRESS: null,           // Domicilio completo
  SELLER_EMAIL: null,             // Email de contacto
  LATE_DELIVERY_POLICY_TEXT: null, // Qué haces si no llegas a la fecha. Ejemplo: "Si no llego a tu fecha, te devuelvo el dinero."
  COLOR_DURABILITY_TEXT: null     // Cuánto aguanta el color. Solo lo que sepas seguro.
};
