/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
function* range(start, end, step, f) {
    for (var i = start; i < end; i += step) {
        yield f(i);
    }
}
/*
 * made by bobince (at) gmail [dot] com
 * obtained from (07-02-2012):
 * http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
 */
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}
/**
 * @constructor
 */
function Persistence()
{
    var self = this;

    if (window.sessionStorage) {
        self.read_state  = function( ) { return sessionStorage.state3; };
        self.write_state = function(d) { sessionStorage.state3 = d; return true; };
        self.clear_state = function( ) { sessionStorage.clear(); };
        self.read_id     = function( ) { return localStorage.id2; };
        self.write_id    = function(d) { localStorage.id2 = d; return true; };
        self.clear_id    = function( ) { localStorage.clear(); };
    } else {
        var userdata = document.getElementById("userdata");

        if (userdata.addBehavior) {
            function userdata_read(id2) {
                userdata.load("persistence");
                return userdata.getAttribute(id2);
            }
            function userdata_write(id2, w) {
                userdata.setAttribute(id2, w);
                userdata.save("persistence");
                return true;
            }
            self.read_state  = function( ) { return userdata_read ("state3"   ); };
            self.write_state = function(d) { return userdata_write("state3", d); };
            self.clear_state = function( ) { userdata.removeAttribute("state3"); };
            self.read_id     = function( ) { return userdata_read ("id2"      ); };
            self.write_id    = function(d) { return userdata_write("id2"   , d); };
            self.clear_id    = function( ) { userdata.removeAttribute("id2"); };
        } else {
            self.read_state  = function( ) { return undefined; };
            self.write_state = function(d) { return false; };
            self.clear_state = function( ) { };
            self.read_id     = function( ) { return undefined; };
            self.write_id    = function(d) { return false; };
            self.clear_id    = function( ) { };
        }
    }
    self.reset = function() { self.clear_state(); self.clear_id(); };
}
/**
 * @constructor
 */
function Dconsole(id)
{
    var self = this;

    var dconsole = document.getElementById(id);
    var dconsoletext = new String();

    self.hexdump = function hexdump(prefix, str)
    {
        var hexstring = prefix + ": ";
        for (var i = 0; i < str.length; i++)
            hexstring += "0x" + str.charCodeAt(i).toString(16) + " ";
        hexstring += "\n";
        dprintf(hexstring);
    }
    self.printf = function printf(str)
    {
        var innerHTML = new String();
        var newstr = new String();
        var split = dconsoletext.split("\n");
        var n = split.length;
        var offset = n - 10;

        if (offset < 0)
            offset = 0;

        for (var i = 0; i < 8 && i < n-2; i++) {
            newstr += split[i+offset] + "\n";
            innerHTML += split[i+offset] + "<br />";
        }
        innerHTML += str + "<br />";
        newstr += str + "\n";
        dconsoletext = newstr;
        dconsole.innerHTML = innerHTML;
    }
}
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
var Horas = {
    "0730": 0,  0:"0730",
    "0820": 1,  1:"0820",
    "0910": 2,  2:"0910",
    "1010": 3,  3:"1010",
    "1100": 4,  4:"1100",
    "1330": 5,  5:"1330",
    "1420": 6,  6:"1420",
    "1510": 7,  7:"1510",
    "1620": 8,  8:"1620",
    "1710": 9,  9:"1710",
    "1830":10, 10:"1830",
    "1920":11, 11:"1920",
    "2020":12, 12:"2020",
    "2110":13, 13:"2110"
};

/**
 * @constructor
 */
function Aula(dia, hora, sala) {
    this.dia  = dia;
    this.hora = hora;
    this.sala = sala;
}
Aula.prototype.toString = function() {
    return (this.dia+2) + "." + Horas[this.hora] + "-1 / " + this.sala;
}

/**
 * @constructor
 */
function Turma(turma) {
    if (!turma) {
        this.horas_aula       = "0";
        this.vagas_ofertadas  = "0";
        this.vagas_ocupadas   = "0";
        this.alunos_especiais = "0";
        this.saldo_vagas      = "0";
        this.pedidos_sem_vaga = "0";
        this.professores      = new Array();
        this.aulas            = new Array();
        this.selected         = 0;
        return;
    }

    var self = this;

    turma = JSON.parse(JSON.stringify(turma));

    if (turma.selected == null)
        turma.selected = 1;
    this.nome             = turma.nome;
    this.selected         = turma.selected;
    this.horas_aula       = turma.horas_aula;
    this.vagas_ofertadas  = turma.vagas_ofertadas;
    this.vagas_ocupadas   = turma.vagas_ocupadas;
    this.alunos_especiais = turma.alunos_especiais;
    this.saldo_vagas      = turma.saldo_vagas;
    this.pedidos_sem_vaga = turma.pedidos_sem_vaga;
    this.professores      = turma.professores;
    this.aulas            = new Array();

    turma.horarios.forEach(function(horario){
        var dia  = parseInt(horario.slice(0,1)) - 2;
        var hora = Horas[horario.slice(2,6)];
        var n    = parseInt(horario.slice(7));
        var sala = horario.slice(11,21);
        for (var j = 0; j < n; j++)
            self.aulas.push(new Aula(dia, hora+j, sala));
    });
    self.order_aulas();
}
Turma.prototype.order_aulas = function() {
    var self = this;
    var aulas = self.aulas;
    for (var i = 0; i < aulas.length-1; i++) {
        for (var j = i+1; j < aulas.length; j++) {
            if ((aulas[j].dia < aulas[i].dia) || ((aulas[j].dia == aulas[i].dia) && (aulas[j].hora < aulas[i].hora))) {
                var tmp  = aulas[i];
                aulas[i] = aulas[j];
                aulas[j] = tmp;
            }
        }
    }
}
Turma.prototype.index = function(agrupar) {
    var index = this.nome;
    if (agrupar) {
        var index = "";
        for (var i = 0; i < this.aulas.length; i++)
            index += (this.aulas[i].dia+2) + "." + Horas[this.aulas[i].hora];
    }
    return index;
}

/**
 * @constructor
 */
function Materia(materia) {
    if (!materia) {
        this.turmas = new Array();
        this.horarios = new Object();
        this.agrupar  = 1;
        this.selected = 1;
        return;
    }

    var self = this;

    materia = JSON.parse(JSON.stringify(materia));

    if (materia.selected == null)
        materia.selected = 1;
    if (materia.agrupar  == null)
        materia.agrupar  = 1;

    this.agrupar  = materia.agrupar;
    this.codigo   = materia.codigo;
    this.cor      = materia.cor;
    this.nome     = materia.nome;
    this.selected = materia.selected;
    this.turmas   = new Array();
    materia.turmas.forEach(function(turma){
        turma = new Turma(turma);
        turma.materia = self;
        self.turmas.push(turma);
    });
    this.chosen_class = materia.chosen_class;
    if (this.chosen_class === undefined) {
        this.chosen_class = materia.turmas[0].nome;
    }
}

Materia.prototype.fix_horarios = function() {
    this.horarios = new Object();
    for (var k = 0; k < this.turmas.length; k++) {
        var turma = this.turmas[k];
        var index = turma.index(this.agrupar);
        if (!this.horarios[index]) {
            this.horarios[index] = new Object();
            this.horarios[index].turmas = new Object();
            this.horarios[index].turma_representante = turma;
            this.horarios[index].materia = this;
            this.horarios[index].aulas = turma.aulas;
        }
        this.horarios[index].turmas[turma.nome] = turma;
        turma.horario = this.horarios[index];
    }
}

/**
 * @constructor
 */
