self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => {
      const isOldAppShell = name.includes('spit-hierarchy-v3') || name.includes('app-html');
      const isOldSupabaseRestCache = name === 'supabase-images' || name.includes('supabase-images');
      return isOldAppShell || isOldSupabaseRestCache ? caches.delete(name) : Promise.resolve(false);
    }));

    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map((client) => {
      const url = new URL(client.url);
      url.searchParams.set('app-updated', Date.now().toString());
      return client.navigate(url.toString());
    }));
  })());
});
