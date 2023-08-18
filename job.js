var _selenv;
var _selPage;

var bepaper = new binean.joint.Paper(document.getElementById("main"), binean.joint.Paper.createPaper(document.getElementById("paper"), 800, 1200));
bepaper.on('job:selected', on_job_selected);

refreshPage();

function refreshPage() {
    var pathArray = window.location.pathname.split('/');
    if (pathArray.length < 3) return;
    _selenv = pathArray[2];
    if (pathArray.length < 4) return;
    _selPage = pathArray[3];
    loadPages(_selenv);
}
function loadPages(env) {
    const func = function (pages) {
        var selValue = _selPage;
        var el = document.getElementById("bi_page");

        el.innerHTML = "";
        var length = pages.length;
        if (length == 0) {
            loadPage();
            return;
        }

        var opts = el.options;
        var selIndex = -1;
        for (var i = 0; i < length; i++) {
            var optn = document.createElement("OPTION");
            var text = pages[i];
            if (selValue && text == selValue) selIndex = i;
            optn.text = text;
            optn.value = text;
            opts.add(optn);
        }
        el.selectedIndex = selIndex;
        on_page_changed();
    }
    binean.request("/api/job/page_list", null, func, env);
}

function on_env_changed() {
}
function on_page_changed() {
    var f = function () {
        var wse = document.getElementById("bi_page");
        if (wse.options.length == 0) return undefined;
        var si = wse.selectedIndex;
        if (si < 0) return _selPage;
        return wse.options[si].value;
    }
    var selPage = f();
    if (!selPage) return;
    _selPage = selPage;
    loadPage();
}
function on_job_selected(el, name) {
    var bi_job = document.getElementById("bi_job");
    bi_job.value = name;

    var page = bepaper.getPage();
    var job = page.getJobByName(name);
    if (!job) return;

    if (job.Start) {
        var brg_process = document.getElementById("brg_process");
        brg_process.value = page.timeToProcess(job.Start);
    }

    propertyTable(job);
    condTable(job);
    dependTable(job);
}
function on_process_changed(e) {
    var brg_process = document.getElementById("brg_process");
    var page = bepaper.getPage();
    var jobs = page.getProcess(parseInt(brg_process.value));
    var graph = page.getGraph();
    var paper = bepaper.getPaper();
    var cells = [];
    var length = jobs.length;
    for (var i = 0; i < length; i++) {
        cells.push(paper.findViewByModel(graph.getCell(jobs[i])));
    }
    bepaper.highlight(cells);
}

function loadPage(info) {
    if (!info) {
        info = {
            Env: _selenv,
            Page: _selPage
        }
    }
    const func = function (model) {
        if (!model) return;
        bepaper.loadPage(model);

        var brg_process = document.getElementById("brg_process");
        var page = bepaper.getPage();
        brg_process.min = 0;
        brg_process.value = 0;
        brg_process.max = page.getProcessCount() + 1;
    }
    binean.request("/api/job/page_load", null, func, info);
}
function savePage() {
    var page = bepaper.getPage();
    if (!page) return;

    var info = {
        Env: _selenv,
        Page: _selPage,
        Content: JSON.stringify(bepaper.getPage().toJSON())
    };
    binean.request("/api/job/page_save", null, null, info);
}

function getTable(id) {
    var table = document.getElementById(id);
    if (table) return table;
    var panel = document.getElementById("panel");
    var div = document.createElement('DIV');
    div.id = id.concat('-div');
    div.classList.add('container');
    div.classList.add('mt-3');
    panel.appendChild(div);
    div.appendChildhi

    table = document.createElement("TABLE");
    div.appendChild(table);
    table.id = id;
    table.classList.add('table');
    table.classList.add('table-bordered');
    table.classList.add('h6');
    table.classList.add('small');
    return table;
}
function removeTable(id) {
    var div = document.getElementById(id.concat('-div'));
    if (!div) return;
    var panel = document.getElementById("panel");
    panel.removeChild(div);
}

function propertyTable(job) {
    const table_id = 'tb_job_prop';
    removeTable(table_id);
    if (!job) return;
    var table = getTable(table_id);

    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "<b>Attribute Name</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Attribute Value</b>";

    var body = table.createTBody();
    row = body.insertRow();
    cell = row.insertCell();
    cell.innerHTML = "Name";
    cell = row.insertCell();
    cell.innerHTML = job.Name;

    if (job.Status) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Status";
        cell = row.insertCell();
        cell.innerHTML = job.Status;
    }
    if (job.Start) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Start";
        cell = row.insertCell();
        cell.innerHTML = new Date(job.Start).toISOString();
    }
    if (job.End) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "End";
        cell = row.insertCell();
        cell.innerHTML = new Date(job.End).toISOString();
    }
    if (job.Description) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Description";
        cell = row.insertCell();
        cell.innerHTML = job.Description;
    }
    if (job.BoxName) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Box Name";
        cell = row.insertCell();
        //cell.innerHTML = "<span class='link' onclick='javascript:selectNode(\"" + job.BoxName + "\");'>" + job.box_name + "</span>";
        cell.innerHTML = job.BoxName;
    }
    if (job.BoxSuccess) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Box Success";
        cell = row.insertCell();
        cell.innerHTML = job.BoxSuccess;
    }
    if (job.WatchFile) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Watch file";
        cell = row.insertCell();
        cell.innerHTML = job.WatchFile;
    }
    if (job.Command) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Command";
        cell = row.insertCell();
        cell.innerHTML = job.Command;
    }
    if (job.Condition) {
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "Condition";
        cell = row.insertCell();
        cell.innerHTML = job.Condition;
    }
}
function condTable(job) {
    const table_id = 'tb_job_cond';
    removeTable(table_id);
    if (!job) return;
    var table = getTable(table_id);

    var scons = job.JobConditionList;
    if (!scons) return;
    var lenght = scons.length;
    if (lenght == 0) return;

    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "<b>Condition</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Expected</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Value</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Pass</b>";
    cell.scope = 'col';

    var body = table.createTBody();
    for (var i = 0; i < lenght; i++) {
        var scon = scons[i];
        row = body.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "<span class='link' onclick='javascript:selectNode(\"" + scon.Name + "\");'>" + scon.Name + "</span>";
        cell = row.insertCell();
        cell.innerHTML = scon.Expected;
        cell = row.insertCell();
        cell.innerHTML = scon.Status;
        cell = row.insertCell();
        cell.innerHTML = scon.IsPass;
    }
}
function dependTable(job) {
    const table_id = 'tb_job_depend';
    removeTable(table_id);
    if (!job) return;
    var table = getTable(table_id);

    var depends = job.DependList;
    if (!depends) return;
    var lenght = depends.length;
    if (lenght == 0) return;
    
    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "<b>Dependent Job</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Expected</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Status</b>";
    cell.scope = 'col';
    cell = row.insertCell()
    cell.innerHTML = "<b>Pass</b>";
    cell.scope = 'col';

    for (var i = 0; i < lenght; i++) {
        var depend = depends[i];
        row = table.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "<span class='link' onclick='javascript:selectNode(\"" + depend.name + "\");'>" + depend.name + "</span>";
        cell = row.insertCell();
        cell.innerHTML = depend.expected;
        cell = row.insertCell();
        cell.innerHTML = depend.status;
        cell = row.insertCell();
        cell.innerHTML = depend.isPass;
    }
}
