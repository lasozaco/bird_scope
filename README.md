# 🐦 BirdScope

> Aplicación móvil híbrida desarrollada con **Ionic + Angular + TensorFlow.js** para la identificación inteligente de aves del departamento del Tolima, Colombia 🇨🇴.

---

# 📱 Descripción General

**BirdScope** es una aplicación móvil orientada a la observación, identificación y registro de aves mediante técnicas de **Inteligencia Artificial** y **Visión por Computadora**.

La aplicación permite capturar imágenes desde la cámara del dispositivo o seleccionar fotografías desde la galería para clasificarlas automáticamente utilizando un modelo de Deep Learning entrenado específicamente con **41 especies de aves del Tolima**.

Además, integra funcionalidades modernas como:

- 📷 Clasificación en tiempo real
- 📍 Geolocalización GPS automática
- ☁️ Sincronización con Firebase
- 🗺️ Visualización en mapas interactivos
- 📊 Estadísticas dinámicas
- 🧠 Inferencia IA directamente en el dispositivo

---

# 🚀 Tecnologías Utilizadas

| Tecnología | Descripción |
|---|---|
| Ionic | Framework híbrido móvil |
| Angular | Framework frontend |
| TypeScript | Lenguaje principal |
| Capacitor | Acceso a hardware nativo |
| SCSS | Diseño visual y estilos |
| TensorFlow.js | Inferencia de IA en el cliente |
| Firebase Firestore | Base de datos en tiempo real |
| Firebase Storage | Almacenamiento de imágenes |
| Firebase Authentication | Gestión de autenticación |
| Leaflet | Visualización de mapas |
| OpenStreetMap | Mapas base |
| MobileNetV2 | Arquitectura CNN base |
| Deep Learning | Clasificación de especies |

---

# ✨ Funcionalidades Principales

## 🏠 Inicio
- Dashboard interactivo
- Estadísticas dinámicas
- Accesos rápidos
- Especies destacadas
- Diseño responsive moderno

---

## 🧠 Clasificación Inteligente
- Captura desde cámara
- Carga desde galería
- Clasificación automática en tiempo real
- Top 3 de predicciones
- Porcentaje de confianza
- Confirmación manual de especies
- Sistema de reporte de especies no identificadas
- Compresión automática de imágenes
- Integración con TensorFlow.js

---

## 🌿 Catálogo de Especies
- 41 especies registradas
- Búsqueda avanzada en tiempo real
- Filtros por familia
- Ordenamiento dinámico
- Modal interactivo por especie
- Chips aleatorios de recomendación
- Información científica y hábitat
- Detección de especies registradas por usuario

---

## 🗺️ Mapa Inteligente
- Visualización GPS de avistamientos
- Marcadores dinámicos por especie
- Colores personalizados
- Búsqueda inteligente de aves
- Navegación automática hacia registros
- Popups interactivos
- Vista mapa/lista
- Leaflet + OpenStreetMap

---

## 📊 Reportes y Estadísticas
- Total de observaciones
- Número de especies únicas
- Promedio de confianza IA
- Historial completo
- Barra de progreso de colección
- Últimos avistamientos
- Estadísticas conectadas en tiempo real con Firebase

---

# 🧠 Inteligencia Artificial

## Arquitectura del Modelo

BirdScope utiliza un modelo basado en **Transfer Learning** para optimizar precisión y rendimiento móvil.

### 🔹 Modelo Padre
Modelo CNN pesado utilizado durante entrenamiento y extracción de características.

### 🔹 Modelo Hijo
Modelo optimizado para dispositivos móviles:

```txt
hijo_fase2_FINAL.keras
```

Características:

- Clasificación de 41 especies
- Optimizado para TensorFlow.js
- Inferencia local sin servidor
- Compatible con móviles Android/Web

---

# 🔄 Conversión del Modelo

Proceso utilizado para exportar el modelo a TensorFlow.js:

```txt
Modelo .keras
        ↓
SavedModel TensorFlow
        ↓
Conversión TFJS GraphModel
        ↓
model.json + shards .bin
        ↓
src/assets/model/
        ↓
Carga en Ionic con tf.loadGraphModel()
```

---

## 📂 Estructura del Modelo

```txt
src/assets/model/
├── model.json
├── group1-shard1of3.bin
├── group1-shard2of3.bin
└── group1-shard3of3.bin
```

