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
