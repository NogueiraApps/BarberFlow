// Service worker mínimo — necessário só para o Chrome/Android reconhecer
// o app como "instalável" (critério oficial do PWA).
self.addEventListener('install', function(e){
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  // Sem cache customizado — deixa passar direto para a rede,
  // já que o app depende de dados em tempo real do Firestore.
});
