/**
Module for web implementation of Radial Sets
@module RadSets
@submodule Draw
@main RadSets
**/

/**
@class RadSet
@constructor
**/
var RadSet = (function (window, document, $, undefined) {
    var _x = window.RadSet || {};

    /**
    Created Degree Meters from entries list
    @method FillElementsByDegree
    @for RadSet  
    **/
    _x.FillElementsByDegree = function FillElementsByDegree(ID, elements) {
        var innerMeter = "<span class=\"InnerMeter\"></span>";
        var format = "<li onclick=\"RadSet.Select(null,{0});\">{0}<div class='meter Hand' title='{1}'><span class='Degree-{0}' style='width: {2}%'>";
        format += innerMeter + "</span></div></li>";

        var listElement$ = $(document.getElementById(ID));

        var degreeList = _x.GetDegreeList(elements);
        var sorted = degreeList.sort(function (a, b) {
            return (a.Degree - b.Degree);
        });

        var maxEntriesCount = 0;
        for (var i = 0; i < sorted.length; i++) {
            if (sorted[i] !== undefined) {
                if (maxEntriesCount < sorted[i].Count) {
                    maxEntriesCount = sorted[i].Count;
                }
            }
        }

        var count = sorted.length;
        var str = "";
        for (var c = 0; c < count; c++) {
            var deg = sorted[c];
            if (deg !== undefined) {
                var per = deg.Count / maxEntriesCount * 100;
                var tit = deg.Degree + ": " + deg.Count + " (0 selected)"; //.format(per.toFixed(2));
                str += format.format(deg.Degree, tit, per.toFixed(2));
            }
        }
        listElement$.append(str);
        _x.log("inserted Elements of Degree list ");
        return sorted;
    };

    /**
    Created Cardinality Meters from Category list
    @method FillCardinality
    @for RadSet  
    **/
    _x.FillCardinality = function FillCardinality(ID, catList) {
        var innerMeter = "<span class=\"InnerMeter\"></span>";
        var format = "<li onclick=\"RadSet.Select('{0}',-1);\">{0}<div class='meter Hand' title='{1}'><span class='{0}' style='width: {2}%'>";
        format += innerMeter + "</span></div></li>";
        var listElement$ = $(document.getElementById(ID));

        var catListNameAndCount = [];
        for (var idx = 0; idx < catList.length; idx++) {
            catListNameAndCount.push({ Name: catList[idx].Name, Count: catList[idx].Count });
        }

        var sorted = catListNameAndCount.sort(function (a, b) {
            return (a.Count - b.Count);
        });
        var maxEntries = sorted[sorted.length - 1].Count;

        var count = sorted.length;
        //var sum = sorted.reduce(function (a, b) { return a + b.Count; }, 0);



        var str = "";
        for (var c = sorted.length - 1; c >= 0; c--) {
            var cat = sorted[c];
            var per = cat.Count / maxEntries * 100;
            var tit = cat.Name + ": " + cat.Count + " (0 selected)";//.format(per.toFixed(2));
            str += format.format(cat.Name, tit, per.toFixed(2));
        }
        listElement$.append(str);
        _x.log("inserted Set of Cardinality list ");
        return sorted;
    };


    /**
    Created Entries Table
    @method FillSelectedElements
    @for RadSet  
    **/
    _x.FillSelectedElements = function FillSelectedElements(tabID, selElements) {
        var table$ = $(document.getElementById(tabID));
        var countHeaders = _x.options.ListOfVisableProps.length;
        // window.alert(countHeaders) // 4

        //header
        var header = "<thead><tr>";
        for (var i = 0; i < countHeaders; i++) {
            header += "<th>{0}</th>".format(_x.options.ListOfVisableProps[i]);
        }
        header += "</tr></thead>";

        var rows = 0;
        //body
        var body = "<tbody>";
        var countSelEle = selElements.length;
        for (var e = 0; e < countSelEle; e++) {
            var entry = selElements[e];
            var cls = entry.Cats.join(" ");
            cls += " Degree-" + entry.Cats.length;
            body += "<tr id='{1}' class='{0}'>".format(cls, entry.ID);

            for (var i = 0; i < countHeaders; i++) {
                var curProp = _x.options.ListOfVisableProps[i];
                if (typeof entry[curProp] === "function") {
                    body += "<td>{0}</td>".format(entry[curProp].call(entry));
                } else {
                    body += "<td>{0}</td>".format(entry[curProp]);
                }
            }
            body += "</tr>";
            rows += 1;
        }
        body += "</tbody>";

        table$.append(header);
        table$.append(body);
        _x.log("inserted Selected Elements list");
    };

    /**
    Highlight Selected Entries in Cardiality Meters
    @method ShowCategoryInCardiality
    @for RadSet  
    **/
    _x.ShowCategoryInCardiality = function ShowCategoryInCardiality() {
        var options = _x.options;
        $("#" + options.DivSetOfCardinalityID + " .HighLight .InnerMeter").css("width", "0");
        $("#" + options.DivSetOfCardinalityID + " .HighLight").removeClass("HighLight");

        var sortedCatList = _x.ElementsByCardinality;
        var entries = _x.GetEntriesFromIDs(_x.CurrentSelection.Entries);
        var selectedCatList = _x.GetEntriesGroupedByCategory(entries);

        for (var i = sortedCatList.length - 1; i >= 0; i--) {
            var c = sortedCatList[i];
            if (selectedCatList[c.Name] !== undefined) {
                var selC = selectedCatList[c.Name];
                // selC = "General_finding_of_soft_tissue"
                var p = (selC.Count / c.Count * 100).toFixed(2) + "%";
                var el = $("#" + options.DivSetOfCardinalityID + " ." + c.Name);
                el.addClass("HighLight");
                el.find(".InnerMeter").css("width", p);
               
                //update selected in tooltip
                var title = el.parent().attr("title");
                title = title.substring(0, title.indexOf("(")) + "(" + selC.Count + " selected)";
                el.parent().attr("title", title);
            }
        }

    };

    /**
    Highlight Selected Entries in Degree Meters
    @method ShowCategoryInDegree
    @for RadSet  
    **/
    _x.ShowCategoryInDegree = function ShowCategoryInDegree() {
        var options = _x.options;
        $("#" + options.DivElementsByDegreeID + " .HighLight .InnerMeter").css("width", "0");
        $("#" + options.DivElementsByDegreeID + " .HighLight").removeClass("HighLight");

        var sortedDegreeList = _x.ElementsByDegree;
        var entries = _x.GetEntriesFromIDs(_x.CurrentSelection.Entries);
        var selectedDegreeList = _x.GetDegreeList(entries);

        for (var i = sortedDegreeList.length - 1; i >= 0; i--) {
            var d = sortedDegreeList[i];
            if (d !== undefined && selectedDegreeList[d.Degree] !== undefined) {
                var selD = selectedDegreeList[d.Degree];
                var p = (selD.Count / d.Count * 100).toFixed(2) + "%";
                var el = $("#" + options.DivElementsByDegreeID + " .Degree-" + d.Degree);
                el.addClass("HighLight");
                el.find(".InnerMeter").css("width", p);

                //update selected in tooltip
                var title = el.parent().attr("title");
                title = title.substring(0, title.indexOf("(")) + "(" + selD.Count + " selected)";
                el.parent().attr("title", title);
            }
        }
    }

    /**
    Highlight Selected Entries in EntriesTable
    @method ShowCategoryInEntries
    @for RadSet  
    **/
    _x.ShowCategoryInEntries = function ShowCategoryInEntries() {
        $(".ShowEntry").removeClass("ShowEntry");

        var nodes = $.map(_x.CurrentSelection.Entries, function (i) { return document.getElementById(i) });
        $(nodes).addClass("ShowEntry");

        var eleSelRows = $("#lblSelectedRows");
        eleSelRows.text($("table .ShowEntry").length + " items");
    };

    /**
    Create Tooltip for Histogram
    @method CreateTooltipForHistogram
    @return String
    @for RadSet  
    **/
    function CreateTooltipForHistogram(degree, count, selCount) {
        var tooltip = "items";
        if (degree > 1) {
            var otherSets = (degree - 1);
            if (otherSets > 1) {
                tooltip += " shared with " + otherSets + " other sets: " + count;
            } else {
                tooltip += " shared with " + otherSets + " other set: " + count;
            }
        } else {
            tooltip += " unique to this set: " + count;
        }
        if (selCount > 0) {
            tooltip += "\n" + selCount + " items selected (" + (selCount / count * 100).toFixed(2) + "%) ";
        }
        return tooltip;
    }

    /**
    Create Tooltip for ConnectionArc 
    @method CreateTooltipForConnectionArc
    @return String
    @for RadSet  
    **/
    function CreateTooltipForConnectionArc(cat1, cat2, count, selCount) {
        var tooltip = cat1 + " - " + cat2;
        tooltip += "\n" + count + " shared items ";
        if (selCount > 0) {
            tooltip += " \n" + selCount + " selected( " + (selCount / count * 100).toFixed(2) + "% of the shared items)";
        }
        //TODO: Overlap missing
        return tooltip;
    }


    function GetMaxConnectedArcCount() {
        var maxCount = 0;
        for (var cIdx = _x.CatList.length - 1; cIdx >= 0; cIdx--) {
            var cat = _x.CatList[cIdx];
            for (var ccIdx = cat.ConnectedCats.length - 1; ccIdx >= 0; ccIdx--) {
                var cc = cat.ConnectedCats[ccIdx];
                if (cc.Count > maxCount) {
                    maxCount = cc.Count;
                }
            }
        }
        return maxCount;
    }

    /**
    This is the Draw function, it create the Radial Sets View with all Sectors,Histograms,ConnectionArcs and the SelectionHighlights
    @method Draw
    @for RadSet  
    **/
    _x.Draw = function Draw() {
        _x.log("begin draw function");

        var options = _x.options;

        /*VARS*/
        var ADD_TEXTS = true;
        var HistogramSelectionStrokeWidth = 0;


        var winHeight = $("#mainContent").height();
        var winWidth = $("#mainContent").width();
        var center = { y: winHeight / 2, x: winWidth / 2 };
        var paddingToBody = 150;
        var percentOfWhiteSpace = 5;

        var r = 0;
        if ((winWidth - paddingToBody) <= (winHeight - paddingToBody)) {
            r = winWidth - paddingToBody;
        } else {
            r = winHeight - paddingToBody;
        }
        r = r / 2;
        //var r = Math.min(winWidth - paddingToBody, winHeight - paddingToBody) / 2;
        var labelr = r + 10; // radius for label anchor

        var maxDegreeNumbers = _x.ElementsByDegree.length - 1;
        var innerRadius = r * 0.8;
        var outerRadius = r;
        var radialRingSize = outerRadius - innerRadius;

        var histoRadSize = radialRingSize / maxDegreeNumbers;

        var radialset = document.getElementById("radialset");
        var PI = Math.PI;

        var whiteSpaceSize = 2 * Math.PI * (percentOfWhiteSpace / 100) / _x.CatList.length / 2; /// divide by 2 because easier to create the spaces later

        var categoryStartAngles = {};
        var categoryEndAngles = {};

        var donut = d3.layout.pie()
            .sort(function (a, b) { return b.SortOrder < a.SortOrder ? -1 : b.SortOrder > a.SortOrder ? 1 : 0; });

        if (_x.ScaleMode === _x.ScaleModes.Compact) {
            donut.value(function (d) { return d.MaxCountInHistogram(); });
        } else if (_x.ScaleMode === _x.ScaleModes.SetSize) {
            donut.value(function (d) { return d.Count; });
        } else {
            donut.value(function (d) { return d.Count; });
        }


        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(function (d) {
                var cname = d.data.Name;
                var x = d.startAngle + whiteSpaceSize;
                categoryStartAngles[cname] = x;
                return x;
            })
            .endAngle(function (d) {
                var cname = d.data.Name;
                var x = d.endAngle - whiteSpaceSize;
                categoryEndAngles[cname] = x;
                return x;
            });

        //Delete previous svg
        var svg = $("svg");
        if (svg.length > 0) {
            d3.select(svg[0]).remove();
        }

        var vis = d3.select(radialset)
            .append("svg:svg")
            .data([_x.CatList])
            .attr("width", winWidth - 50)
            .attr("height", winHeight - 50);

        CreateGradients(vis, 5, "#006600", "#00cc00");

        var arcs = vis.selectAll("g.arc")
            .data(donut)
            .enter().append("svg:g")
            .attr("class", function (d, i) { return "sector " + d.data.Name; })
            .attr("id", function (d, i) { return "sector_" + d.data.Name; })
            .attr("transform", "translate(" + (center.x) + "," + (center.y) + ")");

        var sector_paths = arcs.append("svg:path")
            .on("click", function (d, i) {
                _x.Select(d.data.Name, -1);
            })
            .attr("class", function (d, i) { return d.data.Name + " Hand Sector"; })
            .attr("fill", options.SectorColor)
            .attr("stroke", "black")
            .attr("stroke-width", "1")
            .attr("d", arc);

        if (options.EnableHover) {
            sector_paths.on("mouseover", function (d, i) {
                d3.select(this).style("fill", options.HoverColor);
            })
              .on("mouseout", function (d, i) {
                  d3.select(this).style("fill", options.SectorColor);
              });
        }

        var selectionGrouped = null;
        if (_x.CurrentSelection !== null) {
            var selEntries = _x.GetEntriesFromIDs(_x.CurrentSelection.Entries)
            selectionGrouped = _x.GetEntriesGroupedByCategoryAndDegree(selEntries, true);
        }

        sector_paths.append("svg:title")
          .text(function (d, i) {

              var tooltip = d.data.Name + "\n" + d.data.Count + " items \n";
              if (selectionGrouped !== null) {
                  if (selectionGrouped[d.data.Name] !== undefined) {
                      var selItems = selectionGrouped[d.data.Name].Count;
                      tooltip += selItems + " items selected (" + (selItems / d.data.Count * 100).toFixed(2) + "%)";
                  }
              }
              return tooltip;
          });



        _x.log("begin draw Histograms function");
        //delete all selected histograms
        d3.selectAll("path.HistogramSelection").remove();

        //create histogram arcs
        for (var cIdx = _x.CatList.length - 1; cIdx >= 0; cIdx--) {
            var c = _x.CatList[cIdx];
            var histos = c.Histograms;

            if (categoryStartAngles[c.Name] === undefined) {
                continue;
            }

            var cStartAngle = categoryStartAngles[c.Name];
            var cEndAngle = categoryEndAngles[c.Name];
            var cAngleDiff = cEndAngle - cStartAngle;
            var middleAngle = cAngleDiff / 2; //middle of angle

            _x.CatList[cIdx].StartAngle = cStartAngle;
            _x.CatList[cIdx].EndAngle = cEndAngle;
            _x.CatList[cIdx].MiddleAngle = cStartAngle + middleAngle;

            var histos = histos.sort(function (a, b) {
                return (a.Degree - b.Degree);
            });
            var histosSortByCounts = histos.sort(function (a, b) {
                return (b.Count - a.Count);
            });

            var histoDrawObjs = [];
            var histoSelectionDrawObjs = [];

            for (var hIdx = 0; hIdx < histos.length; hIdx++) {
                var h = histos[hIdx];

                var maxHistoCounterInCat = histosSortByCounts[0].Count;

                var divByCount = cAngleDiff / maxHistoCounterInCat;
                var diffAngleForHisto = divByCount * h.Count;
                diffAngleForHisto = diffAngleForHisto / 2;

                var data = {
                    Name: c.Name,
                    Degree: h.Degree,
                    Count: h.Count,
                    SelCount: 0,
                    InnerRadius: (outerRadius - (histoRadSize * h.Degree)),
                    OuterRadius: (outerRadius - (histoRadSize * (h.Degree - 1))),
                    StartAngle: (cStartAngle + middleAngle - diffAngleForHisto),
                    EndAngle: (cStartAngle + middleAngle + diffAngleForHisto)
                };

                //calculate Selection of Histogram
                if (selectionGrouped !== null && selectionGrouped[c.Name] !== undefined && selectionGrouped[c.Name][h.Degree] !== undefined) {
                    var selObj = selectionGrouped[c.Name][h.Degree];
                    if (selObj !== undefined) {
                        var sel = $.extend({}, data);
                        var diffAngleForHistoSelection = diffAngleForHisto / h.Count * selObj.Count;



                        if (options.SelectionAlignHistogram === "center") {
                            sel.StartAngle = (cStartAngle + middleAngle - diffAngleForHistoSelection);
                            sel.EndAngle = (cStartAngle + middleAngle + diffAngleForHistoSelection);
                        } else if (options.SelectionAlignHistogram === "left") {
                            sel.StartAngle = (cStartAngle + middleAngle - diffAngleForHisto);
                            sel.EndAngle = (cStartAngle + middleAngle - diffAngleForHisto + (diffAngleForHistoSelection * 2));
                        } else if (options.SelectionAlignHistogram === "right") {
                            sel.StartAngle = (cStartAngle + middleAngle + diffAngleForHisto - (diffAngleForHistoSelection * 2));
                            sel.EndAngle = (cStartAngle + middleAngle + diffAngleForHisto);
                        }

                        data.SelCount = selObj.Count;
                        sel.SelCount = selObj.Count;

                        histoSelectionDrawObjs.push(sel);
                    }
                }

                histoDrawObjs.push(data);
            }

            var HistArc = d3.svg.arc()
              .innerRadius(function (d, i) { return d.InnerRadius; })
              .outerRadius(function (d, i) { return d.OuterRadius; })
              .startAngle(function (d, i) { return d.StartAngle; })
              .endAngle(function (d, i) { return d.EndAngle; });

            var ele = document.getElementById("sector_" + c.Name);
            var histogramPaths = d3.select(ele)
              .selectAll("path.Histogram")
              .data(histoDrawObjs)
              .enter()
              .append("path")
              .on("click", function (d, i) {
                  _x.Select(d.Name, d.Degree);
              })
              .attr("stroke", "black")
              .attr("stroke-width", "1")
              .attr("fill", options.HistoColor)
              .attr("class", function (d, i) { return "Hand Histogram Degree-" + d.Degree; })
              .attr("d", HistArc);

            histogramPaths.append("svg:title")
              .text(function (d, i) {
                  return CreateTooltipForHistogram(d.Degree, d.Count, d.SelCount);
              });

            if (selectionGrouped !== null && histoSelectionDrawObjs.length > 0) {
                var selectedPaths = d3.select(ele)
                  .selectAll("path.HistogramSelection")
                  .data(histoSelectionDrawObjs)
                  .enter()
                  .append("path")
                  .on("click", function (d, i) {
                      _x.Select(d.Name, d.Degree);
                  })
                  .attr("stroke", "black")
                  .attr("stroke-width", HistogramSelectionStrokeWidth)
                  .attr("class", function (d, i) { return "Hand HistogramSelection Degree-" + d.Degree; })
                  .attr("d", HistArc);

                selectedPaths.append("svg:title")
                  .text(function (d, i) {
                      return CreateTooltipForHistogram(d.Degree, d.Count, d.SelCount);
                  });
            }

            if (options.EnableHover) {
                histogramPaths.on("mouseover", function (d, i) {
                    d3.select(this).style("fill", options.HoverColor);
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).style("fill", null);
                });
            }

        }

        if (ADD_TEXTS) {
            arcs.append("svg:text")
              .attr("transform", function (d) {
                  var c = arc.centroid(d),
                      x = c[0],
                      y = c[1],
                      h = Math.sqrt(x * x + y * y);
                  return "translate(" + (x / h * labelr) + ',' +
                     (y / h * labelr) + ")";
              })
              .attr("dy", ".35em")
              .attr("text-anchor", function (d) {
                  return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                      "end" : "start";
              })
              .text(function (d, i) {
                  return d.data.Name;
              });
        }


        //draw arcs between categories

        /**
        @class ConnectionArc
        @constructor
        @private
        **/
        function ConnectionArc(x, y, ir, or, sa, ea, cat1, cat2) {
            /**
            @property x
            @for ConnectionArc
            @type Integer
            **/
            this.x = x;
            /**
            @property y
            @for ConnectionArc
            @type Integer
            **/
            this.y = y;
            /**
            @property innerRadius
            @for ConnectionArc
            @type Float
            **/
            this.innerRadius = ir;
            /**
            @property outerRadius
            @for ConnectionArc
            @type Float
            **/
            this.outerRadius = or;
            /**
            @property startAngle
            @for ConnectionArc
            @type Float
            **/
            this.startAngle = sa;
            /**
            @property endAngle
            @for ConnectionArc
            @type Float
            **/
            this.endAngle = ea;
            /**
            @property Cat1
            @for ConnectionArc
            @type String
            **/
            this.Cat1 = cat1;
            /**
            @property Cat2
            @for ConnectionArc
            @type String
            **/
            this.Cat2 = cat2;
            /**
            @property Count
            @for ConnectionArc
            @type Integer
            **/
            this.Count = 0;
            /**
            @property SelCount
            @for ConnectionArc
            @type Integer
            **/
            this.SelCount = 0;
            /**
            @property Name
            @for ConnectionArc
            @type String
            **/
            this.Name = cat1 + "-" + cat2;
        }

        _x.log("begin draw connectionarcs function");
        var connectedArcs = [];
        var selectedConnectedArcs = [];
        var maxConnectedArcCount = GetMaxConnectedArcCount();

        for (var cIdx = _x.CatList.length - 1; cIdx >= 0; cIdx--) {
            var c = _x.CatList[cIdx];
            var connected = c.ConnectedCats;

            var conCatNames = [];
            for (var i = connected.length - 1; i >= 0; i--) {
                conCatNames.push(connected[i].Name);
            }

            for (var cIdx2 = _x.CatList.length - 1; cIdx2 >= 0; cIdx2--) {
                var c2 = _x.CatList[cIdx2];

                if (c.Name === c2.Name) { //|| conCatNames.indexOf(c2.Name) === -1){
                    continue;
                }

                // skip arc there are already made
                var skipArc = false;
                for (var aidx = 0; aidx < connectedArcs.length; aidx++) {
                    var ca = connectedArcs[aidx];
                    if ((ca.Cat1 === c.Name && ca.Cat2 === c2.Name) || (ca.Cat1 === c2.Name && ca.Cat2 === c.Name)) {
                        skipArc = true;
                    }
                }
                var connection = null;
                for (var i = 0; i < connected.length; i++) {
                    if (connected[i].Name == c2.Name) {
                        connection = connected[i];
                        break;
                    }
                }
                if (skipArc || connection === null) {
                    continue;
                }


                var th1 = (c.StartAngle + c.EndAngle) / 2;
                var th2 = (c2.StartAngle + c2.EndAngle) / 2;
                var midAngle = (th1 + th2) / 2;
                var startAngle = th2 + (Math.PI / 2);
                var endAngle = th1 + (3 * Math.PI / 2);
                var range = th2 - th1;
                if (range === Math.PI) {
                    range *= 0.99;
                }
                if (range > Math.PI) {
                    startAngle -= Math.PI;
                    endAngle -= Math.PI;
                }
                var shift;
                if (range > (Math.PI / 10)) {
                    shift = 0.1;
                } else {
                    if (range < (PI / 20)) {
                        shift = 0;
                    } else {
                        shift = (range - (PI / 20)) / PI / 200;
                    }
                }
                var tr = Math.tan(range / 2) * (innerRadius + shift);
                var rad = Math.sqrt((tr * tr) + (shift * shift));
                var rho = (innerRadius + shift) / Math.cos(range / 2);
                var thickness = 6 * connection.Count / maxConnectedArcCount;
                thickness *= options.ConnectionArcMultiply;

                var x = (rho * Math.sin(midAngle));
                var y = (-rho * Math.cos(midAngle));
                var rad1 = rad - (thickness / 2);
                var rad2 = rad + (thickness / 2);

                var conArc = new ConnectionArc(x, y, rad1, rad2, startAngle, endAngle, c.Name, c2.Name);
                conArc.Count = connection.Count;


                if (_x.CurrentSelection !== null) {
                    var selConArc = $.extend({}, conArc);
                    var selCount = connection.GetNumberOfConnected(_x.CurrentSelection.Entries);

                    selCount += (selCount > 0) ? 1 : 0; // plus 1 because itself also selected , but only when selection is available

                    conArc.SelCount = selCount;
                    selConArc.SelCount = selCount;

                    var selThickness = 6 * selCount / maxConnectedArcCount;

                    if (options.SelectionAlignConnectionArc === "center") {
                        selConArc.innerRadius = (rad - (selThickness / 2));
                        selConArc.outerRadius = (rad + (selThickness / 2));
                    } else if (options.SelectionAlignConnectionArc === "left") {
                        selConArc.innerRadius = (rad - (thickness / 2));
                        selConArc.outerRadius = (rad - (thickness / 2) + selThickness);
                    } else if (options.SelectionAlignConnectionArc === "right") {
                        selConArc.innerRadius = (rad + (thickness / 2) - selThickness);
                        selConArc.outerRadius = (rad + (thickness / 2));
                    }
                    selectedConnectedArcs.push(selConArc);
                }

                connectedArcs.push(conArc);
            }
        }

        //draw arcs
        var arc = d3.svg.arc()
          .innerRadius(function (d, i) { return d.innerRadius; })
          .outerRadius(function (d, i) { return d.outerRadius; })
          .startAngle(function (d, i) { return d.startAngle; })
          .endAngle(function (d, i) { return d.endAngle; });

        vis.append("g")
            .attr("id", "ConnectionArcs")
            .attr("class", "ConnectionArcs")
            .attr("transform", "translate(" + (center.x) + "," + (center.y) + ")");

        var connectionPaths = d3.select("g.ConnectionArcs")
          .selectAll("path.ConnectionArc")
          .data(connectedArcs)
          .enter()
          .append("path")
          .attr("stroke", "black")
          .attr("stroke-width", "0")
          .attr("fill", options.ConnectionArcColor)
          .attr("class", function (d, i) { return "Hand ConnectionArc " + d.Name + " {0} {1}".format(d.Cat1, d.Cat2); })
          .attr("transform", function (d, i) {
              return "translate(" + (d.x) + "," + (d.y) + ")";
          })
          .on("click", function (d, i) {
              _x.SelectArc(d.Cat1, d.Cat2);
          })
          .attr("d", arc);

        connectionPaths.append("svg:title")
          .text(function (d, i) {
              return CreateTooltipForConnectionArc(d.Cat1, d.Cat2, d.Count, d.SelCount);
          });

        if (_x.CurrentSelection !== null) {
            var selConnectionPaths = d3.select("g.ConnectionArcs")
                .selectAll("path.SelectedConnectionArc")
                .data(selectedConnectedArcs)
                .enter()
                .append("path")
                .attr("stroke", "black")
                .attr("stroke-width", "0")
                .attr("fill", options.HighlightColor)
                .attr("class", function (d, i) { return "Hand SelectedConnectionArc " + d.Name + " {0} {1}".format(d.Cat1, d.Cat2); })
                .attr("transform", function (d, i) {
                    return "translate(" + (d.x) + "," + (d.y) + ")";
                })
                .on("click", function (d, i) {
                    _x.SelectArc(d.Cat1, d.Cat2);
                })
                .attr("d", arc);

            selConnectionPaths.append("svg:title")
              .text(function (d, i) {
                  return CreateTooltipForConnectionArc(d.Cat1, d.Cat2, d.Count, d.SelCount);
              });
        }

        if (options.EnableHover) {
            connectionPaths.on("mouseover", function (d, i) {
                d3.select(this).style("fill", options.HoverColor);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).style("fill", null);
            });
        }

        _x.log("end draw function");
    };


    _x.CreateStyleTag = function () {
        var style = "<style>";
        var options = _x.options;

        var highlightStyles = ".HighLight .InnerMeter{background-color: " + options.HighlightColor + " !important;} ";
        highlightStyles += ".HighLight{fill: " + options.HighlightColor + " !important; z-index: 5000;} ";
        highlightStyles += ".HighLightCategory{fill: " + options.HighlightColor + " !important} ";
        highlightStyles += ".HighLightHistogram{fill: " + options.HighlightColor + " !important} ";
        highlightStyles += ".HistogramSelection{fill: " + options.HighlightColor + " !important} ";

        style += highlightStyles;

        for (var c = 0; c < _x.options.HistoColors.length; c++) {
            style += ".Degree-" + (c + 1) + "{ fill:#" + _x.options.HistoColors[c] + ";}";
        }

        style += "</style>";

        $("head").append(style);
    }


    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    function rgbToHex(o) {
        return "#" + ((1 << 24) + (o.r << 16) + (o.g << 8) + o.b).toString(16).slice(1);
    }

    function CreateGradients(svg, countDegree, color1, color2, gradientType) {

        var gradientType = gradientType || 0;
        var begRGB = hexToRgb(color1);
        var endRGB = hexToRgb(color2);
        var start = begRGB;
        var data = [];
        for (var k = 1; k <= countDegree; k++) {
            var end = {
                r: begRGB.r + (endRGB.r - start.r) / countDegree * 6,
                g: begRGB.g + (endRGB.g - start.g) / countDegree * 6,
                b: begRGB.b + (endRGB.b - start.b) / countDegree * 6
            };
            var d = {
                id: "Histogram-Degree-" + k,
                x1: "0%",
                y1: "0%",
                x2: "0%",
                y2: "100%",
                spreadMethod: "pad",
                stops: [{
                    offset: "0%",
                    color: rgbToHex(start),
                    opacity: "1"
                }, {
                    offset: "100%",
                    color: rgbToHex(end),
                    opacity: "1"
                }
                ]
            };
            data.push(d);
            start = end;
        }

        if (gradientType === 0) {
            svg.append("defs").selectAll(".lingrad")
              .data(data).enter()
              .append("linearGradient")
              .attr("class", "lingrad")
              .attr("id", function (d, i) { return d.id; })
              //.attr("x1", function (d, i) { return d.x1; })
              //.attr("y1", function (d, i) { return d.y1; })
              //.attr("x2", function (d, i) { return d.x2; })
              //.attr("y2", function (d, i) { return d.y2; })
              //.attr("gradientTransform", "rotate(0)")
              //.attr("spreadMethod", function (d, i) { return d.spreadMethod; })
              .selectAll(".stops").data(function (d) { return d.stops }).enter().append("stop")
              .attr("class", "stops")
              .attr("offset", function (d, i) { return d.offset })
              .attr("stop-color", function (d, i) { return d.color })
              .attr("stop-opacity", 1);
        }
        else if (gradientType === 1) {
            svg.append("defs").selectAll(".lingrad")
              .data(data).enter()
              .append("radialGradient")
              .attr("class", "lingrad")
              .attr("id", function (d, i) { return d.id; })
                .attr("fx", "5%")
                .attr("fy", "5%")
                .attr("r", "65%")
              .attr("spreadMethod", function (d, i) { return d.spreadMethod; })
              .selectAll(".stops").data(function (d) { return d.stops }).enter().append("stop")
              .attr("class", "stops")
              .attr("offset", function (d, i) { return d.offset })
              .attr("stop-color", function (d, i) { return d.color })
              .attr("stop-opacity", 1);
        }
    }

    return _x;
}(window, document, jQuery));