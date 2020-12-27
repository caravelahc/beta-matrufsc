/**
 * @constructor
 */
function Combinacoes()
{
    var self = this;

    var combinacoes = null;
    var current_int = 0;

    function closest(orig) {
        if (!orig)
            return 1;
        var best_c = null;
        var best_p = 0;
        combinacoes.forEach(function(c,j){
            var sum = 0;
            c.horarios_combo.forEach(function(horario){
                var t = horario.turma_representante;
                var t2 = null;
                if (orig.horarios_combo.some(function(horario2){
                        t2 = horario2.turma_representante;
                        return t.materia == t2.materia;
                    }))
                    sum += 10;
                if (t2 && t == t2)
                    sum += 100;
            });
            if (best_p < sum) {
                best_p = sum;
                best_c = j;
            }
        });
        return best_c+1;
    }
    function copy(combinacao, except) {
        var c2 = new Array();
        for (var i2 = 0; i2 < 6; i2++) {
            c2[i2] = new Array();
            for (var i3 = 0; i3 < 14; i3++) {
                if (combinacao[i2][i3] && combinacao[i2][i3].horario.materia != except)
                    c2[i2][i3] = {horario:combinacao[i2][i3].horario,sala:combinacao[i2][i3].sala};
            }
        }
        return c2;
    }

    var generate = function(materias) {
        const chosen_classes = materias.filter(m => m.selected);
        const new_combinacoes = [[],[],[],[],[],[]];
        new_combinacoes.horarios_combo = [];
        for (const materia of chosen_classes) {
            if (!materia.selected)
                continue;

            const horario = materia.turmas.find(t => t.nome === materia.chosen_class).horario;
            for (const aula of horario.aulas) {
                new_combinacoes[aula.dia][aula.hora] = {
                    horario,
                    sala: aula.sala
                };
            }
            new_combinacoes[materia.codigo] = horario;
            new_combinacoes.horarios_combo.push(horario);
        }
        combinacoes = [new_combinacoes];
    }

    /* procedures */
    self.generate    = generate;
    self.set_current = function(n) { current_int = n; };
    /* functions */
    self.get         = function(n) { if (combinacoes && n >= 1 && n <= combinacoes.length) return combinacoes[n-1]; };
    self.get_current = function( ) { if (current_int) return self.get(current_int); };
    self.current     = function( ) { return current_int; };
    self.length      = function( ) { return combinacoes ? combinacoes.length : 0; };
    self.copy        = function(c, e) { return copy(c, e); };
    self.closest     = closest;
}
