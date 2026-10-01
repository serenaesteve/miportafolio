/* ==========================================================================
   InputTracker · Unifica ratón, táctil y giroscopio en un único "punto de
   atención" normalizado (-1..1) que el avatar sigue con la mirada.

   En escritorio hay hover; en móvil NO (criterio a): allí se usa el dedo y,
   si el usuario da permiso, la inclinación del teléfono (giroscopio).
   ========================================================================== */
(function (NS) {
  'use strict';

  class InputTracker {
    constructor(container, options) {
      this.container = container;
      this.opts = Object.assign({ useGyro: true }, options || {});
      this.x = 0;              // -1 (izquierda) .. 1 (derecha)
      this.y = 0;              // -1 (arriba) .. 1 (abajo)
      this.source = 'none';    // 'mouse' | 'touch' | 'gyro' | 'none'
      this.lastMove = 0;       // marca de tiempo del último movimiento
      this.gyroEnabled = false;
      this._gyroBase = null;
      this._listeners = [];

      this._onPointer = this._onPointer.bind(this);
      this._onTouch = this._onTouch.bind(this);
      this._onOrientation = this._onOrientation.bind(this);
      this._onLeave = this._onLeave.bind(this);

      this._on(window, 'pointermove', this._onPointer, { passive: true });
      this._on(window, 'touchstart', this._onTouch, { passive: true });
      this._on(window, 'touchmove', this._onTouch, { passive: true });
      this._on(document, 'mouseleave', this._onLeave);
    }

    _on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts || false);
      this._listeners.push([target, type, fn, opts || false]);
    }

    // Punto de referencia: la cara del avatar en pantalla
    _anchor() {
      var r = this.container.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.3 };
    }

    _setFromClient(cx, cy, source) {
      var a = this._anchor();
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      this.x = Math.max(-1, Math.min(1, (cx - a.x) / (w * 0.5)));
      this.y = Math.max(-1, Math.min(1, (cy - a.y) / (h * 0.5)));
      this.source = source;
      this.lastMove = performance.now();
    }

    _onPointer(e) {
      if (e.pointerType === 'touch') return; // lo gestiona _onTouch
      this._setFromClient(e.clientX, e.clientY, 'mouse');
    }

    _onTouch(e) {
      var t = e.touches && e.touches[0];
      if (t) this._setFromClient(t.clientX, t.clientY, 'touch');
    }

    _onLeave() {
      this.lastMove = 0; // vuelve a mirar al portátil
    }

    _onOrientation(e) {
      if (e.beta == null || e.gamma == null) return;
      // La primera lectura es la posición "neutra" en la que se sostiene el móvil
      if (!this._gyroBase) this._gyroBase = { beta: e.beta, gamma: e.gamma };
      var gx = (e.gamma - this._gyroBase.gamma) / 25;
      var gy = (e.beta - this._gyroBase.beta) / 25;
      // el dedo tiene prioridad sobre el giroscopio durante 1,5 s
      if (this.source === 'touch' && performance.now() - this.lastMove < 1500) return;
      this.x = Math.max(-1, Math.min(1, gx));
      this.y = Math.max(-1, Math.min(1, gy));
      if (Math.abs(gx) + Math.abs(gy) > 0.08) {
        this.source = 'gyro';
        this.lastMove = performance.now();
      }
    }

    // iOS 13+ exige pedir permiso tras un gesto del usuario (un toque)
    enableGyro() {
      if (!this.opts.useGyro || this.gyroEnabled || !('DeviceOrientationEvent' in window)) {
        return Promise.resolve(this.gyroEnabled);
      }
      var self = this;
      var start = function () {
        self._on(window, 'deviceorientation', self._onOrientation, { passive: true });
        self.gyroEnabled = true;
        return true;
      };
      var DOE = window.DeviceOrientationEvent;
      if (typeof DOE.requestPermission === 'function') {
        return DOE.requestPermission()
          .then(function (state) { return state === 'granted' ? start() : false; })
          .catch(function () { return false; });
      }
      return Promise.resolve(start());
    }

    // ¿Hace cuánto que nadie mueve nada? (ms)
    idleFor(now) {
      return this.lastMove ? now - this.lastMove : Infinity;
    }

    dispose() {
      this._listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      this._listeners = [];
    }
  }

  NS.InputTracker = InputTracker;
})(window.SerenaAvatar = window.SerenaAvatar || {});
