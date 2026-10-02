# Ajustes — Créditos IA y Cafecito

La pantalla de Ajustes ahora tiene un bloque visual de **Inteligencia artificial** con:

- saldo de créditos (o `∞ · Owner` para el propietario);
- botón **Comprar créditos**;
- botón **Historial de uso**;
- bloque **Invitar un cafecito** para aportes voluntarios.

## Cafecito

Pegá tu enlace público en `config.js`:

```js
SUPPORT_CAFECITO_URL: "https://cafecito.app/taxflyapp",
```

Mientras quede vacío, el botón no abre una URL externa y muestra un aviso de configuración pendiente.

## Compra de créditos

Los paquetes ya están visibles en la interfaz, pero sus enlaces quedan vacíos hasta conectar el proveedor de pagos:

```js
AI_CREDIT_PACKAGES: [
  { credits: 50, label: "Paquete inicial", url: "" },
  { credits: 100, label: "Paquete estándar", url: "" },
  { credits: 250, label: "Paquete viajero", url: "" },
  { credits: 500, label: "Paquete intensivo", url: "" }
],
```

No pongas una URL de pago real hasta que el backend pueda validar el webhook y acreditar créditos del lado servidor. Un checkout no debe acreditar créditos desde JavaScript del navegador.


## UX de créditos (v2)

- El bloque de IA en Ajustes está colapsado por defecto.
- La compra ofrece 50 / 100 / 250 / 500 créditos y una cantidad personalizada.
- Los importes se muestran siempre en USD.
- La UI aclara que el importe final puede variar por impuestos, tasas o conversión de moneda del país, banco o medio de pago.
- Hasta conectar el proveedor de pagos, los precios y checkouts permanecen deshabilitados.

Config relacionada:

```js
AI_CREDIT_CURRENCY: "USD",
AI_CREDIT_USD_PER_CREDIT: null,
AI_CUSTOM_CREDIT_CHECKOUT_URL: ""
```