function Materias()
{
    var self = this;
    self.selected = "";

    var materias = new Object();
    var list = new Array();

    var cores = [
        {cor: "lightblue",taken:0},
        {cor:"lightcoral",taken:0},
        {cor:"lightcyan",taken:0},
        {cor:"lightgoldenrodyellow",taken:0},
        {cor:"lightgreen",taken:0},
        {cor:"lightpink",taken:0},
        {cor:"lightsalmon",taken:0},
        {cor:"lightseagreen",taken:0},
        {cor:"lightskyblue",taken:0},
        {cor:"lightslategray",taken:0},
        {cor:"lightsteelblue",taken:0},
        {cor:"lightyellow",taken:0},
        {cor: "lightblue",taken:0}
    ];

    function color_taken(cor) {
        for (var i = 0; i < cores.length; i++)
            if (cores[i].cor == cor) {
                cores[i].taken++;
                break;
            }
    }
    function color_available(cor) {
        for (var i = 0; i < cores.length; i++)
            if (cores[i].cor == cor) {
                cores[i].taken--;
                break;
            }
    }
    function get_color(taken) {
        if (taken == null)
            taken = 0;
        for (var i = 0; i < cores.length; i++) {
            if (cores[i].taken == taken) {
                cores[i].taken++;
                return cores[i].cor;
            }
        }
        return get_color(taken+1);
    };

    function new_item(codigo, nome, campus, semestre) {
        if (materias[codigo])
            return null;
        var materia = new Materia();
        materia.campus = campus;
        materia.semestre = semestre;
        materia.codigo = codigo;
        materia.nome   = nome;
        materia.cor    = get_color();
        materias[materia.codigo] = materia;
        list.push(materia);
        return materia;
    }
    var n_turmas = 1;
    function new_turma_name() {
        var nome = new String();
        if (n_turmas < 1000)
            nome += "0";
        if (n_turmas <  100)
            nome += "0";
        if (n_turmas <   10)
            nome += "0";
        nome += n_turmas;
        n_turmas++;
        return nome;
    };
    function update_add_turma(materia, turma) {
        turma.materia = materia;
        materia.turmas.push(turma);
        materia.fix_horarios();
    }
    function new_turma(materia) {
        var nok = true;
        do {
            var nome = new_turma_name();
            for (var k = 0; k < materia.turmas.length; k++)
                if (materia.turmas[k].nome == nome)
                    break;
            if (k == materia.turmas.length)
                nok = false;
        } while (nok);

        var turma = new Turma();
        turma.nome             = nome;
        turma.materia          = materia;
        materia.turmas.push(turma);
        materia.fix_horarios();
        materia.selected = 1;
    }
    function remove_turma(materia, turma) {
        var turmas = turma.horario.turmas;
        for (var j in turmas)
            for (var i = 0; i < materia.turmas.length; i++)
                if (materia.turmas[i] == turmas[j]) {
                    materia.turmas.splice(i,1);
                    break;
                }
        materia.fix_horarios();
    }
    function add_json(materia, campus, semestre)
    {
        if (materias[materia.codigo])
            return null;

        materia = new Materia(materia);
        if (materia.cor      == null)
            materia.cor      = get_color();
        else
            color_taken(materia.cor);
        if (!materia.campus)
            materia.campus   = campus;
        if (!materia.semestre)
            materia.semestre = semestre;
        materia.fix_horarios();

        materias[materia.codigo] = materia;
        list.push(materia);

        return materia;
    }
    function changed(materia, attr, str) {
        if (attr == "nome") {
            materia.nome = str;
        } else if (attr == "codigo") {
            var tmp = materias[materia.codigo];
            delete materias[materia.codigo];
            materias[str] = materia;
            materia.codigo = str;
        }
    }
    function remove_item(materia) {
        color_available(materia.cor);
        for (var i = 0; i < list.length; i++) {
            if (list[i] == materia) {
                list.splice(i,1);
                break;
            }
        }
        delete materias[materia.codigo];
    }

    /* procedures */
    self.add_json = add_json;
    self.new_item = new_item;
    self.changed = changed;
    self.remove_item = remove_item;
    self.new_turma = new_turma;
    self.update_add_turma = update_add_turma;
    self.remove_turma = remove_turma;
    self.list = list;
    /* functions */
    self.find = function(codigo) {
        return this.list.filter(m => m.codigo === codigo)[0];
    };
    self.get = function(codigo) { return materias[codigo]; };
}
/**
 * @constructor
 */
function Display(ui_logger, ui_horario)
{
    var self = this;
    var selected = null;

    function map_turma(turma, priv, func)
    {
        if (!turma.aulas)
            return;
        for (var i = 0; i < turma.aulas.length; i++) {
            var dia  = turma.aulas[i].dia;
            var hora = turma.aulas[i].hora;
            func(priv, dia, hora);
        }
    }
    function over(c, turma)
    {
        var materia = turma.materia;
        var current_turma = c && c[materia.codigo] ? c[materia.codigo].turma_representante : null;

        if (turma == selected)
            return;

        if (current_turma)
            map_turma(current_turma, null, function(priv, dia, hora) {
                ui_horario.clear_cell(dia, hora);
            });

        map_turma(turma, c, function(c, dia, hora) {
            if (c && c[dia][hora] && c[dia][hora].horario.materia != materia) {
                ui_logger.set_quick_text("choque de horario", "lightcoral");
                ui_horario.display_cell(dia, hora, Cell.red(materia));
            } else {
                ui_horario.display_cell(dia, hora, Cell.grey(materia));
            }
        });

        selected = turma;
    }
    function out(c, turma)
    {
        var materia = turma.materia;
        var current_turma = c && c[materia.codigo] ? c[materia.codigo].turma_representante : null;

        if (!c) {
            selected = "";
            ui_horario.reset();
            return;
        }

        if (turma != current_turma)
            map_turma(turma, c, function(c, dia, hora) {
                if (c[dia][hora] && c[dia][hora].horario)
                    ui_horario.display_cell(dia, hora, Cell.normal(c[dia][hora]));
                else
                    ui_horario.clear_cell(dia, hora);
            });

        if (current_turma)
            map_turma(current_turma, c, function(c, dia, hora) {
                ui_horario.display_cell(dia, hora, Cell.normal(c[dia][hora]));
            });

        ui_logger.unset_quick_text();

        selected = null;
    }
    function turma(c, turma) {
        map_turma(turma, c, function(c, dia, hora) {
            ui_horario.display_cell(dia, hora, Cell.normal(c[dia][hora]));
        });
    }

    /* procedures */
    self.reset = function() { ui_horario.reset(); selected = null; };
    self.out   = out;
    self.over  = over;
    self.turma = turma;
    /* functions */
    self.get_selected = function() { return selected; }
}
/**
 * @constructor
 */
function Combobox(input, suggestions, ui_logger, database)
{
    function select_item(item)
    {
        if (!self.array.length) {
            return;
        }
        if (self.selected_item != -1) {
            self.array[self.selected_item].style.backgroundColor = self.color_0;
        }
        if (item >= self.array.length) {
            self.selected_item = 0;
        } else if (item < 0) {
            self.selected_item = self.array.length - 1;
        } else {
            self.selected_item = item;
        }

        var s_top    = self.suggestions.scrollTop;
        var s_height = self.suggestions.clientHeight;
        var i_top    = self.array[self.selected_item].offsetTop;
        var i_height = self.array[self.selected_item].clientHeight;

        if ( s_top > i_top) {
            self.suggestions.scrollTop = i_top;
        } else if ((s_top + s_height) < (i_top + i_height)) {
            self.suggestions.scrollTop = i_top + i_height - s_height;
        }

        self.array[self.selected_item].style.backgroundColor = self.color_1;
        list_show();
    }

    function deselect_item()
    {
        if (self.selected_item != -1) {
            self.array[self.selected_item].style.backgroundColor = self.color_0;
            self.selected_item = -1;
        }
    }

    var self = this;
    self.color_0 = "white";
    self.color_1 = "#eeeeee";
    self.input = document.getElementById(input);
    self.input.className = "combobox_input";
    self.suggestions = document.getElementById(suggestions);
    self.suggestions.className = "combobox_suggestions";
    self.mouse_over_suggestions = false;

    function list_create() {
        self.internal_div = document.createElement("div");
        self.internal_div.style.marginRight = (document.scrollbar_width+1) + "px";

        self.array = new Array();
        self.selected_item = -1;

        self.suggestions.onmouseover = function() { self.mouse_over_suggestions = true; };
        self.suggestions.onmouseout  = function() { self.mouse_over_suggestions = false; };
        self.suggestions.appendChild(self.internal_div);
        list_add_item("Criar atividade extra", "Clique aqui para criar uma atividade extra-curricular, adicionando seus próprios horários");
        self.array[0].style.fontSize = "13px";
        self.array[0].style.fontWeight = "bold";
        self.array[0].onmouseup = function() {
            deselect_item();
            self.cb_new_materia(self.input.value);
            list_hide();
            self.input.blur();
        };
        list_hide();
    }

    function list_add_item(str, title) {
        var li = document.createElement("div");
        li.style.cursor = "pointer";

        if (title) {
            li.title = title;
        }

        li.innerHTML   = str;
        li.onmouseover = function() { select_item(this.index); };
        li.onmouseout  = function() { deselect_item(); };
        li.onselectstart=function() { return false; }
        li.onmouseup   = function() {
            deselect_item();
            self.input.value = this.codigo;
            add_item(self.input.value);
            list_hide();
            self.input.blur();
        };
        li.codigo = str.split(" ")[0];
        li.index = self.array.length;
        self.array.push(li);
        self.internal_div.appendChild(li);
        return self.array.length-1;
    };
    function do_search_more() {
        var fetch_result = database.page(self.page++);
        self.internal_div.removeChild(self.array[self.more]);
        self.array.splice(self.more, 1);
        self.more = null;
        if (fetch_result.length > 0)
            list_add_items(fetch_result);
    };
    function list_add_items(items) {
        var first = self.array.length;
        items.forEach(function(item){
            var str = item.codigo + " " + item.nome;
            list_add_item(str);
        });
        if (items.length == 10) {
            self.more = list_add_item("Buscar mais...");
            self.array[self.more].style.fontSize = "13px";
            self.array[self.more].style.fontWeight = "bold";
            self.array[self.more].onmouseup = do_search_more;
        } else {
            self.more = 0;
        }
        select_item(first);
    }
    function list_clear() {
        for (var i = 1; i < self.array.length; i++)
            self.internal_div.removeChild(self.array[i]);
        self.array.splice(1, self.array.length);
        self.selected_item = -1;
        self.page = 1;
    };
    function list_show() {
        self.suggestions.style.display = "";
    }
    function list_hide() {
        self.mouse_over_suggestions = false;
        self.suggestions.style.display = "none";
    }

    list_create();

    self.input.onblur    = function() {
        if (self.mouse_over_suggestions) {
            setTimeout("document.getElementById(\"" + input + "\").focus();",1);
            self.input.focus();
        } else {
            list_hide();
        }
    };
    self.input.onfocus   = function() { if (self.input.value) list_show(); };
    self.input.onkeydown = function(e) {
        var c = (e) ? e.keyCode : event.keyCode;
        if (c == 40 /* down */) {
            select_item(self.selected_item + 1);
        } else if (c == 38 /* up */) {
            select_item(self.selected_item - 1);
        } else if (c == 27 /* esc */) {
            deselect_item();
            list_hide();
        } else if (c == 13 /* enter */) {
            if (self.more && self.selected_item == self.more) {
                do_search_more();
                return;
            } else
            if (self.selected_item == 0) {
                deselect_item();
                list_hide();
                self.cb_new_materia(self.input.value);
                self.input.focus();
                return;
            } else
            if (self.selected_item != -1) {
                self.input.value = self.array[self.selected_item].codigo;
                deselect_item();
                list_hide();
            }
            add_item(self.input.value);
            self.input.focus();
        }
    };
    self.input.onkeyup   = function (e) {
        var c = (e) ? e.keyCode : event.keyCode;
        var fetch = self.input.value;

        if (!((c >= 65 /* a */) && (c <=  90 /* z */)) &&
            !((c >= 48 /* 0 */) && (c <=  57 /* 9 */)) &&
            !((c >= 96 /* 0 */) && (c <= 105 /* 9 */)) &&
            c != 46 /* del */ && c != 8 /* backspace */)
            return;

        list_clear();
        if (fetch.length > 0) {
            database.fetch(fetch);
            var fetch_result = database.page(0);
            if (fetch_result.length > 0) {
                list_add_items(fetch_result);
                var n = fetch_result.length;
                var v = new String();
                if (n == 1)
                    v = "1 vez";
                else
                    v = n + " vezes";
                if (n == 10)
                    v = v + " ou mais";
                ui_logger.set_text("'" + fetch + "' encontrado " + v, "lightgreen");
            } else {
                ui_logger.set_text("'" + fetch + "' n\u00e3o encontrado", "lightcoral");
            }
            list_show();
        } else {
            ui_logger.reset();
            list_hide();
        }
    };

    function add_item(codigo) {
        var full_result = database.full(codigo.toUpperCase());
        if (full_result) {
            self.cb_add_materia(full_result);
        } else {
            ui_logger.set_text("'" + codigo + "' n\u00e3o adicionada", "lightcoral");
        }
    }

    /* procedures */
    self.add_item    = add_item;
    /* callbacks */
    self.cb_add_materia = null;
    self.cb_new_materia = null;
}
DB_BASE_PATH = 'data/'
/**
 * @constructor
 */
