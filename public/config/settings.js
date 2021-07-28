(function(window) {
  window.__env = window.__env || {};

  // Edit settings below; if no port, then leave as-is.
  window.__env.websocket = {
    port: "__PORT__",
    host: "__HOST__"
  };

  if (window.__env.websocket.host.length === 0)
    window.__env.websocket.host = window.location.host;
})(this);
