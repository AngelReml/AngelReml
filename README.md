## Iván Carbonell

Diseño y opero **sistemas multi-agente que están en producción**. No escribo código a mano ni vendo una identidad de programador tradicional: mi trabajo es convertir objetivos ambiguos en prompts, contratos, guardarraíles, pruebas y criterios de aceptación que permiten a agentes de IA construir, ejecutar y corregir sistemas reales bajo supervisión.

Lo que hay aquí abajo arranca, tiene pruebas y se puede leer. No hay demos.

---

### Proyectos

| Proyecto | Qué es | Verificable |
|---|---|---|
| **[Shinobi](https://github.com/AngelReml/Shinobibot)** | Agente autónomo Windows-nativo. Recibe una orden en lenguaje natural y la ejecuta sobre la máquina real: ficheros, shell, Chrome por CDP, sub-agentes en paralelo. Cada llamada queda en un log append-only. | CI en verde sobre Windows y Linux |
| **[Kaizen](https://github.com/AngelReml/Kaizen)** | Departamento comercial B2B automatizado: busca candidatos, los cualifica contra un ICP, redacta el primer contacto y hace seguimiento. Multi-tenant, sin datos de cliente en el repositorio. | 1343 tests pasan; 8 opcionales se omiten sin servicios externos |
| **[Don Pepe](https://github.com/AngelReml/donpepe)** | Restaurante real, en producción. El dueño dice *"sube el pulpo a 20"* por Telegram y el precio cambia en la carta en menos de 30 segundos. | Cliente real, desplegado |
| **[Swarm IDE](https://github.com/AngelReml/swarm-ide)** | IDE multi-agente local-first: planifica, edita varios ficheros de forma atómica, corre los tests y hace commit. 24 modelos en 8 proveedores con fallback automático. | Arranca con un clic en Windows |
| **[PredAItor](https://github.com/AngelReml/Predaitor)** | Motor de descubrimiento: rastrea GitHub y HuggingFace buscando sistemas agénticos, extrae sus capacidades técnicas y exporta perfiles estructurados. | Dataset exportable |

---

### Tres decisiones que repito en todos

**El modelo nunca escribe en los datos.** En Don Pepe, cuando el dueño pide un cambio, el LLM no toca la carta: emite una *acción tipada* que se valida contra un esquema. Si no encaja en el esquema, la acción no existe. Solo después de que el dueño confirme, una función determinista y sin LLM la aplica. Mismo mensaje, mismo resultado, siempre.

**Las barreras se comprueban solas o no son barreras.** Ninguna acción puede tocar un campo de alérgenos —hoy ni el día que se añada uno—. No es una norma escrita en un documento: es un test que corre dentro de `npm run build`. Si algún día deja de cumplirse, el despliegue se para antes de llegar a producción.

**Nada irreversible sin aprobación explícita.** Antes de un envío real —un correo, una llamada— Kaizen exige tres cosas a la vez: variable de activación, token de aprobación y flag en el comando. Si falta una, no envía. Shinobi intercepta con un gate las acciones sensibles: secretos, gasto, borrado, primer acceso del navegador a un host nuevo.

---

### Cómo trabajo

Especifico, orquesto y **verifico**. La parte que más tiempo me lleva no es generar código: es desconfiar de él. No doy por cierto lo que afirma un agente sin comprobarlo contra el repositorio, la salida real del comando o el sistema en producción. Casi todos los fallos que he encontrado en mi propio trabajo salieron de aplicar esa regla a un informe que decía que todo estaba bien.

Trabajo en español y en inglés. Disponible desde noviembre de 2026.

**[LinkedIn](https://www.linkedin.com/in/ivan-carbonell/)** · Padrón, Galicia, España