function Database() {
    this.db = new Object();
    this.search_score = function(haystack, needle, value) {
        needle.lastIndex = 0;
        var tmp = haystack.match(needle);
        if (tmp === null)
            return 0;
        return tmp.length * value;
    };
}
Database.prototype.get_date = function(semestre) {
    return this.db[semestre]["DATA"];
}
Database.prototype.set_db = function(semestre, campus) {
    if (this.db[semestre] && this.db[semestre][campus]) {
        this.cur_db = this.db[semestre][campus];
	return 0;
    }
    return -1;
}
Database.prototype.add = function(semestre, array) {
    var self = this;
    self.db[semestre] = new Array();

    for (var campus in array) {
        var campus_array = array[campus];
        if (campus === "DATA") {
            self.db[semestre][campus] = campus_array;
            continue;
        }
        self.db[semestre][campus] = new Array();
        campus_array.forEach(function(k) {
            var i = new Object();
            i.codigo     = k[0];
            i.nome_ascii = k[1];
            i.nome       = k[2];
            i.turmas     = new Array();
            k[3].forEach(function(m) {
                var n = new Object();
                n.nome              = m[0];
                n.horas_aula        = m[1];
                n.vagas_ofertadas   = m[2];
                n.vagas_ocupadas    = m[3];
                n.alunos_especiais  = m[4];
                n.saldo_vagas       = m[5];
                n.pedidos_sem_vaga  = m[6];
                n.horarios          = m[7];
                n.professores       = m[8];
                i.turmas.push(n);
            });
            self.db[semestre][campus][i.codigo] = i;
            self.db[semestre][campus].push(i);
        });
    }
}
Database.prototype.fetch = function(string, page) {
    string = string.toUpperCase()
            .replace(/[ÀÁÂÃÄÅ]/g, "A")
            .replace(/[ÈÉÊË]/g, "E")
            .replace(/[ÌÍÎÏ]/g, "I")
            .replace(/[ÒÓÔÕÖØ]/g, "O")
            .replace(/[ÙÚÛÜ]/g, "U")
            .replace(/Ç/g, "C")
            .replace(/Ð/g, "D")
            .replace(/Ñ/g, "N")
            .replace(/Ý/g, "Y")
            .replace(/ß/g, "B");
    var search_whole = [];
    var search_part = [];
    var needles = string.split(" ");
    needles.forEach(function(str) {
        if (str != "") {
            search_whole.push(new RegExp("\\b" + str + "\\b", "g"));
            search_part.push(new RegExp(str, "g"));
        }
    });
    this.result = [];
    this.result.forEach(function(t) {
        delete t.score;
    });
    for (var i = 0; i < this.cur_db.length; i++) {
        var haystack = this.cur_db[i];
        var firstword = haystack.nome_ascii.split(" ")[0];
        var exactly = false;
        var score = 0;
        for (var j = 0; j < search_whole.length; j++) {
            var expr_score = 0;
            search_whole[j].lastIndex = 0;
            if (search_whole[j].test(haystack.codigo)) {
                exactly = true;
                continue;
            }
            if (firstword == needles[j])
                expr_score += 200;
            expr_score += this.search_score(haystack.nome_ascii, search_whole[j], 100);
            expr_score += this.search_score(haystack.nome_ascii, search_part[j], 10);
            expr_score += this.search_score(haystack.codigo, search_part[j], 1);
            if (expr_score) {
                score += expr_score;
            } else {
                score = 0;
                break;
            }
        }
        if (exactly) {
            this.result = [haystack];
            break;
        }
        if (score) {
            haystack.score = score;
            this.result.push(haystack);
        }
    }
    this.result.sort(function(a,b) {
        var diff = b.score - a.score;
        if (!diff) {
            if (a.score < 10 && b.score < 10) {
                if (b.codigo < a.codigo) {
                    diff =  1;
		} else if (a.codigo < b.codigo) {
                    diff = -1;
	        }
            } else {
                if (b.nome_ascii < a.nome_ascii) {
                    diff =  1;
		} else if (a.nome_ascii < b.nome_ascii) {
                    diff = -1;
		}
            }
        }
        return diff;
    });
}
Database.prototype.page = function(page) {
    return this.result.slice(page*10, (page+1)*10);
}
Database.prototype.full = function(string) {
    return this.cur_db[string];
}
/**
 * @constructor
 */
function Plano(n)
{
    var self = this;

    self.index = n;
    self.nome = "Plano " + (n + 1);
    self.cleanup();
}
Plano.prototype.cleanup = function() {
    this.combinacoes = new Combinacoes();
    this.materias    = new Materias();
}


function check_subject_db(database, subject_state) {
    let semester = subject_state.semestre;

    let semester_db = database.db[DB_BASE_PATH + '/' + semester];
    if (!semester_db) {
        return null;
    }

    let campus_db = semester_db[subject_state.campus];
    if (!campus_db) {
        return null;
    }

    return campus_db[subject_state.codigo];
}

/**
 * @constructor
 */
