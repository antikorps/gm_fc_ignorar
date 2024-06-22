// ==UserScript==
// @name         Ocultar hilos de usuarios ignorados
// @namespace    gm_fc_ignorar
// @version      0.1
// @description  Script de usuario para ocultar/ignorar hilos de usuarios en Forocoches
// @author       antikorps@gmail
// @match        https://forocoches.com/foro/forumdisplay.php?f=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=forocoches.com
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/src/FileSaver.js
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

(async function () {
    'use strict';

    const DEBUG = false

    const ESTILOS = `

    .gm-fc-ignorar-oculto {
        display: none !important;
    }

    #gm-fc-ignorar {
       width: 80vw;
        height: 80vh;
        position: fixed;
        margin: 0 auto;
        margin-left: 10vw;
        margin-top: 10vh;
        background: #333;
        border-radius: 12px;
        border: 6px solid #f2f2f2;
        color: white;
        padding: 20px;
        box-shadow: 2px 0px 0px 14px rgba(0,0,0,0.75);
    }

    #gm-fc-ignorar-panel {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    #gm-fc-ignorar-panel span {
        cursor:pointer;
    }

    #gm-fc-ignorar-panel span:hover {
        opacity: 0.6;
    }

    #gm-fc-ignorar p,
    #gm-fc-ignorar textarea {
        color: white;
    }

    #gm-fc-ignorar button {
        padding: 6px 10px;
        border-radius: 12px;
    }

    #gm-fc-ignorar details {
        margin: 20px 0;
        cursor: pointer;
    }

    #gm-fc-ignorar textarea {
        width: 100%;
        margin: 20px 0 20px 0;
        min-height: 100px;
    }

    #gm-fc-ignorar-lotes {
        display: block;
	    margin: 20px 0;
    }
    #gm-fc-ignorar-lotes input[type="file"] {
        margin: 30px 0;
        display: block;
    }

    `

    const MODAL = `
<div id="gm-fc-ignorar" class="gm-fc-ignorar-oculto">
      <div id="gm-fc-ignorar-panel">
        <h4>Gestor de acciones</h4>
        <span>X</span>
      </div>
      <div id="gm-fc-ignorar-contenido">
        <details>
            <summary>Gestión manual</summary>
            <p>Controla manualmente el grueso de usuarios, eliminando registros o añadiendo nuevos.</p>
            <button id="gm-fc-ignorar-manual-cargar">Cargar</button>
            <button id="gm-fc-ignorar-manual-exportar">Exportar</button>
            <form id="gm-fc-ignorar-manual">
                <textarea id="gm-fc-ignorar-manual-entrada" required></textarea>
                <button type="submit">Guardar</button>
            </form>
        </details>
        <details>
            <summary>Gestión por lotes</summary>
            <form id="gm-fc-ignorar-lotes">
                <label>
                    <input type="radio" name="gm-fc-ignorar-lotes-opcion" value="incorporar" checked>
                    Incorporar
                </label>
                <label>
                    <input type="radio" name="gm-fc-ignorar-lotes-opcion" value="eliminar">
                    Eliminar
                </label>
                <label>
                    <input type="radio" id="html" name="gm-fc-ignorar-lotes-opcion" value="sobreescribir">
                    Sobreescribir
                </label>

                <input type="file" required>
                <button type="submit">Procesar</button>
            </form>
        </details>
      </div>
</div>`

    /**
     * Incorporar CSS en un tag style en el head  
     */
    function inyectarCSS(estilos) {
        let el = document.createElement('style')
        el.innerText = estilos
        document.head.appendChild(el)
    }

    /**
     * Guardar la coleccion de usuarios ignorados
     */
    async function guardarColeccionIgnorados(coleccion) {
        const data = JSON.stringify(coleccion)
        await GM.setValue("gm-fc-ignorar", data)
    }

    /*
    * Recuperar la coleccion de usuarios ignorados
    */
    async function recuperarColeccionIgnorados() {
        const data = await GM.getValue("gm-fc-ignorar", "[]")
        return JSON.parse(data)
    }

    /**
     * Añade los registros no incluidos a una colección 
     * Retorna coleccion y número de afectados
     */
    function incorporarRegistrosColeccion(registros, coleccion) {
        let afectados = 0
        for (const registro of registros) {
            if (registro == "") {
                continue
            }
            if (coleccion.includes(registro)) {
                continue
            }
            coleccion.push(registro)
            afectados++
        }
        return [coleccion, afectados]
    }

    /**
     * Elimina los registros incluidos en una colección
     * Retorna colección y número de afectados
     */
    function eliminarRegistroColeccion(registros, coleccion) {
        const nuevaColeccion = []
        let afectados = 0

        for (const item of coleccion) {
            if (item === "") {
                continue
            }
            if (registros.includes(item)) {
                afectados++
                continue
            }
            nuevaColeccion.push(item);
        }

        return [nuevaColeccion, afectados];
    }

    /**
     * Leer archivo de texto
     */
    function leerArchivoTexto(archivo) {
        return new Promise((resolve, reject) => {
            const manejador = new FileReader()
            manejador.onload = (evento) => {
                resolve(evento.target.result)
            }
            manejador.onerror = (error) => {
                reject(error)
            }
            manejador.readAsText(archivo)
        });
    }

    /**
     * Devuelve el contenido dividido en líneas
     */
    function dividirEnLineas(texto) {
        return texto.split(/\r\n|\r|\n/).filter(function (valor) {
            return valor != ""
        })
    }

    /**
     * Cierra el modal añadiendo una clase con display:none
     */
    function cerrarModal() {
        $modal.classList.add("gm-fc-ignorar-oculto")
    }

    /**
     * Abre el modal eliminando clase con display:none
     */
    function abrirModal() {
        $modal.classList.remove("gm-fc-ignorar-oculto")
    }

    /**
     * Convierte en texto una colección con saltos de línea
     * Retorna texto y número de registros
     */
    function convertirTextoColeccion(coleccion) {
        let texto = ""
        for (const elemento of coleccion) {
            texto += `${elemento}\n`
        }
        texto = texto.trimEnd()
        return [texto, coleccion.length]
    }

    /**
     * Recupera el contenido textual de una colección 
     * con el número de registros
     */
    async function recuperarContenidoColeccion() {
        const coleccion = await recuperarColeccionIgnorados()
        return convertirTextoColeccion(coleccion)
    }

    /**
     * Búsqueda en el DOM de hilo/autor del tema moderno para ocultar en caso de que el autor este ignorado
     */
    async function ocultarHilosIgnoradosTemaModerno(ignorados) {
        const $hilos = document.querySelectorAll('a[id^="thread_title_"]')
        for (const $hilo of $hilos) {
            const $contenedor = $hilo.parentElement.parentElement.parentElement
            const $enlaces = $contenedor.querySelectorAll("a")
            for (const $enlace of $enlaces) {
                const atributoId = $enlace.getAttribute("id")
                if (atributoId != undefined) {
                    continue
                }
                const contenido = $enlace.innerText
                const busquedaAutor = contenido.split(" - Actualizado")
                if (busquedaAutor.length < 2) {
                    continue
                }
                const autor = busquedaAutor[0].slice(1)
                if (ignorados.includes(autor)) {
                    if (DEBUG) {
                        $contenedor.style.direction = "rtl"
                        return
                    }
                    $contenedor.remove()                    
                }
            }
        }
    }

    /**
    * Búsqueda en el DOM de hilo/autor del tema clásico para ocultar en caso de que el autor este ignorado
    */
    async function ocultarHilosIgnoradosTemaClasico(ignorados) {
        const $hilos = document.querySelectorAll('a[id^="thread_title_"]')
        for (const $hilo of $hilos) {
            const $contenedor = $hilo.closest("tr")
            const $spans = $contenedor.querySelectorAll("span")
            for (const $span of $spans) {
                const atributoOnClick = $span.getAttribute("onclick")
                if (atributoOnClick == null) {
                    continue
                }

                if (!atributoOnClick.startsWith("window.open('member")) {
                    continue
                }
                const autor = $span.innerText
                if (ignorados.includes(autor)) {
                    if (DEBUG) {
                        $contenedor.style.direction = "rtl"
                        return
                    }
                    $contenedor.remove()                    
                }
            }
        }
    }




    // INICIAR SCRIPT DE USUARIO
    document.querySelector('body').insertAdjacentHTML('afterbegin', MODAL);
    inyectarCSS(ESTILOS)
    const ignorados = await recuperarColeccionIgnorados()
    ocultarHilosIgnoradosTemaClasico(ignorados)
    ocultarHilosIgnoradosTemaModerno(ignorados)
    

    /*
    
      SELECTORES
    ===============
    
    */
    const $modal = document.querySelector("#gm-fc-ignorar")
    const $manualEntrada = document.querySelector("#gm-fc-ignorar-manual-entrada")

    const $manualForm = document.querySelector("#gm-fc-ignorar-manual")
    const $manualCargar = document.querySelector("#gm-fc-ignorar-manual-cargar")
    const $manualExportar = document.querySelector("#gm-fc-ignorar-manual-exportar")

    const $lotesForm = document.querySelector("#gm-fc-ignorar-lotes")

    /*
    
        EVENTOS
    ===============
    
    */

    $modal.querySelector("#gm-fc-ignorar-panel span").addEventListener("click", cerrarModal)

    // GESTIÓN MANUAL
    $manualForm.addEventListener("submit", async function (evento) {
        evento.preventDefault()
        const coleccion = dividirEnLineas($manualEntrada.value)
        await guardarColeccionIgnorados(coleccion)
        alert(`Lista guardada con ${coleccion.length} usuarios ignorados`)
    })

    $manualCargar.addEventListener("click", async function () {
        const [contenido, numeroRegistros] = await recuperarContenidoColeccion()
        $manualEntrada.value = contenido
        alert(`Existen ${numeroRegistros} usuarios ignorados`)
    })

    $manualExportar.addEventListener("click", async function () {
        const [contenido, numeroRegistros] = await recuperarContenidoColeccion()
        var archivo = new Blob([contenido], { type: "text/plain;charset=utf-8" });
        saveAs(archivo, "gm_fc_ignorar_usuarios_ignorados.txt");
        alert(`Lista exportada con ${numeroRegistros} usuarios ignorados`)
    })

    // GESTIÓN POR LOTES
    $lotesForm.addEventListener("submit", async function (evento) {
        evento.preventDefault()
        const tipo = document.querySelector('input[name="gm-fc-ignorar-lotes-opcion"]:checked').value
        const archivo = $lotesForm.querySelector('input[type="file"]').files[0]
        const contenido = await leerArchivoTexto(archivo)
        const registros = dividirEnLineas(contenido)

        const coleccionExistente = await recuperarColeccionIgnorados()

        let mensaje = ""
        if (tipo === "incorporar") {
            const [coleccion, afectados] = incorporarRegistrosColeccion(registros, coleccionExistente)
            await guardarColeccionIgnorados(coleccion)
            mensaje = `Lista de usuarios ignorados actualizada. Se han incorporado ${afectados} usuarios`
        }

        if (tipo === "eliminar") {
            const [coleccion, afectados] = eliminarRegistroColeccion(registros, coleccionExistente)
            await guardarColeccionIgnorados(coleccion)
            mensaje = `Lista de usuarios ignorados actualizada. Se han eliminado ${afectados} usuarios`
        }

        if (tipo === "sobreescribir") {
            await guardarColeccionIgnorados(registros)
            mensaje = `Lista de usuarios ignorados actualizada con un total de ${registros.length} usuarios`
        }

        alert(mensaje)
        $lotesForm.reset()
    })


    // MANEJADORES TECLADO
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape') {
            cerrarModal()
            return
        }
        if (evento.ctrlKey && evento.altKey && evento.key === "i") {
            abrirModal()
            return
        }
    });

})();
