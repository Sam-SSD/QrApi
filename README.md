# 🎨 QR Generator Web3 - Generador Avanzado de Códigos QR

<div align="center">

![QR Generator](https://img.shields.io/badge/QR-Generator-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Web3](https://img.shields.io/badge/Web3-Design-ec4899?style=for-the-badge)

**La aplicación más completa y moderna para generar códigos QR personalizados**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Atajos](#-atajos-de-teclado)

</div>

---

## ✨ Características

### 🎨 **Editor Visual Avanzado**
- **Colores Personalizados**: Cambia colores de QR y fondo con selector visual
- **Degradados**: Crea degradados impresionantes con control total del ángulo
- **Presets de Colores**: 6 combinaciones predefinidas (Cyber, Purple, Sunset, Ocean, Mint, Fire)
- **Sincronización en Tiempo Real**: Los cambios se reflejan instantáneamente

### 🖼️ **Marcos Personalizables**
- **6 Estilos de Marco**: Modern, Classic, Neon, Cyber, Minimal, Elegant
- **Texto Personalizado**: Añade texto al marco (ej: "ESCANÉAME")
- **Grosor Ajustable**: Control total del grosor del marco
- **Colores del Marco**: Personaliza el color según tu marca

### 🎭 **Logo y Marca**
- **Carga de Logo**: Añade tu logo al centro del QR
- **Tamaño Ajustable**: Control del tamaño del logo (10%-40%)
- **Fondo del Logo**: Opción de añadir fondo para mejor visibilidad
- **Padding Personalizable**: Ajusta el espacio alrededor del logo

### ✨ **Efectos Visuales**
- **Efecto Glow**: Resplandor neón alrededor del QR
- **Sombras**: Añade profundidad con sombras personalizables
- **Opacidad**: Control de transparencia
- **Inversión de Colores**: Invierte los colores del QR
- **Esquinas Redondeadas**: Redondea las esquinas del QR con radio ajustable

### 📋 **Templates Predefinidos**
- **Tarjeta de Negocios** (vCard)
- **WiFi** (Acceso rápido)
- **Redes Sociales** (URLs)
- **Pago Crypto** (Wallet addresses)
- **Eventos** (Calendario)
- **Email** (Contacto directo)

### 💾 **Exportación Múltiple**
- **Formatos**: PNG, JPG (SVG y PDF en desarrollo)
- **Calidades**: Estándar (1x), Alta (2x), Ultra (3x), Máxima (4x)
- **Descarga Rápida**: Un clic para exportar en el formato deseado

### 📜 **Historial Inteligente**
- **Almacenamiento Local**: Guarda hasta 20 QRs generados
- **Acceso Rápido**: Haz clic en cualquier QR del historial para cargarlo
- **Persistente**: Los QRs se mantienen entre sesiones

### ⚙️ **Opciones Avanzadas**
- **Tamaño**: 200px - 2000px
- **Margen**: 0 - 10 unidades
- **Corrección de Errores**: 4 niveles (7%, 15%, 25%, 30%)
- **Tipos de Contenido**: Texto, URL, Email, Teléfono, SMS, WiFi, vCard, Crypto
- **Contador de Caracteres**: Visualización en tiempo real (máx. 4296)

### 🎯 **Diseño Web3**
- **Glassmorphism**: Efectos de vidrio esmerilado modernos
- **Animaciones Fluidas**: Transiciones suaves en todos los elementos
- **Fondo Animado**: Grid y formas flotantes con blur
- **Colores Neón**: Paleta de colores vibrante y futurista
- **Responsive**: Adaptado a todos los tamaños de pantalla

---

## 🚀 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clona o descarga el proyecto**
```bash
cd QrGenerator
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Inicia el servidor**
```bash
npm start
```

4. **Abre tu navegador**
```
http://localhost:3000
```

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

---

## 📖 Uso

### 1. **Ingresa el Contenido**
Escribe o pega el contenido que quieres convertir en QR:
- URLs
- Texto simple
- Emails
- Números de teléfono
- Configuraciones WiFi
- vCards
- Direcciones de criptomonedas

### 2. **Personaliza el Diseño**

#### 🎨 Colores
- Selecciona colores con el picker visual
- Introduce códigos HEX manualmente
- Activa degradados para efectos impresionantes
- Usa presets predefinidos

#### 🖼️ Marco
- Activa "Añadir Marco"
- Selecciona el estilo de marco
- Personaliza color y grosor
- Añade texto descriptivo

#### 🎭 Logo
- Activa "Añadir Logo"
- Sube tu imagen (PNG, JPG, etc.)
- Ajusta tamaño y padding
- Activa/desactiva fondo

#### ✨ Efectos
- Glow: Resplandor neón
- Sombra: Profundidad 3D
- Opacidad: Transparencia
- Inversión: Colores invertidos
- Esquinas redondeadas

### 3. **Genera el QR**
Haz clic en **"Generar QR"** o presiona `Ctrl + Enter`

### 4. **Exporta**
Descarga tu QR en el formato y calidad deseados:
- PNG (recomendado)
- JPG
- SVG (próximamente)
- PDF (próximamente)

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + G` | Generar QR |
| `Ctrl + Enter` | Generar QR (desde textarea) |
| `Ctrl + R` | Resetear formulario |
| `Ctrl + S` | Descargar como PNG |

---

## 🎨 Paleta de Colores Web3

```css
Primary: #6366f1 (Índigo vibrante)
Secondary: #ec4899 (Rosa neón)
Accent: #0ea5e9 (Azul cielo)
Success: #10b981 (Verde esmeralda)
Warning: #f59e0b (Ámbar)
Danger: #ef4444 (Rojo brillante)
```

---

## 📦 Estructura del Proyecto

```
QrGenerator/
├── server.js           # Servidor Express
├── package.json        # Dependencias
├── public/
│   ├── index.html     # Estructura HTML
│   ├── styles.css     # Estilos Web3
│   └── app.js         # Lógica del cliente
└── README.md          # Documentación
```

---

## 🔧 Tecnologías Utilizadas

- **Backend**
  - Node.js
  - Express.js
  - qrcode (Generación de QR)
  - body-parser
  - cors

- **Frontend**
  - HTML5 Canvas API
  - CSS3 (Glassmorphism, Animations)
  - JavaScript ES6+
  - LocalStorage API

- **Diseño**
  - Fuentes: Orbitron, Rajdhani (Google Fonts)
  - Efectos: Gradientes, Blur, Shadows
  - Animaciones: CSS Keyframes

---

## 🎯 Características Destacadas

### 🚀 **Rendimiento**
- Generación instantánea de QR
- Canvas optimizado para alta calidad
- Almacenamiento eficiente en localStorage

### 🎨 **Diseño**
- Interfaz intuitiva y moderna
- Paleta de colores Web3 vibrante
- Animaciones suaves y profesionales

### 🔒 **Privacidad**
- Procesamiento 100% local
- Sin envío de datos a terceros
- Historial almacenado localmente

### 📱 **Responsive**
- Adaptado a móviles
- Tabletas
- Escritorio

---

## 💡 Casos de Uso

1. **Marketing Digital**
   - QRs para campañas publicitarias
   - Enlaces a redes sociales
   - Páginas de aterrizaje

2. **Eventos**
   - Entradas digitales
   - Información del evento
   - Registro de asistentes

3. **Negocios**
   - Tarjetas de presentación digitales
   - Menús de restaurantes
   - Información de productos

4. **Personal**
   - WiFi compartido
   - Contactos vCard
   - URLs personales

5. **Crypto**
   - Direcciones de wallet
   - Pagos rápidos
   - Donaciones

---

## 🔜 Próximas Características

- [ ] Exportación SVG vectorial
- [ ] Generación de PDF con múltiples QRs
- [ ] Análisis de escaneos (con backend)
- [ ] QR animados (GIF)
- [ ] Más estilos de puntos personalizables
- [ ] Importar/Exportar configuraciones
- [ ] Modo oscuro/claro
- [ ] API REST completa
- [ ] Batch generation (múltiples QRs)
- [ ] Integración con servicios de acortamiento de URLs

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial

---

## 👨‍💻 Autor

Desarrollado con ❤️ y ☕

---

## 🌟 Agradecimientos

- Biblioteca `qrcode` por la generación base de QR
- Google Fonts por Orbitron y Rajdhani
- Comunidad de desarrolladores Web3 por la inspiración de diseño

---

<div align="center">

**¿Te gusta el proyecto? ¡Dale una ⭐!**

[Reportar Bug](https://github.com/tu-usuario/qr-generator/issues) • [Solicitar Característica](https://github.com/tu-usuario/qr-generator/issues)

</div>
