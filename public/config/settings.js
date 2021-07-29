(function(window) {
  window.__env = window.__env || {};

  // Edit settings below; if no port, then leave as-is.
  window.__env.websocket = {
    port: "__PORT__",
    host: "__HOST__"
  };
  window.__env.audioSettings = {
    refDistance: "__REF_DISTANCE__",
    maxDistance: "__MAX_DISTANCE__"
  };

  if (window.__env.websocket.host.length === 0)
    window.__env.websocket.host = window.location.host;
})(this);