function State()
{
    var self = this;

    self.reset = function() {
        self.planos = Array.from(range(0, 3, 1, i => new Plano(i)));
        self.index = 0;
        self.plano = self.planos[self.index];
        self.campus = "FLO";
        self.semestre = semester_as_str(...current_display_semester(), '');
    }
    self.reset();

    self.copy_plano = function(plano) {
        var state_plano = new Object();
        var list = plano.materias.list;
        state_plano.combinacao = plano.combinacoes.current();
        state_plano.materias   = new Array();
        state_plano.materia    = plano.materias.selected
        for (var i = 0; i < list.length; i++) {
            var state_materia = new Object();
            var materia = list[i];
            state_materia.codigo   = materia.codigo.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/&/g,"&amp;");
            state_materia.nome     = materia.nome.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/&/g,"&amp;");
            state_materia.cor      = materia.cor;
            state_materia.campus   = materia.campus;
            state_materia.semestre = materia.semestre;
            state_materia.chosen_class = materia.chosen_class;
            state_materia.turmas   = new Array();
            for (var j = 0; j < materia.turmas.length; j++) {
                var state_turma = new Object();
                var turma = materia.turmas[j];
                state_turma.nome             = turma.nome;
                state_turma.horas_aula       = turma.horas_aula;
                state_turma.vagas_ofertadas  = turma.vagas_ofertadas;
                state_turma.vagas_ocupadas   = turma.vagas_ocupadas;
                state_turma.alunos_especiais = turma.alunos_especiais;
                state_turma.saldo_vagas      = turma.saldo_vagas;
                state_turma.pedidos_sem_vaga = turma.pedidos_sem_vaga;
                state_turma.professores      = new Array();
                for (var k = 0; k < turma.professores.length; k++)
                    state_turma.professores.push(turma.professores[k]);
                state_turma.horarios         = new Array();
                for (var k = 0; k < turma.aulas.length; k++)
                    state_turma.horarios.push(turma.aulas[k].toString());
                state_turma.selected         = turma.selected;
                state_materia.turmas.push(state_turma);
            }
            state_materia.agrupar  = materia.agrupar;
            state_materia.selected = materia.selected;
            state_plano.materias.push(state_materia);
        }
        return state_plano;
    }

    self.to_json = function() {
        let data = new Object();
        data.versao = 5;
        data.campus = self.campus;
        data.semestre = self.semestre;
        data.planos = new Array();
        data.plano = self.index;
        for (let p = 0; p < self.planos.length; p++) {
            let state_plano = self.copy_plano(self.planos[p]);
            data.planos.push(state_plano);
        }
        return JSON.stringify(data);
    };

    var cores = document.createElement("textarea");
    cores.style.display = "none";
    cores.style.color = "transparent";
    document.body.appendChild(cores);

    /* http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable */
    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    self.preview = function(p) {
        var h = [[],[],[],[],[],[]];
        var t = [];

        var c = self.plano.combinacoes.get_current();
        c.horarios_combo.forEach(function(horario){
            for (var k in horario.turmas) {
                if (horario.turmas[k].selected) {
                    var turma = horario.turmas[k];
                    break;
                }
            }
            if (!turma)
                var turma = horario.turma_representante;
            turma.order_aulas();

            cores.style.color = turma.materia.cor;
            var cor = rgb2hex(cores.style.getPropertyValue("color"));
            cores.style.color = "transparent";

            t.push({ codigo: turma.materia.codigo, nome: turma.materia.nome, turma: turma.nome, periodo: turma.materia.semestre, professores: turma.professores, cor: cor });
            for (var i = 0; i < turma.aulas.length; i++) {
                var dia  = turma.aulas[i].dia;
                var hora = turma.aulas[i].hora;
                h[dia][hora] = { codigo: turma.materia.codigo, sala: turma.aulas[i].sala, cor: cor };
            }
        });
        return { horarios: h, turmas: t, index: self.index };
    };

    self.new_plano = function(plano_to_load, n) {
        var plano = new Plano(n);
        plano.materias.selected = plano_to_load.materia;
        /* não deveria ser necessário o parseInt aqui mas, por causa de um bug
         * no código, vários horários foram salvos com a combinação como
         * string. */
        plano.combinacao = parseInt(plano_to_load.combinacao);
        for (var i = 0; i < plano_to_load.materias.length; i++) {
            var materia = plano.materias.add_json(plano_to_load.materias[i], self.campus, self.semestre);
            if (!materia)
                return -1;
            materia.codigo = materia.codigo.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
            materia.nome   = materia.nome.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
        }
        return plano;
    };

    self.load = function(state_to_load) {
        if (state_to_load.versao > 5)
            return -2;

        self.campus = state_to_load.campus;
        self.semestre = state_to_load.semestre;
        self.planos = [];

        for (var p = 0; p < state_to_load.planos.length; p++) {
            var plano = self.new_plano(state_to_load.planos[p], p);

            if (plano == -1) {
                return -1;
            }

            self.planos.push(plano);
        }

        if (!self.planos[0]) {
            self.planos[0] = new Plano(1);
        }

        var plano_to_load = state_to_load.plano;
        if (plano_to_load < 0 ||
            plano_to_load > self.planos.length ||
            !plano_to_load)
        {
            plano_to_load = 0;
        }
        self.index = plano_to_load;
        self.plano = self.planos[plano_to_load];
        return 0;
    };

    self.set_plano = function(plano) {
        var i = 0;
        if (plano) {
            for (; i < self.planos.length; i++) {
                if (self.planos[i] == plano) {
                    break;
                }
            }
        }
        self.index = i;
        self.plano = self.planos[self.index];
    };

    self.issues = function(database, callback_yes, callback_no) {
        var issues = [];
        var materias = self.plano.materias.list;
        for (var i = 0; i < materias.length; i++) {
            var m_issues = [];
            m_issues.materia = materias[i];
            var state_materia = materias[i];

            var db_materia = check_subject_db(database, state_materia);
            if (!db_materia) {
                if (/^[A-Z]{3}[0-9]{4}$/.test(state_materia.codigo) &&
                   !/^XXX[0-9]{4}$/.test(state_materia.codigo)) {
                    var issue = {};
                    issue.text = "Matéria não existe mais";
                    issue.button = "Remover matéria";
                    issue.action = function(materia) {
                        return function() {
                            self.plano.materias.remove_item(materia);
                        };
                    }(state_materia);
                    m_issues.push(issue);
                    issues.push(m_issues);
                }
                continue;
            }
            db_materia = new Materia(db_materia);
            for (var j = 0; j < state_materia.turmas.length; j++) {
                var state_turma = state_materia.turmas[j];
                state_turma.order_aulas();
                var db_turma = null;
                for (var k = 0; k < db_materia.turmas.length; k++) {
                    if (state_turma.nome == db_materia.turmas[k].nome) {
                        db_turma = db_materia.turmas[k];
                        break;
                    }
                }
                if (!db_turma) {
                    if (state_turma.nome.length != 4) {
                        var issue = {};
                        issue.text = "Turma " + state_turma.nome + " não existe mais!";
                        issue.button = "Remover turma";
                        issue.action = function(materia, turma) {
                            return function() {
                                self.plano.materias.remove_turma(materia, turma);
                            };
                        }(state_materia, state_turma);
                        m_issues.push(issue);
                    }
                    continue;
                }
                state_turma.horas_aula       = db_turma.horas_aula;
                state_turma.vagas_ofertadas  = db_turma.vagas_ofertadas;
                state_turma.vagas_ocupadas   = db_turma.vagas_ocupadas;
                state_turma.alunos_especiais = db_turma.alunos_especiais;
                state_turma.saldo_vagas      = db_turma.saldo_vagas;
                state_turma.pedidos_sem_vaga = db_turma.pedidos_sem_vaga;
                if (JSON.stringify(state_turma.professores) != JSON.stringify(db_turma.professores)) {
                    var issue = {};
                    issue.text = "Turma " + state_turma.nome + ": mudança de professores.";
                    issue.text_from = "";
                    for (var p = 0; p < state_turma.professores.length; p++) {
                        if (p) issue.text_from += ", ";
                        issue.text_from += state_turma.professores[p];
                    }
                    issue.text_to = "";
                    for (var p = 0; p < db_turma.professores.length; p++) {
                        if (p) issue.text_to += ", ";
                        issue.text_to += db_turma.professores[p];
                    }
                    issue.button = "Corrigir professores";
                    issue.action = function(turma, professores) {
                        return function() {
                            turma.professores = professores;
                        };
                    }(state_turma, JSON.parse(JSON.stringify(db_turma.professores)));
                    m_issues.push(issue);
                }
                for (var k = 0; k < state_turma.aulas.length; k++) {
                    if ((state_turma.aulas[k].dia  != db_turma.aulas[k].dia ) ||
                        (state_turma.aulas[k].hora != db_turma.aulas[k].hora)) {
                        var issue = {};
                        issue.text = "Turma " + state_turma.nome + ": horários de aula mudaram.";
                        issue.button = "Corrigir horários de aula";
                        issue.action = function(turma, aulas) {
                            return function() {
                                turma.aulas = aulas;
                                turma.materia.fix_horarios();
                            };
                        }(state_turma, db_turma.aulas);
                        m_issues.push(issue);
                        break;
                    }
                }
                db_materia.turmas.splice(db_materia.turmas.indexOf(db_turma), 1);
            }
            for (var j = 0; j < db_materia.turmas.length; j++) {
                var db_turma = db_materia.turmas[j];
                var issue = {};
                issue.text = "Turma " + db_turma.nome + " é nova!";
                issue.button = "Adicionar turma";
                issue.action = function(materia, turma) {
                    return function() {
                        self.plano.materias.update_add_turma(materia, turma);
                    };
                }(state_materia, db_turma);
                m_issues.push(issue);
            }
            if (m_issues[0]) {
                issues.push(m_issues);
            }
        }
        if (issues[0]) {
            callback_yes(issues);
        } else {
            callback_no();
        }
    };
}
versao_capim = "versão 3.0"
/**
 * @constructor
 */
