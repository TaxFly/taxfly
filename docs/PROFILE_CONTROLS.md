# Controles de perfiles

TaxUSA usa un perfil principal por cuenta para administrar permisos de los demás perfiles.

## Perfil principal

- El primer perfil de una cuenta nueva se convierte en principal.
- Si una cuenta existente tiene un solo perfil, ese perfil se adopta como principal.
- Si una cuenta existente tiene varios perfiles y todavía no tiene principal, `profiles.html` pide elegir uno y confirmar con el PIN de seguridad.
- El perfil principal no puede eliminarse hasta transferir el rol a otro perfil.

## PIN de seguridad

El antiguo PIN offline se reutiliza como PIN de seguridad.

- Los PIN nuevos son de 6 dígitos.
- Los PIN antiguos de 4 dígitos siguen funcionando.
- El hash continúa almacenándose con PBKDF2; el PIN no se guarda en texto plano.
- Las operaciones administrativas del Worker vuelven a verificar el PIN contra el hash almacenado en Firestore.

## Niveles de acceso

- `full`: puede editar y eliminar contenido.
- `standard`: puede editar, pero el frontend bloquea acciones de borrado.
- `readonly`: el frontend bloquea cambios habituales y la IA queda deshabilitada.

Los límites de créditos de IA siguen siendo independientes: sin límite, límite fijo o IA bloqueada.

## Seguridad

El Worker exige PIN + perfil principal para cambiar controles, límites de IA o transferir el perfil principal.

Las restricciones generales de edición/borrado se aplican en la interfaz porque los módulos de TaxUSA escriben directamente en Firestore con la misma sesión Firebase. Para convertir estas restricciones en una frontera de seguridad contra manipulación técnica del navegador sería necesario mover esas escrituras a un backend o reflejar permisos verificables en reglas de Firestore.
