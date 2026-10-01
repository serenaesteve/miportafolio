/* ==========================================================================
   AvatarAnimator · Da vida a la ilustración:
     - gira hacia el cursor (paralaje + inclinación en perspectiva)
     - mueve los ojos, parpadea, respira y el pelo se mueve con la "brisa"
     - saludo: cambia a la ilustración con la mano levantada (fundido
       rápido), mueve la mano, guiña un ojo y da un saltito.
   ========================================================================== */
(function (NS) {
  'use strict';

  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smoothstep(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  // Poses que hacen un saltito al empezar
  var BOUNCY = { saludo: 1 };

  class AvatarAnimator {
    constructor(model, profile) {
      this.model = model;
      this.u = model.uniforms;
      this.mesh = model.mesh;
      this.profile = profile || {};
      this.reduced = !!this.profile.reducedMotion;
      this.time = 0;

      this.look = { x: 0, y: 0, ex: 0, ey: 0 };
      this.gesture = null;             // { name, start, dur }
      this.blinkT = -1;
      this.blinkEyes = [1, 1];
      this.blinkDur = 0.16;
      this.nextBlink = 1.2;
    }

    // ---------------------------------------------------------- API pública
    get busy() { return !!this.gesture; }
    get current() { return this.gesture ? this.gesture.name : null; }

    // Muestra una pose durante "dur" segundos (Infinity = hasta release()).
    // Si la pose aún no está descargada, se descarga y empieza al llegar.
    play(name, dur) {
      var self = this;
      var token = this._token = (this._token || 0) + 1;   // la última petición gana
      if (!this.model.has(name)) {
        if (name === 'saludo') this._start('sin-pose', dur || 3.4);   // sin ilustración: guiño y saltito
        return Promise.resolve(false);
      }
      // Si ya se ve otra ilustración, primero se funde con la normal y después
      // entra la nueva (cambiar la textura en mitad del fundido daría un salto)
      var showing = this.u.uAltMix.value > 0.02;
      if (showing) this.release();
      var wait = showing ? new Promise(function (r) { setTimeout(r, 240); }) : null;
      return Promise.all([this.model.loadPose(name), wait]).then(function (r) {
        if (!r[0] || token !== self._token) return false;   // llegó tarde: otra pose la sustituyó
        self.model.setPose(name);
        self._start(name, dur || 3.4);
        return true;
      });
    }

    wave(dur) { return this.play('saludo', dur || 3.4); }

    // Cancela una pose que aún se está descargando y termina la actual
    cancel() {
      this._token = (this._token || 0) + 1;
      this.release();
    }

    // Termina la pose actual con su fundido de salida
    release() {
      var g = this.gesture;
      if (!g) return;
      g.dur = Math.min(g.dur, this.time - g.start + 0.25);
    }

    talk() { /* la ilustración no mueve la boca: el bocadillo ya "habla" */ }

    _start(name, dur) {
      this.gesture = { name: name, start: this.time, dur: dur, winked: false };
    }

    _blinkNow(eyes, dur) {
      this.blinkT = 0;
      this.blinkEyes = eyes || [1, 1];
      this.blinkDur = dur || 0.16;
    }

    // ---------------------------------------------------------- bucle
    update(dt, input) {
      this.time += dt;
      var t = this.time;
      var now = performance.now();
      var g = this.gesture;
      if (g && t - g.start > g.dur) { g = this.gesture = null; }
      var gt = g ? t - g.start : 0;
      var dur = g ? g.dur : 0;
      // peso "suave" (movimientos) y peso "rápido" (cambio de ilustración:
      // en 0,18 s, para que no se vean dos poses superpuestas)
      var gw = g ? smoothstep(gt / 0.35) * smoothstep((dur - gt) / 0.5) : 0;
      var pose = g ? smoothstep(gt / 0.18) * smoothstep((dur - gt) / 0.22) : 0;
      var isWave = g && (g.name === 'saludo' || g.name === 'sin-pose');

      // --- ¿hacia dónde mira? ---------------------------------------------
      var idle = input ? input.idleFor(now) > 4000 : true;
      var tx, ty;
      if (idle) {
        tx = Math.sin(t * 0.35) * 0.35;          // deriva suave "pensativa"
        ty = Math.sin(t * 0.23 + 1) * 0.15;
      } else {
        tx = clamp(input.x, -1, 1);
        ty = clamp(input.y, -1, 1);
      }
      // durante una pose mira más de frente (la ilustración ya tiene su gesto)
      tx *= 1 - gw * 0.8; ty *= 1 - gw * 0.8;

      this.look.x = damp(this.look.x, tx, 4, dt);
      this.look.y = damp(this.look.y, ty, 4, dt);
      this.look.ex = damp(this.look.ex, tx, 12, dt);
      this.look.ey = damp(this.look.ey, ty, 12, dt);

      var k = this.reduced ? 0.4 : 1;
      this.u.uLook.value.set(this.look.x * k, this.look.y * k);
      this.u.uEyeShift.value.set(this.look.ex * 2.8, this.look.ey * 1.6);
      this.u.uTime.value = t;

      // inclinación real del plano en perspectiva
      this.mesh.rotation.y = this.look.x * 0.14 * k;
      this.mesh.rotation.x = this.look.y * 0.05 * k;

      // --- respiración, saltito y balanceo --------------------------------
      var breath = this.reduced ? 0 : Math.sin(t * 1.6) * 0.004;
      var hop = 0, sway = 0;
      if (g && !this.reduced && (BOUNCY[g.name] || g.name === 'sin-pose')) {
        hop = Math.max(0, Math.sin(gt * 7)) * 0.018 * Math.exp(-gt * 1.2);
        sway = Math.sin(gt * 6) * 0.025 * gw;
      }
      this.mesh.scale.set(1 - hop * 0.4, 1 + breath + hop, 1);
      this.mesh.rotation.z = sway;

      this.u.uAltMix.value = g && g.name !== 'sin-pose' && this.model.hasAlt ? pose : 0;
      // en el saludo, la mano se balancea (≈ ±11°)
      this.u.uWave.value = isWave && !this.reduced ? Math.sin(gt * 9) * 0.2 * gw : 0;

      // guiño a los 0,7 s del saludo
      if (isWave && !g.winked && gt > 0.7) {
        g.winked = true;
        this._blinkNow([0, 1], 0.45);
      }

      // --- parpadeo -------------------------------------------------------
      if (this.blinkT < 0 && t > this.nextBlink) {
        this._blinkNow([1, 1], 0.16);
        this.nextBlink = t + 2.4 + Math.random() * 3.5;
        if (Math.random() < 0.15) this.nextBlink = t + 0.3;   // a veces doble parpadeo
      }
      var b = 0;
      if (this.blinkT >= 0) {
        this.blinkT += dt;
        var p = this.blinkT / this.blinkDur;
        b = p < 0.5 ? p * 2 : Math.max(0, 2 - p * 2);
        if (p >= 1) { this.blinkT = -1; b = 0; }
      }
      this.u.uBlink.value.set(b * this.blinkEyes[0], b * this.blinkEyes[1]);
    }
  }

  NS.AvatarAnimator = AvatarAnimator;
})(window.SerenaAvatar = window.SerenaAvatar || {});
