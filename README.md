# dak-barcode

Frontend-only SvelteKit rebuild of the DST Stage & Load barcode module.

## Package manager

This project uses **Bun** as the package-manager standard.

```sh
bun install
```

## Common commands

```sh
bun run dev
bun run check
bun run test:unit --run
bun run test:e2e src/routes/app-shell.e2e.ts
bun run build
```

## Notes

- Primary runtime target is shared iPad Safari with hardware barcode scanners
- `legacy_flutterflow_fe/` is reference-only legacy behavior
- Vercel supports Bun as a package manager through `bun.lock`
