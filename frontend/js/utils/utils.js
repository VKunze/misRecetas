
exports.formatNumber = (number, placesAfterComma = 0) => {
    if (typeof number != Number) {
        number = parseFloat(number)
    }
    return number.toFixed(placesAfterComma)
    // .replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

exports.appendChildren = (padre, objetos) => {
    for (var i = 0; i < objetos.length; i++) {
        padre.appendChild(objetos[i]);
    }
}

exports.crearLabel = (forValue, contenido) => {
    element = document.createElement('label');
    element.setAttribute("for", forValue);
    element.innerHTML = contenido
    return element
}

exports.crearDiv = (id, classList, contenido) => {
    element = document.createElement('div');
    element.setAttribute("id", id);
    element.setAttribute("class", classList.join(' '));
    element.innerHTML = contenido
    return element
}

exports.crearSpan = (id) => {
    element = document.createElement('span');
    element.setAttribute("id", id);
    return element
}

exports.crearBotonAgregarIngrediente = (id, name, iconClassList, iconStyle) => {
    element = document.createElement('a');
    element.setAttribute("type", "button");
    element.setAttribute("id", id);
    element.setAttribute("name", name);
    element.addEventListener('click', function () {
        agregarIngrediente(this.name);
    });
    icon = document.createElement('i');
    icon.setAttribute("class", iconClassList.join(' '));
    icon.setAttribute("style", iconStyle);
    element.appendChild(icon);
    return element
}   

exports.crearInputNumero = (id, classList, required, otherParams, onClickFunctionName) => {
    input = this.crearInput(id, classList, required, otherParams, onClickFunctionName);
    input.setAttribute("type", "number");
    input.setAttribute("step", "0.01");
    input.setAttribute("min", "0");
    return input
}

exports.crearInputFecha = (id, classList, required, otherParams, onClickFunctionName) => {
    input = this.crearInput(id, classList, required, otherParams, onClickFunctionName);
    input.setAttribute("type", "month");
    return input;
}

exports.crearInput = (id, classList, required, otherParams, onClickFunctionName) => {
    input = document.createElement('input');
    input.setAttribute("id", id);
    input.setAttribute("class", classList.join(' '));
    Object.keys(otherParams).forEach(function (key) {
        input.setAttribute(key, otherParams[key]);
    });
    input.addEventListener('click', function () {
        var functionToExecute = new Function(onClickFunctionName + '()');
        functionToExecute();
    });
    input.required = required;
    return input
}