function widget_dropdown_menu(parent, width, padding, left)
{
    var self = this;

    var button = document.createElement("span");
    button.onselectstart = function () { return false; };
    button.className = "widget_dropdown_menu_button";
    button.innerHTML = "V";
    parent.appendChild(button);
    self.button_menu = button;

    var menu = document.createElement("div");
    menu.className = "widget_dropdown_menu";
    menu.style.width = width + "px";
    if (left) {
        menu.style.top = "18px";
        menu.style.left = (19 - width) + "px";
    }
    button.appendChild(menu);

    self.opcoes = [];

    self.add = function(nome, onclick) {
        var menu_op = document.createElement("div");
        menu_op.className = "widget_dropdown_menu_op";
        menu_op.style.padding = padding + "px";
        menu_op.innerHTML = nome;
        menu_op.onclick = onclick;
        menu.appendChild(menu_op);
        self.opcoes.push(menu_op);
    };
}
/**
 * @constructor
 */
function UI_avisos(id)
{
    var self = this;

    var panel = document.getElementById(id);

    panel.className = "ui_avisos";

    /* functions */
    self.show = function() { panel.style.display = "block"; };
    self.hide = function() { panel.style.display = "none"; };
    self.reset = function() { panel.innerHTML = ""; self.hide(); };
    self.set_text = function(text) { panel.innerHTML = text; self.show(); };

    self.hide();
}
/**
 * Returns appropriate [year, semester] to be displayed as default in semester
 * selection.
 *
 * Semester starts at 1.
 */
function current_display_semester() {
    const semester_end_months = [5, 10, 11];

    let today = new Date(Date.now());

    let semester = 1 + Math.floor(today.getMonth() / 6);
    if (semester_end_months.includes(today.getMonth())) {
        semester += 1;
    }

    let year = today.getFullYear();

    return [year, semester];
}

function semester_as_str(year, semester, dash) {
    return year + dash + semester;
}

function load_semesters(max) {
    let [year, semester] = current_display_semester();

    let semesters = [];
    for (let _ of Array(max).keys()) {
        semesters.push(year + '-' +  semester);

        semester--;
        if (semester == 0) {
            semester = 2;
            year -= 1;
        }
    }

    return semesters;
}

function make_semester_option(semester) {
    let option = document.createElement("option");
    option.value = semester.replace('-', '');
    option.innerHTML = semester;
    return option;
}

/**
 * @constructor
 */
function UI_campus(id)
{
    let self = this;

    let ui_campus = document.getElementById(id).parentNode;
    ui_campus.className = "ui_campus";
    ui_campus.appendChild(document.createTextNode("campus: "));
    let campus = document.createElement("select");
    let campuses = [
        ["FLO", "Florianópolis"],
        ["JOI", "Joinville"],
        ["CBS", "Curitibanos"],
        ["ARA", "Araranguá"],
        ["BLN", "Blumenau"],
    ];
    for (let camp of campuses) {
        let option = document.createElement("option");
        option.value = camp[0];
        option.innerHTML = camp[1];
        campus.appendChild(option);
    }

    ui_campus.appendChild(campus);

    campus.value = "FLO";

    campus.onchange = function() {
        self.cb_campus(this.value);
    }

    let semestre = document.createElement("select");

    let semesters = load_semesters(4);

    for (let semester of semesters) {
        semestre.appendChild(make_semester_option(semester));
    }

    ui_campus.appendChild(semestre);

    semestre.value = semester_as_str(semesters[semesters.length - 1], '-');
    semestre.selectedIndex = 0;

    semestre.onchange = function() {
        self.cb_semestre(this.value);
    }

    /* callbacks */
    self.cb_campus = null;
    self.cb_semestre = null;
    /* procedures */
    self.set_campus = function(value) { campus.value = value; };
    self.set_semestre = function(value) { semestre.value = value; };
}
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
/**
 * @constructor
 */
