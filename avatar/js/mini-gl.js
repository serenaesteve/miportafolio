/* ==========================================================================
   MiniGL · Lo mínimo de WebGL que necesita el avatar (≈ 4 KB).

   Sustituye a Three.js (600 KB): el avatar solo dibuja UN plano con un
   shader, así que basta con compilar el shader, subir dos texturas y
   calcular tres matrices (proyección, cámara y modelo).
   ========================================================================== */
(function (NS) {
  'use strict';

  // ------------------------------------------------------------ shaders
  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error('Shader: ' + log);
    }
    return s;
  }

  function program(gl, vertSrc, fragSrc) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Programa: ' + gl.getProgramInfoLog(p));
    // Guarda las posiciones de todos los uniforms para no buscarlas cada fotograma
    var loc = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var name = gl.getActiveUniform(p, i).name;
      loc[name] = gl.getUniformLocation(p, name);
    }
    return { handle: p, uniforms: loc };
  }

  // ------------------------------------------------------------ texturas
  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('No se pudo cargar ' + url)); };
      img.src = url;
    });
  }

  function texture(gl, img) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);          // v = 0 abajo
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    // Sin mipmaps y con CLAMP: vale para texturas de cualquier tamaño (WebGL 1)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // ------------------------------------------------------------ matrices 4×4
  // Formato de WebGL: Float32Array de 16, por columnas.
  var M = {
    identity: function () {
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },
    multiply: function (a, b) {
      var o = new Float32Array(16);
      for (var c = 0; c < 4; c++) {
        for (var r = 0; r < 4; r++) {
          o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
      }
      return o;
    },
    perspective: function (fovDeg, aspect, near, far) {
      var f = 1 / Math.tan(fovDeg * Math.PI / 360), nf = 1 / (near - far);
      var o = new Float32Array(16);
      o[0] = f / aspect; o[5] = f;
      o[10] = (far + near) * nf; o[11] = -1;
      o[14] = 2 * far * near * nf;
      return o;
    },
    translation: function (x, y, z) {
      var o = M.identity(); o[12] = x; o[13] = y; o[14] = z; return o;
    },
    scaling: function (x, y, z) {
      var o = M.identity(); o[0] = x; o[5] = y; o[10] = z; return o;
    },
    rotationX: function (a) {
      var c = Math.cos(a), s = Math.sin(a), o = M.identity();
      o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o;
    },
    rotationY: function (a) {
      var c = Math.cos(a), s = Math.sin(a), o = M.identity();
      o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o;
    },
    rotationZ: function (a) {
      var c = Math.cos(a), s = Math.sin(a), o = M.identity();
      o[0] = c; o[1] = s; o[4] = -s; o[5] = c; return o;
    },
    // Punto (x,y,z,1) × matriz → coordenadas de recorte normalizadas (NDC)
    project: function (m, x, y, z) {
      var cx = m[0] * x + m[4] * y + m[8] * z + m[12];
      var cy = m[1] * x + m[5] * y + m[9] * z + m[13];
      var cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      return { x: cx / cw, y: cy / cw };
    }
  };

  // Pequeños contenedores con .set() (mismo estilo de API que Three.js)
  function vec(n) {
    var v = { set: function () { for (var i = 0; i < n; i++) this[i] = arguments[i]; return this; } };
    for (var i = 0; i < n; i++) v[i] = 0;
    return v;
  }
  function xyz(x, y, z) {
    return { x: x, y: y, z: z, set: function (a, b, c) { this.x = a; this.y = b; this.z = c; return this; } };
  }

  NS.GL = { program: program, loadImage: loadImage, texture: texture, M: M, vec: vec, xyz: xyz };
})(window.SerenaAvatar = window.SerenaAvatar || {});
