/* ==========================================================================
   AvatarEngine · El "motor" del avatar.

   Se encarga del ciclo de vida completo:
     detectar dispositivo → crear escena → bucle de render → entrada →
     animación → bocadillo de texto → pausa/reanudación → liberar memoria.

   Uso:
     SerenaAvatar.mount('#avatar-stage');           // saludo según la hora
     SerenaAvatar.mount('#avatar-stage', { greeting: '¡Hola! 👋' });
   ========================================================================== */
(function (NS) {
  'use strict';

  var FOV = 30;          // apertura de la cámara (grados)

  // Textos del avatar en cada idioma
  var TEXTS = {
    es: {
      phrases: [
        '¿Te enseño mis proyectos? 💻',
        'Python, PHP, JS… ¡y mucho café! ☕',
        'Keep coding & stay curious ✨',
        '¿Trabajamos juntos? 💌',
        'Estoy en Mislata, Valencia 🌊'
      ],
      leftPhrase: '¿Hay alguien por la izquierda? 👀',
      rightPhrase: '¡Te veo por la derecha! 😄',
      hintTouch: 'Tócame 👋',
      hintMouse: 'Salúdame 👋',
      label: 'Avatar de Serena sentada con su portátil que te sigue con la mirada. Toca o haz clic para que te salude.'
    },
    en: {
      phrases: [
        'Want to see my projects? 💻',
        'Python, PHP, JS… and lots of coffee! ☕',
        'Keep coding & stay curious ✨',
        'Shall we work together? 💌',
        "I'm based in Mislata, Valencia 🌊"
      ],
      leftPhrase: 'Anyone over there on the left? 👀',
      rightPhrase: 'I can see you on the right! 😄',
      hintTouch: 'Tap me 👋',
      hintMouse: 'Say hi 👋',
      label: 'Avatar of Serena sitting with her laptop, following you with her eyes. Tap or click to get a wave.'
    }
  };

  var DEFAULTS = {
    lang: 'es',                                  // 'es' | 'en' (cambia con setLang)
    greeting: null,                              // null = saludo según la hora del día
    basePath: 'avatar/',                         // dónde está la carpeta del avatar
    waveImage: 'assets/serena-saludo.webp',      // pose saludando (null = sin ella)
    waveDepth: 'assets/serena-saludo-depth.png',
    fallbackImage: 'avatar/assets/serena-color.webp',
    debug: false
  };

  class AvatarEngine {
    constructor(container, options) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) throw new Error('AvatarEngine: contenedor no encontrado');
      this.opts = Object.assign({}, DEFAULTS, options || {});
      this.lang = TEXTS[this.opts.lang] ? this.opts.lang : 'es';
      this.opts = Object.assign({}, TEXTS[this.lang], this.opts);
      try {
        if (new URLSearchParams(location.search).has('debug')) this.opts.debug = true;
      } catch (e) { /* noop */ }

      this.profile = NS.DeviceProfile.detect(this.opts.profile);
      this.running = false;
      this.visible = true;
      this._raf = 0;
      this._last = 0;
      this._acc = 0;
      this._fps = { frames: 0, t: 0, value: 0 };
      this._sideSaid = { left: 0, right: 0 };
      this._phrase = 0;

      this.container.classList.add('sa-stage');
      this.placeholder = this.container.querySelector('.sa-placeholder');
      if (this.placeholder) this.container.classList.add('has-placeholder');
      this.container.setAttribute('data-profile', this.profile.name);

      if (this.profile.name === 'estatico' || !NS.GL) {
        this._fallback('sin WebGL');
        return;
      }
      try {
        this._init();
      } catch (err) {
        console.warn('[avatar] no se pudo iniciar WebGL:', err);
        if (this.canvas) { this.canvas.remove(); this.canvas = null; this.gl = null; }
        this._fallback('error WebGL');
      }
    }

    // ---------------------------------------------------------- arranque
    _init() {
      var p = this.profile;

      // Contexto WebGL propio (sin librerías): fondo transparente y alfa premultiplicado
      var canvas = this.canvas = document.createElement('canvas');
      var attrs = {
        alpha: true,
        premultipliedAlpha: true,
        antialias: p.antialias,
        depth: false,
        powerPreference: p.name === 'alto' ? 'high-performance' : 'low-power'
      };
      var gl = this.gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
      if (!gl) throw new Error('WebGL no disponible');
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, p.pixelRatioMax);

      canvas.className = 'sa-canvas';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', this.opts.label);
      this.container.appendChild(canvas);

      this.proj = NS.GL.M.identity();
      this.view = NS.GL.M.identity();

      this.input = new NS.InputTracker(this.container);
      this._buildBubble();
      if (this.opts.debug) this._buildDebug();

      // Las texturas se cargan de forma asíncrona; mientras, no se dibuja nada
      var self = this;
      this.model = new NS.AvatarModel(gl, p, {
        basePath: this.opts.basePath,
        waveImage: this.opts.waveImage,
        waveDepth: this.opts.waveDepth
      });
      this.model.load().then(function () {
        self.animator = new NS.AvatarAnimator(self.model, p);
        self.behaviors = new NS.AvatarBehaviors(self);
        self._bindLifecycle();
        self._resize();

        // Primer fotograma y saludo de bienvenida
        self.animator.update(0.016, null);
        self._render();
        self.container.classList.add('sa-ready');
        // Saluda en cuanto esté la pose con la mano (máx. 2 s de espera)
        var wait = new Promise(function (r) { setTimeout(r, 2000); });
        Promise.race([self.model.altReady, wait]).then(function () {
          setTimeout(function () { self.behaviors.greetOnEnter(); }, 250);
        });
        self.start();
      }).catch(function (err) {
        console.warn('[avatar] no se pudieron cargar las imágenes:', err);
        self.canvas.remove();
        self._fallback('error de carga');
      });
    }

    _fallback(reason) {
      this.container.classList.add('sa-fallback', 'sa-ready');
      this.fallbackReason = reason;
      if (this.placeholder) return;          // ya se está viendo la ilustración
      var img = document.createElement('img');
      img.src = this.opts.fallbackImage;
      img.alt = 'Ilustración de Serena con su portátil';
      img.className = 'sa-fallback-img';
      this.container.appendChild(img);
    }

    // ---------------------------------------------------------- bocadillo
    _buildBubble() {
      this.bubble = document.createElement('div');
      this.bubble.className = 'sa-bubble';
      this.bubble.setAttribute('aria-live', 'polite');
      this.container.appendChild(this.bubble);

      // Botón bajo el avatar
      this.actions = document.createElement('div');
      this.actions.className = 'sa-actions';
      this.container.appendChild(this.actions);
      this.hint = document.createElement('button');
      this.hint.type = 'button';
      this.hint.className = 'sa-hint';
      this.hint.textContent = this.profile.capabilities.coarsePointer ? this.opts.hintTouch : this.opts.hintMouse;
      this.actions.appendChild(this.hint);
    }

    say(text, seconds) {
      if (!this.bubble) return;
      var secs = seconds || Math.max(2.2, text.length * 0.07);
      this.showBubble(text);
      if (this.animator) this.animator.talk(Math.min(secs, 1.6));
      this.hideBubble(secs);
    }

    showBubble(text) {
      clearTimeout(this._bubbleTimer);
      this.bubble.textContent = text;
      this.bubble.classList.add('is-visible');
      this._updateBubblePosition();
    }

    hideBubble(seconds) {
      clearTimeout(this._bubbleTimer);
      var b = this.bubble;
      this._bubbleTimer = setTimeout(function () { b.classList.remove('is-visible'); }, (seconds || 0) * 1000);
    }

    greet(text) {
      if (!this.animator) return;
      this.animator.wave(3.4);
      this.say(text || this.opts.greeting || NS.AvatarBehaviors.saludoSegunHora(null, this.lang), 3);
    }

    // Cambia el idioma de los textos del avatar
    setLang(lang) {
      if (!TEXTS[lang]) return;
      this.lang = lang;
      Object.assign(this.opts, TEXTS[lang]);
      if (this.hint) this.hint.textContent = this.profile.capabilities.coarsePointer ? this.opts.hintTouch : this.opts.hintMouse;
      if (this.canvas) this.canvas.setAttribute('aria-label', this.opts.label);
    }

    // ---------------------------------------------------------- eventos
    _bindLifecycle() {
      var self = this;

      this._onResize = function () { self._resize(); };
      if ('ResizeObserver' in window) {
        this._ro = new ResizeObserver(this._onResize);
        this._ro.observe(this.container);
      } else {
        window.addEventListener('resize', this._onResize);
      }

      // Pausa cuando el avatar sale de pantalla (ahorra batería)
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(function (entries) {
          self.visible = entries[0].isIntersecting;
          if (self.visible) { self.start(); self.behaviors.visible(); } else self.stop();
        }, { threshold: 0.02 });
        this._io.observe(this.container);
      }

      // Pausa cuando la pestaña/app pasa a segundo plano
      this._onVisibility = function () {
        if (document.hidden) self.stop();
        else if (self.visible) { self.start(); self.behaviors.visible(); }
      };
      document.addEventListener('visibilitychange', this._onVisibility);

      // Clic / toque: saluda y dice una frase (y activa el giroscopio en móvil)
      this._onTap = function () {
        self.input.enableGyro();
        self.behaviors.tap();
      };
      this.canvas.addEventListener('click', this._onTap);
      this.hint.addEventListener('click', this._onTap);

      // Si la GPU pierde el contexto (frecuente en móviles), se muestra la ilustración
      this.canvas.addEventListener('webglcontextlost', function (e) {
        e.preventDefault();
        self.stop();
        self.canvas.style.display = 'none';
        self._fallback('contexto WebGL perdido');
      });
    }

    _resize() {
      var r = this.container.getBoundingClientRect();
      var w = Math.max(1, r.width), h = Math.max(1, r.height);
      this.canvas.width = Math.round(w * this.pixelRatio);
      this.canvas.height = Math.round(h * this.pixelRatio);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      var aspect = w / h;

      // Encuadre: la ilustración (2 de alto) cabe entera a lo alto y a lo ancho.
      // La cámara mira al centro del plano (y = 1) desde la distancia justa.
      var tan = Math.tan(FOV * Math.PI / 360);
      var fitH = 1.04 / tan;
      var fitW = (this.model.aspect * 1.08) / (tan * aspect);
      var dist = Math.max(fitH, fitW);
      this.proj = NS.GL.M.perspective(FOV, aspect, 0.1, 50);
      this.view = NS.GL.M.translation(0, -1, -dist);
      if (!this.running) this._render();
    }

    _render() {
      var gl = this.gl;
      if (!gl || gl.isContextLost()) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.model.draw(this.proj, this.view);
    }

    // ---------------------------------------------------------- bucle
    start() {
      if (this.running || !this.gl || !this.animator) return;
      this.running = true;
      this._last = performance.now();
      this._raf = requestAnimationFrame(this._tick.bind(this));
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this._raf);
    }

    _tick(now) {
      if (!this.running) return;
      this._raf = requestAnimationFrame(this._tick.bind(this));

      var dt = Math.min(0.1, (now - this._last) / 1000);
      this._last = now;

      // Límite de FPS según el perfil (30 fps en gama baja = menos batería)
      var minStep = 1 / this.profile.fpsMax;
      this._acc += dt;
      if (this._acc < minStep - 0.002) return;
      var step = this._acc;
      this._acc = 0;

      this.animator.update(step, this.input);
      this.behaviors.update(now);
      this._reactToSide(now);
      this._render();
      this._updateBubblePosition();
      if (this.debugEl) this._updateDebug(step);
    }

    // Comentarios cuando el cursor se va muy a un lado (como en la referencia)
    _reactToSide(now) {
      if (this.input.source === 'none' || this.animator.busy) return;
      if (this.input.idleFor(now) > 800) return;
      if (this.bubble.classList.contains('is-visible')) return;
      var x = this.input.x;
      if (x < -0.92 && now - this._sideSaid.left > 20000) {
        this._sideSaid.left = now;
        this.say(this.opts.leftPhrase, 2.6);
      } else if (x > 0.92 && now - this._sideSaid.right > 20000) {
        this._sideSaid.right = now;
        this.say(this.opts.rightPhrase, 2.6);
      }
    }

    _updateBubblePosition() {
      if (!this.bubble.classList.contains('is-visible')) return;
      var p = this.model.headAnchor();
      var r = this.container.getBoundingClientRect();
      var x = (p.x * 0.5 + 0.5) * r.width - 30;
      var y = (-p.y * 0.5 + 0.5) * r.height;
      // el bocadillo cuelga a la izquierda de la cabeza sin salirse del contenedor
      var bw = this.bubble.offsetWidth;
      x = Math.max(bw + 8, Math.min(r.width - 8, x));
      y = Math.max(this.bubble.offsetHeight + 8, y);
      this.bubble.style.left = Math.round(x) + 'px';
      this.bubble.style.top = Math.round(y) + 'px';
    }

    // ---------------------------------------------------------- depuración
    _buildDebug() {
      this.debugEl = document.createElement('pre');
      this.debugEl.className = 'sa-debug';
      this.container.appendChild(this.debugEl);
    }

    _updateDebug(dt) {
      var f = this._fps;
      f.frames++; f.t += dt;
      if (f.t < 0.5) return;
      f.value = Math.round(f.frames / f.t);
      f.frames = 0; f.t = 0;
      var c = this.profile.capabilities;
      this.debugEl.textContent = [
        'perfil     ' + this.profile.name + ' (' + this.profile.formFactor + ')',
        'fps        ' + f.value + ' / ' + this.profile.fpsMax,
        'pixelRatio ' + this.pixelRatio.toFixed(2) + ' (disp. ' + c.pixelRatio + ')',
        'geometría  2 triángulos · 1 draw call',
        'núcleos    ' + (c.cores || '?') + '  memoria ' + (c.memoryGB ? c.memoryGB + ' GB' : '?'),
        'entrada    ' + this.input.source + (this.input.gyroEnabled ? ' + giroscopio' : ''),
        'táctil     ' + c.touch + '  reduced-motion ' + c.reducedMotion
      ].join('\n');
    }

    // ---------------------------------------------------------- limpieza
    destroy() {
      this.stop();
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVisibility);
      if (this.input) this.input.dispose();
      if (this.behaviors) this.behaviors.dispose();
      if (this.model) this.model.dispose();
      if (this.gl) {
        var lose = this.gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();          // libera la GPU enseguida
        this.canvas.remove();
      }
      clearTimeout(this._bubbleTimer);
      this.container.innerHTML = '';
    }
  }

  NS.AvatarEngine = AvatarEngine;
  NS.mount = function (container, options) {
    return new AvatarEngine(container, options);
  };
})(window.SerenaAvatar = window.SerenaAvatar || {});
