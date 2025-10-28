export const clearAppCache = () => {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  window.location.reload();
};

export const clearWalletCache = () => {
  localStorage.removeItem('walletAddress');
  sessionStorage.removeItem('walletAddress');
};