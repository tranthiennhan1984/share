(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('joint')) :
        typeof define === 'function' && define.amd ? define(['exports', 'joint'], factory) :
            (global = global || self, factory(global.binean = {}, global.joint));
}(this, function (exports, joint) {
    'use strict';
    class Bepage {
        #isLoading = false;
        #scaling = false;
        #movingCell;
        #ORG_ID = 'Binean.JointPapper.ORG';

        #dx;
        #dy;
        #scale;

        #width;
        #height;

        #reference;
        #paper;
        #viewer;
        #selection;

        constructor(reference, paper, dx, dy) {
            this.#reference = reference;
            this.#paper = paper;
            this.#viewer = paper.el.parentElement;
            this.#dx = dx ? dx : 100;
            this.#dy = dy ? dy : 100;
            this.#scale = 1.0;

            var rect = paper.el.getBoundingClientRect();
            this.#width = rect.width;
            this.#height = rect.height;

            this.#initalize();
            this.selection(new Beselection());
            this.lock(true);
        }
        #initalize() {
            var paper = this.#paper;
            paper.translate(0, 0);

            paper.on('blank:mousewheel', function (e, x, y, delta) {
                if (!e.altKey) return;
                var s = this.#scale + delta * 0.1;
                if (this.#width * s < 50 || this.#height * s < 50) return;
                this.scale(s);
            }.bind(this));

            paper.on('cell:pointerup', function (cview, e, x, y) {
                var cell = this.#movingCell;
                this.#movingCell = null;
                var refer = this.#reference;
                if (!refer) return;
                if (cview.model != cell) return;

                var box = cell.getBBox();
                var x = box.x;
                var y = box.y;

                var org = paper.model.getCell(this.#ORG_ID);
                if (org !== undefined) org = org.getBBox();
                if (org !== undefined) {
                    x -= org.x;
                    y -= org.y;
                }

                refer.invokeMethodAsync('OnNodePositionChanged', cell.id, x, y);
            }.bind(this));

            paper.on('cell:pointerdblclick', function (cview) {
                var refer = this.#reference;
                if (!refer) return;
                //refer.invokeMethodAsync(
                //    'NodeDoubleClick',
                //    cview.model.id
                //);
            }.bind(this));

            document.addEventListener("keydown", function (e) {
                if (e.ctrlKey) {
                    switch (e.keyCode) {
                        case 13: this.fitToContent(); break;
                        case 37: this.#expandLeft(); break;
                        case 38: this.#expandTop(); break;
                        case 39: this.#expandRight(); break;
                        case 40: this.#expandBottom(); break;
                    }
                } else if (e.shiftKey) {
                    switch (e.keyCode) {
                        case 37: this.#expandRight(true); break;
                        case 38: this.#expandBottom(true); break;
                        case 39: this.#expandLeft(true); break;
                        case 40: this.#expandTop(true); break;
                    }
                }
            }.bind(this));

            var graph = paper.model;
            graph.on('change:position', function (cell) {
                if (!(cell instanceof binean.joint.jnode)) return;
                this.#movingCell = cell;
            }.bind(this));


            this.#selectionInitialize(paper);
        }

        minWidth = 1240;
        minHeight = 1754;
        padding = { left: 40, top: 40, right: 40, bottom: 40 };

        getPaper() { return this.#paper }
        getViewer() { return this.#viewer }
        getGraph() { return this.#paper.model }

        lock(locked) {
            if (locked === undefined) {
                var retVal = this.getGraph().get('locked');
                if (retVal === undefined) retVal = false;
                return retVal;
            }
            this.getGraph().set('locked', locked);
            return locked;
        }

        selection(value) {
            if (value === undefined) return this.#selection;

            var preventSelection = undefined;
            if (this.#selection) preventSelection = this.#selection.offNodeSelection();
            if (!value) return this.#selection;
            this.#selection = value;
            value.page(this);
            if (preventSelection !== undefined) this.#selection.onNodeSelection(preventSelection);
        };

        selectCell(cell, scroll) {
            var paper = this.getPaper();
            var view = paper.findViewByModel(cell);
            if (!view) return;
            this.#selection.selectOn(view);
            if (scroll) view.el.scrollIntoView();
            view.el.focus();
        }
        highlight(cells) {
            this.#selection.highlight(cells);
        }
        selectOff() {
            this.#selection.selectOff();
        }

        #expandLeft(isCollapse) {
            var dx = (isCollapse ? -1 : 1) * this.#dx;
            if (this.#width + dx < this.minWidth) dx = this.minWidth - this.#width;
            if (dx == 0) return;

            this.#width += dx;

            this.#paper.model.translate(dx, 0);
            this.scale(this.#scale);

            //var refer = this.#reference;
            //if (refer) refer.invokeMethodAsync('LocationChanged');
        }
        #expandRight(isCollapse) {
            var dx = (isCollapse ? -1 : 1) * this.#dx;
            if (this.#width + dx < this.minWidth) dx = this.minWidth - this.#width;
            if (dx == 0) return;

            this.#width += dx;
            this.scale(this.#scale);
        }
        #expandTop(isCollapse) {
            var dy = (isCollapse ? -1 : 1) * this.#dy;
            if (this.#height + dy <= this.minHeight) dy = this.minHeight - this.#height;
            if (dy == 0) return;

            this.#height += dy;

            this.#paper.model.translate(0, dy);
            this.scale(this.#scale);
            //var refer = this.#reference;
            //f (refer) refer.invokeMethodAsync('LocationChanged');
        }
        #expandBottom(isCollapse) {
            var dy = (isCollapse ? -1 : 1) * this.#dy;
            if (this.#height + dy <= this.minHeight) dy = this.minHeight - this.#height;
            if (dy == 0) return;

            this.#height += dy;
            this.scale(this.#scale);
        }

        #selectionInitialize(paper) {
            paper.on("element:pointerclick", (elm) => {
                if (this.#selection && this.#selection.selectOn) this.#selection.selectOn(elm);
            });
            paper.on("blank:pointerclick", (elm) => {
                if (this.#selection && this.#selection.selecteOff) this.#selection.selecteOff(elm);
            });

        }
        onNodeSelected(...parms) {
            //this.#events.raise('job:selected', ...parms);
            var refer = this.#reference;
            if (!refer) return;
            refer.invokeMethodAsync('OnNodeSelected', ...parms);
        }
        scale(s) {
            if (this.#scaling) return;
            this.#scaling = true;
            try {
                let paper = this.#paper;
                if (!s) return this.#scale;
                this.#scale = s;

                paper.scale(s, s);

                var gridLayer = paper._layers.grid.el.children[0];
                gridLayer.setAttribute("width", this.#width + 'px');
                gridLayer.setAttribute("height", this.#height + 'px');

                var style = paper.el.style;
                style.width = Math.trunc(this.#width * s).toString() + 'px';
                style.height = Math.trunc(this.#height * s).toString() + 'px';

                this.refreshView();
                //var viewer = this.getViewer();
                //if (!viewer) return;
                //var pr = paper.el.getBoundingClientRect();
                //var vr = viewer.getBoundingClientRect();

                //if (pr.width < vr.width) viewer.style.justifyContent = 'center';
                //else viewer.style.justifyContent = 'flex-start';
                //if (pr.height < vr.height) viewer.style.alignItems = 'center';
                //else viewer.style.alignItems = 'flex-start';
            } finally {
                this.#scaling = false;
            }
        }
        refreshView() {
            let viewer = this.getViewer();
            if (!viewer) return;

            let pr = this.#paper.el.getBoundingClientRect();
            let vr = viewer.getBoundingClientRect();

            if (pr.width < vr.width) viewer.style.justifyContent = 'center';
            else viewer.style.justifyContent = 'flex-start';
            if (pr.height < vr.height) viewer.style.alignItems = 'center';
            else viewer.style.alignItems = 'flex-start';
        }
        correctPageSize() {
            var paper = this.#paper;
            var pRect = paper.getArea();
            if (pRect.width < this.minWidth || pRect.height < this.minHeight) {
                paper.setDimensions(this.minWidth, this.minHeight);
            }
        }
        fitToContent(padding) {
            if (!padding) padding = this.padding;

            let paper = this.#paper;

            paper.scale(1, 1);
            let crect = paper.getContentArea();

            this.#width = Math.max(this.minWidth, Math.ceil(crect.width) + padding.left + padding.right);
            this.#height = Math.max(this.minHeight, Math.ceil(crect.height) + padding.top + padding.bottom);

            var ox = Math.ceil((this.#width - crect.width) / 2) - crect.x;
            var oy = padding.top;// Math.ceil((this.#height - crect.height) / 2) - crect.y;

            ox = Math.floor(ox / 10) * 10;
            oy = Math.floor(oy / 10) * 10;

            this.#paper.model.translate(ox, oy);

            this.scale(this.#scale);
        }

        fromJSON(json) {
            if (this.#isLoading) return;
            this.#isLoading = true;
            try {
                var paper = this.getPaper();
                this.selectOff();
                paper.freeze();
                var graph = this.getGraph();
                var cells = JSON.parse(json);
                graph.fromJSON(cells);
                paper.unfreeze();
            } finally {
                this.#isLoading = false;
            }
        }

        static createPaper(id, width, height) {
            if (!width) width = 1240
            if (width < this.minWidth) width = this.minWidth;

            if (!height) height = 1754;
            if (height < this.minHeight) height = this.minHeight;


            var namespace = joint.shapes;
            return new joint.dia.Paper({
                el: document.getElementById(id),
                model: new joint.dia.Graph({}, { cellNamespace: namespace }),
                width: width,
                height: height,
                gridSize: 10,
                drawGrid: {
                    name: 'doubleMesh',
                    args: [
                        { color: '#FBFBFB', thickness: 1 }, // settings for the primary mesh
                        { color: '#E8E8E8', scaleFactor: 5, thickness: 1 } //settings for the secondary mesh
                    ],
                    update: function (el, opt) {
                        var d;
                        var width = opt.width;
                        var height = opt.height;
                        var thickness = opt.thickness;

                        if (width - thickness >= 0 && height - thickness >= 0) {
                            d = ['M', width, 0, 'H0 M0 0 V0', height].join(' ');
                        } else {
                            d = 'M 0 0 0 0';
                        }
                        V(el).attr({ 'd': d, stroke: opt.color, 'stroke-width': opt.thickness });
                    }
                },
                /*defaultConnectionPoint: { name: "anchor" },*/
                defaultConnector: {
                    name: "curve",
                    args: {
                        sourceTangent: { x: 100, y: 0 },
                        targetTangent: { x: -130, y: 0 }
                    }
                }, interactive: function (cellView) {
                    if (cellView.model.graph.get('locked')) return { elementMove: false };
                    if (cellView.model.get('locked')) return { elementMove: false };
                    return true;
                },
                cellViewNamespace: namespace
            });
            return retVal;
        }

    }
    class Beselection {
        #highlighterName = 'beselection';
        #selected = 'selected';
        #highlighted = 'highlighted';
        #anim = 'anim';

        #preventSelection = false;

        #page;

        #selectedElements = [];
        #highlightedCells = [];

        #highlightElement(el, isSelected) {
            let className = isSelected ? this.#selected : this.#highlighted;
            V(el.el).addClass(className);
            joint.highlighters.mask.add(el, { selector: 'root' }, this.#highlighterName, {
                deep: true,
                attrs: { 'stroke-width': 3 }
            });
            V(joint.dia.HighlighterView.get(el, this.#highlighterName).el).addClass(className);
        };
        #unhighlightElement(el) {
            joint.dia.HighlighterView.remove(el, this.#highlighterName);
            var vel = V(el.el);
            vel.removeClass(this.#highlighted);
            vel.removeClass(this.#selected);
        }

        #highlightCell(cell, add) {
            if (this.#highlightedCells.includes(cell)) return;
            if (!add) return;
            V(cell.el).addClass(this.#anim);
            this.#highlightedCells.push(cell)
        }
        #unhighlightCell(cell, remove) {
            var v = V(cell.el);
            v.removeClass('hanim');
            v.removeClass('anim');
            if (!remove) return;
            var index = this.#highlightedCells.indexOf(cell);
            if (index > -1) this.#highlightedCells.splice(index, 1);
        }

        #selectElement(el) {
            var sel = this.getSelected();
            if (sel === el) return;
            this.#unselect();
            if (!el) return;

            this.#highlightElement(el, true);
            this.#selectedElements.splice(0, 0, el);
            var paper = this.#page.getPaper();
            this.#getNeighbors(el).forEach((cell) => this.#highlightCell(paper.findViewByModel(cell), true));
        }
        #unselect() {
            let selel = this.getSelected();
            if (selel) this.#unhighlightElement(selel);
            this.#selectedElements.splice(0, this.#selectedElements.length);
            this.#unhighlight();
        }
        #unhighlight() {
            var list = this.#highlightedCells;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                let cell = list[i];
                this.#unhighlightCell(cell);
            }
            list.splice(0, length);
        }

        #getNeighbors(el) {
            var graph = this.#page.getGraph();

            var models = [];
            var stack = [];
            stack.push({ model: el.model, opt: { inbound: true } });
            stack.push({ model: el.model, opt: { outbound: true } });
            while (stack.length > 0) {
                let item = stack.pop();
                let model = item.model;
                let opt = item.opt;
                graph.getNeighbors(model, opt).forEach(function (cell) {
                    if (models.indexOf(cell) >= 0) return;
                    models.push(cell);
                    if (cell.attributes.z != 3) stack.push({ model: cell, opt: opt });
                });
            }
            if (models.indexOf(el.model) < 0) models.push(el.model);

            var retVal = graph.getSubgraph(models, { deep: true });

            var g = this.#page.getGraph();
            if (g !== graph) {
                retVal.forEach(function (cell) {
                    if (!cell.isLink()) return;
                    var c = g.getCell(cell.id);
                    if (!c) cell.addTo(g);
                });
            }

            return retVal;
        }

        anim(enable) {
            if (enable === undefined) return this.#anim == 'anim';
            if (enable) this.#anim = 'anim';
            else this.#anim = 'hanim';
        }
        getSelected() {
            if (this.#selectedElements.length == 0) return null;
            return this.#selectedElements[0];
        }
        highlight(cells) {
            this.#unhighlight();
            var item = this;
            each.forEach(cells, function (cell) {
                item.#highlightCell(cell, true);
            });
        }

        offNodeSelection() {
            var old = this.#preventSelection;
            this.#preventSelection = true;
            return old;
        }
        onNodeSelection(preventSelection) {
            this.#preventSelection = preventSelection;
        }
        #onNodeSelected(...parms) {
            if (this.#preventSelection) return;
            this.#page.onNodeSelected(...parms);
            //this.#events.raise('job:selected', ...parms);
        }
        page(value) {
            if (!value) return this.#page;
            this.#page = value;
        }
        selectOn(elm) {
            var paper = this.#page.getPaper();
            paper.freeze();
            let isElement = elm.model.isElement();
            if (isElement) {
                this.#selectElement(elm);
                var model = elm.model;
                if (model.attributes.z = 3) {
                    this.#onNodeSelected(model.id);
                }
            }
            paper.unfreeze();
        }
        selectOff() {
            this.#unselect();
        }
    }

    var portMarkup = [{
        tagName: 'rect',
        attributes: {
            r: 5
            //opacity: 0
        }
    }];
    var portTmpl = {
        groups: {
            'in': { position: { name: 'left' }, markup: portMarkup },
            'out': { position: { name: 'right' }, markup: portMarkup },
        },
        items: [
            { group: "in", 'id': "in" },
            { group: "out", 'id': "out" }
        ]
    };


    var JOrg = joint.shapes.standard.Ellipse.define('binean.joint.jorg', {
        locked: true,
        position: {
            x: 0,
            y: 0
        },
        size: {
            height: 1,
            width: 1,
        },
        attrs: {
            root: { highlighterSelector: 'body' },
            body: { class: 'bzo-body', },
        },
    });
    var JNode = joint.shapes.standard.Rectangle.define('binean.joint.jnode', {
        ports: portTmpl,
        size: {
            height: 40,
            width: 300,
        },
        attrs: {
            root: { highlighterSelector: 'body', },
            body: { class: 'bzj-body', },
            label: { class: 'bzj-label', },
        },
    });
    var JCond = joint.shapes.standard.Ellipse.define('binean.joint.jcond', {
        ports: portTmpl,
        size: {
            height: 20,
            width: 20,
        },
        attrs: {
            root: { highlighterSelector: 'body' },
            body: { class: 'bzj-body', },
            label: { class: 'bzj-label', },
        },
    });
    var JLink = joint.shapes.standard.Link.define('binean.joint.jlink', {
        //router: { name: 'manhattan' },
        //connector: {
        //    name: "curve",
        //    //args: {
        //    //    sourceDirection: connectors.curve.TangentDirections.RIGHT,
        //    //    targetDirection: connectors.curve.TangentDirections.LEFT
        //    //}
        //    //name: 'rounded'
        //},
        attrs: {
            line: {
                targetMarker: {
                    class: 'bzj-marker',
                    type: 'path',
                    'stroke-width': 1,
                    d: 'M 13 -3 0 0 13 3 8 0 Z',
                }
            }
        },
    });

    var bePapers = {};
    function initializePaper(id, reference) {
        var paper = binean.joint.Page.createPaper(id);
        var page = new Bepage(reference, paper);

        bePapers[id] = {
            reference: reference,
            page: page
        };

        page.scale(1);
    }
    function finalizePaper(id) {
        delete bePapers[id];
    }
    function papperLoadCells(id, json) {
        var bePaper = bePapers[id];
        if (bePaper === undefined) return;

        var page = bePaper.page;
        if (page === undefined) return;

        page.fromJSON(json);
        page.fitToContent();
    }
    function papperSelectCell(id, cellId, scroll) {
        var bePaper = bePapers[id];
        if (bePaper === undefined) return;

        var page = bePaper.page;
        if (page === undefined) return;

        var cell = page.getGraph().getCell(cellId);
        if (cell === undefined) return;

        if (scroll === undefined) scroll = true;

        page.selectCell(cell, scroll);
    }
    function papperLock(id, locked) {
        var bePaper = bePapers[id];
        if (bePaper === undefined) return false;

        var page = bePaper.page;
        if (page === undefined) return false;

        return page.lock(locked);
    }
    function papperRefreshView(id) {
        var bePaper = bePapers[id];
        if (bePaper === undefined) return false;

        var page = bePaper.page;
        if (page === undefined) return false;

        return page.refreshView();
    }

    var bejoint = ({
        Page: Bepage,
        Selection: Beselection,

        jorg: JOrg,
        jnode: JNode,
        jcond: JCond,
        jlink: JLink,

        initializePaper: initializePaper,
        finalizePaper: finalizePaper,

        papperLoadCells: papperLoadCells,
        papperSelectCell: papperSelectCell,
        papperLock: papperLock,
        papperRefreshView: papperRefreshView
    });

    exports.joint = bejoint;
}));

if (typeof binean !== 'undefined') { }