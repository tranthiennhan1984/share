(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.binean = {}));
}(this, function () {
    'use strict';
    var berequest = function (url, tag, done, req) {
        $.ajax({
            type: 'PUT',
            crossDomain: false,
            url: url,
            contentType: 'application/json',
            dataType: 'json',
            async: false,
            data: JSON.stringify(req), // access in body
        }).done(function (d) {
            if (done) done(d, tag);
        }).fail(function (msg) {
            console.log('FAIL' + msg);
        })
    }
    //#region :: Joint Helpers ::
    class Beevent {
        #triggers = {};
        on(event, callback) {
            var funcs = this.#triggers[event];
            if (!funcs) this.#triggers[event] = funcs = [];
            funcs.push(callback);
        }
        raise(event, params) {
            var funcs = this.#triggers[event];
            if (!funcs) return;
            var length = funcs.length
            for (var i = 0; i < length; i++) {
                funcs[i](params);
            }
        }
    }
    class Beselection {
        #highlighterName = 'beselection';
        #spoint = 'bespoint';
        #selected = 'selected';

        #ctrlPressed = false;
        #paper;
        #selectedElement;
        #selectedElements = {};
        #events = new Beevent();

        canSelect = (elm) => true;
        canSelects = (elm) => true;

        selectingColor = '#FF4365';
        selectedColor = '#3465FF';

        highlighterSelecting = {
            deep: true,
            attrs: {
                'stroke': '#FF4365',
                'stroke-width': 3
            }
        };
        highlighterSelected = {
            deep: true,
            attrs: {
                'stroke': '#3465FF',
                'stroke-width': 3
            }
        }

        attach(paper) {
            document.addEventListener('keydown', (e) => {
                this.#ctrlPressed = e.ctrlKey;
            });
            document.addEventListener('keyup', (e) => {
                this.#ctrlPressed = false;
            });

            //paper.el.onmousedown = (e) => {
            //    if (!ctrlPressed && Object.keys(selectedElements).length > 0) {
            //        var a2 = jpaper.clientToLocalPoint(e.x, e.y);
            //        var views = jpaper.findViewsFromPoint(a2);
            //        if (views.length == 0) _selectionClear();
            //    }
            //};

            this.#paper = paper;
            paper.on('element:pointerdown', this.#elementPointerdown.bind(this));

            //paper.on('element:pointermove', (elementView) => {
            //    var spoint = elementView['spoint'];
            //    if (!spoint) return;
            //    var npoint = elementView.model.position();
            //    _selectionMove(npoint.x - spoint.x, npoint.y - spoint.y);
            //});

        }

        on(event, callback) {
            this.#events.on(event, callback);
        }

        select(element) {
            if (!element) return this.#selectedElement;

        }
        selects(element) {
            if (!element) return this.#selectedElements;
        }

        #singleSelect(element) {
            if (!this.canSelect(element)) return;
            if (this.#selectedElement) this.#highlight(this.#selectedElement);
            this.#selectedElement = element;
            this.#highlight(element, true);
            //element.el.scrollIntoView();
            this.#events.raise(this.#selected, element);
        }
        #multiSelect(element) {
            //if (!selectedElements[element.model.id]) {
            //    selectedElements[element.model.id] = element;
            //    var box = element.getBBox();
            //    element['spoint'] = { x: box.x, y: box.y };
            //}
            //if (!isJob) {
            //    joint.dia.HighlighterView.remove(element, 'job-highlighter');
            //    joint.highlighters.mask.add(element, { selector: 'root' }, 'job-highlighter', {
            //        deep: true,
            //        attrs: {
            //            'stroke': '#3465FF',
            //            'stroke-width': 3
            //        }
            //    });
            //    return;
            //}

            //if (!selectedElements[selectedElement.model.id]) {
            //    selectedElements[selectedElement.model.id] = selectedElement;
            //    var box = selectedElement.getBBox();
            //    selectedElement['spoint'] = { x: box.x, y: box.y };
            //}
            //if (selectedElement) {
            //    joint.dia.HighlighterView.remove(selectedElement, 'job-highlighter');
            //    joint.highlighters.mask.add(selectedElement, { selector: 'root' }, 'job-highlighter', {
            //        deep: true,
            //        attrs: {
            //            'stroke': '#3465FF',
            //            'stroke-width': 3
            //        }
            //    });
            //}
            //selectedElement = element;

            //joint.highlighters.mask.add(selectedElement, { selector: 'root' }, 'job-highlighter', {
            //    deep: true,
            //    attrs: {
            //        'stroke': '#FF4365',
            //        'stroke-width': 3
            //    }
            //});

            //element.el.scrollIntoView();
            //document.dispatchEvent(selectedJobChanged);
        }

        #addSelect(element) {
            var id = element.model.id;
            if (selectedElements[id]) return;
            selectedElements[id] = element;
            element[this.#spoint] = element.model.position();
        }
        #clearSelects() {
            for (const property in this.#selectedElements) {
                var elm = selectedElements[property];
                if (elm != selectedElement) this.#highlight(elm);
                delete elm[this.#spoint];
                delete selectedElements[property];
            }
        }
        #moveSelects(dx, dy) {
            for (const property in selectedElements) {
                var view = selectedElements[property];
                var spoint = view[this.#spoint]
                if (!spoint) continue;
                view.model.position(spoint.x + dx, spoint.y + dy);
            }
        }
        #highlight(element, selecting) {
            if (selecting === undefined) {
                joint.dia.HighlighterView.remove(element, this.#highlighterName);
                return;
            }

            var color = selecting ? this.selectingColor : this.selectedColor;
            var mask = joint.dia.HighlighterView.get(element, this.#highlighterName);
            if (mask) {
                mask.vel.attr('fill', color);
                return;
            }
            joint.highlighters.mask.add(element, { selector: 'root' }, this.#highlighterName, {
                deep: true,
                attrs: {
                    'stroke': color,
                    'stroke-width': 3
                }
            });
        }

        #elementPointerdown(element) {
            if (this.#selectedElement == element) return;

            if (this.#ctrlPressed) {
                this.#multiSelect(element);
            } else {
                this.#clearSelects();
                this.#singleSelect(element);
            }
        }
    }
    class BejobSelection {
        #highlighterName = 'selection';
        #spoint = 'bespoint';
        #selected = 'selected';

        #ctrlPressed = false;
        #paper;
        #selectedElement;
        #selectedElements = {};
        #events = new Beevent();

        canSelect = (elm) => true;
        canSelects = (elm) => true;

        selectingColor = '#FF4365';
        selectedColor = '#3465FF';

        highlighterSelecting = {
            deep: true,
            attrs: {
                'stroke': '#FF4365',
                'stroke-width': 3
            }
        };
        highlighterSelected = {
            deep: true,
            attrs: {
                'stroke': '#3465FF',
                'stroke-width': 3
            }
        }

        attach(paper) {
            document.addEventListener('keydown', (e) => {
                this.#ctrlPressed = e.ctrlKey;
            });
            document.addEventListener('keyup', (e) => {
                this.#ctrlPressed = false;
            });

            //paper.el.onmousedown = (e) => {
            //    if (!ctrlPressed && Object.keys(selectedElements).length > 0) {
            //        var a2 = jpaper.clientToLocalPoint(e.x, e.y);
            //        var views = jpaper.findViewsFromPoint(a2);
            //        if (views.length == 0) _selectionClear();
            //    }
            //};

            this.#paper = paper;
            paper.on('element:pointerdown', this.#elementPointerdown.bind(this));

            //paper.on('element:pointermove', (elementView) => {
            //    var spoint = elementView['spoint'];
            //    if (!spoint) return;
            //    var npoint = elementView.model.position();
            //    _selectionMove(npoint.x - spoint.x, npoint.y - spoint.y);
            //});

        }

        on(event, callback) {
            this.#events.on(event, callback);
        }

        select(element) {
            if (!element) return this.#selectedElement;

        }
        selects(element) {
            if (!element) return this.#selectedElements;
        }

        #singleSelect(element) {
            if (!this.canSelect(element)) return;
            if (this.#selectedElement) this.#highlight(this.#selectedElement);
            this.#selectedElement = element;
            //this.#highlight(element, true);
            this.highlightCell(element.model);
            this.getElementPredecessorLinks(element.model).forEach((link) => this.highlightCell(link));
            //element.el.scrollIntoView();
            this.#events.raise(this.#selected, element);
        }

        highlightCell(cell) {
            var paper = this.#paper;
            joint.highlighters.addClass.add(
                cell.findView(paper),
                cell.isElement() ? "body" : "line",
                "selection",
                { className: "selection" }
            );
        }
        getElementPredecessorLinks(el) {
            var graph = this.#paper.model;
            return graph
                .getSubgraph([el, ...graph.getPredecessors(el)])
                .filter((cell) => cell.isLink());
        }

        #multiSelect(element) {
            //if (!selectedElements[element.model.id]) {
            //    selectedElements[element.model.id] = element;
            //    var box = element.getBBox();
            //    element['spoint'] = { x: box.x, y: box.y };
            //}
            //if (!isJob) {
            //    joint.dia.HighlighterView.remove(element, 'job-highlighter');
            //    joint.highlighters.mask.add(element, { selector: 'root' }, 'job-highlighter', {
            //        deep: true,
            //        attrs: {
            //            'stroke': '#3465FF',
            //            'stroke-width': 3
            //        }
            //    });
            //    return;
            //}

            //if (!selectedElements[selectedElement.model.id]) {
            //    selectedElements[selectedElement.model.id] = selectedElement;
            //    var box = selectedElement.getBBox();
            //    selectedElement['spoint'] = { x: box.x, y: box.y };
            //}
            //if (selectedElement) {
            //    joint.dia.HighlighterView.remove(selectedElement, 'job-highlighter');
            //    joint.highlighters.mask.add(selectedElement, { selector: 'root' }, 'job-highlighter', {
            //        deep: true,
            //        attrs: {
            //            'stroke': '#3465FF',
            //            'stroke-width': 3
            //        }
            //    });
            //}
            //selectedElement = element;

            //joint.highlighters.mask.add(selectedElement, { selector: 'root' }, 'job-highlighter', {
            //    deep: true,
            //    attrs: {
            //        'stroke': '#FF4365',
            //        'stroke-width': 3
            //    }
            //});

            //element.el.scrollIntoView();
            //document.dispatchEvent(selectedJobChanged);
        }

        #addSelect(element) {
            var id = element.model.id;
            if (selectedElements[id]) return;
            selectedElements[id] = element;
            element[this.#spoint] = element.model.position();
        }
        #clearSelects() {
            for (const property in this.#selectedElements) {
                var elm = selectedElements[property];
                if (elm != selectedElement) this.#highlight(elm);
                delete elm[this.#spoint];
                delete selectedElements[property];
            }
        }
        #moveSelects(dx, dy) {
            for (const property in selectedElements) {
                var view = selectedElements[property];
                var spoint = view[this.#spoint]
                if (!spoint) continue;
                view.model.position(spoint.x + dx, spoint.y + dy);
            }
        }
        #highlight(element, selecting) {
            if (selecting === undefined) {
                joint.dia.HighlighterView.remove(element, this.#highlighterName);
                return;
            }

            var color = selecting ? this.selectingColor : this.selectedColor;
            var mask = joint.dia.HighlighterView.get(element, this.#highlighterName);
            if (mask) {
                mask.vel.attr('fill', color);
                return;
            }
            joint.highlighters.mask.add(element, { selector: 'root' }, this.#highlighterName, {
                deep: true,
                attrs: {
                    'stroke': color,
                    'stroke-width': 3
                }
            });
        }

        #elementPointerdown(element) {
            if (this.#selectedElement == element) return;

            if (this.#ctrlPressed) {
                this.#multiSelect(element);
            } else {
                this.#clearSelects();
                this.#singleSelect(element);
            }
        }
    }
    class Bepaper {
        #dx;
        #dy;

        #paper;
        #viewer;

        constructor(viewer, paper, dx, dy) {
            this.#dx = dx ? dx : 100;
            this.#dy = dy ? dy : 100;
            this.#viewer = viewer;
            this.#paper = paper;
            this.#initalize();
        }
        #initalize() {
            var paper = this.#paper;
            paper.options.linkView = BelinkView;
            paper.on('blank:mousewheel', function (e, x, y, delta) {
                if (!e.altKey) return;
                this.scale(this.scale() + delta * 0.1);
            }.bind(this))

            $(document).on('keydown', function (e) {
                if (e.ctrlKey) {
                    switch (e.keyCode) {
                        case 13:
                            this.fitToContent();
                            break;
                        case 37:
                            if (e.shiftKey) this.#expandRight(true);
                            else this.#expandLeft();
                            break;
                        case 38:
                            if (e.shiftKey) this.#expandBottom(true);
                            else this.#expandTop();
                            break;
                        case 39:
                            if (e.shiftKey) this.#expandLeft(true);
                            else this.#expandRight();
                            break;
                        case 40:
                            if (e.shiftKey) this.#expandTop(true);
                            else this.#expandBottom();
                            break;
                    }
                }
            }.bind(this));

            //const color = "#ff4468";
            //paper.svg.prepend(
            //    V.createSVGStyle(`
            //        .joint-element .selection {
            //            stroke: ${color};
            //        }
            //        .joint-link .selection {
            //            stroke: ${color};
            //            stroke-dasharray: 5;
            //            stroke-dashoffset: 10;
            //            animation: dash 0.5s infinite linear;
            //        }
            //        @keyframes dash {
            //            to {
            //                stroke-dashoffset: 0;
            //            }
            //        }
            //    `)
            //);
            
            const lcs = 'green';
            const lct = 'red';
            const lcf = 'orange';
            const lcd = 'blue';
            paper.svg.prepend(
                V.createSVGStyle(`
                    .binean-link.s {
                      color: ${lcs};
                    }
                    .binean-link.t {
                      color: ${lct};
                    }
                    .binean-link.f {
                      color: ${lcf};
                    }
                    .binean-link.d {
                      color: ${lcd};
                    }
                    .binean-link.anim {
                        stroke-dasharray: 5;
                        stroke-dashoffset: 10;
                        animation: dash 0.5s infinite linear;
                    }
                    @keyframes dash {
                        to {
                            stroke-dashoffset: 0;
                        }
                    }
                `)
            );
        }

        minWidth = 1240;
        minHeight = 1754;
        padding = { left: 40, top: 40, right: 40, bottom: 40 };


        getPaper() { return this.#paper }
        getViewer() { return this.#viewer }
        getGraph() { return this.#paper.model }

        #expandLeft(isCollapse) {
            var paper = this.#paper;
            var pRect = paper.getArea();
            var origin = paper.options.origin;

            var dx = (isCollapse ? -1 : 1) * this.#dx;
            if (dx < 0 && pRect.width <= this.minWidth) return;

            paper.setDimensions(pRect.width + dx, pRect.height);
            paper.translate(origin.x + dx, origin.y);
            this.#viewer.scrollLeft += dx;
        }
        #expandTop(isCollapse) {
            var paper = this.#paper;
            var pRect = paper.getArea();
            var origin = paper.options.origin;

            var dy = (isCollapse ? -1 : 1) * this.#dy;
            if (dy < 0 && pRect.height <= this.minHeight) return;

            paper.setDimensions(pRect.width, pRect.height + dy);
            paper.translate(origin.x, origin.y + dy);
            this.#viewer.scrollTop += dy;
        }
        #expandRight(isCollapse) {
            var paper = this.#paper;
            var pRect = paper.getArea();
            var dx = (isCollapse ? -1 : 1) * this.#dx;
            if (dx < 0 && pRect.width <= this.minWidth) return;
            paper.setDimensions(pRect.width + dx, pRect.height);
        }
        #expandBottom(isCollapse) {
            var paper = this.#paper;
            var pRect = paper.getArea();
            var dy = (isCollapse ? -1 : 1) * this.#dy;
            if (dy < 0 && pRect.height <= this.minHeight) return;
            paper.setDimensions(pRect.width, pRect.height + dy);
        }

        scale(s) {
            let paper = this.#paper;
            if (!s) return paper.scale().sx;
            paper.scale(s, s);
            this.fitToContent();
            //let pRect = paper.getArea();
            //paper.setDimensions(pRect.width * s, pRect.height * s);
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
            let crect = paper.getContentArea();
            let scale = paper.scale();

            let w = Math.max(this.minWidth, Math.ceil(crect.width) + padding.left + padding.right);
            let h = Math.max(this.minHeight, Math.ceil(crect.height) + padding.top + padding.bottom);

            var ox = Math.ceil((w - crect.width) / 2) - crect.x;
            var oy = Math.ceil((h - crect.height) / 2) - crect.y;
            paper.model.translate(ox, oy);

            paper.setDimensions(w * scale.sx, h * scale.sy);
            paper.translate(0, 0);
        }

        static createPaper(pageElememt, width, height) {
            if (!width) width = 1754;
            if (!height) height = 11240;

            var namespace = joint.shapes;
            return new joint.dia.Paper({
                el: pageElememt,
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
                interactive: true,
                cellViewNamespace: namespace
            });
        }
    }
    class TextUtil {
        #svgDocument;
        #textElement;

        constructor(styles) {
            this.initialize(styles);
        }

        initialize(styles) {
            if (this.#svgDocument) return;
            this.#svgDocument = V('svg').node;
            document.body.appendChild(this.#svgDocument);
            if (styles) this.applyStyle(styles);
        }

        finalize() {
            if (!this.#svgDocument) return;
            document.body.removeChild(this.#svgDocument);
        }
        applyStyle(styles) {
            if (!this.#svgDocument) return;
            if (this.#textElement) this.#svgDocument.removeChild(this.#textElement);
            this.#textElement = V('<text></text>').attr(styles || {}).node;
            this.#svgDocument.appendChild(this.#textElement);

        }
        getTextBBox(text) {
            if (!this.#textElement) return;
            var textElement = this.#textElement;
            textElement.textContent = text;
            return textElement.getBBox();
        }
    }
    //#endregion
    var BelinkView = joint.dia.LinkView.extend({
       // presentationAttributes: joint.dia.LinkView.addPresentationAttributes({
        // // mapping the model attributes to flag labels
        // faded: ['@opacity'],
      // }),
      // confirmUpdate(flags, ...args) {
        // debugger;
          // flags = joint.dia.LinkView.prototype.confirmUpdate.apply(this, flags, ...args);
          // if (this.hasFlag(flags, '@opacity')) this.toggleFade();
          // return flags;
      // },
      // toggleFade() {
          // this.el.style.opacity = this.model.get('faded') ? 0.5 : 1;
      // }
            
      init: function() {
        joint.dia.LinkView.prototype.init.apply(this, arguments);
        var model = this.model;
        this.listenTo(model, 'change:linkType', this.updateType);
      }, 
      render: function() {
        joint.dia.LinkView.prototype.render.apply(this, arguments);
        this.vel.addClass('binean-link');
        this.updateType();
      },
      updateType: function() {
        var model = this.model;
        var linkType = model.attr('linkType');
        this.vel.addClass(linkType);
        //var a = this.findBySelector('targetMarker');
        //debugger;
        //V(this.findBySelector('line')[0]).addClass(linkType);
      },
    });

    //#region ::Cells::
    var Belink = joint.shapes.standard.Link.define('binean.joint.job.Link',
        {
            attrs: {
                type:'s',
                body: {
                    rx: 8,
                    strokeWidth: 1,
                },
                position: { x: 100, y: 100 },
            },
        },
        {
            addToPaper: function (paper, addToGraph) {
                if (addToGraph) this.addTo(paper.model);
                this.attr(['root', 'highlighterSelector'], 'body');
            }
        },
        {
            fromBinean: function (page, link) {
                var retVal = new this();

                var jobs = page.getJobs();
                var source = jobs[link.From];
                var target = jobs[link.To];

                var retVal = new joint.shapes.standard.Link({
                    source: { id: source.id },
                    target: { id: target.id },
                });

                var ltype = link.LinkType;
                if(!ltype) ltype = 'o'; 
                
                var stroke = 'black';
                // if (ltype == 's') stroke = 'green';
                // else if (ltype == 't') stroke = 'red';
                // else if (ltype == 'f') stroke = 'orange';
                // else if (ltype == 'd') stroke = 'blue';
                

                var strokeDasharray = null;
                if (link.FromType == 'OJob') {
                    strokeDasharray = '0 4 0';
                    stroke = 'purple'
                }

                retVal.attr({
                    linkType:ltype,
                    line: {
                        opacity: 0.2,
                        sourceMarker: null,
                        'stroke-width': 1,
                        color: 'currentColor',
                        stroke: 'currentColor',
                        targetMarker: {
                            type: 'path',
                            color: 'currentColor',
                            stroke: 'currentColor',
                            'stroke-width': 1,
                            fill: 'currentColor',
                            d: 'M 13 -3 0 0 13 3 8 0 Z',
                        },
                    }
                });
                
                //retVal.router('manhattan');
                //retVal.router('metro');
                //retVal.router('rightAngle');
                //retVal.connector('rounded', {
                //    radius: 5
                //});
                return retVal;
            }
        });
    var Becond = joint.shapes.standard.Ellipse.define('binean.joint.job.CCell',
        {
            attrs: {
                root: {
                    highlighterSelector: 'body',
                },
                body: {
                    //opacity: 0.3,
                    strokeWidth: 1,
                    stroke: '#E0E0E0',
                },
                label: {
                    fill: '#E0E0E0',
                },
                position: { x: 100, y: 100 },
            },
        },
        {
            addToPaper: function (paper, addToGraph) {
                if (addToGraph) this.addTo(paper.model);
            }
        },
        {
            fromBinean: function (cell) {
                var retVal = new this();
                var ctype = cell.CellType;

                retVal.resize(25, 25);
                retVal.attr({
                    label: {
                        text: ctype == 'And' ? '&' : '|'
                    }
                });
                retVal.jobName = cell.Name;
                return retVal;
            }
        });
    var Bejob = joint.shapes.standard.Rectangle.define('binean.joint.job.JCell',
        {
            attrs: {
                body: {
                    rx: 8,
                    strokeWidth: 1,
                },
                position: { x: 100, y: 100 },
            },
            jobName: "nhan",
        },
        {
            //addToPaper: function (paper, addToGraph) {
            //    if (addToGraph) this.addTo(paper.model);
            //    this.attr(['root', 'highlighterSelector'], 'body');
            //    var text = paper.findViewByModel(this).findBySelector('label')[0];
            //    if (text) {
            //        var padding = 30;
            //        var bbox = text.getBBox();
            //        this.resize(bbox.width + padding, 30);
            //    }
            //}
        },
        {
            fromBinean: function (cell, util) {
                var retVal = new this();
                var stroke = '#AEAEAE';
                var fill = undefined;
                var color = '#AEAEAE'

                var ctype = cell.CellType;
                if (ctype == 'Job') {
                    fill = 'white';
                    color = 'black';
                    stroke = 'black';

                    var jsts = cell.Status;
                    if (jsts == 'SUCCESS') stroke = 'green';
                    else if (jsts == 'TERMINATED') stroke = 'red';
                    else if (jsts == 'FAIL') stroke = 'orange';
                    else if (jsts == 'ON_NOEXEC') stroke = 'blue';
                    else if (jsts == 'INACTIVE') fill = '#DFDFDF';
                }

                var rx = 12;
                var jtype = cell.JobType;
                if (jtype == 'BOX') rx = 0;
                else if (jtype == 'FW') rx = 30;

                retVal.defaults.jobName = cell.Name;

                retVal.attr({
                    root: {
                        highlighterSelector: 'body',
                    },
                    body: {
                        rx: rx,
                        fill: fill,
                        stroke: stroke,
                    },
                    label: {
                        text: cell.Name,
                        fill: color
                    }
                });

                var bbox;
                if (!util) {
                    util = new TextUtil(retVal.attr().label);
                    bbox = util.getTextBBox(cell.Name)
                    util.finalize();
                } else {
                    util.applyStyle(retVal.attr().label);
                    bbox = util.getTextBBox(cell.Name)
                }

                if (bbox) retVal.resize(bbox.width + 18, 30);

                return retVal;
            },

        });
    class Bepage {
        #project;
        #jobs = {};
        #cells = {};
        #links = [];
        #startJobs = [];

        #selectedName = '';
        constructor(project) {
            this.#project = project;
        }

        padding = 15;
        getProject() { return this.#project; }
        getJobs() { return this.#jobs; }
        getStartJobs() { return this.#startJobs; }

        //getBox() { return this.#box; }
        //selectedJob(jobName) {
        //    if (!jobName) return this.#selectedJob;
        //    this.#selectedJob = jobName;
        //}


        #loadBejobs(becells, cells, items, utils) {
            for (const cn in items) {
                var item = items[cn];
                let c = (item.CellType == 'And' || item.CellType == 'Or')
                    ? Becond.fromBinean(item) : Bejob.fromBinean(item, utils);
                if (item.Level) c.belevel = item.Level;
                cells[c.id] = c;
                item.id = c.id;
                becells[cn] = item;
            }
        }
        #loadBelinks(links, belinks) {
            for (const cn in belinks) {
                var l = Belink.fromBinean(this, belinks[cn]);
                links.push(l);
            }
        }

        findCellByJobName(name) {
            if (!this.#jobs[name]) return;
            var id = this.#jobs[name].id;
            return this.#cells[id];
        }

        //render(paper) {
        //    let graph = paper.model;
        //    graph.clear();
        //    graph.fromJSON(this.#graph);
        //}
        //save(graph) {
        //    this.#graph = graph.toJSON();
        //}

        toJSON() {
            return {
                cells: this.#cells,
                links: this.#links,
            };
        }
        //fromJSON() { }

        addTo(graph) {
            _.each(this.#cells, function (cell) {
                cell.addTo(graph);
            });
            _.each(this.#links, function (link) {
                link.addTo(graph);
            });
        }
        remove() {
            _.each(this.#cells, function (cell) {
                cell.remove();
            });
        }


        #bineanlayout(layout) {
            var length = layout.length;
            var x = 0;
            for (var i = 0; i < length; i++) {
                var table = layout[i];
                x = this.#btlayout(table, 60, 80, x);
            }
        }
        #btlayout(table, dx, dy, x) {
            var opt = {
                dx: dx,
                dy: dy,
                maxWidth: 0,
                rows: [],
                widths: []
            }
            this.#bvlayout(table, opt);
            return this.#bhlayout(opt, x);
        }
        #bvlayout(table, opt) {
            var length = table.length;
            var y = 0;
            for (var i = 0; i < length; i++) {
                opt.rows.push([]);
                opt.widths.push(0);
                y += Math.ceil(this.#brlayout(table[i], opt, i, y) + opt.dy);
            }
        }
        #brlayout(items, opt, index, y) {
            var row = opt.rows[index];
            var width = opt.widths[index];

            var height = 30;
            var length = items.length;
            for (var i = 0; i < length; i++) {
                var cell = this.findCellByJobName(items[i]);
                if (!cell) continue;

                if (items[i] == 'IPVN06_FW_PYPIDAT-01') {
                    var a = 1;
                }

                row.push(cell);
                cell.position(width + opt.dx, y);
                var box = cell.getBBox();
                opt.widths[index] = (width += Math.ceil(opt.dx + box.width));
                if (width > opt.maxWidth) opt.maxWidth = width;
                if (box.height > height) height = box.height;
            }
            return height;
        }
        #bhlayout(opt, x) {
            var rows = opt.rows;
            var maxWidth = opt.maxWidth - opt.dx;
            var length = rows.length;
            for (var i = 0; i < length; i++) {
                var ox = Math.ceil(x + (maxWidth - opt.widths[i]) / 2);
                var cells = rows[i];
                var count = cells.length;
                for (var j = 0; j < count; j++) {
                    var cell = cells[j];
                    var pos = cell.position();
                    if (cell.jobName == 'IPVN06_FW_PYPIDAT-01') {
                        var a = 1;
                    }
                    cell.position(pos.x + ox, pos.y)
                }
            }
            return opt.maxWidth + x;
        }

        #bineanlayout2(layout) {
            for (var name in layout) {
                var cell = this.findCellByJobName(name);
                if (!cell) continue;
                var box = cell.getBBox();
                this.#blayout2(layout[name], Math.ceil(box.x + box.width / 2), Math.ceil(box.y), 80, 80);
            }
        }
        #blayout2(names, x, y, dx, dy) {
            y -= dy;
            var row = [];
            var width = 0;
            var length = names.length;
            for (var i = 0; i < length; i++) {
                var name = names[i];
                var cell = this.findCellByJobName(name);
                if (!cell) continue;
                row.push(cell);
                cell.position(x + width, y);
                var box = cell.getBBox();
                width += box.width + dx;
            }
            var ox = -Math.ceil((width -= dx) / 2);

            var length = row.length;
            for (var i = 0; i < length; i++) {
                var cell = row[i];
                var pos = cell.position();
                cell.position(pos.x + ox, pos.y)
            }
        }
        static fromBinean(proj, page) {
            if (!proj) return undefined;
            var retVal = new this(proj);
            if (!page) return retVal;

            if (!page.SelectedName) retVal.#selectedName = '';
            else retVal.#selectedName = page.SelectedName;

            if (page.StartJobs) retVal.#startJobs = page.StartJobs;

            var utils = new TextUtil();
            retVal.#loadBejobs(retVal.#jobs, retVal.#cells, page.Jobs, utils);
            retVal.#loadBelinks(retVal.#links, page.Links);
            utils.finalize();

            retVal.#bineanlayout(page.Layout);
            retVal.#bineanlayout2(page.Layout2);
            return retVal;
        }
    };
    //#endregion
    class Beproj {
        #jobs = {};
        #pages = {};

        #selectedName = '';

        loadBineanProject(proj) {
            if (!proj) return undefined;

            this.#jobs = proj.Jobs;
            this.#selectedName = proj.SelectedName;

            var pages = this.#pages;
            for (const key in pages) {
                delete pages[key];
            }
            var jpages = proj.Pages;
            for (const name in jpages) {
                var page = Bepage.fromBinean(this, jpages[name]);
                if (!page) continue;
                pages[name] = page;
            }
        }

        select(pageName) {
            if (!pageName) {
                if (!this.#selectedName) {
                    var keys = Object.keys(this.#pages);
                    if (keys.length == 0) return;
                    this.#selectedName = keys[0];
                }
                return this.#pages[this.#selectedName];
            }
        }

        toJSON() {
            var page = this.select();
            return page.toJSON();
        }

        static fromBinean(proj) {
            var retVal = new this();
            if (!proj) return retVal;
            retVal.loadBineanProject(proj);

            //var box = page.Box ? Bebox.fromBinean(page.Box) : undefined;
            //if (box) box.addToPaper(paper, true);
            //var retVal = new this(box, page.SelectedJob, graph.toJSON());
            return retVal;
        }
    }
    //#endregion

    //#region :: namespaces ::
    var bejob = ({
        Project: Beproj,
        Page: Bepage,
        Link: Belink,
        //BCell: Bebox,
        JCell: Bejob,
        CCell: Becond,
        //PageLayout: PageLayout,
    });
    var bejoint = ({
        Selection: BejobSelection,
        Paper: Bepaper,
        job: bejob,
    });
    binean.Event = Beevent;
    binean.joint = bejoint;
    binean.request = berequest;
    //#endregion

    return binean;
}));
