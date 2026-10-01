/* ==========================================================================
   i18n · Versión en inglés del portafolio.

   index.html está escrito en español. scripts/build.py usa este
   diccionario para generar en/index.html ya traducido (así Google indexa
   las dos versiones). Los textos que no están en el diccionario (nombres
   propios, tecnologías…) se quedan igual.
   ========================================================================== */
(function () {
  'use strict';

  var EN = {
    // ---- menú y portada
    'Sobre mí': 'About', 'Proyectos': 'Projects', 'Experiencia': 'Experience',
    'Educación': 'Education', 'Contacto': 'Contact',
    'Disponible': 'Available',
    'Construyo aplicaciones web y multiplataforma combinando criterio técnico, atención al detalle y espíritu creativo.':
      'I build web and cross-platform apps combining technical judgement, attention to detail and a creative spirit.',
    'Ver proyectos': 'See projects', 'proyectos': 'projects', 'tecnologías': 'technologies',
    'IA · Ollama · Scraping': 'AI · Ollama · Scraping',

    // ---- sobre mí
    'Hola,': 'Hi,', 'soy': "I'm",
    'Desarrolladora Full Stack en formación, cursando el Grado Superior en DAM. Mi trayectoria combina experiencia administrativa real con una creciente especialización en tecnología.':
      "Full Stack Developer in training, currently studying a Higher Vocational Degree in Cross-Platform App Development (DAM). My background combines real administrative experience with a growing specialisation in technology.",
    'Me apasiona construir soluciones digitales que unan funcionalidad con diseño. Resolutiva, organizada y con espíritu emprendedor.':
      "I love building digital solutions that bring together functionality and design. Problem-solver, organised and entrepreneurial.",
    'Emprendedora': 'Entrepreneurial', 'Comunicación': 'Communication', 'Trabajo en equipo': 'Teamwork',
    'Resolutiva': 'Problem-solver', 'Marketing digital': 'Digital marketing', 'IA aplicada': 'Applied AI',

    // ---- stack
    'Stack técnico': 'Tech stack', 'Tecnologías &': 'Technologies &', 'herramientas': 'tools',
    'IA / Ollama': 'AI / Ollama',

    // ---- proyectos
    'Lo que he': "What I've", 'construido': 'built', 'proyectos en total': 'projects in total',
    'Thais Esteve · Fotografía': 'Thais Esteve · Photography',
    'Web para fotógrafa profesional de familia y naturaleza. Galerías, redes sociales y formulario de contacto.':
      'Website for a professional family and nature photographer. Galleries, social media and contact form.',
    'Galería de fotos estilo Netflix para la fotógrafa Thais Esteve. Navegación por secciones con thumbnails y visor.':
      'Netflix-style photo gallery for photographer Thais Esteve. Section navigation with thumbnails and viewer.',
    'Web Portafolios': 'Portfolio Website',
    'Aplicación web con Flask y SQLite para gestionar y mostrar portafolios profesionales. Backend completo en Python.':
      'Flask and SQLite web app to manage and showcase professional portfolios. Full Python backend.',
    'Sistema de gestión de relaciones con clientes. Seguimiento, documentación y gestión completa.':
      'Customer relationship management system. Tracking, documentation and full management.',
    'Correo IMAP': 'IMAP Mail',
    'Cliente de correo electrónico con protocolo IMAP para leer y gestionar emails desde Python.':
      'Email client using the IMAP protocol to read and manage emails from Python.',
    'Correo Thais': 'Thais Mail',
    'Sistema de envío de correos automatizado para la fotógrafa Thais Esteve.':
      'Automated email sending system for photographer Thais Esteve.',
    'Descargar Imágenes de Internet': 'Web Image Downloader',
    'Herramienta para descargar imágenes automáticamente desde páginas web.':
      'Tool to automatically download images from web pages.',
    'Descargar Imágenes con IA': 'AI Image Downloader',
    'Generación y descarga de imágenes usando inteligencia artificial.':
      'Image generation and download using artificial intelligence.',
    'IA': 'AI',
    'Ollama Currículum': 'Ollama Résumé',
    'Aplicación que usa IA local (Ollama) para analizar y mejorar currículums automáticamente.':
      'App that uses local AI (Ollama) to automatically analyse and improve résumés.',
    'Web Adopciones': 'Pet Adoption Website',
    'Plataforma web para gestión de adopciones de mascotas con panel de administración.':
      'Web platform to manage pet adoptions, with an admin panel.',
    'IA para Dietética': 'AI for Nutrition',
    'Aplicación de inteligencia artificial aplicada al ámbito de la nutrición y dietética.':
      'Artificial intelligence app applied to nutrition and dietetics.',
    'IA Inicial': 'AI Basics',
    'Proyecto de iniciación a la inteligencia artificial con modelos y ejemplos básicos.':
      'Introductory artificial intelligence project with basic models and examples.',
    'Colección de diseños y creación de logotipos con herramientas de diseño.':
      'Collection of designs and logo creation with design tools.',
    'Proyecto con el motor de plantillas Pug para generación dinámica de HTML.':
      'Project using the Pug template engine to generate HTML dynamically.',
    'Práctica y maquetación de interfaces con el framework Tailwind CSS.':
      'Interface layout practice with the Tailwind CSS framework.',
    'Web con Panel de Control': 'Website with Control Panel',
    'Sitio web completo con panel de control integrado para gestión de contenido.':
      'Complete website with a built-in control panel for content management.',
    'Aplicación web para gestión de entrenamientos y rutinas de ejercicio.':
      'Web app to manage workouts and exercise routines.',
    'Tienda online de productos para mascotas con catálogo y sistema de compra.':
      'Online pet store with catalogue and checkout system.',
    'Panel de Control Pet Shop': 'Pet Shop Control Panel',
    'Panel de administración para gestión del inventario y pedidos de la tienda Pet Shop.':
      'Admin panel to manage inventory and orders for the Pet Shop store.',
    'Tienda de Juguetes': 'Toy Store',
    'Panel de administración para gestión completa de una tienda de juguetes.':
      'Admin panel for the complete management of a toy store.',
    'Tienda Juguetes Mejorada': 'Improved Toy Store',
    'Versión mejorada de la tienda de juguetes con nuevas funcionalidades y diseño optimizado.':
      'Improved version of the toy store with new features and an optimised design.',
    'Blog Conia · Artículos': 'Blog Conia · Articles',
    'Sistema de publicación y gestión de contenidos para blog con arquitectura dinámica.':
      'Blog publishing and content management system with a dynamic architecture.',
    'Landing Curso IA': 'AI Course Landing Page',
    'Rediseño de landing page para curso de inteligencia artificial. Orientada a conversión y UX.':
      'Landing page redesign for an artificial intelligence course. Focused on conversion and UX.',
    'Panel de administración para gestión de posts y contenido digital de la fotógrafa Thais Esteve.':
      'Admin panel to manage posts and digital content for photographer Thais Esteve.',
    'Posicionamiento SEO': 'SEO Ranking',
    'Análisis y optimización de posicionamiento orgánico aplicado a sitios web reales.':
      'Organic search ranking analysis and optimisation applied to real websites.',
    'Herramienta de extracción y procesamiento automático de datos desde páginas web.':
      'Tool for automatic data extraction and processing from web pages.',
    'Sistema de Automatización de Correos': 'Email Automation System',
    'Sistema automatizado de gestión de correos electrónicos. Lectura, clasificación y respuesta automática de emails.':
      'Automated email management system. Reads, classifies and automatically replies to emails.',
    'Automatización': 'Automation',
    'Generador de Presupuestos y Facturas': 'Quote & Invoice Generator',
    'Aplicación web para generar automáticamente presupuestos y facturas de forma rápida y profesional.':
      'Web app to automatically generate quotes and invoices quickly and professionally.',
    'Plataforma de Clasificación Documental': 'Document Classification Platform',
    'Plataforma inteligente para clasificar y organizar documentos automáticamente usando IA.':
      'Smart platform to automatically classify and organise documents using AI.',
    'Herramienta de Extracción Automática de Datos': 'Automatic Data Extraction Tool',
    'Herramienta para extraer y procesar datos de forma automática desde distintas fuentes web.':
      'Tool to automatically extract and process data from different web sources.',
    'Asistente Virtual Interno para Empleados': 'Internal Virtual Assistant for Employees',
    'Asistente virtual con IA para que los empleados puedan consultar procedimientos internos de forma rápida y sencilla.':
      'AI virtual assistant so employees can look up internal procedures quickly and easily.',
    'Chatbot de Atención al Cliente': 'Customer Service Chatbot',
    'Chatbot integrado en página web para atención al cliente automatizada con IA.':
      'Chatbot embedded in a website for AI-powered automated customer service.',
    'Sistema de Respuesta Automática a Consultas': 'Automatic Query Response System',
    'Sistema automatizado que responde consultas frecuentes de clientes usando IA.':
      'Automated system that answers frequent customer questions using AI.',
    'Plataforma de Análisis de Ventas': 'Sales Analytics Platform',
    'Plataforma que genera informes automáticos y detecta tendencias comerciales a partir de datos de ventas.':
      'Platform that generates automatic reports and detects business trends from sales data.',
    'Panel de Control Empresarial con KPIs': 'Business Dashboard with KPIs',
    'Panel de control empresarial con indicadores clave de rendimiento generados automáticamente.':
      'Business dashboard with automatically generated key performance indicators.',
    'Sistema Predictivo de Demanda y Ventas': 'Demand & Sales Forecasting System',
    'Sistema predictivo básico para estimación de demanda y previsión de ventas futuras mediante IA.':
      'Basic predictive system to estimate demand and forecast future sales with AI.',
    'Datos': 'Data',
    'Segmentación Automática de Clientes': 'Automatic Customer Segmentation',
    'Herramienta que segmenta clientes automáticamente según su comportamiento de compra usando IA.':
      'Tool that automatically segments customers by purchasing behaviour using AI.',
    'Herramienta para gestionar, convertir y manipular archivos PDF de forma sencilla.':
      'Tool to easily manage, convert and edit PDF files.',
    'Seguimiento Inteligente de Oportunidades Comerciales': 'Smart Sales Opportunity Tracking',
    'Sistema inteligente de seguimiento de oportunidades comerciales y generación de alertas de negocio.':
      'Smart system to track sales opportunities and generate business alerts.',
    'Asistente WhatsApp': 'WhatsApp Assistant',
    'Asistente inteligente integrado en WhatsApp para automatizar respuestas y gestionar consultas.':
      'Smart assistant built into WhatsApp to automate replies and handle enquiries.',
    'Automatización de Procesos Administrativos': 'Administrative Process Automation',
    'Automatización de procesos administrativos repetitivos mediante flujos de trabajo digitales.':
      'Automation of repetitive administrative processes through digital workflows.',
    'Flujos': 'Workflows',
    'Plataforma de Digitalización de Documentos': 'Document Digitisation Platform',
    'Plataforma de digitalización y organización centralizada de documentos empresariales.':
      'Platform to digitise and centrally organise business documents.',
    'Asistente para Generación de Informes Empresariales': 'Business Report Generation Assistant',
    'Asistente para la generación automática de informes empresariales periódicos con IA.':
      'Assistant for the automatic generation of periodic business reports with AI.',
    'Herramienta de Apoyo a la Toma de Decisiones': 'Decision Support Tool',
    'Herramienta de apoyo a la toma de decisiones basada en análisis automático de datos históricos.':
      'Decision support tool based on automatic analysis of historical data.',
    'Sistema de Análisis de Satisfacción del Cliente': 'Customer Satisfaction Analysis System',
    'Sistema de análisis de satisfacción del cliente mediante procesamiento de opiniones.':
      'Customer satisfaction analysis system through review processing.',
    'Copiloto Empresarial con Documentación Interna': 'Business Copilot with Internal Docs',
    'Copiloto empresarial entrenado con la documentación interna de la empresa para asistir a empleados.':
      "Business copilot trained on the company's internal documentation to help employees.",
    'Sistema de Automatización de Recursos Humanos': 'HR Automation System',
    'Automatización de tareas de recursos humanos como gestión de solicitudes y currículos.':
      'Automation of HR tasks such as handling applications and résumés.',
    'Plataforma de Control y Análisis de Productividad': 'Productivity Monitoring & Analysis Platform',
    'Plataforma para el control y análisis de productividad interna de equipos y empresas.':
      'Platform to monitor and analyse the internal productivity of teams and companies.',
    'Generación Automática de Contenidos Corporativos': 'Automatic Corporate Content Generation',
    'Herramienta de generación automática de contenidos comerciales y comunicaciones corporativas con IA.':
      'Tool to automatically generate marketing content and corporate communications with AI.',
    'Sistema de Apoyo a la Gestión Comercial': 'Sales Management Support System',
    'Sistema que sugiere acciones de seguimiento con clientes para apoyar la gestión comercial.':
      'System that suggests customer follow-up actions to support sales management.',
    'Juego de aventura noir interactivo con narrativa y toma de decisiones.':
      'Interactive noir adventure game with narrative and decision-making.',
    'Juego': 'Game',
    'Plataforma de Digitalización para Pequeñas Empresas': 'Digitisation Platform for Small Businesses',
    'Plataforma de digitalización accesible para pequeñas empresas con implantación rápida y bajo coste.':
      'Affordable digitisation platform for small businesses with fast, low-cost rollout.',
    'Servicio de Auditoría Tecnológica Empresarial': 'Business Technology Audit Service',
    'Servicio de auditoría tecnológica y diagnóstico de madurez digital empresarial.':
      'Technology audit and digital maturity assessment service for businesses.',
    'Plataforma de Integración de Datos Empresariales': 'Business Data Integration Platform',
    'Plataforma de integración de datos procedentes de distintos programas empresariales existentes.':
      'Platform that integrates data coming from different existing business software.',
    'Sistema de Implantación Progresiva de IA': 'Progressive AI Adoption System',
    'Sistema de implantación progresiva de IA adaptado al crecimiento de la empresa.':
      'System for progressive AI adoption adapted to the growth of the company.',
    'Organización Automática de Agendas y Tareas': 'Automatic Schedule & Task Organiser',
    'Herramienta de organización automática de agendas y tareas empresariales con IA.':
      'Tool to automatically organise business schedules and tasks with AI.',
    'Sistema de Automatización de Atención Postventa': 'After-Sales Service Automation System',
    'Sistema de automatización de procesos de atención postventa al cliente.':
      'System to automate after-sales customer service processes.',
    'Servicio de Mantenimiento de Soluciones IA': 'AI Solutions Maintenance Service',
    'Servicio de mantenimiento y mejora continua de soluciones de inteligencia artificial implantadas.':
      'Maintenance and continuous improvement service for deployed artificial intelligence solutions.',
    'Aplicación web desarrollada con Python y Flask.': 'Web app built with Python and Flask.',
    'Sistema RAG (Retrieval-Augmented Generation) personalizado con IA local.':
      'Custom RAG (Retrieval-Augmented Generation) system with local AI.',
    'Carta Digital con IA para Restaurantes': 'AI Digital Menu for Restaurants',
    'Carta digital interactiva con IA para restaurantes, con recomendaciones personalizadas.':
      'Interactive AI-powered digital menu for restaurants, with personalised recommendations.',
    'Plataforma de Gestión de Candidatos con IA': 'AI Candidate Management Platform',
    'Plataforma para la gestión de candidatos en procesos de selección asistida por IA.':
      'Platform to manage candidates in AI-assisted recruitment processes.',
    'Plataforma para crear portfolios profesionales con IA de forma rápida y sencilla.':
      'Platform to create professional portfolios with AI quickly and easily.',
    'Asistente inteligente desarrollado con Python e IA local.': 'Smart assistant built with Python and local AI.',
    'Fichaje Labora TAME': 'Labora TAME Time Tracking',
    'Sistema de control de fichaje para TAME Formación integrado con Labora.':
      'Time and attendance system for TAME Formación integrated with Labora.',
    'Plataforma de gestión y automatización para Labora desarrollada para TAME Formación.':
      'Management and automation platform for Labora built for TAME Formación.',
    'Sistema de gestión de prácticas y formación para TAME Formación integrado con Labora.':
      'Internship and training management system for TAME Formación integrated with Labora.',
    'SaaS Competencia': 'Competitor SaaS',
    'Herramienta SaaS para el análisis y seguimiento de la competencia empresarial.':
      'SaaS tool to analyse and monitor business competitors.',
    'Seguimiento de partidas de juegos de mesa con ranking Elo multijugador, recomendador y asistente IA.':
      'Board game match tracker with multiplayer Elo ranking, recommender and AI assistant.',
    'Juego de coches deportivos en 3D desarrollado desde cero.': '3D sports car game built from scratch.',
    'Gestión de Información en Ficheros': 'File-Based Information Management',
    'Sistema de gestión de información almacenada en ficheros con Python.':
      'Python system to manage information stored in files.',
    'Ficheros': 'Files',
    'Interfaz de usuario personalizada desarrollada con HTML, CSS y JavaScript.':
      'Custom user interface built with HTML, CSS and JavaScript.',

    // ---- experiencia
    'Trayectoria': 'Career', 'profesional': 'so far',
    '13/05/2026 — 16/06/2026 · Prácticas': '13/05/2026 — 16/06/2026 · Internship',
    'Programadora': 'Developer',
    '100 horas de prácticas de programación': '100-hour programming internship',
    'Desarrollo de 3 programas de gestión para la automatización de procesos administrativos':
      'Built 3 management programs to automate administrative processes',
    '2022 — Actual': '2022 — Present', 'Administrativa': 'Administrative Assistant',
    'Atención telefónica y presencial': 'Phone and in-person customer service',
    'Gestión documental e informes': 'Document management and reporting',
    'Marketing y redes sociales': 'Marketing and social media',
    'Plan de igualdad empresarial': 'Company equality plan',
    '3 meses · Plan Social': '3 months · Social employment plan',
    'NEMASA · Ayuntamiento': 'NEMASA · City Council',
    'Control de fichajes': 'Time and attendance control',
    'Documentación e informes': 'Documentation and reports',
    '3 meses · Prácticas': '3 months · Internship',
    'Gestión documental': 'Document management',
    'Redacción de comunicaciones': 'Writing communications',
    'Búsqueda de información': 'Information research',

    // ---- formación
    'Formación': 'Learning', 'Educación &': 'Education &', 'conocimiento': 'knowledge',
    'Formación académica': 'Academic background',
    'Desarrollo de aplicaciones multiplataforma': 'Cross-Platform Application Development (DAM)',
    'Cursando actualmente': 'Currently studying',
    'Técnico Auxiliar Administrativo': 'Administrative Assistant Technician',
    'Educación Secundaria': 'Secondary Education',
    'Idiomas': 'Languages', 'Español': 'Spanish', 'Nativo': 'Native', 'Valenciano': 'Valencian',
    'Alto': 'Advanced', 'Inglés': 'English', 'A2 · En progreso': 'A2 · Improving',
    'Formación complementaria': 'Additional training',
    'IA aplicada a la empresa': 'AI applied to business', 'Planes de igualdad': 'Equality plans',
    'Gestión SEM': 'SEM management', 'Social Media nivel 1 y 2': 'Social Media levels 1 & 2',
    'Mecanografía avanzada': 'Advanced touch typing', 'Office avanzado': 'Advanced Office',

    // ---- contacto
    '¿Trabajamos': 'Shall we', 'juntos?': 'work together?',
    'Estoy disponible para proyectos, colaboraciones y nuevas oportunidades. Escríbeme sin compromiso.':
      "I'm available for projects, collaborations and new opportunities. Feel free to get in touch.",
    'Instalar app': 'Install app', '📲 Instalar app': '📲 Install app',
    'Teléfono': 'Phone', 'Ubicación': 'Location', 'Enviar mensaje': 'Send a message',

    // ---- estética nueva: destacados, stack, pie
    'IA y marketing': 'AI & marketing',
    '# stack.py · lo que uso para construir cosas ✨': '# stack.py · what I use to build things ✨',
    '"tecnologías y aprendiendo más 🚀"': '"technologies and still learning 🚀"',
    'tecnologías y aprendiendo más 🚀': 'technologies and still learning 🚀',
    'Código Python con las tecnologías que uso': 'Python code with the technologies I use',
    'serena@portafolio': 'serena@portfolio',
    'Nivel 3 de 5': 'Level 3 of 5', 'Nivel 4 de 5': 'Level 4 of 5',
    'Enlaces del pie': 'Footer links', 'Hecho con ♥ y WebGL': 'Made with ♥ and WebGL',

    // ---- atributos (aria-label, alt…)
    'Abrir menú': 'Open menu',
    'Ilustración de Serena con su portátil': 'Illustration of Serena with her laptop',
    'Páginas de proyectos': 'Project pages',
    'Filtrar proyectos': 'Filter projects',
    'Cambiar idioma': 'Change language',
    'Cambiar a modo oscuro': 'Switch to dark mode',
    'Cambiar a modo claro': 'Switch to light mode',

    // ---- filtros de proyectos (los crea el JS)
    'Todos': 'All', 'Web': 'Web', 'Juegos y 3D': 'Games & 3D',

    // ---- metadatos
    'Serena Sania Esteve · Full Stack Developer en Valencia. Python, PHP, JavaScript, IA aplicada y más de 70 proyectos.':
      'Serena Sania Esteve · Full Stack Developer in Valencia, Spain. Python, PHP, JavaScript, applied AI and 70+ projects.'
  };

  // Cada idioma tiene su página: / (español) y /en/ (inglés, generada por
  // scripts/build.py con este mismo diccionario). Aquí solo se traducen los
  // textos que crea el JavaScript (filtros, paginación…) y se cambia de página.
  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';

  function t(es) { return lang === 'en' && EN[es] ? EN[es] : es; }

  function setLang(l) {
    l = l === 'en' ? 'en' : 'es';
    try { localStorage.setItem('lang', l); } catch (e) { /* sin almacenamiento */ }
    if (l === lang) return;
    // desde / se va a en/ y desde /en/ se vuelve a ../ (funciona también en local)
    location.href = (lang === 'en' ? '../' : 'en/') + location.hash;
  }

  window.I18N = {
    t: t,
    setLang: setLang,
    get lang() { return lang; },
    EN: EN
  };
})();
