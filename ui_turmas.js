/**
 * @constructor
 */
function UI_turmas(id)
{
    var self = this;

    var current_materia = null;
    var current_turma = null;
    var insert_before = null;
    var old_cb_onmouseout = null;

    list = document.getElementById(id);

    var thiswidth = 438;

    list.className = "ui_turmas";
    list.style.width  = thiswidth + "px";

    function onmouseup() {
        var checkboxes = this.parentNode.getElementsByTagName("td")[0].getElementsByTagName("input");
        var at_least_one_selected = 0;
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                at_least_one_selected = 1;
                break;
            }
        }
        for (var i = 0; i < checkboxes.length; i++) {
            self.cb_changed(checkboxes[i].turma, !at_least_one_selected);
            checkboxes[i].checked = !at_least_one_selected;
        }
        self.cb_updated();
    }
    function edit_start(turma) {
        current_turma = turma;
        var row = current_turma.row;
        row.style.backgroundColor = "black";
        row.style.color           = "white";
        self.ok_button.style.display = "";
        self.cancel_button.style.display = "";
        old_cb_onmouseout = self.cb_onmouseout;
        self.cb_onmouseout = function() {};
    }
    function edit_end() {
        if (current_turma) {
            var row = current_turma.row;
            row.style.backgroundColor = current_materia.cor;
            row.style.color           = "black";
            self.ok_button.style.display = "none";
            self.cancel_button.style.display = "none";
            self.cb_onmouseout = old_cb_onmouseout;
        }
    }
    function remove_turma(turma) {
        var row = turma.row;
        row.parentNode.removeChild(row);
        self.fix_height();
    }
    function stop_propagation(e)
    {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }
    function hover_off() { this.style.backgroundColor = this.oldbg; this.style.color = "black"; };
    function hover_on()  { this.style.backgroundColor = "black"; this.style.color = this.oldbg; };
    var mouseover_turma = null;
    var mouseout_turma = function() {
        if (mouseover_turma) {
            mouseover_turma.row.menu_div.style.display = "none";
            mouseover_turma.row.menu_v.style.borderBottom = "1px solid black";
            mouseover_turma.row.menu_v.onmouseout  = hover_off;
            mouseover_turma.row.menu_v.onmouseover = hover_on;
            mouseover_turma.row.menu_v.style.backgroundColor = current_materia.cor;
            mouseover_turma.row.menu_v.style.color = "black";
            mouseover_turma.row.menu.style.display = "none";
            self.cb_onmouseout(mouseover_turma);
            mouseover_turma = null;
        }
    };
    function new_turma(horario) {
        var row  = document.createElement("tr");
        row.style.backgroundColor = current_materia.cor;
        row.onmouseover = function() {
            if (mouseover_turma == this.turma)
                return;
            mouseout_turma();
            this.menu.style.display = "block";
            self.cb_onmouseover(this.turma);
            mouseover_turma = this.turma;
        };
        mouseover_turma = null;

        var data = document.createElement("td");
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            var input = document.createElement("input");
            input.title = "selecionar/deselecionar turma";
            input.type     = "checkbox";
            input.turma    = turma;
            input.onchange = function() {
                self.cb_changed(this.turma, this.checked);
                self.cb_updated();
            };
            if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
                input.onclick = function() { this.blur() };
            }
            data.appendChild(input);
            input.checked  = turma.selected;
        }
        data.style.width = "22px";
        row.appendChild(data);

        var data = document.createElement("td");
        data.onmouseup = onmouseup;
        var innerHTML = new String();
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            innerHTML += turma.nome + "<br>";
            if (!row.turma) {
                row.turma = turma;
                turma.row = row;
            }
        }
        data.innerHTML = innerHTML;
        data.style.width = "44px";
        row.appendChild(data);

        var twochars = function(n) {
            var str = "";
            if (n < 10)
                str += "&nbsp;";
            str += n;
            return str;
        }
        var data = document.createElement("td");
        data.onmouseup = onmouseup;
        var innerHTML = new String();
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            innerHTML += twochars(turma.vagas_ocupadas) + "/" + twochars(turma.vagas_ofertadas);
            if (turma.pedidos_sem_vaga != 0)
                innerHTML += " +" + twochars(turma.pedidos_sem_vaga);
            innerHTML += "<br>";
            if (!row.turma) {
                row.turma = turma;
                turma.row = row;
            }
        }
        data.innerHTML = innerHTML;
        data.style.width = "70px";
        row.appendChild(data);

        var data = document.createElement("td");
        data.onmouseup = onmouseup;
        data.style.position = "relative";
        data.style.zIndex = self.zIndex;
        self.zIndex = self.zIndex - 1;
        var innerHTML = new String();
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            var prof = new String;
            for (var p = 0; p < turma.professores.length; p++)
                innerHTML += turma.professores[p] + "<br>";
        }
        data.innerHTML = innerHTML;
        row.appendChild(data);

        var menu = document.createElement("div");
        menu.className = "ui_turmas_menu";
        data.appendChild(menu);

        var menu_v = document.createElement("div");
        menu_v.className = "ui_turmas_menu_v";
        menu_v.innerHTML = "V";
        menu_v.title = "clique aqui para editar ou remover turma";
        menu_v.oldbg = current_materia.cor;
        menu_v.onmouseout  = hover_off;
        menu_v.onmouseover = hover_on;
        menu_v.row = row;
        menu_v.onmouseup = function(e) {
            if (menu_div.style.display == "block") {
                menu_div.style.display = "none";
                menu_v.style.borderBottom = "1px solid black";
                menu_v.onmouseout  = hover_off;
                menu_v.onmouseover = hover_on;
                menu_v.style.backgroundColor = current_materia.cor;
                menu_v.style.color = "black";
            } else {
                menu_div.style.display = "block";
                menu_v.style.borderBottom = "0";
                menu_v.onmouseout  = function(){};
                menu_v.onmouseover = function(){};
                menu_v.style.backgroundColor = "black";
                menu_v.style.color = current_materia.cor;
            }
            stop_propagation(e);
        }
        menu_v.onselectstart = function () { return false; };
        menu.appendChild(menu_v);

        var menu_div = document.createElement("div");
        menu_div.className = "ui_turmas_menu_div";
        menu_div.style.backgroundColor = current_materia.cor;
        menu.appendChild(menu_div);

        var menu_remover = document.createElement("div");
        menu_remover.innerHTML = "remover";
        menu_remover.title = "remover turma";
        menu_remover.oldbg = current_materia.cor;
        menu_remover.onmouseout  = hover_off;
        menu_remover.onmouseover = hover_on;
        menu_remover.onselectstart = function () { return false; };
        menu_remover.turma = row.turma;
        menu_remover.onmouseup = function(e) {
            self.cb_remove_turma(row.turma);
            stop_propagation(e);
        }
        menu_div.appendChild(menu_remover);
        var menu_editar = document.createElement("div");
        menu_editar.innerHTML = "editar";
        menu_editar.title = "editar horário desta turma";
        menu_editar.oldbg = current_materia.cor;
        menu_editar.onmouseout  = hover_off;
        menu_editar.onmouseover = hover_on;
        menu_editar.onselectstart = function () { return false; };
        menu_editar.turma = row.turma;
        menu_editar.onmouseup = function(e) {
            self.cb_edit_turma(row.turma);
            stop_propagation(e);
        }
        menu_div.appendChild(menu_editar);

        row.menu = menu;
        row.menu_v = menu_v;
        row.menu_div = menu_div;

        self.tbody.insertBefore(row, insert_before);
        self.fix_height();
    }
    var create = function(materia) {
        list.innerHTML = "";
        insert_before = null;

        current_materia = materia;

        self.table = document.createElement("table");
        self.tbody = document.createElement("tbody");
        self.table.style.width= thiswidth + "px";
        self.table.cellPadding="1";
        self.table.cellSpacing="1";

        self.table.onmouseout = function(e) {
            if (!e) var e = window.event;
            var t = (window.event) ? e.srcElement : e.target;
            var rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
            while ( t &&  t.nodeName != "TABLE")
                 t =  t.parentNode;
            while (rt && rt.nodeName != "TABLE")
                rt = rt.parentNode;
            if (rt && t && t == rt)
                return;
            mouseout_turma();
        };

        self.zIndex = 100;
        for (var i in current_materia.horarios) {
            var horario = current_materia.horarios[i];
            if (current_materia.agrupar == 1) {
                new_turma(horario);
            } else {
                for (var k in horario.turmas) {
                    var turma = horario.turmas[k];
                    var tmp = new Object();
                    tmp.turmas = new Object();
                    tmp.turmas[turma.nome] = turma;
                    new_turma(tmp);
                }
            }
        }
        var row  = document.createElement("tr");
        row.style.backgroundColor = current_materia.cor;
        row.materia = current_materia;
        row.onmouseover = mouseout_turma;

        var data = document.createElement("td");
        data.colSpan = "4";
        data.style.textAlign = "center";
        data.onmouseup = function() { self.cb_new_turma(); };
        data.style.fontSize = "13px"
        data.innerHTML = ">>>> adicione turmas aqui <<<<";
        data.oldbg = current_materia.cor;
        data.onmouseout  = hover_off;
        data.onmouseover = hover_on;
        row.appendChild(data);

        self.tbody.appendChild(row);
        insert_before = row;

        var row  = document.createElement("tr");
        row.style.backgroundColor = "#eeeeee";
        row.onmouseover = mouseout_turma;

        var data = document.createElement("td");
        var input = document.createElement("input");
        input.type     = "checkbox";
        input.onchange = function() { self.cb_toggle_agrupar(); };
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
            input.onclick = function() { this.blur() };
        }
        data.appendChild(input);
        input.checked = materia.agrupar;
        data.style.width = "22px";
        row.appendChild(data);

        var data = document.createElement("td");
        data.colSpan = "3";
        data.onmouseup = function() { self.cb_toggle_agrupar(); };
        data.style.fontSize = "13px"
        data.innerHTML = "agrupar turmas com horários iguais";
        row.appendChild(data);

        self.tbody.appendChild(row);

        var button = document.createElement("span");
        button.style.marginLeft = ((thiswidth/2) - 100) + "px";
        button.style.display = "none";
        button.innerHTML = "<strong>OK</strong>";
        button.onselectstart = function () { return false; };
        button.onclick = function () { self.cb_ok(); return false; };
        list.appendChild(button);
        self.ok_button = button;

        var button = document.createElement("span");
        button.style.marginLeft = ((thiswidth/2)) + "px";
        button.style.display = "none";
        button.innerHTML = "<strong>Cancelar</strong>";
        button.onselectstart = function () { return false; };
        button.onclick = function () { self.cb_cancel(); return false; };
        list.appendChild(button);
        self.cancel_button = button;

        self.table.appendChild(self.tbody);
        list.appendChild(self.table);
        self.fix_height();
    }

    self.old_cb_onmouseover = null;
    self.old_cb_onmouseout  = null;

    /* procedures */
    self.create = create;
    self.reset = function() { list.innerHTML = ""; insert_before = null; current_materia = null; };
    self.new_turma = new_turma;
    self.remove_turma = remove_turma;
    self.edit_start = edit_start;
    self.edit_end   = edit_end;
    /* functions */
    self.get_current = function() { return current_materia; };
    self.set_height = function(height) {
        list.style.height    = (height-2) + "px";
        list.style.maxHeight = (height-2) + "px";
        self.fix_height();
    };
    self.fix_height = function() {
        if (!self.table)
            return;
        if (self.table.offsetHeight < list.offsetHeight)
            self.table.style.width = thiswidth + "px";
        else
            self.table.style.width = (thiswidth - document.scrollbar_width) + "px";
    };
    /* callbacks */
    self.cb_toggle_agrupar= null;
    self.cb_edit_turma   = null;
    self.cb_remove_turma = null;
    self.cb_new_turma    = null;
    self.cb_onmouseover  = null;
    self.cb_onmouseout   = null;
    self.cb_updated      = null;
    self.cb_changed      = null;
    self.cb_ok           = null;
    self.cb_cancel       = null;
}