function UI_horario(id)
{
    var self = this;
    var dias  = [ "Segunda", "Ter\u00e7a", "Quarta", "Quinta", "Sexta", "S\u00e1bado" ];
    var horas = [ "07:30", "08:20", "09:10", "10:10", "11:00",
                  "13:30", "14:20", "15:10", "16:20", "17:10",
                  "18:30", "19:20", "20:20", "21:10"];
    var horas_fim = [ "08:20", "09:10", "10:00", "11:00", "11:50",
                      "14:20", "15:10", "16:00", "17:10", "18:00",
                      "19:20", "20:10", "21:10", "22:00"];
    var horas_fim_div = [];
    var mostrar_sala = false;
    var horario = document.getElementById(id);
    horario.className = "ui_horario";

    array = new Array();
    for (var i = 0; i < 6; i++) {
        array[i] = new Array();
    }

    var table = document.createElement("table");
    var thead = document.createElement("thead");

    var row = document.createElement("tr");
    var head = document.createElement("th");
    var input = document.createElement("input");
    input.title = "mostrar salas";
    input.type  = "checkbox";
    input.onchange = function() {
        mostrar_sala = this.checked;
        self.show_fim();
        self.cb_select();
    };
    head.appendChild(input);
    row.appendChild(head);
    for (var i = 0; i < dias.length; i++) {
        var head = document.createElement("th");
        head.innerHTML = dias[i];
        row.appendChild(head);
    }
    thead.appendChild(row);

    table.appendChild(thead);

    self.show_fim = function() {
        horas_fim_div.forEach(function(div) {
            if (mostrar_sala) {
                div.style.display = "block";
            } else {
                div.style.display = "none";
            }
        });
    }

    var tbody = document.createElement("tbody");
    for (var j = 0; j < horas.length; j++) {
        if (j == 5 || j == 10) {
            var row = document.createElement("tr");
            row.style.height = "4px";
            tbody.appendChild(row);
        }
        var row = document.createElement("tr");
        var hora = document.createElement("td");
        hora.style.fontSize = "11px";
        var div = document.createElement("div");
        div.innerHTML = horas[j];
        hora.appendChild(div);
        var div = document.createElement("div");
        div.innerHTML = horas_fim[j];
        hora.appendChild(div);
        horas_fim_div.push(div);
        row.appendChild(hora);
        for (var i = 0; i < dias.length; i++) {
            var data = document.createElement("td");
            data.className = "ui_horario_celula";
            data.innerHTML = "&nbsp;";

            if (mostrar_sala) {
                var div = document.createElement("div");
                div.style.fontSize = "10px";
                div.innerHTML = "&nbsp;";
                data.appendChild(div);
            }

            array[i][j] = data;
            row.appendChild(data);
        }
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    horario.appendChild(table);
    self.show_fim();

    var reset = function() {
        for (var dia = 0; dia < 6; dia++)
            for (var hora = 0; hora < 14; hora++)
                clear_cell(dia, hora);
    }
    var clear_cell = function(dia, hora) {
        var cell = array[dia][hora];
        cell.innerHTML = "&nbsp;";

        if (mostrar_sala) {
            var div = document.createElement("div");
            div.style.fontSize = "10px";
            div.innerHTML = "&nbsp;";
            cell.appendChild(div);
        }

        cell.style.backgroundColor = "white";
        cell.style.border = "1px solid black";
        cell.style.color = "black";
    }
    var display_cell = function(dia, hora, data) {
        var cell = array[dia][hora];
        cell.innerHTML = data.text;

        if (mostrar_sala) {
            var div = document.createElement("div");
            div.style.fontSize = "10px";
            if (data.sala) {
                div.innerHTML = data.sala;
            } else {
                div.innerHTML = "&nbsp;";
            }
            cell.appendChild(div);
        }

        if (data.fixed)
            cell.style.fontWeight = "";
        else
            cell.style.fontWeight = "bold";
        cell.style.backgroundColor = data.bgcolor;
        cell.style.color = data.color;
    }
    function set_toggle(func, onover, onout) {
        for (var dia = 0; dia < 6; dia++) {
            for (var hora = 0; hora < 14; hora++) {
                if (func) {
                    array[dia][hora].style.cursor = "pointer";
                    array[dia][hora].onclick     = function() { func(this.dia, this.hora); };
                    array[dia][hora].onmouseover = function() { onover(this.dia, this.hora); };
                    array[dia][hora].onmouseout  = function() { onout(this.dia, this.hora); };
                } else {
                    array[dia][hora].style.cursor = "";
                    array[dia][hora].onclick = null;
                    array[dia][hora].onmouseover = null;
                    array[dia][hora].onmouseout = null;
                }
                array[dia][hora].dia = dia;
                array[dia][hora].hora = hora;
            }
        }
        if (func) {
            horario.style.zIndex = "2000";
        } else {
            horario.style.zIndex = "0";
        }
    }

    /* procedures */
    self.set_toggle   = set_toggle;
    self.display_cell = display_cell;
    self.clear_cell   = clear_cell;
    self.reset        = reset;
    /* functions */
    self.height       = function() { return horario.offsetHeight; };
    /* callbacks */
    self.cb_select    = null;
}

var Cell = {
    normal: function(d) {
        return {
            fixed: d.fixed,
            text: d.horario.materia.codigo + '\n' + d.horario.materia.chosen_class,
            sala: d.sala,
            bgcolor: d.horario.materia.cor,
            color: "black",
        };
    },
    red: function(materia) {
        return {
            fixed: true,
            text: materia.codigo,
            bgcolor: "red",
            color: "black",
        };
    },
    grey: function(materia) {
        return {
            fixed: false,
            text: materia.codigo,
            bgcolor: "grey",
            color: "white",
        };
    }
};
/**
 * @constructor
 */
function UI_logger(id)
{
    var self = this;

    var persistent_color = null;
    var persistent_str = null;

    var ui_logger = document.getElementById(id).parentNode;
    ui_logger.className = "ui_logger";
    var stop = function() {
        if (self.timer) {
            clearTimeout(self.timer);
            self.timer = null;
        }
    }
    var reset = function(hard) {
        stop();
        if (hard)
            clear_persistent();
        ui_logger.innerHTML = persistent_str;
        ui_logger.style.backgroundColor = persistent_color;
        ui_logger.style.textAlign = "left";
    };
    var set_text = function(str, color) {
        stop();
        ui_logger.innerHTML = str;
        ui_logger.style.backgroundColor = color;
        ui_logger.style.textAlign = "left";
        self.timer = setTimeout((function(t){return function(){t.reset();}})(self), 5000);
    }
    var quick_text = "";
    var quick_color;
    var unset_quick_text = function() {
        if (quick_text) {
            stop();
            self.set_text(quick_text, quick_color);
            quick_text = "";
        }
    };
    var set_quick_text = function(str, color) {
        if (!quick_text) {
            quick_text = ui_logger.innerHTML;
            quick_color = ui_logger.style.backgroundColor;
        }
        stop();
        ui_logger.innerHTML = str;
        ui_logger.style.backgroundColor = color;
        ui_logger.style.textAlign = "center";
        self.timer = setTimeout((function(t){return function(){t.unset_quick_text()}})(self), 2000);
    };
    var updatesearch = function() {
        self.pontos += ".";
        if (self.pontos == "....")
            self.pontos = ".";
        ui_logger.innerHTML = self.str + self.pontos;
        self.timer = setTimeout((function(t){return function(){t.updatesearch();}})(self), 200);
    }
    var waiting = function(str) {
        self.str = str;
        stop();
        self.pontos = "";
        self.updatesearch();
        ui_logger.style.backgroundColor = "lightyellow";
        ui_logger.style.textAlign = "left";
    }
    var set_persistent = function(str, color) {
        persistent_str = str;
        persistent_color = color;
    }
    var clear_persistent = function() {
        persistent_str = "&lt;&lt;&lt;&lt; procure as disciplinas por nome ou código";
        persistent_color = "#eeeeee";
    }
    clear_persistent();
    reset();

    /* procedures */
    self.reset        = reset;
    self.stop         = stop;
    self.set_text     = set_text;
    self.set_quick_text= set_quick_text;
    self.unset_quick_text= unset_quick_text;
    self.set_persistent = set_persistent;
    self.clear_persistent = clear_persistent;
    self.updatesearch = updatesearch;
    self.waiting      = waiting;
}
/**
 * @constructor
 */
function UI_materias(id)
{
    var self = this;

    var list = document.getElementById(id);

    list.className = "ui_materias"

    var thiswidth = 882;

    var table;
    var thead;
    var tbody;
    var scroll_div;

    var mouseover_materia = null;
    var mouseout_materia = function() {
        if (mouseover_materia) {
            self.cb_onmouseout(mouseover_materia);
            mouseover_materia = null;
        }
    };
    function create() {
        table = document.createElement("table");
        thead = document.createElement("thead");
        table.cellPadding="1";
        table.cellSpacing="1";
        table.appendChild(thead);
        list.appendChild(table);
        var row  = document.createElement("tr");
        row.onmouseover = mouseout_materia;
        row.style.backgroundColor = "#eeeeee";
        var data = document.createElement("th");
        data.style.width = "22px";
        row.appendChild(data);
        var data = document.createElement("th");
        data.style.textAlign = "center";
        data.style.width = "60px";
        data.innerHTML = "C\u00f3digo";
        row.appendChild(data);
        var data = document.createElement("th");
        data.style.textAlign = "center";
        data.style.width = "50px";
        data.innerHTML = "Turma";
        row.appendChild(data);
        var data = document.createElement("th");
        data.style.textAlign = "center";
        data.style.width = "60px";
        data.innerHTML = "Período";
        row.appendChild(data);
        var data = document.createElement("th");
        data.id = "combinacoes";
        row.appendChild(data);
        thead.appendChild(row);

        scroll_div = document.createElement("div");
        scroll_div.style.overflow = "auto";
        scroll_div.style.maxHeight = "231px";
        table = document.createElement("table");
        table.cellPadding="1";
        table.cellSpacing="1";
        table.onmouseout = function(e) {
            if (!e) var e = window.event;
            var t = (window.event) ? e.srcElement : e.target;
            var rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
            while ( t &&  t.nodeName != "TABLE")
                 t =  t.parentNode;
            while (rt && rt.nodeName != "TABLE")
                rt = rt.parentNode;
            if (rt && t && t == rt)
                return;
            if (mouseover_materia) {
                self.cb_onmouseout(mouseover_materia);
                mouseover_materia = null;
            }
        };
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
        scroll_div.appendChild(table);
        list.appendChild(scroll_div);
    }
    create();

    function reset() {
        var rows = tbody.getElementsByTagName("tr");
        while (rows[0])
            tbody.removeChild(rows[0]);
        self.fix_width();
    }

    self.input = null;

    function onclick() { self.cb_onclick(this.parentNode.materia); };
    function onremove() { this.onmouseout(); self.cb_onremove(this.parentNode.materia); };
    function onmoveup() { this.onmouseout(); self.cb_onmoveup(this.parentNode.materia); };
    function onmovedown() { this.onmouseout(); self.cb_onmovedown(this.parentNode.materia); };
    function hover_off() { this.style.backgroundColor = this.oldbg; this.style.color = "black"; };
    function hover_on()  { this.style.backgroundColor = "black"; this.style.color = this.oldbg; };
    function edit_start(row, attr) {
        var data = row.editable_cell[attr];
        data.innerHTML = "";
        var div = document.createElement("div");
        div.style.overflow="hidden";
        var input = document.createElement("input");
        input.className = "ui_materias_edit_input";
        input.value = row.materia[attr];
        if (attr == "codigo")
            input.maxLength = "7";
        input.onblur = function() {
            if (this.value != row.materia[attr])
                self.cb_changed(row.materia, attr, this.value);
            data.innerHTML = "";
            data.appendChild(document.createTextNode(row.materia[attr]));
            self.input = null;
        };
        input.onkeydown = function(e) {
            var ev = e ? e : event;
            var c = ev.keyCode;
            if (c == 27) {
                this.value = row.materia[attr];
                this.blur();
            } else if (c == 13) {
                this.blur();
            }
        }
        self.input = input;
        div.appendChild(input);
        data.appendChild(div);
        input.focus();
    };
    function add(materia) {
        var row  = document.createElement("tr");
        row.editable_cell = new Object();
        row.onmouseover = function() {
            if (mouseover_materia == this.materia)
                return;
            mouseout_materia();
            self.cb_onmouseover(this.materia);
            mouseover_materia = this.materia;
        };
        row.style.backgroundColor = materia.cor;
        row.style.cursor="pointer";
        var data = document.createElement("td");
        var input = document.createElement("input");
        input.title = "selecionar/deselecionar matéria";
        input.type     = "checkbox";
        input.materia  = materia;
        materia_onchange = function() { self.cb_select(this.materia, this.checked); };
        input.onchange = materia_onchange;
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
            input.onclick = function() { this.blur() };
        }
        input.checked  = true;
        data.appendChild(input);
        materia.ui_selected = input;
        data.style.width = "22px";
        row.appendChild(data);
        var data = document.createElement("td");
        data.ondblclick = function() { edit_start(this.parentNode, "codigo"); };
        data.onclick = onclick;
        data.style.textAlign = "center";
        data.style.width = "60px";
        data.innerHTML = "";
        data.appendChild(document.createTextNode(materia.codigo));
        row.appendChild(data);
        row.editable_cell["codigo"] = data;
        var data = document.createElement("td");
        data.onclick = onclick;
        data.style.width = "50px";
        materia.ui_turma = data;
        row.appendChild(data);
        var data = document.createElement("td");
        data.onclick = onclick;
        data.style.textAlign = "center";
        data.style.width = "60px";
        data.innerHTML = "";
        var semestre_str = materia.semestre.substring(0, 4) + "-" + materia.semestre.substring(4, 5);
        data.appendChild(document.createTextNode(semestre_str));
        row.appendChild(data);
        var data = document.createElement("td");
        data.ondblclick = function() { edit_start(this.parentNode, "nome"); };
        data.onclick = onclick;
        data.innerHTML = "";
        data.appendChild(document.createTextNode(materia.nome));
        row.appendChild(data);
        row.editable_cell["nome"] = data;
        var data = document.createElement("td");
        data.style.fontSize = "15px";
        data.style.MozUserSelect = "none";
        data.style.KhtmlUserSelect = "none";
        data.onselectstart = function () { return false; };
        data.oldbg = materia.cor;
        data.onmouseout  = hover_off;
        data.onmouseover = hover_on;
        data.onclick = onmovedown;
        data.innerHTML = "\u2193";
        data.title = "diminuir prioridade da matéria";
        data.style.width = "15px";
        data.style.textAlign = "center";
        row.appendChild(data);
        var data = document.createElement("td");
        data.style.fontSize = "15px";
        data.style.MozUserSelect = "none";
        data.style.KhtmlUserSelect = "none";
        data.onselectstart = function () { return false; };
        data.oldbg = materia.cor;
        data.onmouseout  = hover_off;
        data.onmouseover = hover_on;
        data.onclick = onmoveup;
        data.innerHTML = "\u2191";
        data.title = "aumentar prioridade da matéria";
        data.style.width = "15px";
        data.style.textAlign = "center";
        row.appendChild(data);
        var data = document.createElement("td");
        data.style.MozUserSelect = "none";
        data.style.KhtmlUserSelect = "none";
        data.onselectstart = function () { return false; };
        data.oldbg = materia.cor;
        data.onmouseout  = hover_off;
        data.onmouseover = hover_on;
        data.onclick = onremove;
        data.innerHTML = "X";
        data.title = "remover matéria";
        data.style.width = "15px";
        data.style.textAlign = "center";
        row.appendChild(data);
        tbody.appendChild(row);
        row.materia = materia;
        materia.row = row;
        self.fix_width();
    }

    /* functions */
    self.add = add;
    self.reset    = reset;
    self.fix_width = function() {
        if (table.offsetHeight <= scroll_div.offsetHeight)
            table.style.width = thiswidth + "px";
        else
            table.style.width = (thiswidth - document.scrollbar_width) + "px";
    };
    /* callbacks */
    self.cb_changed  = null;
    self.cb_select   = null;
    self.cb_onmouseover = null;
    self.cb_onmouseout = null;
    self.cb_onremove = null;
    self.cb_onclick  = null;
}
/**
 * @constructor
 */
