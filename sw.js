// Retire the prototype's cache-first worker so updated authenticated screens load.
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith('family-world-og01-')).map((key) => caches.delete(key)));
  await self.registration.unregister();
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) client.navigate(client.url);
})()));
