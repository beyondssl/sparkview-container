async function registerProxyWorker(){
    if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            '/PXY/_pxy_worker.js'
          );
        } catch (e) {
          console.error('Registration failed with ', e);
        }
      }
}
registerProxyWorker();