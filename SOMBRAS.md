# Corrección del brillo de los filtros

Causa: las filas con overflow horizontal también recortan verticalmente las sombras y el foco. El espacio de 2–4 px alrededor de los filtros no alcanzaba y producía los rectángulos que se ven en las capturas.

Se agregó espacio transparente alrededor de las barras de filtros y se compensó con márgenes para conservar las posiciones y separaciones anteriores. Se aplicó en Mis cosas (incluida la fila de bolsos), Planificación, Documentos, Calculadora, Grupo, filtros de comparación de Gastos, pestañas de días de Rutas y vistas previas. Se conservaron los colores, las sombras, los radios y los tamaños de los botones. Las flechas siguen sobre el área transparente del brillo.

Archivos funcionales: assets/app-shell.css y sw.js. No se agregaron textos de interfaz ni se modificaron datos personales. El paquete incluye las mejoras anteriores.

Validación: las pruebas existentes de pulido, navegación, scroll y caché pasaron. No se agregaron pruebas para esta corrección de CSS. Se revisaron los estilos contra las capturas del usuario. La comprobación visual renderizada posterior sigue pendiente: el navegador local no estaba disponible en este entorno. No se desplegó el paquete.
