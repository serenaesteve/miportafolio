/* ==========================================================================
   DeviceProfile · Detecta las capacidades del dispositivo y elige un perfil
   de calidad para el avatar.

   Relación con el ejercicio:
   - (a) Limitaciones de los móviles: GPU, memoria, batería, pantalla, datos.
   - (d) Configuraciones que clasifican los dispositivos por características.
   - (e) Perfiles que relacionan el dispositivo con la aplicación.
   ========================================================================== */
(function (NS) {
  'use strict';

  // Cada perfil define cómo se comporta el motor en ese tipo de dispositivo.
  var PROFILES = {
    alto: {
      name: 'alto',
      label: 'Escritorio / gama alta',
      pixelRatioMax: 2,
      antialias: true,
      parallax: 0.03,     // intensidad del efecto 3D (paralaje)
      eyeFx: true,        // ojos que se mueven y parpadean
      fpsMax: 60
    },
    medio: {
      name: 'medio',
      label: 'Tablet / móvil moderno',
      pixelRatioMax: 1.75,
      antialias: true,
      parallax: 0.03,
      eyeFx: true,
      fpsMax: 60
    },
    bajo: {
      name: 'bajo',
      label: 'Móvil de gama baja / ahorro de energía',
      pixelRatioMax: 1.25,
      antialias: false,
      parallax: 0.022,
      eyeFx: true,
      fpsMax: 30
    },
    estatico: {
      name: 'estatico',
      label: 'Sin WebGL: se muestra la ilustración',
      pixelRatioMax: 1,
      antialias: false,
      parallax: 0,
      eyeFx: false,
      fpsMax: 0
    }
  };

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function media(q) {
    return !!(window.matchMedia && window.matchMedia(q).matches);
  }

  // Recoge las características "en bruto" del dispositivo.
  function readCapabilities() {
    var nav = window.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
    var w = Math.min(window.screen ? window.screen.width : window.innerWidth, window.innerWidth);

    return {
      webgl: hasWebGL(),
      touch: ('ontouchstart' in window) || (nav.maxTouchPoints > 0),
      coarsePointer: media('(pointer: coarse)'),
      screenWidth: w,
      pixelRatio: window.devicePixelRatio || 1,
      cores: nav.hardwareConcurrency || 0,          // 0 = el navegador no lo expone
      memoryGB: nav.deviceMemory || 0,              // solo Chromium
      saveData: !!conn.saveData,
      slowNetwork: /(^|-)2g$/.test(conn.effectiveType || ''),
      reducedMotion: media('(prefers-reduced-motion: reduce)'),
      gyroscope: 'DeviceOrientationEvent' in window,
      userAgent: nav.userAgent || ''
    };
  }

  // Clase de dispositivo según el ancho (móvil / tablet / escritorio).
  function formFactor(caps) {
    if (caps.coarsePointer && caps.screenWidth < 600) return 'movil';
    if (caps.coarsePointer && caps.screenWidth < 1100) return 'tablet';
    return 'escritorio';
  }

  // Decide el perfil a partir de las capacidades.
  function choose(caps) {
    if (!caps.webgl) return 'estatico';

    var ff = formFactor(caps);
    var lowEnd =
      caps.saveData ||
      caps.slowNetwork ||
      (caps.memoryGB && caps.memoryGB <= 2) ||
      (caps.cores && caps.cores <= 4 && ff === 'movil');

    if (lowEnd) return 'bajo';
    if (ff === 'escritorio') return 'alto';
    return 'medio';
  }

  function detect(forced) {
    var caps = readCapabilities();
    var key = (forced && PROFILES[forced]) ? forced : choose(caps);

    // Permite forzar un perfil desde la URL para probar en emuladores:
    //   index.html?perfil=bajo
    try {
      var q = new URLSearchParams(window.location.search).get('perfil');
      if (q && PROFILES[q]) key = q;
    } catch (e) { /* URLSearchParams no disponible */ }

    var profile = Object.assign({}, PROFILES[key]);
    profile.formFactor = formFactor(caps);
    profile.capabilities = caps;
    // Con "movimiento reducido" el avatar no hace gestos amplios.
    profile.reducedMotion = caps.reducedMotion;
    return profile;
  }

  NS.DeviceProfile = { detect: detect, PROFILES: PROFILES };
})(window.SerenaAvatar = window.SerenaAvatar || {});
