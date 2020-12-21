function UI_creditos(id) {
    var d2 = document.getElementById(id);
    d2.className = "ui_creditos";
    d2.appendChild(document.createTextNode(" Créditos por semana: "));
    var horas_aula = document.createTextNode("0");
    d2.appendChild(horas_aula);

    this.set_horas_aula = function(n) { horas_aula.nodeValue = n; };
    this.reset = () => {
        this.set_horas_aula(0);
    };
}
