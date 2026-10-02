# TaxFly · TaxUSA

**Español** · [English](#english) · [Português](#português)

---

## Español

TaxUSA es una aplicación web para organizar viajes, compras y gastos en Estados Unidos desde un único lugar.

La app reúne herramientas de planificación, registro de compras, cálculo de impuestos, gestión de tickets y documentos, rutas y funciones asistidas por inteligencia artificial.

### Funcionalidades

- Gestión de perfiles y viajes
- Registro de compras y gastos
- Cálculo de impuestos sobre compras
- Organización de tickets y comprobantes
- Gestión de documentos y reservas
- Planificación y optimización de rutas
- Herramientas de inteligencia artificial
- Historial de información del viaje
- Soporte multidioma
- Configuración y preferencias por usuario

### Inteligencia artificial

TaxUSA incorpora funciones de IA para asistir en distintas tareas de viaje, como:

- análisis de tickets y comprobantes;
- creación y optimización de rutas;
- análisis de información vinculada al viaje;
- asistencia contextual dentro de la aplicación;
- comparación y organización de información.

Las funciones de IA están integradas a través de un backend dedicado, de modo que las credenciales privadas no se exponen en el navegador.

### Tecnologías

El proyecto utiliza principalmente:

- HTML, CSS y JavaScript
- Firebase Authentication
- Cloud Firestore
- Cloudflare Workers
- Anthropic Claude
- Progressive Web App / Service Worker

### Ejecutar localmente

Desde la raíz del proyecto:

```bash
python3 -m http.server 8765
```

Luego abrir:

```text
http://localhost:8765/login.html
```

> Algunas funciones requieren servicios externos y configuración propia del entorno para funcionar completamente en desarrollo local.

### Pruebas

```bash
npm test
```

### Caché de la aplicación

Para verificar la versión de caché:

```bash
node scripts/bump-cache.js --check
```

Cuando corresponda actualizarla:

```bash
node scripts/bump-cache.js
```

### Estructura general

```text
/
├── assets/        # Estilos, scripts y recursos de interfaz
├── docs/          # Documentación técnica y funcional
├── scripts/       # Herramientas auxiliares
├── tests/         # Pruebas automatizadas
├── *.html         # Pantallas principales
└── worker*.js     # Servicios backend
```

### Configuración y seguridad

TaxUSA utiliza servicios externos para autenticación, almacenamiento y funciones de inteligencia artificial.

Las credenciales, claves privadas y secretos de producción no deben guardarse en el repositorio.

El proyecto utiliza autenticación de usuarios, separación entre frontend y servicios con credenciales privadas, validación de solicitudes en backend y controles de uso para servicios externos.

### Documentación

La documentación adicional se encuentra en:

```text
docs/
```

### Desarrollo

Antes de publicar cambios:

1. Ejecutar la suite de pruebas.
2. Verificar que no se hayan incorporado credenciales o archivos privados.
3. Comprobar el comportamiento de la aplicación en escritorio y móvil.
4. Revisar los cambios relacionados con caché y Service Worker.
5. Validar las funciones que dependan de servicios externos.

### Privacidad

TaxUSA está diseñada para manejar información relacionada con viajes, compras y documentos del usuario.

No deben incluirse secretos, claves privadas ni credenciales personales dentro del código fuente o del repositorio.

### Apoyar el proyecto

TaxUSA busca mantenerse accesible y sostener los costos asociados a infraestructura y funciones de inteligencia artificial.

Quienes quieran colaborar pueden hacerlo desde la opción de apoyo disponible dentro de la aplicación.

---

## English

TaxUSA is a web application designed to organize trips, purchases, and travel expenses in the United States from one place.

The app brings together trip planning, purchase tracking, tax calculation, receipt and document management, route planning, and AI-assisted tools.

### Features

- Profile and trip management
- Purchase and expense tracking
- Sales tax calculations
- Receipt and proof-of-purchase organization
- Document and reservation management
- Route planning and optimization
- Artificial intelligence tools
- Travel information history
- Multilingual support
- User settings and preferences

### Artificial intelligence

TaxUSA includes AI-powered features to assist with different travel-related tasks, including:

- receipt and document analysis;
- route creation and optimization;
- analysis of travel-related information;
- contextual assistance within the application;
- comparison and organization of information.

AI features are integrated through a dedicated backend so private credentials are not exposed in the browser.

### Technologies

The project mainly uses:

- HTML, CSS, and JavaScript
- Firebase Authentication
- Cloud Firestore
- Cloudflare Workers
- Anthropic Claude
- Progressive Web App / Service Worker

### Run locally

From the project root:

```bash
python3 -m http.server 8765
```

Then open:

```text
http://localhost:8765/login.html
```

> Some features rely on external services and require environment-specific configuration to work fully in local development.

### Tests

```bash
npm test
```

### Application cache

To check the cache version:

```bash
node scripts/bump-cache.js --check
```

When the cache version needs to be updated:

```bash
node scripts/bump-cache.js
```

### General structure

```text
/
├── assets/        # Styles, scripts, and interface resources
├── docs/          # Technical and functional documentation
├── scripts/       # Project utilities
├── tests/         # Automated tests
├── *.html         # Main application screens
└── worker*.js     # Backend services
```

### Configuration and security

TaxUSA uses external services for authentication, storage, and artificial intelligence features.

Production credentials, private keys, and secrets must not be stored in the repository.

The project uses user authentication, separation between the frontend and services that require private credentials, backend request validation, and usage controls for external services.

### Documentation

Additional project documentation is available in:

```text
docs/
```

### Development

Before publishing changes:

1. Run the test suite.
2. Make sure no credentials or private files were added.
3. Check the application on both desktop and mobile.
4. Review cache and Service Worker changes.
5. Validate features that depend on external services.

### Privacy

TaxUSA is designed to handle information related to trips, purchases, and user documents.

Secrets, private keys, and personal credentials must never be included in the source code or repository.

### Support the project

TaxUSA aims to remain accessible while covering the costs of infrastructure and artificial intelligence features.

Users who want to support the project can do so through the support option available inside the application.

---

## Português

TaxUSA é uma aplicação web criada para organizar viagens, compras e despesas nos Estados Unidos em um único lugar.

O aplicativo reúne ferramentas de planejamento, registro de compras, cálculo de impostos, gerenciamento de comprovantes e documentos, rotas e recursos assistidos por inteligência artificial.

### Funcionalidades

- Gerenciamento de perfis e viagens
- Registro de compras e despesas
- Cálculo de impostos sobre compras
- Organização de comprovantes e recibos
- Gerenciamento de documentos e reservas
- Planejamento e otimização de rotas
- Ferramentas de inteligência artificial
- Histórico de informações da viagem
- Suporte multilíngue
- Configurações e preferências por usuário

### Inteligência artificial

TaxUSA incorpora recursos de IA para auxiliar em diferentes tarefas relacionadas à viagem, como:

- análise de comprovantes e documentos;
- criação e otimização de rotas;
- análise de informações relacionadas à viagem;
- assistência contextual dentro do aplicativo;
- comparação e organização de informações.

Os recursos de IA são integrados por meio de um backend dedicado, para que credenciais privadas não sejam expostas no navegador.

### Tecnologias

O projeto utiliza principalmente:

- HTML, CSS e JavaScript
- Firebase Authentication
- Cloud Firestore
- Cloudflare Workers
- Anthropic Claude
- Progressive Web App / Service Worker

### Executar localmente

Na raiz do projeto:

```bash
python3 -m http.server 8765
```

Depois, abra:

```text
http://localhost:8765/login.html
```

> Alguns recursos dependem de serviços externos e exigem configuração específica do ambiente para funcionar completamente em desenvolvimento local.

### Testes

```bash
npm test
```

### Cache da aplicação

Para verificar a versão do cache:

```bash
node scripts/bump-cache.js --check
```

Quando for necessário atualizar a versão:

```bash
node scripts/bump-cache.js
```

### Estrutura geral

```text
/
├── assets/        # Estilos, scripts e recursos de interface
├── docs/          # Documentação técnica e funcional
├── scripts/       # Ferramentas auxiliares
├── tests/         # Testes automatizados
├── *.html         # Telas principais
└── worker*.js     # Serviços backend
```

### Configuração e segurança

TaxUSA utiliza serviços externos para autenticação, armazenamento e recursos de inteligência artificial.

Credenciais, chaves privadas e segredos de produção não devem ser armazenados no repositório.

O projeto utiliza autenticação de usuários, separação entre frontend e serviços com credenciais privadas, validação de requisições no backend e controles de uso para serviços externos.

### Documentação

A documentação adicional do projeto está disponível em:

```text
docs/
```

### Desenvolvimento

Antes de publicar alterações:

1. Execute a suíte de testes.
2. Verifique se nenhuma credencial ou arquivo privado foi incluído.
3. Teste o comportamento da aplicação em desktop e dispositivos móveis.
4. Revise alterações relacionadas ao cache e ao Service Worker.
5. Valide os recursos que dependem de serviços externos.

### Privacidade

TaxUSA foi projetada para lidar com informações relacionadas a viagens, compras e documentos do usuário.

Segredos, chaves privadas e credenciais pessoais nunca devem ser incluídos no código-fonte ou no repositório.

### Apoiar o projeto

TaxUSA busca continuar acessível e, ao mesmo tempo, cobrir os custos de infraestrutura e dos recursos de inteligência artificial.

Quem quiser apoiar o projeto pode fazê-lo pela opção de apoio disponível dentro do aplicativo.

---

**TaxUSA** is part of the **TaxFly** project.
