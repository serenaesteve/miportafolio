/* ==========================================================================
   AvatarModel · Serena en "2.5D": la ilustración cobra volumen en WebGL.

   Técnica (la misma idea que las "fotos 3D" de las redes sociales):
     - serena-color.webp → la ilustración recortada (con transparencia)
     - serena-depth.png  → mapa de profundidad (blanco = cerca, negro = lejos)
   Un shader desplaza cada píxel según su profundidad y hacia dónde mira:
   lo cercano (portátil, cara, mano) se mueve más que lo lejano, y el cerebro
   lo percibe como un giro en 3D. Además el plano se inclina en perspectiva,
   los ojos se deslizan dentro de su contorno y parpadean.

   Se dibuja con WebGL directo (ver mini-gl.js), sin librerías.
   Los ojos se definen en píxeles de la imagen original (1069 × 1472).
   ========================================================================== */
(function (NS) {
  'use strict';

  var GL = NS.GL, M = GL.M;

  var IMG = { w: 1069, h: 1472 };

  // Ojos: centro, semiejes del contorno y ángulo (en píxeles de la imagen)
  var EYES = [
    { c: [404, 252], ab: [21, 8.5], angle: -0.45 },   // ojo izquierdo en pantalla
    { c: [487, 205], ab: [18, 7.5], angle: -0.67 }    // ojo derecho en pantalla
  ];
  // Los mismos ojos en la ilustración saludando (se interpolan durante el fundido).
  // Las poses sin "eyes" desactivan el movimiento de ojos y el parpadeo.
  var EYES_ALT = [
    { c: [400, 251], ab: [23, 9], angle: -0.39 },
    { c: [481, 204], ab: [19, 7.5], angle: -0.73 }
  ];
  // Mano que saluda: gira sobre la muñeca. Detrás de la mano solo hay fondo
  // transparente, así que se puede rotar sin dejar "huecos".
  var WAVE = { wrist: [763, 463], hand: [800, 330], radius: [150, 175] };
  var HEAD = [440, 40];      // encima del moño: ancla del bocadillo

  var VERT = [
    'attribute vec2 aPos;',
    'attribute vec2 aUv;',
    'uniform mat4 uMVP;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = aUv;',
    '  gl_Position = uMVP * vec4(aPos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',   // GPUs móviles antiguas
    '#endif',
    'uniform sampler2D uColor;',
    'uniform sampler2D uDepth;',
    'uniform sampler2D uAlt;',        // ilustración alternativa (saludo), opcional
    'uniform sampler2D uAltDepth;',
    'uniform float uAltMix;',
    'uniform vec2  uLook;',           // -1..1 hacia dónde gira
    'uniform float uStrength;',       // intensidad del paralaje
    'uniform vec2  uImg;',            // tamaño de la imagen en píxeles
    'uniform vec4  uEye0; uniform float uAng0;',   // xy centro, zw semiejes
    'uniform vec4  uEye1; uniform float uAng1;',
    'uniform vec2  uEyeShift;',       // desplazamiento de las pupilas (px)
    'uniform vec2  uBlink;',          // 0 abierto · 1 cerrado (por ojo)
    'uniform float uEyeFx;',
    'uniform float uWave;',           // ángulo de la mano (radianes)
    'uniform vec2  uWrist;',          // pivote: la muñeca (px)
    'uniform vec4  uHand;',           // xy centro de la mano, zw radios (px)
    'uniform float uTime;',
    'uniform float uSway;',           // intensidad de la "brisa" en el pelo
    'varying vec2 vUv;',
    '',
    'vec2 eyeLocal(vec2 px, vec4 e, float ang) {',
    '  vec2 d = px - e.xy;',
    '  float c = cos(-ang), s = sin(-ang);',
    '  d = vec2(c * d.x - s * d.y, s * d.x + c * d.y);',
    '  return d / e.zw;',
    '}',
    '',
    '// Mechones sueltos que se mueven con la brisa (px de la ilustración principal).',
    '// Cada zona: máscara elíptica × distancia a la raíz del mechón.',
    'float zone(vec2 p, vec2 c, vec2 r) { return 1.0 - smoothstep(0.7, 1.0, length((p - c) / r)); }',
    'vec2 hairSway(vec2 p) {',
    '  float t = uTime;',
    '  vec2 o = vec2(0.0);',
    '  o.x += zone(p, vec2(305.0, 25.0), vec2(70.0, 38.0)) * clamp((58.0 - p.y) / 58.0, 0.0, 1.0) * 3.0 * sin(t * 1.6 + p.x * 0.03);',
    '  float m2 = zone(p, vec2(212.0, 112.0), vec2(40.0, 62.0)) * clamp((250.0 - p.x) / 60.0, 0.0, 1.0);',
    '  o += m2 * vec2(1.2 * sin(t * 1.1 + 2.0), 2.5 * sin(t * 1.3 + p.y * 0.04 + 1.0));',
    '  o.x += zone(p, vec2(298.0, 342.0), vec2(16.0, 26.0)) * clamp((p.y - 318.0) / 50.0, 0.0, 1.0) * 2.5 * sin(t * 1.4 + 0.5);',
    '  o.x += zone(p, vec2(515.0, 152.0), vec2(14.0, 32.0)) * clamp((p.y - 122.0) / 60.0, 0.0, 1.0) * 1.5 * sin(t * 1.5 + 2.5);',
    '  return o * uSway;',
    '}',
    '',
    'void main() {',
    '  // 1) paralaje por profundidad (3 iteraciones para seguir el relieve)',
    '  vec2 off = vec2(-uLook.x, uLook.y) * uStrength;',
    '  vec2 uv = vUv;',
    '  for (int i = 0; i < 3; i++) {',
    '    float d = mix(texture2D(uDepth, uv).r, texture2D(uAltDepth, uv).r, uAltMix) - 0.45;',
    '    uv = vUv + off * d;',
    '  }',
    '',
    '  // 2) ojos: iris y pupila se deslizan dentro del contorno',
    '  vec2 px = vec2(uv.x, 1.0 - uv.y) * uImg;',
    '  vec2 l0 = eyeLocal(px, uEye0, uAng0);',
    '  vec2 l1 = eyeLocal(px, uEye1, uAng1);',
    '  float r0 = length(l0), r1 = length(l1);',
    '  float m = ((1.0 - smoothstep(0.5, 0.9, r0)) + (1.0 - smoothstep(0.5, 0.9, r1))) * uEyeFx;',
    '  vec2 suv = uv - vec2(uEyeShift.x, -uEyeShift.y) * m / uImg;',
    '',
    '  vec2 sp = vec2(suv.x, 1.0 - suv.y) * uImg;',
    '  vec2 so = hairSway(sp) * (1.0 - uAltMix) / uImg;',
    '  vec4 col = texture2D(uColor, suv - vec2(so.x, -so.y));',
    '  if (uAltMix > 0.001) {',
    '    // la mano gira sobre la muñeca: solo los píxeles por encima de ella',
    '    vec2 wp = vec2(suv.x, 1.0 - suv.y) * uImg;',
    '    float hw = smoothstep(uWrist.y + 12.0, uWrist.y - 30.0, wp.y)',
    // a la izquierda de la muñeca está la manga: se excluye solo a esa altura
    // (más arriba está el pulgar, que sí tiene que girar con la mano)
    '             * mix(1.0, smoothstep(uWrist.x - 40.0, uWrist.x - 20.0, wp.x), smoothstep(uWrist.y - 85.0, uWrist.y - 55.0, wp.y))',
    '             * (1.0 - smoothstep(0.9, 1.1, length((wp - uHand.xy) / uHand.zw)));',
    '    vec2 d = wp - uWrist;',
    '    float c = cos(uWave), s = sin(uWave);',
    '    vec2 rp = mix(wp, uWrist + vec2(c * d.x - s * d.y, s * d.x + c * d.y), hw);',
    '    vec4 alt = texture2D(uAlt, vec2(rp.x / uImg.x, 1.0 - rp.y / uImg.y));',
    '    col = mix(col, alt, uAltMix);',
    '  }',
    '',
    '  // 3) parpadeo: la piel del párpado cubre el ojo y queda la línea de pestañas',
    '  vec3 lid = vec3(0.97, 0.62, 0.49);',
    '  vec3 lash = vec3(0.12, 0.05, 0.05);',
    '  float in0 = 1.0 - smoothstep(0.85, 1.15, r0);',
    '  float in1 = 1.0 - smoothstep(0.85, 1.15, r1);',
    '  float line0 = (1.0 - smoothstep(0.1, 0.3, abs(l0.y - 0.3 + 0.2 * l0.x * l0.x))) * step(abs(l0.x), 1.05);',
    '  float line1 = (1.0 - smoothstep(0.1, 0.3, abs(l1.y - 0.3 + 0.2 * l1.x * l1.x))) * step(abs(l1.x), 1.05);',
    '  col.rgb = mix(col.rgb, mix(lid, lash, line0), in0 * uBlink.x * uEyeFx);',
    '  col.rgb = mix(col.rgb, mix(lid, lash, line1), in1 * uBlink.y * uEyeFx);',
    '',
    '  if (col.a < 0.01) discard;',
    '  gl_FragColor = vec4(col.rgb * col.a, col.a);',   // alfa premultiplicado
    '}'
  ].join('\n');

  class AvatarModel {
    constructor(gl, profile, options) {
      this.gl = gl;
      this.profile = profile || {};
      var o = options || {};
      var base = o.basePath != null ? o.basePath : 'avatar/';
      this.base = base;
      this.urls = {
        color: base + 'assets/serena-color.webp',
        depth: base + 'assets/serena-depth.png'
      };
      // Poses: la normal (principal) y la de saludo
      this.poses = {};
      if (o.waveImage) {
        this.poses.saludo = { image: o.waveImage, depth: o.waveDepth, eyes: EYES_ALT, wave: WAVE };
      }
      this.pose = null;          // pose que se está mostrando (o null)
      this.aspect = IMG.w / IMG.h;
      this.hasAlt = false;
      // Transformación del plano (el animador la modifica cada fotograma)
      this.mesh = { rotation: GL.xyz(0, 0, 0), scale: GL.xyz(1, 1, 1) };
      this._mvp = M.identity();
    }

    // Carga asíncrona: en móvil la red puede ser lenta y el motor espera aquí
    load() {
      var self = this, gl = this.gl;
      return Promise.all([GL.loadImage(this.urls.color), GL.loadImage(this.urls.depth)])
        .then(function (img) {
          self._build(GL.texture(gl, img[0]), GL.texture(gl, img[1]));
          // La pose de saludo se precarga (se usa nada más entrar); altReady avisa
          self.altReady = self.poses.saludo ? self.loadPose('saludo') : Promise.resolve(false);
          return self;
        });
    }

    has(name) { return !!this.poses[name]; }

    // Carga una pose la primera vez que se usa (en móvil no se descargan
    // imágenes que quizá nunca se vean)
    loadPose(name) {
      var self = this, gl = this.gl, pose = this.poses[name];
      if (!pose) return Promise.resolve(false);
      if (pose._ready) return pose._ready;
      pose._ready = Promise.all([
        GL.loadImage(this.base + pose.image),
        pose.depth ? GL.loadImage(this.base + pose.depth) : null
      ]).then(function (r) {
        pose.tex = GL.texture(gl, r[0]);
        pose.texDepth = r[1] ? GL.texture(gl, r[1]) : self.tex.depth;
        return true;
      }).catch(function (e) {
        console.warn('[avatar] no se pudo cargar la pose "' + name + '":', e.message);
        delete self.poses[name];
        return false;
      });
      return pose._ready;
    }

    // Deja preparada la pose para el fundido (el animador controla uAltMix)
    setPose(name) {
      var pose = this.poses[name];
      if (!pose || !pose.tex) return false;
      if (this.pose && this.pose !== pose) this._evict(pose);
      this.pose = pose;
      this.tex.alt = pose.tex;
      this.tex.altDepth = pose.texDepth;
      this.hasAlt = true;
      return true;
    }

    // Límite de memoria de GPU: en móviles solo se quedan cargadas la pose de
    // saludo y la que se va a mostrar (cada pose ocupa ~8 MB de GPU).
    _evict(keep) {
      if (this.profile.name === 'alto') return;
      var gl = this.gl, self = this;
      Object.keys(this.poses).forEach(function (n) {
        var ps = self.poses[n];
        if (n === 'saludo' || ps === keep || ps === self.pose || !ps.tex) return;
        gl.deleteTexture(ps.tex);
        if (ps.texDepth && ps.texDepth !== self.tex.depth) gl.deleteTexture(ps.texDepth);
        ps.tex = ps.texDepth = null;
        ps._ready = null;                         // se volverá a descargar (caché del navegador)
      });
    }

    _build(color, depth) {
      var gl = this.gl, p = this.profile;
      this.prog = GL.program(gl, VERT, FRAG);
      this.tex = { color: color, depth: depth, alt: color, altDepth: depth };

      function v2(a, b) { return GL.vec(2).set(a, b); }
      function v4(e) { return GL.vec(4).set(e.c[0], e.c[1], e.ab[0], e.ab[1]); }
      this.uniforms = {
        uAltMix: { value: 0 },
        uLook: { value: v2(0, 0) },
        uStrength: { value: p.parallax || 0.03 },
        uImg: { value: v2(IMG.w, IMG.h) },
        uEye0: { value: v4(EYES[0]) }, uAng0: { value: EYES[0].angle },
        uEye1: { value: v4(EYES[1]) }, uAng1: { value: EYES[1].angle },
        uEyeShift: { value: v2(0, 0) },
        uBlink: { value: v2(0, 0) },
        uEyeFx: { value: p.eyeFx === false ? 0 : 1 },
        uWave: { value: 0 },
        uTime: { value: 0 },
        uSway: { value: p.reducedMotion ? 0 : (p.name === 'bajo' ? 0.6 : 1) }
      };

      // Plano: 2 de alto, pivote abajo en el centro. 2 triángulos (TRIANGLE_STRIP)
      var w = this.aspect;
      var data = new Float32Array([
        // x,  y,  u, v
        -w, 0, 0, 0,
         w, 0, 1, 0,
        -w, 2, 0, 1,
         w, 2, 1, 1
      ]);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      this.aPos = gl.getAttribLocation(this.prog.handle, 'aPos');
      this.aUv = gl.getAttribLocation(this.prog.handle, 'aUv');
    }

    // Matriz del modelo: escala → giros → (el pivote ya está en el origen)
    _modelMatrix() {
      var r = this.mesh.rotation, s = this.mesh.scale;
      var m = M.multiply(M.rotationX(r.x), M.rotationY(r.y));
      m = M.multiply(m, M.rotationZ(r.z));
      return M.multiply(m, M.scaling(s.x, s.y, s.z));
    }

    draw(proj, view) {
      var gl = this.gl, u = this.uniforms, L = this.prog.uniforms;
      this._mvp = M.multiply(M.multiply(proj, view), this._modelMatrix());

      gl.useProgram(this.prog.handle);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(this.aUv);
      gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 16, 8);

      [['uColor', this.tex.color], ['uDepth', this.tex.depth], ['uAlt', this.tex.alt], ['uAltDepth', this.tex.altDepth]]
        .forEach(function (t, i) {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, t[1]);
          gl.uniform1i(L[t[0]], i);
        });

      gl.uniformMatrix4fv(L.uMVP, false, this._mvp);
      gl.uniform1f(L.uAltMix, u.uAltMix.value);
      gl.uniform2f(L.uLook, u.uLook.value[0], u.uLook.value[1]);
      gl.uniform1f(L.uStrength, u.uStrength.value);
      gl.uniform2f(L.uImg, u.uImg.value[0], u.uImg.value[1]);
      // ojos: interpolados entre la pose normal y la actual según el fundido.
      // Si la pose no define sus ojos, el efecto se apaga mientras se muestra.
      var k = u.uAltMix.value, pose = this.pose;
      var alt = pose && pose.eyes ? pose.eyes : EYES;
      [0, 1].forEach(function (i) {
        var a = EYES[i], b = alt[i];
        function lerp(x, y) { return x + (y - x) * k; }
        gl.uniform4f(L['uEye' + i], lerp(a.c[0], b.c[0]), lerp(a.c[1], b.c[1]), lerp(a.ab[0], b.ab[0]), lerp(a.ab[1], b.ab[1]));
        gl.uniform1f(L['uAng' + i], lerp(a.angle, b.angle));
      });
      gl.uniform1f(L.uEyeFx, u.uEyeFx.value * (pose && !pose.eyes ? 1 - k : 1));
      var rig = pose && pose.wave;
      gl.uniform1f(L.uWave, rig ? u.uWave.value : 0);
      gl.uniform2f(L.uWrist, rig ? rig.wrist[0] : 0, rig ? rig.wrist[1] : 0);
      gl.uniform4f(L.uHand, rig ? rig.hand[0] : 0, rig ? rig.hand[1] : 0, rig ? rig.radius[0] : 1, rig ? rig.radius[1] : 1);
      gl.uniform1f(L.uTime, u.uTime.value);
      gl.uniform1f(L.uSway, u.uSway.value);
      gl.uniform2f(L.uEyeShift, u.uEyeShift.value[0], u.uEyeShift.value[1]);
      gl.uniform2f(L.uBlink, u.uBlink.value[0], u.uBlink.value[1]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Punto sobre la cabeza en coordenadas de pantalla normalizadas (-1..1)
    headAnchor() {
      var x = (HEAD[0] / IMG.w - 0.5) * 2 * this.aspect;
      var y = (1 - HEAD[1] / IMG.h) * 2;
      return M.project(this._mvp, x, y, 0);
    }

    dispose() {
      var gl = this.gl;
      if (!this.prog) return;
      var seen = [];
      Object.keys(this.tex).forEach(function (k) {
        var t = this.tex[k];
        if (seen.indexOf(t) < 0) { gl.deleteTexture(t); seen.push(t); }
      }, this);
      Object.keys(this.poses).forEach(function (n) {
        var ps = this.poses[n];
        [ps.tex, ps.texDepth].forEach(function (t) { if (t && seen.indexOf(t) < 0) { gl.deleteTexture(t); seen.push(t); } });
      }, this);
      gl.deleteBuffer(this.buffer);
      gl.deleteProgram(this.prog.handle);
    }
  }

  AvatarModel.IMG = IMG;
  AvatarModel.EYES = EYES;
  NS.AvatarModel = AvatarModel;
})(window.SerenaAvatar = window.SerenaAvatar || {});
