function createButton(text) {
    let button = document.createElement("button");
    button.innerHTML = text;
    button.onselectstart = () => false;
    return button;
}

/**
 * @constructor
 */
function UI_saver(id)
{
    var self = this;

    var ui_saver = document.getElementById(id).parentNode;
    ui_saver.className = "ui_saver";
    ui_saver.appendChild(document.createTextNode("identificador: "));
    var input = document.createElement("input");
    self.input = input;
    input.title = "Escolha um identificador qualquer para salvar/abrir seus horários. O identificador pode ser qualquer coisa (por exemplo seu número de matrícula). Cuidado: qualquer um pode usar qualquer identificador.";
    ui_saver.appendChild(input);
    ui_saver.appendChild(document.createTextNode(" "));

    self.button_load = createButton("abrir");
    ui_saver.appendChild(self.button_load);
    ui_saver.appendChild(document.createTextNode(" "));
    self.button_load.onclick = () => {
        self.cb_load(self.input.value);
        return false;
    };

    self.button_save = createButton("salvar");
    ui_saver.appendChild(self.button_save);
    ui_saver.appendChild(document.createTextNode(" "));
    self.button_save.onclick = () => {
        self.cb_save(self.input.value);
        return false;
    };

    const enroll_id_input = document.createElement("input");
    enroll_id_input.name = "enroll_id_input";
    enroll_id_input.id = "enroll_id_input";
    enroll_id_input.placeholder = "digite sua matrícula";
    enroll_id_input.type = "text";
    ui_saver.appendChild(enroll_id_input);

    self.button_enroll = createButton("matricular");
    ui_saver.appendChild(self.button_enroll);
    ui_saver.appendChild(document.createTextNode(" "));
    self.button_enroll.onclick = () => {
        self.cb_enroll()
    };

    var form = document.createElement("form");
    form.style.display = "none";
    form.method = "POST";
    form.enctype = "multipart/form-data";
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "ping";
    form.appendChild(input);
    ui_saver.appendChild(form);
    self.form = form;
    self.form_input = input;

    var dropdown_menu = new widget_dropdown_menu(ui_saver, 230, 2, true);
    dropdown_menu.add("limpar tudo", function(e) {
        var really = confirm("Você quer mesmo limpar tudo?");
        if (really) {
            self.cb_cleanup();
        }
    });
    dropdown_menu.add("exportar arquivo JSON", function(e) { self.cb_download(".json") });
    dropdown_menu.add("importar arquivo JSON", function(e) { self.cb_upload() });

    self.enabled = true;
    self.disable = () => {
        if (!self.enabled) {
            return;
        }

        self.enabled = false;
    }

    self.enable = function() {
        if (self.enabled) {
            return;
        }

        const enable_button = (button, title) => {
            button.style.backgroundColor = "lightblue";
            button.disabled = false;

            button.style.opacity = "";
            button.style.filter = "";
            button.title = title;
        }

        enable_button(self.button_load, "abrir horário");
        enable_button(self.button_save, "salvar horário");
        enable_button(self.button_enroll, "matricular");

        self.enabled = true;
    }

    self.input.onkeyup = function(e) {
        var c = (e) ? e.keyCode : event.keyCode;
        if (this.value.length == 0) {
            self.disable();
        } else {
            self.enable();
        }
    }

    self.disable();
    /* procedures */
    self.identificar = function(identificador) {
        if (identificador != null && identificador != "") {
            self.input.value = identificador;
            self.enable();
        }
    }
    self.reset = function() {
        self.input.value = "";
        self.disable();
    }
    /* callbacks */
    self.cb_download = null;
    self.cb_ods = null;
    self.cb_upload = null;
    self.cb_cleanup = null;
    self.cb_save = null;
    self.cb_load = null;
    self.cb_enroll = null;
}
