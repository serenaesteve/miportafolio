/* ==========================================================================
   AvatarBehaviors · Cuándo saluda y qué dice.

     entrar ............ saludo según la hora del día (espera a que el
                         avatar se vea si la página se abrió más abajo)
     clic / toque ...... saluda y dice una frase (van rotando)
   ========================================================================== */
(function (NS) {
  'use strict';

  // "¡Buenos días!", "¡Buenas tardes!" o "¡Buenas noches!" según la hora local
  function saludoSegunHora(date, lang) {
    var h = (date || new Date()).getHours();
    if (lang === 'en') {
      if (h >= 6 && h < 12) return "Good morning! ☀️ I'm Serena, welcome to my portfolio";
      if (h >= 12 && h < 20) return "Good afternoon! 👋 I'm Serena, welcome to my portfolio";
      if (h >= 20) return "Good evening! 🌙 I'm Serena, welcome to my portfolio";
      return "Hi! 🌙 Coding at this hour too? I'm Serena 👋";
    }
    if (h >= 6 && h < 13) return '¡Buenos días! ☀️ Soy Serena, bienvenid@ a mi portafolio';
    if (h >= 13 && h < 21) return '¡Buenas tardes! 👋 Soy Serena, bienvenid@ a mi portafolio';
    if (h >= 21) return '¡Buenas noches! 🌙 Soy Serena, bienvenid@ a mi portafolio';
    return '¡Buenas noches! 🌙 ¿Tú también programando a estas horas? Soy Serena 👋';
  }

  class AvatarBehaviors {
    constructor(engine) {
      this.e = engine;
      this.phrase = 0;
      this.pendingGreet = false;
    }

    get a() { return this.e.animator; }

    greetOnEnter() {
      // Si la página se abrió con el avatar fuera de pantalla, espera a verlo
      if (!this.e.visible || document.hidden) { this.pendingGreet = true; return; }
      this.pendingGreet = false;
      this.a.wave(3.4);
      this.e.say(this.e.opts.greeting || saludoSegunHora(null, this.e.lang), 3.2);
    }

    // El motor avisa cuando el avatar vuelve a verse
    visible() {
      if (this.pendingGreet) this.greetOnEnter();
    }

    tap() {
      var list = this.e.opts.phrases;
      this.a.wave(3.4);
      this.e.say(list[this.phrase++ % list.length], 3);
    }

    update() { /* sin comportamientos automáticos */ }

    dispose() {}
  }

  AvatarBehaviors.saludoSegunHora = saludoSegunHora;
  NS.AvatarBehaviors = AvatarBehaviors;
})(window.SerenaAvatar = window.SerenaAvatar || {});
