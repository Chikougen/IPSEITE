(() => {
  if (document.getElementById('ipseite-conseil-widget')) return;
  const source = document.currentScript?.src;
  if (!source) return;
  const host = document.createElement('div');
  host.id = 'ipseite-conseil-widget';
  document.body.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
    :host{all:initial;position:fixed;right:20px;bottom:20px;z-index:10000;font-family:Arial,sans-serif;color:#333d33}
    *{box-sizing:border-box}button{font:inherit;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #b38168;outline-offset:3px}
    .launcher{border:0;border-radius:28px;padding:15px 20px;background:#425342;color:white;font-size:13px;box-shadow:0 5px 24px #0002;min-height:48px}
    .panel{position:absolute;right:0;bottom:64px;width:min(420px,calc(100vw - 32px));height:min(720px,calc(100dvh - 110px));background:#fffefa;border:1px solid #dadfd1;border-radius:18px;overflow:hidden;box-shadow:0 12px 50px #0003;display:flex;flex-direction:column}
    [hidden]{display:none!important}.bar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #e3e4da;flex-shrink:0;background:#f7f3ed}
    .bar strong{font-size:12px;font-weight:500}.close{border:0;background:transparent;font-size:22px;padding:4px 8px;color:#425342}
    iframe{width:100%;height:100%;flex:1;border:0;min-height:0;background:#fffefa}.fallback{display:block;padding:7px;text-align:center;font-size:10px;color:#425342;background:#f7f3ed}
    @media(max-width:500px){:host{right:12px;bottom:12px}.panel{bottom:62px;height:calc(100dvh - 100px)}}
  </style>
  <section class="panel" id="ipseite-chat-panel" role="dialog" aria-labelledby="ipseite-chat-title" hidden>
    <div class="bar"><strong id="ipseite-chat-title">Votre conseil Ipséité</strong><button class="close" aria-label="Fermer le conseil">×</button></div>
    <iframe title="Trouver ma prestation Ipséité" allow="clipboard-write"></iframe>
    <a class="fallback" target="_blank" rel="noopener noreferrer">Ouvrir le conseil dans une nouvelle page</a>
  </section>
  <button class="launcher" aria-expanded="false" aria-controls="ipseite-chat-panel">Trouver ma prestation</button>`;
  const panel = root.querySelector('.panel'), launcher = root.querySelector('.launcher'), iframe = root.querySelector('iframe');
  const page = new URL('./index.html',source);
  root.querySelector('.fallback').href = page.href;
  const close = () => { panel.hidden = true; launcher.setAttribute('aria-expanded','false'); launcher.focus(); };
  launcher.addEventListener('click',() => {
    if (!panel.hidden) { close(); return; }
    panel.hidden = false; launcher.setAttribute('aria-expanded','true');
    if (!iframe.src) { page.searchParams.set('embed','1'); iframe.src = page.href; }
    root.querySelector('.close').focus();
  });
  root.querySelector('.close').addEventListener('click',close);
  root.addEventListener('keydown',event => { if (event.key === 'Escape' && !panel.hidden) close(); });
})();
