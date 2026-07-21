<div align="center">

# 🍼 Yummi Glu Glu

**App móvil Android de alimentación infantil con IA integrada.**
Recetas, planificación semanal y videos paso a paso para padres de niños de 6 meses a 5 años.

[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📱 Sobre el proyecto

**Yummi Glu Glu** es un producto móvil real (no un MVP de práctica) pensado para padres de LATAM hispanohablante. Acompaña la alimentación complementaria del bebé con recetas filtradas por etapa alimentaria, un plan semanal, lista de compras automática, un diario de introducción de alimentos y videos cortos paso a paso.

Desarrollada de punta a punta: frontend móvil, backend, autenticación, base de datos, suscripciones y monetización.

## ✨ Funcionalidades

- **Onboarding guiado** — crea el perfil del hijo y calcula automáticamente su etapa alimentaria por fecha de nacimiento.
- **Catálogo de recetas con filtros avanzados** — por etapa, momento del día y alérgenos, con índices GIN para consultas eficientes.
- **Favoritos con actualizaciones optimistas** — feedback instantáneo en la UI antes de confirmar en el servidor.
- **Plan semanal + lista de compras** — genera el plan según la etapa y alergias del niño y deriva la lista de compras.
- **Diario de alimentos** — registro de introducción de nuevos alimentos por perfil.
- **Videos premium (YouTube Shorts embebidos)** — reproductor vertical 9:16 con modelo freemium a nivel video.
- **Suscripciones premium** — integración con RevenueCat y webhooks para sincronizar el estado de la suscripción.
- **Monetización con anuncios** — Google AdMob (banner, intersticial capeado y recompensado para desbloqueos temporales).
- **Panel de administración** — gestión de recetas y contenido, protegido por contraseña.
- **Modo oscuro** — tema claro/oscuro persistente.
- **Autenticación completa** — email/contraseña, magic links, Google Sign-In y deep links.

## 🛠️ Stack técnico

| Capa               | Tecnologías                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| **Móvil**          | React Native · Expo · Expo Router · EAS Build                          |
| **Lenguaje**       | TypeScript                                                             |
| **Estado**         | Zustand                                                                |
| **Estilos**        | NativeWind (Tailwind CSS)                                              |
| **Backend / BaaS** | Supabase — PostgreSQL, Auth, Edge Functions (Deno), Row Level Security |
| **Pagos**          | RevenueCat                                                             |
| **Anuncios**       | Google AdMob                                                           |
| **Calidad**        | ESLint · Prettier · Husky (pre-commit hooks)                           |

## 🏗️ Arquitectura destacada

- **Navegación basada en archivos** con Expo Router y protección de rutas por capas (guards de sesión y perfiles).
- **Seguridad en el backend, no solo en el cliente** — el acceso a contenido premium está enforced por Row Level Security en PostgreSQL; el cliente nunca escribe en tablas sensibles.
- **Edge Functions** para lógica sensible del lado servidor (webhook de RevenueCat con validación y idempotencia, desbloqueos temporales verificados por JWT).
- **Stores independientes** por dominio (auth, perfiles, recetas, favoritos, plan, suscripción, anuncios) — separación clara de responsabilidades.
- **Patrón defensivo para módulos nativos** — carga perezosa con guards de plataforma para que la app no crashee donde el módulo no existe (web, dev client).

## 📸 Capturas

> _Agregá tus capturas en una carpeta `docs/screenshots/` y enlazalas acá._

<div align="center">

<!-- Ejemplo:
<img src="docs/screenshots/detalle-receta.png" width="240" />
<img src="docs/screenshots/catalogo.png" width="240" />
<img src="docs/screenshots/video.png" width="240" />
-->

</div>

## 🚀 Desarrollo

```bash
npm start          # Expo dev server
npm run android    # Lanzar en Android (emulador o dispositivo)
npm run web        # Revisión rápida de UI en navegador
npm run lint       # ESLint

# Build de APK para dispositivo real (requiere EAS CLI)
eas build -p android --profile development
```

## 🗺️ Roadmap

- [x] Catálogo, favoritos, plan semanal y diario
- [x] Videos premium + suscripciones (RevenueCat)
- [x] Monetización con AdMob
- [ ] **NutriBot** — asistente de nutrición con IA (integración con Anthropic API vía Edge Function)

---

<div align="center">
<sub>Desarrollado por <b>Samuel Sánchez</b> · Ingeniero Civil en Computación e Informática</sub>
</div>
