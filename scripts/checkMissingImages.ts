import { INITIAL_PRODUCTS } from '../src/data/initialProducts';

async function checkMissingImages() {
  console.log(`Auditoría de imágenes para ${INITIAL_PRODUCTS.length} productos...\n`);

  const missing: Array<{ id: string; name: string; brand: string; reason: string; url: string }> = [];
  const valid: string[] = [];

  const batchSize = 20;
  for (let i = 0; i < INITIAL_PRODUCTS.length; i += batchSize) {
    const batch = INITIAL_PRODUCTS.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (p) => {
        if (!p.image || p.image.trim() === '') {
          missing.push({ id: p.id, name: p.name, brand: p.brand, reason: 'Sin URL de imagen', url: '' });
          return;
        }
        if (!p.image.startsWith('http://') && !p.image.startsWith('https://')) {
          missing.push({ id: p.id, name: p.name, brand: p.brand, reason: 'URL inválida', url: p.image });
          return;
        }

        try {
          const res = await fetch(p.image, { method: 'HEAD' });
          if (res.status === 200) {
            valid.push(p.id);
          } else {
            missing.push({
              id: p.id,
              name: p.name,
              brand: p.brand,
              reason: `HTTP ${res.status} (No encontrada)`,
              url: p.image,
            });
          }
        } catch (err: any) {
          missing.push({
            id: p.id,
            name: p.name,
            brand: p.brand,
            reason: `Error de conexión: ${err?.message || 'Error'}`,
            url: p.image,
          });
        }
      })
    );
  }

  console.log(`======================================================================`);
  console.log(`REPORTE DE FRAGANCIAS FALTANTES O CON ERROR DE IMAGEN`);
  console.log(`Total analizadas: ${INITIAL_PRODUCTS.length}`);
  console.log(`Imágenes válidas (200 OK): ${valid.length}`);
  console.log(`Imágenes faltantes / con error: ${missing.length}`);
  console.log(`======================================================================\n`);

  if (missing.length === 0) {
    console.log('¡Todas las fragancias tienen una imagen válida!');
    return;
  }

  missing.forEach((item, index) => {
    console.log(`${index + 1}. ID: ${item.id}`);
    console.log(`   Nombre: ${item.name}`);
    console.log(`   Marca: ${item.brand}`);
    console.log(`   Motivo: ${item.reason}`);
    console.log(`   URL: ${item.url}`);
    console.log('');
  });
}

checkMissingImages();
