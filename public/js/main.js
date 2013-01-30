$(function(){
	// Cambiar el estilo de Template de Underscore a Mustache
	_.templateSettings = {
		interpolate : /\{\{(.+?)\}\}/g
	};

	// Front Controller - Usado para disparar eventos "globales"
	var front_controller = _.extend({}, Backbone.Events);
	// Este "on" no es necesario, pero es practico para probar si se disparan
	// correctamente nuestros eventos
	front_controller.on('all', function(){
		console.log(arguments);
	});

	// Un modelo sencillo.
	// Notar que no hace falta definir la URL aqui pues la definiremos dentro de
	// la coleccion.
	var Patrocinador = Backbone.Model.extend({
		defaults: {
			id: null,
			nombre: '',
			url: '',
			banner: ''
		}
	});

	// Coleccion de modelos.
	// Asociamos la URL del servidor asi como el Modelo a usar.
	var Patrocinadores = Backbone.Collection.extend({
		url: '/api/patrocinadores',
		model: Patrocinador
	});

	// Vista principal de este ejemplo
	var TablaView = Backbone.View.extend({
		// Template de vista secundaria
		template_patrocinador: null,
		// Referencia al Front Controller para poder usarla y pasarla a las vistas
		// secundarias
		fc: null,

		// Constructor
		initialize: function() {
			_.bindAll(this);

			// Con this.options podemos accesar a todos los valores que nos hayan pasado con "new"

			this.fc = this.options.fc;
			this.template_patrocinador = this.options.template_patrocinador;

			// Bindeamos eventos del modelo a metodos de la vista.
			this.listenTo(this.model, 'reset', this.render);
			this.listenTo(this.model, 'add', this.add);
		},

		render: function() {
			// En caso de fetch, vacia la tabla y rellenala con lo que tenga el modelo
			this.$el.empty();
			this.model.each(this.add);

			return this;
		},


		add: function(patrocinador) {
			// Si el modelo agregado no tiene una vista, creale una asignandole los
			// datos que requiera.
			if (!patrocinador.view) {
				patrocinador.view = new PatrocinadorView({
					model:patrocinador,
					template: this.template_patrocinador
				});
			}

			// En este punto todos los modelos deberian tener vista, por lo que es
			// seguro simplemente pedir el render del mismo y agregar su HTML al DOM
			this.$el.append(patrocinador.view.render().el);
		}
	});

	// Vista de cada patrocinador en la tabla
	var PatrocinadorView = Backbone.View.extend({
		// Dado que esta vista esta dentro de una tabla, no queremos DIVs sino TRs
		tagName: 'tr',
		template: null,

		initialize: function() {
			_.bindAll(this);
			// Tomamos el string que venga de "new"
			this.template = _.template(this.options.template);
			// Bindeamos los eventos que nos interesen del modelo
			this.listenTo(this.model, 'change', this.render);
		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));

			this.delegateEvents();
			return this;
		}
	});

	// Una vista muy sencilla de un boton que solo dispara eventos al Front Controller
	var BotonAgregarView = Backbone.View.extend({
		// Las cadenas con los nombres de los eventos no deben estar referenciadas
		// directamente por valor para evitar errores al escribir los nombres
		// asi como para facilitar su implementacion; en vez de esto se deben usar
		// "constantes simbolicas" (js no maneja el concepto de constantes como tal)
		// con dichos valores.
		CLICK: 'boton_agregar_view.click',

		modal: null,

		initialize: function() {
			_.bindAll(this);
			// Tomamos la referencia del front controller que nos pasan en "new"
			this.fc = this.options.fc;
		},

		events: {
			'click': 'click'
		},

		click: function() {
			// El boton lo unico que realmente necesita conocer es la referencia al
			// Front Controller para poder notificar cuando le hayan dado clic.
			// De esta manera en teoria cualquier vista podria escuchar dicho evento
			// y reaccionar de la forma que mejor le convenga.
			this.fc.trigger(this.CLICK);
		}
	});

	// Vista para el dialogo de Agregar
	var AgregarView = Backbone.View.extend({
		// Las cadenas con los nombres de los eventos no deben estar referenciadas
		// directamente por valor para evitar errores al escribir los nombres
		// asi como para facilitar su implementacion; en vez de esto se deben usar
		// "constantes simbolicas" (js no maneja el concepto de constantes como tal)
		// con dichos valores.
		ADD: 'agregar_view.add',

		template: null,
		fc: null,

		events: {
			'click .btn-primary': 'add'
		},

		initialize: function() {
			_.bindAll(this);

			// Tomamos la referencia del front controller que nos pasan en "new"
			this.fc = this.options.fc;
			// Tomamos el string que venga de "new"
			this.template = _.template(this.options.template);

			// Bindeamos el evento del Front Controller que nos interesa conocer
			// cuando piden mostrar el dialogo (cuando dan click al boton agregar)
			this.listenTo(this.fc, BotonAgregarView.prototype.CLICK, this.show);
		},

		render: function() {
			this.$('.modal-body').html(this.template());

			return this;
		},

		show: function() {
			this.render();
			this.$el.modal();
		},

		add: function() {
			// Similar a como funciona el boton agregar, este dialogo no necesita
			// saber que se va a hacer con los datos que se introdujeron, solo
			// necesita notificar al mundo que se ha dado click al boton agregar y
			// enviar los datos que contenga el formulario.
			this.fc.trigger(this.ADD, {
				nombre: this.$('#inputNombre').val(),
				url: this.$('#inputURL').val(),
				banner: this.$('#inputBanner').val(),
			});
			this.$el.modal('hide');
		}
	});

	// Vista de notificacion individual
	// Avisa a los clientes que se ha agregado un nuevo Patrocinador. En caso
	// que el mensaje contenta un valor en milisegundos en "selfdestroy" la
	// notificacion se remueve a si misma.
	var NotificacionView = Backbone.View.extend({
		className: 'alert alert-info',
		mensaje: null,
		patrocinador: null,
		autodestruir: null,

		// Toma los datos recibidos en "new"
		initialize: function() {
			_.bindAll(this);
			this.mensaje = this.options.message || "";
			this.patrocinador = this.options.data || {};
			this.autodestruir = this.options.selfdestroy;
		},

		// Crea el elemento DOM usando la informacion proporcionada. En caso que
		// autodestruir contenga un valor, usa dicho numero como milisegundos
		// para autoremoverse.
		render: function() {
			this.$el.text(this.mensaje + ': ' + this.patrocinador.nombre);
			if (this.autodestruir) {
				setTimeout(this.remove, this.autodestruir);
			}
			return this;
		}
	});

	// Vista principal del notificador
	var NotificadorView = Backbone.View.extend({
		fc: null,

		// Toma los datos de "new".
		// Bindeamos para agregar nuevas Notificaciones segun lleguen. Es importante
		// notar que no estamos escuchando el socket directamente sino mediante
		// el Front Controller, lo cual nos da mas flexibilidad pues podemos
		// emitir el evento en cualquier momento o cambiar la tecnologia usada
		// sin afectar el codigo.
		initialize: function() {
			this.fc = this.options.fc;
			this.listenTo(this.fc, 'socket.message', this.notify);
		},

		notify: function(data) {
			var notificacion = new NotificacionView(data);
			this.$el.append(notificacion.render().el);
		}
	});

	// Instancia de nuestra coleccion de Patrocinador(es)
	patrocinadores = new Patrocinadores();
	// Con fetch obtenemos los datos del servidor.
	patrocinadores.fetch();
	// Bindeamos el evento del dialogo agregar a la coleccion dado que las
	// colecciones cuentan con el metodo "create" que facilita el crear y salvar
	// un modelo nuevo al servidor.
	patrocinadores.listenTo(front_controller, AgregarView.prototype.ADD, function(patrocinador) {
		this.create(patrocinador);
	});
	// Bindeamos el evento de mensaje nuevo para hacer que la coleccion se
	// actualize automaticamente (usando {update: true}). Es importante
	// notar que no estamos escuchando el socket directamente sino mediante
	// el Front Controller, lo cual nos da mas flexibilidad pues podemos
	// emitir el evento en cualquier momento o cambiar la tecnologia usada
	// sin afectar el codigo.
	patrocinadores.listenTo(front_controller, 'socket.message', function() {
		this.fetch({update:true});
	});

	// Arrancamos la aplicacion injectando (IoC) todas las referencias, IDs y
	// strings con los templates, de esta forma nuestro codigo queda mas limpio
	// y es mas facil de reusar.
	var tabla = new TablaView({
		el: '#tabla',
		model:patrocinadores,
		fc: front_controller,
		template_patrocinador: $('#templates #patrocinador').html(),
	});

	// Vista del dialogo para agregar nuevos registros.
	var agregar = new AgregarView({
		el: '#formulario-modal',
		fc: front_controller,
		template: $('#formulario').html()
	});

	// Vista del boton para abrir el dialogo agegar.
	var btn_agregar = new BotonAgregarView({
		el: '#btn-agregar',
		fc: front_controller
	});

	// Implementacion de Socket.io. Para evitar dependencia directa del mismo
	// se reenvian los eventos del socket mediante nuestro Front Controller
	// lo cual nos da mas flexibilidad pues podemos emitir el evento en cualquier
	// momento o cambiar la tecnologia usada sin afectar el codigo.
	var socket = io.connect(window.location.protocol + '//' + window.location.host);
	socket.on('message', function (data) {
		front_controller.trigger('socket.message', data);
	});

	// Vista del notificador
	var notificador = new NotificadorView({
		el: '#notificaciones',
		fc: front_controller
	})
});