# Ocultar hilos de usuarios ignorados
Script de usuario para usar con GreaseMonkey o equivalente (TamperMonkey, ViolentMonkey, etc.) que permite gestionar una colección de usuarios ignorados y ocultar sus hilos.

## Uso
### Configuración TamperMonkey/GreaseMonkey
Para evitar múltiples ejecuciones causadas por iframes, publicidad, etc., se recomienda configurar su ejecución únicamente en el top frame. 

Esto puede hacerse desde la pestaña **Configuración**

<img src="https://i.imgur.com/cfM3zwJ.png">

La ventana de gestión se acciona haciendo foco en el contenido de la página y pulsando la combinación **Control + Alt + i** o a través del **icono del escudo** que aparecerá en la parte superior de la página

<img src="https://i.imgur.com/wr8oX2L.png">


Existen 2 formas de gestionar la colección de usuarios ignorados.

### Gestión manual
- Cargar: muestrar todos los usuarios ignorados.
- Exportar: generar un archivo .txt con los usuarios ignorados de forma que se puede compartir, intercambiar, etc.
- Guardar: creará una colección de usuarios ignorados a partir del contenido de área de texto. Recuerda que cada usuario debe estar en una línea y debe coincidir completamente con el nombre de usuario (mayúsculas, miníusculas, símbolos, espacios, etc.)

### Gestión por lotes
Permite operaciones masivas usando archivos de texto en los que se espera un usuario en cada línea.
- Incorporar: añade a la lista de usuarios ignorados aquellos que no estén presentes.
- Eliminar: suprimer de la lista de usuarios ignorados aquellos que aparecen en la colección.
- Sobreescribir: la colección de usuarios ignorados se conformará exactamente por los usuarios presentes en el archivo.

### Depuración de errores / Debug
La modificación de la variable DEBUG a **true** ayuda a la depuración de errores al no llegar a eliminar el hilo, simplemente cambiará la dirección del texto para que sea fácilmente identificable. 

### Agradecimientos
Agradecer a illokedise por la idea, las sugerencias y la ayuda prestada.