---

# 🐦 Especies Soportadas

El sistema reconoce automáticamente **41 especies de aves** del Tolima, incluyendo:

- Aguililla Caminera
- Bananaquit
- Chachalaca Colombiana
- Colibrí Florido de Tolima
- Halcón Peregrino
- Momoto Serrano
- Tángara Azulgris
- Zopilote Común
- Benteveo
- Tortolita Canela
- entre otras...

---

# ☁️ Firebase

BirdScope utiliza Firebase como infraestructura backend completa.

## Servicios Integrados

| Servicio | Uso |
|---|---|
| Firestore | Base de datos de avistamientos |
| Storage | Imágenes registradas |
| Authentication | Gestión de usuarios |

---

## 📄 Ejemplo de Documento Firestore

```json
{
  "especie": "Bananaquit",
  "confianza": 93,
  "imagen": "data:image/jpeg;base64,...",
  "latitud": 4.415071,
  "longitud": -75.174409,
  "fecha": "2026-05-08T05:54:30.061Z"
}
```

---

# 📷 Flujo del Sistema

```txt
📷 Cámara / Galería
          ↓
🖼️ Captura de Imagen
          ↓
🧠 TensorFlow.js
          ↓
🐦 Clasificación IA
          ↓
📍 GPS Automático
          ↓
☁️ Firebase Firestore
          ↓
📊 Reportes y Estadísticas
```

---

# 📂 Estructura del Proyecto

```txt
src/
├── app/
│   └── tabs/
│       ├── inicio/
│       ├── clasificar/
│       ├── especies/
│       ├── mapa/
│       └── reportes/
│
├── assets/
│   ├── model/
│   ├── icon/
│   └── images/
│
└── environments/
    └── environment.ts
```

---

# ⚙️ Instalación

## Clonar repositorio

```bash
git clone <url-del-repo>
```

---

## Instalar dependencias

```bash
npm install --legacy-peer-deps
```

---

## Ejecutar en desarrollo

```bash
ionic serve
```

---

## Ejecutar en red local

```bash
ionic serve --host=0.0.0.0 --port=8100
```

---

# 📱 Compilar para Android

```bash
ionic build
npx cap sync android
npx cap open android
```

---

# 🎨 Características UI/UX

- Diseño moderno responsive
- Animaciones fluidas
- Componentes Ionic personalizados
- SCSS modular
- Experiencia optimizada para móviles
- Sistema visual de estados
- Transiciones suaves
- Cards interactivas

---

# 🔒 Características Técnicas

## Optimización implementada

✅ Compresión automática de imágenes  
✅ Lazy loading de vistas  
✅ Inferencia local sin servidor  
✅ Uso de Angular Signals  
✅ Renderizado eficiente del mapa  
✅ Optimización de Firebase  
✅ Manejo reactivo de datos  
✅ Compatible con dispositivos móviles  

---

# 👨‍💻 Equipo de Desarrollo

Proyecto desarrollado para la asignatura:

## Electiva III

**Universidad Cooperativa de Colombia**  
Facultad de Ingeniería  
Ibagué, Tolima — Colombia 🇨🇴

### Integrantes

- Kevin Julian Guerrero Penagos
- Laura Sophia Zapata Coronado
---

# 📌 Estado del Proyecto

✅ Aplicación funcional  
✅ Firebase integrado  
✅ IA funcional en móvil  
✅ Mapa interactivo operativo  
✅ Clasificación en tiempo real  
✅ Responsive completo  

---

# 📄 Licencia

Proyecto académico — Todos los derechos reservados ©

---

# 🐦 BirdScope

> “Tecnología e inteligencia artificial al servicio de la biodiversidad.”

## Uso compartido del sistema (Firebase)

BirdScope utiliza un único proyecto de Firebase como backend centralizado. Esto permite que múltiples integrantes del equipo puedan ejecutar la aplicación desde distintos dispositivos (PC o móvil) y trabajar sobre la misma base de datos en tiempo real.

En este caso, la compañera de desarrollo puede utilizar la aplicación normalmente (captura de imágenes, clasificación con IA y geolocalización) y todos los registros generados se almacenan directamente en el mismo proyecto de Firebase, garantizando sincronización inmediata entre usuarios y entornos de desarrollo.