// ==UserScript==
// @name         Ocultar hilos de usuarios ignorados
// @namespace    gm_fc_ignorar
// @version      1.0
// @description  Script de usuario para ocultar/ignorar hilos de usuarios ignorados
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

    #gm-fc-ignorar * {
        font-size: large
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
        color: white !important;
    }
    #gm-fc-ignorar textarea {
        background: #333;
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

    #gm-fc-ignorar-icono {
        display: inline-flex;
        background: red;
        padding: 5px;
        border-radius: 12px;
        cursor:pointer;
    }

     #gm-fc-ignorar-icono div {
        color: white;
    }

    `
    const MODAL = `
<div id="gm-fc-ignorar" class="gm-fc-ignorar-oculto">
      <div id="gm-fc-ignorar-panel">
        <h4>Script de usuario para ocultar hilos de usuarios ignorados</h4>
        <span>X</span>
      </div>
      <div id="gm-fc-ignorar-contenido">
        <details>
            <summary>Gestión manual</summary>
            <p>Controla manualmente el grueso de usuarios, eliminando registros o añadiendo nuevos. 
            Incorpora un usuario por línea.</p>
            <button id="gm-fc-ignorar-manual-cargar">Cargar</button>
            <button id="gm-fc-ignorar-manual-exportar">Exportar</button>
            <form id="gm-fc-ignorar-manual">
                <textarea id="gm-fc-ignorar-manual-entrada" required></textarea>
                <button type="submit">Guardar</button>
            </form>
        </details>
        <details>
            <summary>Gestión por lotes</summary>
            <p>Utiliza un archivo de texto para hacer operaciones masivas. 
            Incorpora un usuario por línea.</p>
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

                <input type="file" accept=".txt, .csv" required>
                <button type="submit">Procesar</button>
            </form>
        </details>
        <button id="gm-fc-ignorar-mostrar">Mostrar hilos ocultos</button>
      </div>
</div>`

    const ICONO = `
