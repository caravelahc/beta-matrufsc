const default_db = current_display_semester();
/**
 * @constructor
 */
function Main(ui_materias, ui_turmas, ui_logger, ui_creditos, ui_horario,
              ui_saver, ui_campus, ui_planos, ui_grayout, ui_updates, ui_avisos,
              combo, state, display, persistence, database)
{
    var self = this;

    function display_combinacao(cc)
    {
        var horas_aula = 0;
        for (const materia of state.plano.materias.list) {
            if (materia.selected == -1) {
                materia.ui_turma.innerHTML = "<strike>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strike>";
                materia.ui_turma.style.textAlign = "center";
                materia.ui_selected.checked = 0;
                materia.ui_selected.disabled = "disabled";
            } else if (materia.selected == 0) {
                materia.ui_turma.innerHTML = "<strike>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strike>";
                materia.ui_turma.style.textAlign = "center";
                materia.ui_selected.checked = 0;
                materia.ui_selected.disabled = "";
            }
        }

        display.reset();
        var c = state.plano.combinacoes.get(cc);
        if (!c) {
            cc = 0;
        } else {
            c.horarios_combo.forEach(function(horario){
                for (var k in horario.turmas) {
                    if (horario.turmas[k].selected) {
                        var turma = horario.turmas[k];
                        break;
                    }
                }
                if (!turma)
                    var turma = horario.turma_representante;
                var horario_selecionado = 0;
                for (const t of turma.materia.turmas) {
                    if (t.selected) {
                        if (horario_selecionado == 0) {
                            horario_selecionado = t.horario;
                        } else {
                            if (t.horario != horario_selecionado) {
                                horario_selecionado = 0;
                                break;
                            }
                        }
                    }
                }
                if (horario_selecionado == 0)
                    turma.materia.ui_turma.style.fontWeight = "bold";
                else
                    turma.materia.ui_turma.style.fontWeight = "";

                turma.materia.ui_turma.innerHTML = turma.materia.chosen_class;
                turma.materia.ui_selected.checked = true;
                turma.materia.ui_selected.disabled = "";
                horas_aula += parseInt(turma.aulas.length);
                display.turma(c, turma);
            });
        }
        state.plano.combinacoes.set_current(cc);
        state.plano.combinacao = cc;
        ui_creditos.set_horas_aula(horas_aula);
    }

    function new_materia(nome) {
        codigo = nome.substr(0,7).toUpperCase();
        if (state.plano.materias.get(codigo)) {
            ui_logger.set_text("'" + codigo + "' ja foi adicionado", "lightcoral");
            return;
        }
        var materia = state.plano.materias.new_item(codigo, nome, state.campus, state.semestre);
        state.plano.materias.new_turma(materia);
        ui_materias.add(materia);
        ui_turmas.create(materia);
        state.plano.materias.selected = materia.codigo;
        ui_logger.set_text("'" + nome + "' adicionada", "lightgreen");
        update_all();
    };
    function add_materia(result) {
        var materia = state.plano.materias.add_json(result, state.campus, state.semestre);
        if (!materia) {
            ui_logger.set_text("'" + result.codigo + "' ja foi adicionada", "lightcoral");
            return;
        }
        ui_materias.add(materia);
        ui_turmas.create(materia);
        state.plano.materias.selected = materia.codigo;
        ui_logger.set_text("'" + result.codigo + "' adicionada", "lightgreen");
        update_all();
    }

    /* self */
    self.new_materia = new_materia;
    self.add_materia = add_materia;

    /* UI_materias */
    ui_materias.cb_changed = function(materia, attr, str) {
        if (str == "") {
            ui_logger.set_text("o código não pode ser vazio", "lightcoral");
        } else if (attr == "codigo" && state.plano.materias.get(str)) {
            ui_logger.set_text("código '" + str + "' já está sendo usado", "lightcoral");
        } else {
            state.plano.materias.changed(materia, attr, str);
            update_all();
        }
    };
    ui_materias.cb_select = function(materia, checked) {
        self.m_stop();
        materia.selected = checked ? 1 : 0;
        if (materia.selected) {
            var selected = 0;
            for (var i = 0; i < materia.turmas.length; i++) {
                var turma = materia.turmas[i];
                if (turma.selected)
                    selected = 1;
            }
            if (!selected) {
                for (var i = 0; i < materia.turmas.length; i++) {
                    var turma = materia.turmas[i];
                    turma.selected = 1
                }
                ui_turmas.create(materia);
                state.plano.materias.selected = materia.codigo;
            }
        }
        update_all();
    };
    ui_materias.cb_onmoveup    = function(materia) {
        self.m_stop();
        var m = state.plano.materias.list;
        for (var i = 0; i < m.length; i++)
            if (m[i] == materia)
                break;
        if (i >= m.length) {
            return;
        }
        if (i == 0)
            return;
        m[i].row.parentNode.insertBefore(m[i].row, m[i-1].row);
        var tmp = m[i-1];
        m[i-1]  = m[i  ];
        m[i  ]  = tmp;
        update_all();
    };
    ui_materias.cb_onmovedown  = function(materia) {
        self.m_stop();
        var m = state.plano.materias.list;
        for (var i = 0; i < m.length; i++)
            if (m[i] == materia)
                break;
        if (i >= m.length) {
            return;
        }
        if (i == m.length-1)
            return;
        m[i].row.parentNode.insertBefore(m[i+1].row, m[i].row);
        var tmp = m[i+1];
        m[i+1]  = m[i  ];
        m[i  ]  = tmp;
        update_all();
    };
    ui_materias.cb_onremove    = function(materia) {
        self.m_stop();
        var selected = state.plano.materias.get(state.plano.materias.selected);
        if (selected && selected.codigo == materia.codigo)
            ui_turmas.reset();
        ui_logger.set_text("'" + materia.codigo + "' removida", "lightgreen");
        materia.row.parentNode.removeChild(materia.row);
        state.plano.materias.remove_item(materia);
        state.plano.materias.selected = "";
        ui_materias.fix_width();
        update_all();
        self.issues();
    };
    var m_array = null;
    var m_timer = null;
    var m_count = null;
    self.m_stop = function() {
        var c = state.plano.combinacoes.get_current();
        if (!c)
            return;
        if (m_array && m_array.length)
            display.out(c, m_array[m_count]);
        if (m_timer)
            clearTimeout(m_timer);
        m_timer = null;
        m_array = null;
        m_count = null;
    }
    self.m_update_turma = function() {
        if (!m_array.length)
            return;
        if (m_count != -1)
            display.out(state.plano.combinacoes.get_current(), m_array[m_count]);
        m_count++;
        if (m_count >= m_array.length)
            m_count = 0;
        display.over(state.plano.combinacoes.get_current(), m_array[m_count]);
        if (m_array.length != 1)
            m_timer = setTimeout((function(t){return function(){t.m_update_turma();}})(self), 1000);
    }
    ui_materias.cb_onmouseover = function(materia) {
        var c = state.plano.combinacoes.get_current();
        if (!c)
            return;
        for (var i = 0; i < c.horarios_combo.length; i++) {
            var horario = c.horarios_combo[i];
            var turma = horario.turma_representante;
            if (turma.materia == materia) {
                display.over(c, turma);
                return;
            }
        }
        m_array = materia.turmas.filter(function(turma){return turma.selected;});
        m_count = -1;
        self.m_update_turma();
    };
    ui_materias.cb_onmouseout  = function(materia) {
        var c = state.plano.combinacoes.get_current();
        if (!c)
            return;
        for (var i = 0; i < c.horarios_combo.length; i++) {
            var horario = c.horarios_combo[i];
            var turma = horario.turma_representante;
            if (turma.materia == materia) {
                display.out(c, turma);
                return;
            }
        }
        self.m_stop();
    };
    ui_materias.cb_onclick     = function(materia) {
        ui_turmas.create(materia);
        state.plano.materias.selected = materia.codigo;
    }
    /* UI_turmas */
    ui_turmas.cb_toggle_agrupar = function() {
        var materia = state.plano.materias.get(state.plano.materias.selected);
        materia.agrupar = materia.agrupar ? 0 : 1;
        materia.fix_horarios();
        update_all();
        ui_turmas.create(materia);
        state.plano.materias.selected = materia.codigo;
    };
    ui_turmas.cb_new_turma   = function() {
        var materia = state.plano.materias.get(state.plano.materias.selected);
        state.plano.materias.new_turma(materia);
        ui_turmas.create(materia);
        state.plano.materias.selected = materia.codigo;
        update_all();
    };
    ui_turmas.cb_remove_turma = function(turma) {
        var materia = turma.materia;
        state.plano.materias.remove_turma(materia, turma);
        ui_turmas.remove_turma(turma);
        update_all();
        self.issues();
    };
    var overlay = null;
    function clear_overlay() {
        overlay = [[],[],[],[],[],[]];
    }
    clear_overlay();
    function update_all(comb) {
        if (self.editando) {
            var editando = self.editando;
            var aulas = new Array();
            for (dia = 0; dia < 6; dia++)
                for (hora = 0; hora < 14; hora++)
                    if (overlay[dia][hora]) {
                        var aula = new Aula(dia, hora, "SALA");
                        for (var k = 0; k < editando.aulas.length; k++) {
                            var a2 = editando.aulas[k];
                            if (a2.dia == dia && a2.hora == hora) {
                                aula.sala = a2.sala;
                                break;
                            }
                        }
                        aulas.push(aula);
                    }
            editando.horario.aulas = aulas;
            for (var k in editando.horario.turmas)
                editando.horario.turmas[k].aulas = aulas;
            editando.materia.fix_horarios();
            clear_overlay();
            ui_horario.set_toggle(null);
            ui_turmas.edit_end();
            ui_turmas.create(editando.materia);
            state.plano.materias.selected = editando.materia.codigo;
            self.editando = null;
        }
        if (comb == null)
            var current = state.plano.combinacoes.get_current();
        state.plano.combinacoes.generate(state.plano.materias.list);
        if (comb == null)
            comb = state.plano.combinacoes.closest(current)
        if (comb < 1 || comb > state.plano.combinacoes.length())
            comb = 1;
        display_combinacao(comb);
        var errmsg = new String();
        var m = state.plano.materias.list;
        for (var i = 0; i < m.length; i++) {
            var materia = m[i];
            if (materia.selected == -1) {
                errmsg += " " + materia.codigo;
            }
        }
        if (errmsg != "") {
            ui_logger.set_persistent("materias em choque:" + errmsg, "lightcoral");
        } else {
            ui_logger.clear_persistent();
        }
        ui_logger.reset();
        current = null;
        mudancas = state.plano.combinacoes.get_current();
        persistence.write_state(state.to_json());
    }
    self.editando = null;
    function edit_start(turma) {
        if (self.editando) {
            if (self.editando == turma) {
                update_all();
                return;
            }
            update_all();
        }
        var materia = state.plano.materias.get(state.plano.materias.selected);
        clear_overlay();
        var c       = state.plano.combinacoes.get_current();
        var fake    = state.plano.combinacoes.copy(c, turma.materia);
        for (var i = 0; i < turma.aulas.length; i++) {
            var dia  = turma.aulas[i].dia;
            var hora = turma.aulas[i].hora;
            overlay[dia][hora] = true;
        }
        function display(dia, hora, tipo, fake) {
            /* 0 clear
             * 1 normal
             * 2 over
             * 3 comb
             * 4 choque 1
             * 5 choque 2
             */
            switch (tipo) {
                case 0: ui_horario.clear_cell(dia, hora); break;
                case 1: ui_horario.display_cell(dia, hora, {fixed:false,text:turma.materia.codigo,bgcolor:turma.materia.cor,color:"black"}); break;
                case 2: ui_horario.display_cell(dia, hora, Cell.grey (turma.materia.codigo)); break;
                case 3: ui_horario.display_cell(dia, hora, Cell.normal(fake[dia][hora])); break;
                case 4: ui_horario.display_cell(dia, hora, {fixed:false,text:turma.materia.codigo,bgcolor:"black",color:"red"}); break;
                case 5: ui_horario.display_cell(dia, hora, Cell.red   (turma.materia.codigo)); break;
            }
        };
        function onover(dia, hora) {
            var eq = fake   [dia][hora] ? fake[dia][hora].horario == turma.horario : 0;
            var a1 = overlay[dia][hora] ? 0 : 1;
            var a2 = fake   [dia][hora] ? 0 : 1;
            var a3 = eq                 ? 0 : 1;
            var todisplay = [ [ [ 2, 5 ], [ 1, 1 ] ], [ [ 3, 4 ], [ 2, 2 ] ] ];
            display(dia, hora, todisplay[a1][a2][a3], fake);
        };
        function onout(dia, hora) {
            var eq = fake   [dia][hora] ? fake[dia][hora].horario == turma.horario : 0;
            var a1 = overlay[dia][hora] ? 0 : 1;
            var a2 = fake   [dia][hora] ? 0 : 1;
            var a3 = eq                 ? 0 : 1;
            var todisplay = [ [ [ 0, 5 ], [ 1, 1 ] ], [ [ 3, 3 ], [ 0, 0 ] ] ];
            display(dia, hora, todisplay[a1][a2][a3], fake);
        };
        function toggle(dia, hora) {
            if (overlay[dia][hora])
                overlay[dia][hora] = false;
            else
                overlay[dia][hora] = true;
            onover(dia, hora);
        };
        ui_grayout.show();
        ui_horario.set_toggle(toggle, onover, onout);
        ui_turmas.edit_start(turma);
        self.editando = turma;
        for (var dia = 0; dia < 6; dia++)
            for (var hora = 0; hora < 14; hora++)
                onout(dia, hora);
    }
    ui_turmas.cb_edit_turma = function(turma) {
        edit_start(turma);
    };
    ui_turmas.cb_onmouseover = function(turma) {
        display.over(state.plano.combinacoes.get_current(), turma);
    };
    ui_turmas.cb_onmouseout = function(turma) {
        display.out(state.plano.combinacoes.get_current(), turma);
    };
    ui_turmas.cb_changed = function(turma, checked) {
        const current_course = state.plano.materias.selected;
        state.plano.materias.find(current_course).chosen_class = turma.nome
        turma.selected = checked ? 1 : 0;
        turma.materia.selected = 1;
    };
    ui_turmas.cb_updated = function(materia) {
        var turma = display.get_selected();
        update_all();
        if (materia)
            ui_turmas.create(materia);
        if (turma)
            display.over(state.plano.combinacoes.get_current(), turma);
    };

    ui_turmas.cb_ok = function() {
        ui_grayout.hide();
        update_all();
    };
    ui_turmas.cb_cancel = function() {
        ui_grayout.hide();
        clear_overlay();
        ui_horario.set_toggle(null);
        ui_turmas.edit_end();
        self.editando = null;
        display_combinacao(state.plano.combinacoes.current());
    };
    /* UI_saver */
    ui_saver.cb_ods = function() {
        var identifier = ui_saver.input.value;
        if (!identifier) {
            identifier = "matrufsc";
        }
        ui_saver.form.action = "ods.cgi?q=" + encodeURIComponent(identifier + ".ods");
        ui_saver.form_input.value = JSON.stringify(state.preview());
        ui_saver.form.submit();
    };
    ui_saver.cb_download = function(ext) {
        var identifier = ui_saver.input.value;
        if (!identifier) {
            identifier = "matrufsc";
        }
        ui_saver.form.action = "ping.cgi?q=" + encodeURIComponent(identifier + ext);
        ui_saver.form_input.value = state.to_json();
        ui_saver.form.submit();
    };
    ui_saver.cb_upload = function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var input = document.createElement("input");
            input.style.display = "none";
            input.type = "file";
            input.onchange = function(e) {
                if (!e.target.files[0]) {
                    ui_logger.set_text("nenhum arquivo selecionado", "lightcoral");
                    document.body.removeChild(input);
                } else {
                    for (var f = 0; f < e.target.files.length; f++) {
                        var fname = e.target.files[f];
                        var filereader = new FileReader();
                        filereader.fname = fname;
                        filereader.onload = function(file) {
                            try {
                                var nome = file.target.fname.name;
                                var id = nome.substr(0, nome.lastIndexOf('.')) || nome;
                                var statestr = file.target.result;
                                var state3 = JSON.parse(statestr);
                                self.load(state3, id);
                                ui_logger.set_text("horário carregado do arquivo " + nome, "lightgreen");
                                persistence.write_id(id);
                                persistence.write_state(statestr);
                            } catch (e) {
                                ui_logger.set_text("erro ao carregar arquivo", "lightcoral");
                            }
                            if (input) {
                                document.body.removeChild(input);
                                input = null;
                            }
                        };
                        filereader.readAsText(fname);
                    }
                }
            };
            document.body.appendChild(input);
            input.click();
        } else {
            ui_logger.set_text("é preciso um navegador mais recente para fazer upload", "lightcoral");
        }
    };
    ui_saver.cb_cleanup = function() {
        ui_creditos.reset();
        ui_materias.reset();
        ui_updates.reset();
        ui_planos.reset();
        ui_logger.reset(true);
        ui_turmas.reset();
        display.reset();
        state.reset();
        ui_campus.set_campus(state.campus);
        ui_campus.set_semestre(state.semestre);
        self.set_db(state.semestre, state.campus);
        persistence.reset();
        ui_saver.reset();
        ui_planos.startup(state);
    };
    ui_saver.cb_save = function(identifier) {
        self.save(identifier);
    };
    ui_saver.cb_load = function(identifier, cb_error) {
        if (!identifier || identifier == "") {
            ui_logger.set_text("identifier invalido", "lightcoral");
            return;
        }

        let url = 'load/' + identifier;

        const debug = true;
        if (debug) {
            url = 'http://localhost:5000/matrufsc' + url;
        }

        let request = new Request(
            url,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );

        fail = function() {
            ui_logger.set_text(
                'erro ao abrir horário para "' + identifier + '" ',
                'lightcoral'
            );

            if (cb_error) {
                cb_error();
            }
        };

        fetch(request)
            .then(function(response) {
                if (!response.ok) {
                    fail();
                }
                response.text().then(function (text) {
                    text = text.replace(/'/g, '"');
                    try {
                        var state_to_load = JSON.parse(text);
                    } catch (e) {
                        fail();
                        throw e;
                    }
                    self.load(state_to_load, identifier);
                    ui_logger.set_text(
                        'horário para "' + identifier + '" foi carregado',
                        'lightgreen'
                    );
                });
            });

        _gaq.push(['_trackEvent', 'state', 'load', identifier])
        ui_logger.waiting('carregando horário para "' + identifier + '"');
    }

    ui_saver.cb_enroll = () => {
        const x = window.open('https://cagr.sistemas.ufsc.br/matricula/pedido?cmd=mostralogin&tipoUsuario=null');
        setTimeout(() => {
            x.close();

            const courseList = state.plano.materias.list;
            const nomes = courseList.map(c => c.codigo).join("#")
            const turmas = courseList.map(c => c.chosen_class).join("#")
            const useless = "0#".repeat(courseList.length);

            document.getElementById("nomes").value = nomes;
            document.getElementById("turmas").value = turmas;
            document.getElementById("aulas").value = useless;
            document.getElementById("codHorarios").value = useless;
            document.getElementById("tipos").value = useless;
            document.getElementById("formatura").value = -1;
            document.getElementById("matricula").value = document.getElementById("enroll_id_input").value;
            document.getElementById("enroll_form").submit();
        }, 500);
    }

    ui_horario.cb_select = function() {
        display_combinacao(state.plano.combinacoes.current());
        ui_turmas.set_height(ui_horario.height());
    };

    ui_campus.cb_campus = function(campus) {
        self.set_db(state.semestre, campus);
        state.campus = campus;
    }
    ui_campus.cb_semestre = function(semestre) {
        self.set_db(semestre, state.campus);
        state.semestre = semestre;
    }
    /* UI_planos */
    ui_planos.cb_clean = function() {
        var really = confirm("Você quer mesmo limpar este plano?");
        if (really) {
            ui_creditos.reset();
            ui_materias.reset();
            ui_updates.reset();
            ui_logger.reset(true);
            ui_turmas.reset();
            display.reset();
            state.plano.cleanup();
            update_all();
        }
    };
    ui_planos.cb_dup = function(n) {
        var really = confirm("Você quer mesmo copiar este plano para o plano " + (n+1) + "?");
        if (really) {
            var state_plano = state.copy_plano(state.plano);
            var plano_to_load = JSON.parse(JSON.stringify(state_plano));
            state.planos[n] = state.new_plano(plano_to_load, n);
            ui_creditos.reset();
            ui_materias.reset();
            ui_logger.reset(true);
            ui_turmas.reset();
            display.reset();
            self.set_plano(state.planos[n]);
            ui_planos.startup(state);
        }
    };
    function redraw_plano(plano) {
        ui_creditos.reset();
        ui_materias.reset();
        ui_logger.reset(true);
        ui_turmas.reset();
        display.reset();
        self.set_plano(plano);
        ui_planos.select(plano);
    };
    ui_planos.cb_changed = function(plano) {
        redraw_plano(plano);
        self.issues();
    };
    /* Save/Load */
    self.save = function(identifier) {
        if (!identifier || identifier == "") {
            ui_logger.set_text("identifier invalido", "lightcoral");
            return;
        }

        let url = 'store/' + identifier;
        let data = state.to_json();
        persistence.write_state(data);

        const debug = true;
        if (debug) {
            url = 'http://localhost:5000/matrufsc' + url;
            data = {"versao":5,"campus":"FLO","semestre":"20191","planos":[{"combinacao":1,"materias":[{"codigo":"INE5429","nome":"Segurança em Computação *CIÊNCIAS DA COMPUTAÇÃO","cor":"lightcoral","campus":"FLO","semestre":"20191","turmas":[{"nome":"07208","horas_aula":72,"vagas_ofertadas":30,"vagas_ocupadas":0,"alunos_especiais":0,"saldo_vagas":30,"pedidos_sem_vaga":0,"professores":["Jean Everson Martina","Ricardo Felipe Custódio"],"horarios":["3.1620-1 / CTC-INE101","3.1710-1 / CTC-INE101","5.1620-1 / CTC-CTC101","5.1710-1 / CTC-CTC101"],"selected":1}],"agrupar":1,"selected":1},{"codigo":"INE5420","nome":"Computação Gráfica *CIÊNCIAS DA COMPUTAÇÃO","cor":"lightcyan","campus":"FLO","semestre":"20191","turmas":[{"nome":"05208","horas_aula":72,"vagas_ofertadas":33,"vagas_ocupadas":0,"alunos_especiais":0,"saldo_vagas":33,"pedidos_sem_vaga":0,"professores":["Aldo Von Wangenheim"],"horarios":["3.0820-1 / CTC-LABINF","3.0910-1 / CTC-LABINF","5.0820-1 / CTC-LABINF","5.0910-1 / CTC-LABINF"],"selected":1}],"agrupar":1,"selected":1},{"codigo":"INE5433","nome":"Trabalho de Conclusão de Curso I (TCC) *CIÊNCIAS DA COMPUTAÇÃO","cor":"lightgoldenrodyellow","campus":"FLO","semestre":"20191","turmas":[{"nome":"07208","horas_aula":108,"vagas_ofertadas":40,"vagas_ocupadas":0,"alunos_especiais":0,"saldo_vagas":40,"pedidos_sem_vaga":0,"professores":["Renato Cislaghi"],"horarios":[],"selected":1}],"agrupar":1,"selected":1},{"codigo":"INE5431","nome":"Sistemas Multimídia *CIÊNCIAS DA COMPUTAÇÃO","cor":"lightblue","campus":"FLO","semestre":"20191","turmas":[{"nome":"07208","horas_aula":72,"vagas_ofertadas":35,"vagas_ocupadas":0,"alunos_especiais":0,"saldo_vagas":35,"pedidos_sem_vaga":0,"professores":["Roberto Willrich"],"horarios":["3.1330-1 / CTC-CTC303","3.1420-1 / CTC-CTC303","5.1330-1 / CTC-CTC107","5.1420-1 / CTC-CTC107"],"selected":1}],"agrupar":1,"selected":1}],"materia":"INE5431"},{"combinacao":0,"materias":[],"materia":""},{"combinacao":0,"materias":[],"materia":""},{"combinacao":0,"materias":[],"materia":""}],"plano":0};
        }

        const request = new Request(
            url,
            {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        fetch(request)
            .then(function(response) {
                if (!response.ok) {
                    ui_logger.set_text(
                        'erro ao salvar horário para "' + identifier + '"',
                        'lightcoral'
                    );
                }
                ui_logger.set_text(
                    'horário para "' + identifier + '" foi salvo',
                    'lightgreen'
                );
                persistence.write_id(identifier);
                mudancas = false;
            });

        _gaq.push(['_trackEvent', 'state', 'save', identifier])
        ui_logger.waiting("salvando horário para '" + identifier + "'");
    };

    ui_updates.cb_update = function() {
        redraw_plano(state.plano);
    };

    self.issues = function() {
        state.issues(database, function(issues){
            let materia = state.plano.materias.get(state.plano.materias.selected);
            if (materia) {
                ui_turmas.create(materia);
            }
            ui_updates.fill(issues);
        }, ui_updates.hide);
    };

    self.load = function(state_to_load, identifier) {
        ui_creditos.reset();
        ui_materias.reset();
        ui_updates.reset();
        ui_planos.reset();
        ui_logger.reset(true);
        ui_turmas.reset();
        display.reset();

        var ret = state.load(state_to_load);
        if (ret === -1) {
            ui_logger.set_text("houve algum erro ao importar as mat\u00e9rias!", "lightcoral");
        } else if (ret === -2) {
            ui_logger.set_text("erro ao tentar abrir horário de versão mais recente", "lightcoral");
        }

        if (ret != 0) {
            return -1;
        }

        ui_planos.startup(state);

        self.set_plano();

        ui_campus.set_campus(state.campus);
        ui_campus.set_semestre(state.semestre);

        self.set_db(state.semestre, state.campus, self.issues);
        if (identifier) {
            persistence.write_id(identifier);
        }

        return 0;
    };
    self.set_plano = function(plano) {
        if (!plano) {
            plano = state.planos[state.index];
        }

        if (!plano) {
            plano = state.planos[0];
        }

        state.set_plano(plano);

        let materias = plano.materias.list;
        for (let i = 0; i < materias.length; i++) {
            ui_materias.add(materias[i]);
        }

        var materia = plano.materias.get(plano.materias.selected);

        if (materia) {
            ui_turmas.create(materia);
            plano.materias.selected = materia.codigo;
        } else {
            plano.materias.selected = "";
        }

        update_all(plano.combinacao);
        mudancas = false;
    };
    load_db = function(semestre, campus, callback) {
        var src = semestre + '.json';
        var oldval = combo.input.value;
        var f_timeout;
        var f_length = 0;
        var f_loaded = 0;

        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            switch (this.readyState) {
                case 4:
                    clearTimeout(f_timeout);
                    f_timeout = null;
                    if (this.status != 200) {
                        ui_logger.set_text("erro ao carregar banco de dados", "lightcoral");
                    } else {
                        try {
                            var dbjson = JSON.parse(this.responseText);
                            database.add(semestre, dbjson);
                        } catch (e) {
                            ui_logger.set_text("erro ao carregar banco de dados", "lightcoral");
                        }
                    }
                    database.set_db(semestre, campus);
                    combo.input.value = oldval;
                    combo.input.disabled = false;
                    combo.input.style.backgroundColor = "";
                    self.atualizar_data_db(semestre);
                    if (callback)
                        callback();
                    break;
            }
        };
        req.onprogress = function(p) {
            f_loaded = p.loaded;
        };
        req.open("GET", src, true);
        req.send(null);

        _gaq.push(['_trackEvent', 'db', 'load', semestre])

        var f_pontos = 0;
        loading = function() {
            var innerHTML = "carregando ";
            if (f_length && f_loaded) {
                var percent = Math.round((f_loaded/f_length)*100);
                innerHTML += " (" + percent + "%)";
            } else {
                for (var i = 0; i < f_pontos; i++)
                    innerHTML += ".";
            }
            combo.input.value = innerHTML;
            f_pontos++;
            if (f_pontos == 6)
                f_pontos = 0;
            if (f_timeout) {
                f_timeout = setTimeout("loading()", 200);
                combo.input.style.backgroundColor = "lightgray";
            }
        };
        f_timeout = setTimeout("loading()", 500);
        combo.input.disabled = true;
    };
    self.atualizar_data_db = function(semestre) {
        document.getElementById("data_db").innerHTML = "banco de dados atualizado em " + database.get_date(semestre);
    };
    self.set_db = function(semestre, campus, callback) {
        let [year, semester] = current_display_semester();
        let current = year + '' + semester;
        if (semestre == current) {
            ui_avisos.reset();
        } else {
            let str = semestre.substr(0,4) + "-" + semestre.substr(4,1);
            ui_avisos.set_text(
                "Você escolheu os horários de " + str + "! " +
                "Nós já estamos em " + year + '-' + semester + "!"
            );
        }
        semestre = DB_BASE_PATH + '/' + semestre;
        var ret = database.set_db(semestre, campus);
        if (ret == -1)
            load_db(semestre, campus, callback);
        else {
            self.atualizar_data_db(semestre);
            if (callback)
                callback();
        }
    };
}

function getScrollBarWidth () {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  return (w1 - w2);
};

sobre_shown = false;
mudancas = false;
window.onload = function() {
    document.scrollbar_width = getScrollBarWidth();

    var persistence = new Persistence();
    var database = new Database();

    var ui_materias    = new UI_materias("materias_list");
    var ui_creditos    = new UI_creditos("combinacoes");
    var ui_horario     = new UI_horario("horario");
    var ui_turmas      = new UI_turmas("turmas_list");
    var ui_logger      = new UI_logger("logger");
    var ui_campus      = new UI_campus("campus");
    var ui_planos      = new UI_planos("planos");
    var ui_saver       = new UI_saver("saver");
    var ui_updates     = new UI_updates("updates_list");
    var ui_avisos      = new UI_avisos("avisos");

    var ui_grayout     = new UI_grayout("grayout");
    ui_grayout.cb_onclick = function() {
        if (sobre_shown) {
            ui_sobre_popup.cb_fechar();
        } else if (main.editando) {
            ui_turmas.cb_cancel();
        }
    };
    var ui_sobre_popup = new UI_sobre_popup("sobre_popup");
    ui_sobre_popup.link = document.getElementById("sobre");
    var a = document.createElement("a");
    a.href = "#";
    a.innerHTML = "Sobre";
    a.onclick = function() {
        _gaq.push(['_trackEvent', 'sobre', 'show', identifier]);
        ui_sobre_popup.show();
        ui_grayout.show();
        sobre_shown = true;
    };
    ui_sobre_popup.link.appendChild(a);
    ui_sobre_popup.cb_fechar = function() {
        _gaq.push(['_trackEvent', 'sobre', 'hide', identifier]);
        ui_grayout.hide();
        ui_sobre_popup.hide();
        sobre_shown = false;
    }

    var state = new State();
    var display = new Display(ui_logger, ui_horario);

    dconsole2 = new Dconsole("dconsole");
    var combo   = new Combobox("materias_input", "materias_suggestions", ui_logger, database);
    var main   = new Main(ui_materias, ui_turmas, ui_logger, ui_creditos,
                          ui_horario, ui_saver, ui_campus, ui_planos, ui_grayout,
                          ui_updates, ui_avisos, combo,
                          state, display, persistence, database);

    combo.cb_add_materia = main.add_materia;
    combo.cb_new_materia = main.new_materia;

    document.onkeydown = function(e) {
        var ev = e ? e : event;
        var c = ev.keyCode;
        var elm = ev.target;
        if (!elm)
            elm = ev.srcElement;
        if (elm.nodeType == 3) // defeat Safari bug
            elm = elm.parentNode;
        if (sobre_shown && c == 27) {
            ui_sobre_popup.cb_fechar();
            return;
        }
        if (main.editando) {
            if (c == 27)
                ui_turmas.cb_cancel();
            return;
        }
        if (elm == combo.input || elm == ui_saver.input || elm == ui_materias.input)
            return;
    };

    window.onbeforeunload = function (e) {
        e = e || window.event;
        var str = 'Mudanças feitas não foram salvas'

        if (mudancas && !persistence.write_state(state.to_json())) {
            // For IE and Firefox prior to version 4
            if (e) { e.returnValue = str; }
            // For Safari
            return str;
        }
    };

    ui_planos.startup(state);

    var identifier = persistence.read_id();
    ui_saver.identificar(identifier);
    var state2 = persistence.read_state();
    var database_ok = false;
    if (state2 && state2 != "") {
        try {
            var state3 = JSON.parse(state2);
            if (!main.load(state3))
                database_ok = true;
        } catch (e) {
            ui_logger.set_text("erro lendo estado da cache do navegador", "lightcoral");
            persistence.clear_state();
        }
    }
    if (!database_ok) {
        if (identifier != null && identifier != "") {
            ui_saver.cb_load(identifier, function(){ main.set_db(semester_as_str(...default_db, ''), "FLO"); });
            database_ok = true;
        }
    }
    if (!database_ok) {
        main.set_db(semester_as_str(...default_db, ''), "FLO");
    }
    if (combo.input.value == identifier)
        combo.input.value = "";

    document.getElementById("versao").innerHTML = versao_capim;
    document.getElementById("ui_main").style.display = "block";
    document.getElementById("ui_fb").style.display = "block";
    ui_turmas.set_height(ui_horario.height());
    ui_materias.fix_width();
}
