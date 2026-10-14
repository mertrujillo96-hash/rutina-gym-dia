# Migración a React + Vite

Esta rama migra la aplicación vanilla a React sin alterar `main`.

## Qué se conserva

- Los 5 días y todos sus ejercicios.
- La clave de localStorage `rutinaGymMultiDia-v1`, para conservar el progreso cuando React sustituya a la versión actual en el mismo dominio.
- Inicio, Rutina y Progreso.
- Series 4 × 15, notas y ejercicios con pestañas.
- Imágenes principales y sus fallbacks.
- Pec deck y Press plano con los assets anatómicos locales aprobados.

## Estrategia segura

La rama `main` continúa intacta. `react-migration` compila mediante CI, pero no despliega GitHub Pages.

## Validación local

```bash
npm install
npm run dev
npm run build
```

Después del QA funcional se puede preparar el cambio de producción.