<?xml version="1.0" encoding="UTF-8"?>
<svg width="35" height="35" clip-rule="evenodd" fill-rule="evenodd" image-rendering="optimizeQuality" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" version="1.1" viewBox="0 0 8500 11000" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
    <defs>
    <style type="text/css">
    <![CDATA[
        .fil0 {fill:white;fill-rule:nonzero}
    ]]>
    </style>
    </defs>


    <g transform="matrix(12.16 0 0 12.16 -58263 -50573)" fill="#f00">

        <path class="fil0" d="m4761.2 4317.5c142.64-3.06 281.81-57.78 389.72-150.83 97.22 96.94 233.2 147.64 369.31 150.97 8.75 126.25 4.03 254.58-23.75 378.47-36.94 175.69-189.17 314.58-358.61 359.86-146.8-45.69-279.44-156.53-334.3-302.64-47.08-139.58-50.83-290-42.36-435.83zm325.14 87.64c-111.8 26.67-185.56 152.22-153.19 262.78 26.25 110.97 151.25 185.28 261.25 153.06 113.2-25.56 188.2-154.58 153.2-265.69-27.36-110.28-152.08-181.39-261.25-150.14z"/>

    <path class="fil0" d="m5039.2 4497.6c52.36-49.17 134.03-48.61 192.78-11.25-71.67 73.47-144.17 146.11-217.64 217.78-42.22-64.03-35.69-156.25 24.86-206.53z"/>
    <path class="fil0" d="m5050 4739.2c71.39-73.06 144.03-144.72 216.39-216.81 44.03 62.64 36.25 155.7-23.19 205.83-52.08 49.03-134.86 49.58-193.2 10.97z"/>
    </g>

    </svg>`

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
     * Determina si el tema es el clásico
     */
    function esTemaClasico() {
        return !!document.querySelector("#AutoNumber1")
    }

    /**
     * Búsqueda en el DOM de hilo/autor del tema moderno para ocultar en caso de que el autor este ignorado
     */
    async function ocultarHilosIgnoradosTemaModerno(ignorados) {
        const $hilos = document.querySelectorAll('a[id^="thread_title_"]')
        let numeroHilosOcultos = 0
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
                    numeroHilosOcultos++
                    if (DEBUG) {
                        $contenedor.style.direction = "rtl"
                    } else {
                        //$contenedor.remove()
                        $contenedor.classList.add("gm-fc-ignorar-oculto")
                    }                    
                }
            }
        }
        indicarHilosOcultos(numeroHilosOcultos)
    }

    /**
    * Búsqueda en el DOM de hilo/autor del tema clásico para ocultar en caso de que el autor este ignorado
    */
    async function ocultarHilosIgnoradosTemaClasico(ignorados) {
        const $hilos = document.querySelectorAll('a[id^="thread_title_"]')
        let numeroHilosOcultos = 0
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
                    numeroHilosOcultos++
                    if (DEBUG) {
                        $contenedor.style.direction = "rtl"
                    } else {
                         //$contenedor.remove()
                         $contenedor.classList.add("gm-fc-ignorar-oculto")
                    }  
                }
            }
        }
        indicarHilosOcultos(numeroHilosOcultos)
    }

    /**
     * 
     * Insertar icono en el tema moderno
     */
    function insertarIconoTemaModerno() {
        const iconoHtml = `
        <div id="gm-fc-ignorar-icono">
            ${ICONO}
        <div id="gm-fc-ignorar-hilos-ocultos">0</div>
        </div>`
        const $posicion = document.querySelector("#header > div:nth-child(2)")
        if ($posicion == null) {
            return
        }
        $posicion.insertAdjacentHTML("afterend", iconoHtml)
    }
    /**
     * Insertar icono en el tema clásico
     */
    function insertarIconoTemaClasico() {
        const iconoHtml = `
        <div id="gm-fc-ignorar-icono">
            ${ICONO}
        <div id="gm-fc-ignorar-hilos-ocultos">0</div>
        </div>`
        const $posicion = document.querySelector("#AutoNumber1 > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3)")
        if ($posicion == null) {
            return
        }
        $posicion.insertAdjacentHTML("beforebegin", iconoHtml)
    }


    /**
     * Indicar número de hilos
     */
    function indicarHilosOcultos(numero) {
        const $indicador = document.querySelector("#gm-fc-ignorar-hilos-ocultos")
        if ($indicador == null) {
            return
        }
        $indicador.textContent = numero
    }

    /**
     * Mostrar hilos ocultos
     */

    function mostrarHilosOcultos() {
        const $elementosOcultos = document.querySelectorAll(".gm-fc-ignorar-oculto:not(#gm-fc-ignorar)")
        let hilosMostrados = 0
        for (const $elemento of $elementosOcultos) {
            $elemento.classList.remove("gm-fc-ignorar-oculto")
            hilosMostrados++
        }
        alert(`Se han mostrado ${hilosMostrados} hilos`)
        indicarHilosOcultos(0)
    }

    // INICIAR SCRIPT DE USUARIO
    document.querySelector('body').insertAdjacentHTML('afterbegin', MODAL);
    inyectarCSS(ESTILOS)
    const ignorados = await recuperarColeccionIgnorados()
    if (esTemaClasico()) {
        insertarIconoTemaClasico()
        document.querySelector("#gm-fc-ignorar-icono").addEventListener("click", abrirModal)
        ocultarHilosIgnoradosTemaClasico(ignorados)
    } else {
        insertarIconoTemaModerno()
        document.querySelector("#gm-fc-ignorar-icono").addEventListener("click", abrirModal)
        ocultarHilosIgnoradosTemaModerno(ignorados)
    }

    // https://svgdxfvector.com/product/ignore-shield-icon-eps-cdr-vector/

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
    $modal.querySelector("#gm-fc-ignorar-mostrar").addEventListener("click", mostrarHilosOcultos)

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
