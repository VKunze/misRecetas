
var Container = $('.container');
Container.imagesLoaded(function () {
    var filtroTipoComida = $('.filtro-tipo-comida');
    var filtroNombreReceta = $('#inputFiltroNombreReceta');
    var filtroNombreAutor = $('#inputFiltroNombreAutor');
    var filtroIngrediente = $('#inputFiltroIngrediente');

    filtroTipoComida.on('click', 'button', function () {
        $(this).addClass('active').siblings().removeClass('active');
        filtrar();
    });

    filtroNombreReceta.on('keyup', function () {
        filtrarPorNombreReceta()
        filtrar()
    })

    filtroNombreAutor.on('keyup', function () {
        filtrarPorNombreAutor()
        filtrar()
    })

    filtroIngrediente.on('keyup', function () {
        filtrarPorIngrediente()
        filtrar()
    })

});


function filtrar() {
    var filterValues = [];

    var tipoComidaFilterValue = obtenerValorFiltroTipoComida();
    if (tipoComidaFilterValue && tipoComidaFilterValue != "*") {
        filterValues.push(tipoComidaFilterValue);
    }
    if (document.getElementById('inputFiltroNombreReceta').value != "") {
        filterValues.push(".nombreRecetaFiltroOk");
    }
    if (document.getElementById('inputFiltroNombreAutor').value != "") {
        filterValues.push(".nombreAutorFiltroOk");
    }
    if (document.getElementById('inputFiltroIngrediente').value != "") {
        filterValues.push(".ingredienteFiltroOk");
    }

    agregarClasesASiempreVisibles(filterValues);
    $('.listaRecetas').isotope({
        itemSelector: '.elemento-grid-recetas',
        filter: filterValues.join('')
    });

}

function obtenerValorFiltroTipoComida() {
    var docsTiposComida = document.getElementsByClassName('boton-filtro-tipo-comida');
    var tipoComidaFilterValue = ''
    for (var i = 0; i < docsTiposComida.length; i++) {
        if (docsTiposComida[i].classList.contains('active')) {
            tipoComidaFilterValue = docsTiposComida[i].getAttribute('data-filter')
        }
    }
    return tipoComidaFilterValue
}

function agregarClasesASiempreVisibles(filterValues) {
    var grid = document.getElementById('listaRecetas');
    var siempreVisibles = grid.getElementsByClassName('siempreVisible');
    for (i = 0; i < siempreVisibles.length; i++) {
        for (j = 0; j < filterValues.length; j++) {
            siempreVisibles[i].classList.add(filterValues[j]);
        }
    }
}

function filtrarPorNombreReceta() {
    var filter = document.getElementById('inputFiltroNombreReceta').value.toLowerCase();

    var grid = document.getElementById('listaRecetas');
    var listaElementos = grid.getElementsByClassName('elemento-grid-recetas');

    for (i = 0; i < listaElementos.length; i++) {
        if (listaElementos[i].id != "elementoAgregarReceta") {
            if (obtenerNombreReceta(listaElementos[i]).toLowerCase().indexOf(filter) > -1) {
                listaElementos[i].classList.add('nombreRecetaFiltroOk');
            } else {
                listaElementos[i].classList.remove('nombreRecetaFiltroOk');
            }
        }
    }
}

function filtrarPorNombreAutor() {
    var filter = document.getElementById('inputFiltroNombreAutor').value.toLowerCase();
    var grid = document.getElementById('listaRecetas');
    var listaElementos = grid.getElementsByClassName('elemento-grid-recetas');

    for (i = 0; i < listaElementos.length; i++) {
        if (listaElementos[i].id != "elementoAgregarReceta") {
            autorReceta = obtenerAutor(listaElementos[i]);
            if (autorReceta.toLowerCase().indexOf(filter) > -1) {
                listaElementos[i].classList.add('nombreAutorFiltroOk');
            } else {
                listaElementos[i].classList.remove('nombreAutorFiltroOk');
            }
        }
    }
}

function filtrarPorIngrediente() {
    var filter = document.getElementById('inputFiltroIngrediente').value.toLowerCase();
    var grid = document.getElementById('listaRecetas');
    var listaElementos = grid.getElementsByClassName('elemento-grid-recetas');
    console.log("listaElementos", listaElementos, listaElementos.length)
    for (var i = 0; i < listaElementos.length; i++) {
        console.log("elemento: ", listaElementos[i].id)
        if (listaElementos[i].id != "elementoAgregarReceta") {
            ingredientesReceta = obtenerIngredientes(listaElementos[i]);
            console.log("ingredientesReceta", ingredientesReceta)

            listaElementos[i].classList.remove('ingredienteFiltroOk');
            for (var j = 0; j < ingredientesReceta.length; j++) {
                if (ingredientesReceta[j].toLowerCase().indexOf(filter) > -1) {
                    listaElementos[i].classList.add('ingredienteFiltroOk');
                }
            }
            console.log("termino ejecucion")
        }
        console.log("termino ejecucion final, i: ", i)
    }
}

function obtenerNombreReceta(elemento) {
    var a = elemento.getElementsByClassName("nombreReceta")[0];
    var nombreReceta = a.textContent || a.innerText;
    return nombreReceta;
}

function obtenerAutor(elemento) {
    var a = elemento.getElementsByClassName("nombreAutor")[0];
    var nombreAutor = a.textContent || a.innerText;
    return nombreAutor;
}

function obtenerIngredientes(elemento) {
    var a = elemento.getElementsByClassName("nombresIngredientes")[0];
    var ingredientes = a.textContent || a.innerText;
    return ingredientes.split(",");
}

function concatValues(obj) {
    var value = '';
    for (var prop in obj) {
        value += obj[prop];
    }
    return value;
}