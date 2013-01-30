backbone-views-demo
===================

Un ejemplo del manejo de Vistas, Modelos y Colecciones en Backbone.

Y ahora tambien con Socket.io!

## Ejecucion ##

Para ejecutar este ejemplo solo se requiere tener instalado Node.js en el equipo. Una vez que se tenga el codigo bastara con instalar las dependencias del proyecto y ejecutarlo.

### Para instalar las dependencias ###

```
npm install
```

### Para ejecutar el ejemplo ###

```
node app.js
```

Una vez ejecutado el ejemplo, bastata con abrir el navegador y abrir [http://localhost:3000](http://localhost:3000)

## Codigo ##

### Mini API ###

El "API" de este ejemplo no necesita ninguna base de datos, solo guarda los valores en memoria mientras se este ejecutando el ejemplo en Node.js. Una vez que se finaliza la ejecucion todos los registros se eliminaran.

El codigo relevante al "API" se encuentra en app.js.

### UI ###

El codigo del navegador se encuentra en la carpeta public/ en dos archivos: index.html y js/main.js.

## Licencia ##

Este ejemplo cuenta con una licencia [MIT](http://opensource.org/licenses/MIT)