# QR dinámicos

Cada código QR apunta a una página propia de este sitio (GitHub Pages), que redirige al destino real.
Para cambiar a dónde lleva un QR **no hace falta reimprimirlo**: solo se edita `links.json`.

## Uso

```bash
npm install
npm run build
```

## Editar un destino

Abre `links.json` y cambia el campo `destino`:

```json
{
  "slug": "falabella-cl",
  "nombre": "Falabella Chile",
  "destino": "https://www.falabella.com/falabella-cl"
}
```

Luego ejecuta `npm run build`, haz commit y push. GitHub Pages publica el cambio en 1-2 minutos.

## Agregar un QR nuevo

Agrega un objeto a `links.json` con un `slug` único (solo minúsculas, números y guiones), y ejecuta `npm run build`.
Los archivos quedan en `qr/<slug>.png`, `qr/<slug>.svg` y la URL del QR es `base_url/r/<slug>/`.

## Notas

- Los QR se generan en `qr/`. Imprime el PNG/SVG; no cambia aunque cambie el destino.
- Si cambias `base_url` (p. ej. al renombrar el repositorio), los QR ya impresos dejarán de funcionar: no lo hagas después de imprimir.
