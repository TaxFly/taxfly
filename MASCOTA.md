# Mascota 2D · Guía de TaxUSA

Se recupera el diseño plano original de la mascota y se incorporan las expresiones faciales trabajadas durante las versiones anteriores. El cuerpo, la insignia, las manos y los zapatos usan las rutas vectoriales del diseño de referencia. Los brazos se articulan para saludar, señalar y festejar.

## Comportamiento

Diez estados: espera, saludo, señalar, festejo, pensar, contento, curioso, sorprendido, triste y con sueño. Las caras se expresan con ojos, cejas y boca, sin mejillas rosadas. Las transiciones son suaves. Se conserva la mano redondeada al señalar, sin agregar un dedo, y se elige el brazo según la dirección del objetivo, con estabilidad en el centro.

La guía se llama Guía de TaxUSA; conserva recorridos, textos, permisos, progreso y cierre con Escape. La miniatura se pausa mientras la guía está abierta. Se respeta el movimiento reducido y se suspende la animación cuando la pestaña está oculta.

## Archivos

- assets/mascot.js: motor SVG 2D sin dependencias externas.
- assets/guide.js, guide-data.js y guide.css: integración y textos de la guía.
- mascota.html: demo independiente con datos ficticios; permite probar gestos y emociones y descargar una instantánea SVG.
- sw.js: caché actualizada para los archivos modificados.

Se retira el motor 3D de esta versión del proyecto. No se necesita WebGL ni cargar un GLB. El nombre global TaxflyMascot se conserva para mantener la compatibilidad de las pantallas.

## Verificación

Comprobado en Chromium: diez expresiones distintas, ambos brazos y las cuatro direcciones al señalar, transiciones faciales, habla, recorrido de la guía completo, Escape, preferencias de movimiento reducido, descarga SVG y vista móvil de 390 px sin desbordamiento. No hubo errores de JavaScript.

Esta versión no está desplegada. Para instalarla, reemplazar los archivos del proyecto y desplegar mediante el procedimiento habitual.