function UI_planos(id)
{
    var self = this;

    function hover_off() { this.style.backgroundColor = this.oldbg; this.style.color = "black"; };
    function hover_on()  { this.style.backgroundColor = "black"; this.style.color = this.oldbg; };

    var ui_planos = document.getElementById(id).parentNode;
    ui_planos.className = "ui_planos";

    var dropdown_menu = new widget_dropdown_menu(ui_planos, 180, 2, false);
    dropdown_menu.add("Limpar plano atual", function() { self.cb_clean();      });
    dropdown_menu.add("Copiar plano atual", function() { self.cb_dup(this.ix); });
    dropdown_menu.add("Copiar plano atual", function() { self.cb_dup(this.ix); });

    function reset() {
        self.planos.forEach(function(plano) {
            ui_planos.removeChild(plano.span);
        });
        self.planos = [];
    }
    function add(plano) {
        var span = document.createElement("span");
        span.plano = plano;
        span.innerHTML = plano.nome;
        span.oldbg = "#eeeeee";
        span.onmouseout  = hover_off;
        span.onmouseover = hover_on;
        span.style.padding = "1px";
        span.style.border = "1px solid black";
        span.onclick = function() { self.cb_changed(this.plano); };
        ui_planos.appendChild(span);
        self.planos.push(plano);
        plano.span = span;
    }
    function select(plano) {
        var o = 0;
        for (var i = 0; i < self.planos.length; i++)
            if (self.planos[i] == plano) {
                index = i;
                break;
            }
        dropdown_menu.opcoes[0].innerHTML = "Limpar \"" + plano.nome + "\"";
        if (i == o) o++;
        dropdown_menu.opcoes[1].ix = o;
        dropdown_menu.opcoes[1].innerHTML = "Copiar para \"" + self.planos[o].nome + "\"";
        o++; if (i == o) o++;
        dropdown_menu.opcoes[2].ix = o;
        dropdown_menu.opcoes[2].innerHTML = "Copiar para \"" + self.planos[o].nome + "\"";
        o++; if (i == o) o++;
        plano.span.style.backgroundColor = "black";
        plano.span.style.color = "#eeeeee";
        plano.span.onmouseout  = function() { };
        plano.span.onmouseover = function() { };
        self.planos.forEach(function(planox) {
            if (planox != plano) {
                planox.span.style.backgroundColor = "#eeeeee";
                planox.span.style.color = "black";
                planox.span.onmouseout  = hover_off;
                planox.span.onmouseover = hover_on;
            }
        });
    }
    function startup(state) {
        self.reset();
        for (var i = 0; i < state.planos.length; i++)
            add(state.planos[i]);
        self.select(state.plano);
    }
    self.planos = [];

    /* callbacks */
    self.cb_changed = null;
    self.cb_clean   = null;
    self.cb_dup     = null;
    /* procedures */
    self.reset   = reset;
    self.select  = select;
    self.startup = startup;
}
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
    ui_saver.appendChild(document.createTextNode("Número de matrícula:"));
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

    // TODO: restore save system
    this.input.style.display = "none";
    this.button_load.style.display = "none";
    this.button_save.style.display = "none";

    const enroll_id_input = document.createElement("input");
    enroll_id_input.name = "enroll_id_input";
    enroll_id_input.id = "enroll_id_input";
    enroll_id_input.placeholder = "ex: 19100544";
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
        self.cb_updated(null);
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
            mouseover_turma.row.menu.style.top = "0px";
            mouseover_turma.row.inner_div.style.zIndex = 0;
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
            input.type     = "radio";
            input.name     = "selected_class";
            input.turma    = turma;
            input.onchange = function() {
                self.cb_changed(this.turma, this.checked);
                self.cb_updated(null);
            };
            if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
                input.onclick = function() { this.blur() };
            }
            data.appendChild(input);
            input.checked = turma.nome === horario.materia.chosen_class;
        }
        row.appendChild(data);

        var data = document.createElement("td");
        data.onmouseup = onmouseup;
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            var div = document.createElement("div");
            div.innerHTML = turma.nome;
            data.appendChild(div);
            if (!row.turma) {
                row.turma = turma;
                turma.row = row;
            }
        }
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
        for (var j in horario.turmas) {
            var div = document.createElement("div");
            var turma = horario.turmas[j];
            var innerHTML = "(" + twochars(turma.vagas_ocupadas);
            if (turma.pedidos_sem_vaga != 0)
                innerHTML += "+" + twochars(turma.pedidos_sem_vaga);
            else
                innerHTML += "&nbsp;&nbsp;&nbsp;";
            innerHTML += ")/" + twochars(turma.vagas_ofertadas);
            div.innerHTML = innerHTML;
            data.appendChild(div);
            if (!row.turma) {
                row.turma = turma;
                turma.row = row;
            }
        }
        row.appendChild(data);

        var data = document.createElement("td");
        data.onmouseup = onmouseup;
        var inner_div = document.createElement("div");
        inner_div.style.position = "relative";
        for (var j in horario.turmas) {
            var turma = horario.turmas[j];
            var prof = new String;
            for (var p = 0; p < turma.professores.length; p++) {
                var div = document.createElement("div");
                div.innerHTML = turma.professores[p];
                inner_div.appendChild(div);
            }
        }
        if (!inner_div.innerHTML)
            inner_div.innerHTML = "&nbsp;";
        data.appendChild(inner_div);
        row.appendChild(data);

        var menu = document.createElement("div");
        menu.className = "ui_turmas_menu";
        inner_div.appendChild(menu);

        var menu_v = document.createElement("div");
        menu_v.className = "ui_turmas_menu_v";
        menu_v.style.backgroundColor = current_materia.cor;
        menu_v.innerHTML = "V";
        menu_v.title = "clique aqui para editar ou remover turma";
        menu_v.oldbg = current_materia.cor;
        menu_v.onmouseout  = hover_off;
        menu_v.onmouseover = hover_on;
        menu_v.row = row;
        menu_v.data = data;
        menu_v.onmouseup = function(e) {
            if (menu_div.style.display == "block") {
                menu_div.style.display = "none";
                menu_v.style.borderBottom = "1px solid black";
                menu_v.onmouseout  = hover_off;
                menu_v.onmouseover = hover_on;
                menu_v.style.backgroundColor = current_materia.cor;
                menu_v.style.color = "black";
                menu.style.top = "0px";
                inner_div.style.zIndex = 0;
            } else {
                menu_div.style.display = "block";
                menu_v.style.borderBottom = "0";
                menu_v.onmouseout  = function(){};
                menu_v.onmouseover = function(){};
                menu_v.style.backgroundColor = "black";
                menu_v.style.color = current_materia.cor;
                var goback = (list.offsetHeight + list.scrollTop) - (menu_div.offsetHeight + menu_v.offsetHeight + menu_v.row.offsetTop);
                if (goback > 0)
                    goback = 0;
                menu.style.top = goback + "px";
                inner_div.style.zIndex = 100;
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
        menu_remover.innerHTML = "remover turma";
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
        menu_editar.innerHTML = "editar turma";
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
        row.inner_div = inner_div;

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

        self.thead = document.createElement("thead");
        self.table.style.width= thiswidth + "px";
        self.table.cellPadding="1";
        self.table.cellSpacing="1";
        self.table.appendChild(self.thead);
        var row  = document.createElement("tr");
        row.style.backgroundColor = "#eeeeee";
        row.onmouseover = mouseout_turma;
        var data = document.createElement("td");

        var dropdown_menu = new widget_dropdown_menu(data, 130, 5, false);
        dropdown_menu.add("adicionar turma", function(e) { self.cb_new_turma(); });

        data.style.width = "22px";
        row.appendChild(data);
        var data = document.createElement("td");
        data.style.textAlign = "center";
        data.innerHTML = "Turma";
        data.style.width = "44px";
        row.appendChild(data);
        var data = document.createElement("td");
        data.style.textAlign = "center";
        data.title = "Ocupadas / Oferdatas (+ Pedidos sem vaga)";
        data.innerHTML = "Vagas Ocupadas";
        data.style.width = "72px";
        row.appendChild(data);
        var data = document.createElement("td");
        data.style.textAlign = "center";
        data.innerHTML = "Professores";
        row.appendChild(data);
        self.thead.appendChild(row);

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
        row.style.backgroundColor = "#eeeeee";
        row.onmouseover = mouseout_turma;

        self.tbody.appendChild(row);
        insert_before = row;

        var button = document.createElement("span");
        button.className = "ui_turmas_big_button";
        button.style.marginLeft = ((thiswidth/2) - 100) + "px";
        button.style.display = "none";
        button.innerHTML = "<strong>OK</strong>";
        button.onselectstart = function () { return false; };
        button.onclick = function () { self.cb_ok(); return false; };
        list.appendChild(button);
        self.ok_button = button;

        var button = document.createElement("span");
        button.className = "ui_turmas_big_button";
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
/**
 * @constructor
 */
function UI_updates(id)
{
    var self = this;

    var panel = document.getElementById(id);

    panel.className = "ui_update";

    /* functions */
    self.show = function() { panel.style.display = "block"; };
    self.hide = function() { panel.style.display = "none"; };
    self.reset = function() { panel.innerHTML = ""; self.hide(); };
    self.fill = function(issues) {
        self.reset();

        var div = document.createElement("div");
        div.innerHTML = "ATENÇÃO: Confira as mudanças no cadastro de turmas:";
        panel.appendChild(div);

        function arrow_toggle() {
            this.parentNode.criancas.forEach(function(pm){
                if (pm.style.display == "none")
                    pm.style.display = "block";
                else
                    pm.style.display = "none";
            });
        }

        panel.criancas = [];
        for (var m = 0; m < issues.length; m++) {
            var materia = issues[m];
            var materia_div = document.createElement("div");
            var arrow = document.createElement("span");
            arrow.innerHTML = "\u25b6&nbsp;";
            arrow.style.cursor = "pointer";
            arrow.onclick = arrow_toggle;
            materia_div.appendChild(arrow);
            var nome = document.createElement("span");
            nome.innerHTML = materia.materia.codigo;
            nome.style.cursor = "pointer";
            nome.onclick = arrow_toggle;
            materia_div.appendChild(nome);
            materia_div.criancas = [];
            for (var i = 0; i < materia.length; i++) {
                var issue = materia[i];
                var issue_div = document.createElement("div");
                var arrow = document.createElement("span");
                arrow.innerHTML = "&nbsp;\u25b6&nbsp;";
                issue_div.appendChild(arrow);
                var nome = document.createElement("span");
                nome.innerHTML = issue.text;
                issue_div.appendChild(nome);
                var button = document.createElement("span");
                button.className = "simple_button";
                button.action = issue.action;
                button.onclick = function() {
                    var a = this.parentNode;
                    var b = a.parentNode;
                    var c = b.parentNode;
                    this.action();
                    b.removeChild(a);
                    if (!b.childNodes[2])
                        c.removeChild(b);
                    if (!c.childNodes[1])
                        self.hide();
                    self.cb_update();
                };
                button.innerHTML = issue.button;
                issue_div.appendChild(button);
                if (issue.text_from) {
                    var text_from = document.createElement("div");
                    text_from.style.marginLeft = "30px";
                    text_from.innerHTML = "de&nbsp;&nbsp;: " + issue.text_from;
                    issue_div.appendChild(text_from);
                }
                if (issue.text_to) {
                    var text_to = document.createElement("div");
                    text_to.style.marginLeft = "30px";
                    text_to.innerHTML = "para: " + issue.text_to;
                    issue_div.appendChild(text_to);
                }
                issue_div.style.display = "none";
                materia_div.criancas.push(issue_div);
                materia_div.appendChild(issue_div);
            }
            panel.criancas.push(materia_div);
            panel.appendChild(materia_div);
        }
        self.show();
    };

    self.hide();
}
const default_db = current_display_semester();
/**
 * @constructor
 */
function Main(ui_materias, ui_turmas, ui_logger, ui_creditos, ui_horario,
              ui_saver, ui_campus, ui_planos, ui_updates, ui_avisos,
              combo, state, display, persistence, database)
{
    var self = this;

    function display_combinacao(cc)
    {
        var horas_aula = 0;
        for (const materia of state.plano.materias.list) {
            materia.ui_turma.style.textAlign = "center";
            if (materia.selected == -1) {
                materia.ui_turma.innerHTML = "<strike>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strike>";
                materia.ui_selected.checked = 0;
                materia.ui_selected.disabled = "disabled";
            } else if (materia.selected == 0) {
                materia.ui_turma.innerHTML = "<strike>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strike>";
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
        update_all();
    };
    ui_turmas.cb_cancel = function() {
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

        ui_logger.waiting('carregando horário para "' + identifier + '"');
    }

    ui_saver.cb_enroll = () => {
        const x = window.open('https://cagr.sistemas.ufsc.br/matricula/pedido?cmd=mostralogin&tipoUsuario=null');
        setTimeout(() => {
            x.close();

            function sendEnrollRequest(plan, final) {
                const courseList = plan.materias.list;
                const nomes = courseList.map(c => c.codigo).join("#")
                const turmas = courseList.map(c => c.chosen_class).join("#")
                const currentPlanIndex = state.planos.indexOf(plan) + 1;
                const filler = "0#".repeat(courseList.length);

                document.getElementById("nomes").value = nomes;
                document.getElementById("turmas").value = turmas;
                document.getElementById("aulas").value = filler;
                document.getElementById("codHorarios").value = filler;
                document.getElementById("tipos").value = filler;
                document.getElementById("formatura").value = -1;
                document.getElementById("matricula").value = document.getElementById("enroll_id_input").value;
                document.getElementById("planoAtivo").value = currentPlanIndex;
                if (final) {
                    document.getElementById("plano").disabled = true;
                    document.getElementById("copiarPlano").disabled = true;
                } else {
                    document.getElementById("plano").value = currentPlanIndex + 1;
                    document.getElementById("copiarPlano").disabled = false;
                }
                document.getElementById("cmd").value = final ? "Concluir Pedido" : "troca";
                document.getElementById("enroll_form").submit();
            }

            const activePlans = state.planos.filter(plan => plan.materias.list.length > 0);
            for (const plan of activePlans) {
                const final = state.planos.indexOf(plan) === activePlans.length - 1;
                sendEnrollRequest(plan, final);
            }
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
        document.getElementById("data_db").innerHTML = " | Banco de dados atualizado em " + database.get_date(semestre);
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

    var state = new State();
    var display = new Display(ui_logger, ui_horario);

    dconsole2 = new Dconsole("dconsole");
    var combo   = new Combobox("materias_input", "materias_suggestions", ui_logger, database);
    var main   = new Main(ui_materias, ui_turmas, ui_logger, ui_creditos,
                          ui_horario, ui_saver, ui_campus, ui_planos,
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
    ui_turmas.set_height(ui_horario.height());
    ui_materias.fix_width();
}
