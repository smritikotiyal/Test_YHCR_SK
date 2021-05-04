/**
Module for web implementation of Radial Sets
@module RadSets
@submodule Converter
@main RadSets
**/

/**
@class RadSet
@constructor
**/
var RadSet = (function (window, document, $, undefined) {
    var _x = window.RadSet || {};

    /**
    * List of Entries
    * @attribute Entries
    * @type [Entry]
    */
    _x.Entries = [];
    /**
    * List of Categories
    * @attribute CatList
    * @type [Category]
    */
    _x.CatList = [];
    /**
    * List of elements by Cardinality
    * @attribute ElementsByCardinality
    * @type [{Category,Count}]
    */
    _x.ElementsByCardinality = [];

    /**
    * List of elements by degree
    * @attribute ElementsByDegree
    * @type [{Degree,Count}]
    */
    _x.ElementsByDegree = [];


    _x.ActiveSchema = "avgRating";
    _x.Schemas = {
        "avgRating": { file: "AvgRating.csv", order: "desc" },
        "releaseDate": { file: "releaseDate.csv", order: "asc" },
        "watches": { file: "watches.csv", order: "desc" },
    };
    _x.Legend = {
        "avgRating": { file: "AvgRating_TF.csv"},
        "releaseDate": { file: "releaseDate_TF.csv"},
        "watches": { file: "watches_TF.csv"},
    };
    _x.LegendData = null;


    /* Constructors */
    /**
    Entry class
    @class Entry
    @constructor
    **/
    function Entry(id, name) {
        /**
        Autonumber of Entry 
        @property ID 
        @type Integer
        **/
        this.ID = id;
        /**
        Name of the Entry
        @property Name
        @type String
        **/
        this.Name = name;
        /**
        List of Categories Names
        @property Cats
        @type [String]
        **/
        this.Cats = [];
        /**
        Degree
        @property Degree
        @type Int
        @default -1
        **/
        this.Degree = -1;
        /**
        ReleaseDate
        @property Degree
        @type Date
        @default null
        **/
        this.ReleaseDate = null;
        /**
        AvgRating
        @property AvgRating
        @type Float
        @default 0
        **/
        this.AvgRating = 0;
        /**
        Watches
        @property Watches
        @type int
        @default 0
        **/
        this.Watches = 0;
        /**
        Returns String of connected Categories
        @method Sets
        @return String
        **/
        this.Sets = function () {
            return this.Cats.join(",");
        };
    }
    /**
    Category class
    @class Category
    @constructor
    **/
    function Category(name) {
        /**
        @property Name
        @type String
        **/
        this.Name = name;
        /**
        @property Count
        @type Integer
        @default 0
        **/
        this.Count = 0;
        /**
        @property StartAngle
        @type Integer
        @default 0
        **/
        this.StartAngle = 0;
        /**
        @property EndAngle
        @type Integer
        @default 0
        **/
        this.EndAngle = 0;
        /**
        @property MiddleAngle
        @type Integer
        @default 0
        **/
        this.MiddleAngle = 0;
        /**
        @property SortOrder
        @type Integer
        @default 0
        **/
        this.SortOrder = 0;
        /**
        @property Histograms
        @type [Histogram]
        @default []
        **/
        this.Histograms = [];
        /**
        Object that contains information about connected ConnectedCategory, Key for the Category is its Name
        @property ConnectedCats
        @type {ConnectedCategory}
        @default {}
        **/
        this.ConnectedCats = {};
        /**
        Gets the maximum count in the histogram list
        @method MaxCountInHistogram
        @for Category
        @return Integer
        **/
        this.MaxCountInHistogram = function () {
            var max = 0;
            for (var i = 0; i < this.Histograms.length; i += 1) {
                var x = this.Histograms[i];
                if (max < x.Count) {
                    max = x.Count;
                }
            }
            return max;
        };
    }
    /**
    ConnectedCategory class
    @class ConnectedCategory
    @constructor
    **/
    function ConnectedCategory(name, count) {
        /**
        @property Name
        @type String
        **/
        this.Name = name;
        /**
        @property Count
        @type Int
        **/
        this.Count = count;
        /**
        List of the connected entry IDs
        @property Entries
        @type [Int]
        **/
        this.Entries = []; //list of the connected entry ids
        /**
        @method GetNumberOfConnected
        @return Int
        **/
        this.GetNumberOfConnected = function (ids) {
            var count = 0;
            for (var i = 0, len = ids.length; i < len - 1; i++) {
                if (this.Entries.indexOf(ids[i]) !== -1) {
                    count += 1;
                }
            }
            return count;
        };
    }
    /**
    Histogram class
    @class Histogram
    @constructor
    **/
    function Histogram(degree) {
        /**
        @property Degree
        @type Int
        **/
        this.Degree = degree;
        /**
        @property InnerRadius
        @type Float
        **/
        this.InnerRadius = 0;
        /**
        @property OuterRadius
        @type Float
        **/
        this.OuterRadius = 0;
        /**
        @property Count
        @type Int
        **/
        this.Count = 0;
    }

    /**
    Reads a list of strings an transforms it into Entries and Categories
    @method ConvertCSVtoObjects
    @for RadSet 
    @param {String} allTextLines
    @param {String} sep
    **/
    function ConvertCSVtoObjects(allTextLines, sep) {
        _x.CatList = [];
        _x.Entries = [];
        var maxLines = allTextLines.length; // 1911
        var headerRow = [];
        var headerIdxAndCatIdx = [];

        if (maxLines > _x.options.EntryLimit && _x.options.EntryLimit > 0) {
            maxLines = _x.options.EntryLimit;
        }

        for (var i = 0; i < maxLines ; i++) {
            var line = allTextLines[i];
            var lineParts = line.split(sep);
            var e = null;

            if (line === "") {
                continue;
            }

            for (var x = 0; x < lineParts.length; x++) {
                var t = lineParts[x];
                if (i === 0) {
                    headerRow.push(t);
                }
                if (i === 0 && x !== 0) {
                    if ($.inArray(t, _x.options.ListOfNonCategories) === -1) { //when not in list den count as category
                        var c = new Category(t);
                        c.SortOrder = _x.options.CategoryOrder.indexOf(t) === -1 ? null : _x.options.CategoryOrder.indexOf(t);
                        _x.CatList.push(c);

                        headerIdxAndCatIdx[x] = _x.CatList.length - 1;
                    }
                } else if (i !== 0 && x === 0) {
                    var id = _x.Entries.length;
                    e = new Entry(id, t);
                } else if (i !== 0 && x !== 0) {
                    var head = headerRow[x];
                    if ($.inArray(head, _x.options.ListOfNonCategories) === -1) { //when not in list den count as category
                        if (t === "1") {
                            var catIdx = headerIdxAndCatIdx[x];
                            if (catIdx !== undefined) {
                                var cat = _x.CatList[catIdx];
                                e.Cats.push(cat.Name);
                                _x.CatList[catIdx].Count += 1;
                            }
                        }
                    } else {
                        e[head] = t;
                    }
                }
            }
            if (e !== null) {
                e.Degree = e.Cats.length;
                if ((e.Degree < 1 && !_x.options.IgnoreEntriesWithoutCategories) || e.Degree > 0) {
                    _x.Entries.push(e);
                }
            }
        }
        _x.log("{0} categories and {1} objects saved.".format(_x.CatList.length, _x.Entries.length));

        //if no sortorder was found then take category-entry-count
        for (var cidx = 0; cidx < _x.CatList.length; cidx++) {
            var cat2 = _x.CatList[cidx];
            if (cat2.SortOrder === null) {
                cat2.SortOrder = cat2.Count;
            }
        }

        _x.CatList.sort(function (a, b) {
            return (a.SortOrder - b.SortOrder);
        });

        CreateHistogram();
    }

    /**
    Create Histogram Objects for the Entries 
    @method CreateHistogram
    @for RadSet
    **/
    function CreateHistogram() {
        var tmpCatHistoList = {};
        var tmpConnectedCats = {};

        for (var idx = _x.Entries.length - 1; idx >= 0; idx--) {
            var e = _x.Entries[idx];
            var degree = e.Degree + '';
            for (var i = e.Cats.length - 1; i >= 0; i--) {
                var cname = e.Cats[i];

                if (tmpCatHistoList[cname] === undefined) {
                    tmpCatHistoList[cname] = {};
                }
                if (tmpConnectedCats[cname] === undefined) {
                    tmpConnectedCats[cname] = {};
                }
                if (tmpCatHistoList[cname][degree] === undefined) {
                    tmpCatHistoList[cname][degree] = new Histogram(parseInt(degree, 10));
                    tmpCatHistoList[cname][degree].Count = 1;
                } else {
                    tmpCatHistoList[cname][degree].Count += 1;
                }
                //create connected to
                var otherCats = e.Cats.slice();
                otherCats.splice(i, 1);
                for (var oc = otherCats.length - 1; oc >= 0; oc--) {
                    var ocName = otherCats[oc];
                    if (tmpConnectedCats[cname][ocName] === undefined) {
                        tmpConnectedCats[cname][ocName] = new ConnectedCategory(ocName, 1, e.ID);
                    } else {
                        tmpConnectedCats[cname][ocName].Count += 1;
                        tmpConnectedCats[cname][ocName].Entries.push(e.ID);
                    }
                }
            }
        }


        for (var c = 0; c < _x.CatList.length; c++) {
            var cat = _x.CatList[c];
            var histos = [];
            if (tmpCatHistoList[cat.Name] !== undefined) {
                var k;
                for (k in tmpCatHistoList[cat.Name]) {
                    var hi = tmpCatHistoList[cat.Name][k];
                    histos.push(hi);
                }
                _x.CatList[c].Histograms = histos;
            }

            var connected = [];
            if (tmpConnectedCats[cat.Name] !== undefined) {
                var kcc;
                for (kcc in tmpConnectedCats[cat.Name]) {
                    var con = tmpConnectedCats[cat.Name][kcc];
                    connected.push(con);
                }
                _x.CatList[c].ConnectedCats = connected;
            }
        }

        _x.log("created historgrams data.");
    }


    /**
    Method that reads the CSV file and transforms the data in the file
    @method ReadCSV
    @for RadSet
    @param {String} filename
    **/
    _x.ReadCSV = function ReadCSV(filename) {
        $.ajax({
            url: filename,
            async: false,
            success: function (data) {
                _x.log("file {0} found.".format(filename));
                var allTextLines = [];
                //$("#divPlainText").text(data);
                allTextLines = data.split(/\r\n|\n/);
                // window.alert(allTextLines);
                // ConvertCSVtoObjects(allTextLines, ";");
                ConvertCSVtoObjects(allTextLines, ";");
            },
            error: function (xhr) {
                _x.log("error while reading file {0}.".format(filename));
            }
        });
    };

    _x.CreateColorSchemaFromCSV = function (name, filename, order) {
        $.ajax({
            url: filename,
            async: false,
            success: function (data) {
                var allTextLines = [];
                allTextLines = data.split(/\r\n|\n/);
                //CreateColorSchema(name, allTextLines, ";");
                CreateColorSchema2(name, allTextLines, "\t", order);
            },
            error: function (xhr) {
                _x.log("error while reading file {0}.".format(filename));
            }
        });
    };

    _x.ReadLegendCSV = function (name, filename) {
        $.ajax({
            url: filename,
            async: false,
            success: function (data) {
                var allTextLines = [];
                allTextLines = data.split(/\r\n|\n/);
                CreateLegend(name, allTextLines, "\t");
            },
            error: function (xhr) {
                _x.log("error while reading file {0}.".format(filename));
            }
        });
    }

    _x.ActivateSchema = function (name) {
        $("body").removeClass(_x.ActiveSchema);
        _x.ActiveSchema = null;
        if (name !== undefined && name !== null && name !== "") {
            $("body").addClass(name);
            _x.ActiveSchema = name;
            UpdateLegendDialog(name, "tabLegend");
        }
    }

    _x.DeactivateSchema = function (name) {
        $("body").removeClass(_x.ActiveSchema);
    };
    _x.ReactivateSchema = function (name) {
        $("body").addClass(_x.ActiveSchema);
    };

    _x.ShowLegend = function () {
        $("#diaLegend").dialog("open");
    };

    function UpdateLegendDialog(name, id) {
        var tab = $(document.getElementById(id));
        tab.empty();
        var str = "";
        var data = _x.LegendData[name];
        var c = 0;
        for (var v in data) {
            var d = data[v];
            str += "<tr>";
            if (c === 0) {
                str += "<td rowspan='9'><div id='bar'></div></td>";
            }
            str += "<td class='barline'>" + v + "</td></tr>";
            c++;
        }
        tab.html(str);
    }

    function CreateColorSchema(name, allTextLines, sep) {
        var maxLines = allTextLines.length;
        var headerRow = [];
        var headerIdxAndCatIdx = [];
        var schema = {};

        for (var i = 0; i < maxLines ; i++) {
            var line = allTextLines[i];
            var lineParts = line.split(sep);
            var e = null;
            var degree = 0;

            if (line === "") {
                continue;
            }

            for (var x = 0; x < lineParts.length; x++) {
                var t = lineParts[x];
                if (i === 0 && t !== "") {
                    headerRow.push(t);
                    schema[t] = {};
                }
                if (i !== 0 && x === 0) {
                    degree = parseInt(t, 10);
                } else if (i !== 0 && x !== 0) {
                    var head = headerRow[x - 1];
                    schema[head][degree] = t;
                }
            }
        }
        AddSchemaStyle(name, schema);
    }

    function CreateColorSchema2(name, allTextLines, sep, order) {
        var maxLines = allTextLines.length;
        var headerRow = [];
        var headerIdxAndCatIdx = [];
        var schema = {};

        for (var i = 0; i < maxLines ; i++) {
            var line = allTextLines[i];
            var lineParts = line.split(sep);
            var e = null;
            var degree = 0;

            if (line === "") {
                continue;
            }

            var cat = null;
            for (var x = 0; x < lineParts.length; x++) {
                var t = lineParts[x];
                if (x === 0) {
                    cat = t;
                    schema[cat] = {};
                } else if (x !== 0) {
                    if (order === "asc") {
                        schema[cat][x] = t;
                    } else if (order === "desc") {
                        schema[cat][lineParts.length-x] = t;
                    }
                }
            }
        }
        AddSchemaStyle(name, schema);
    }

    function AddSchemaStyle(name, schema) {
        var style = "<style>";

        for (var cat in schema) {
            var c = schema[cat];
            for (var d in c) {
                var color = c[d];
                style += GetSingleStyle(name, cat, d, color);
            }
        }

        style += "</style>";

        $("head").append(style);
        _x.log("create schema " + name);
    }

    function GetSingleStyle(name, cat, degree, color) {
        var hexColor = color.indexOf("#") === 0 ? color : "#" + color;
        return "body." + name + " .sector." + cat + " .Histogram.Degree-" + degree + "{ fill: " + hexColor + "; }";
    }

    function CreateLegend(name, allTextLines, sep) {
        //fill Legend Data
        var maxLines = allTextLines.length;
        var headerRow = [];
        var headerIdxAndCatIdx = [];
        var data = {};

        for (var i = 0; i < maxLines ; i++) {
            var line = allTextLines[i];
            var lineParts = line.split(sep);
            var e = null;

            if (line === "") {
                continue;
            }

            var val = null;
            for (var x = 0; x < lineParts.length; x++) {
                var t = lineParts[x];
                if (x === 0) {
                    val = t;
                    data[val] = null;
                } else if (x !== 0) {
                    data[val] = t;
                }
            }
        }
        if (_x.LegendData === null) {
            _x.LegendData = {};
        }
        _x.LegendData[name] = data;

        //create style
        AddStyleForLegend(name, data);

    }

    function AddStyleForLegend(name, data) {
        //background: -moz-linear-gradient(top,  #1e5799 0%, #2989d8 50%, #207cca 51%, #7db9e8 100%);
        //background: -ms-linear-gradient(top,  #1e5799 0%,#2989d8 50%,#207cca 51%,#7db9e8 100%); /* IE10+ */
        //background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#1e5799), color-stop(50%,#2989d8), color-stop(51%,#207cca), color-stop(100%,#7db9e8)); /* Chrome,Safari4+ */
        //background: -webkit-linear-gradient(top,  #1e5799 0%,#2989d8 50%,#207cca 51%,#7db9e8 100%); /* Chrome10+,Safari5.1+ */
        //background: -o-linear-gradient(top,  #1e5799 0%,#2989d8 50%,#207cca 51%,#7db9e8 100%); /* Opera 11.10+ */

        var style = "<style>";

        style += "body." + name + " #bar{ ";


        //convert values to percent and use for legend-background-gradient
        var max = null;
        for (var d in data) {
            if (max === null || max < d) {
                max = d;
            }
        }
        //var arr = { "0%": "#1e5799", "50%": "#2989d8", "100%": "#7db9e8" };
        var arr = {};
        var c = 0;
        for (var x in data) {
            var color = data[x];
            //var per = (x / max * 100);
            per = (c * 11.11).toFixed(0);
            arr[per + "%"] = color;
            c++;
        }

        style += CreateBackground(arr, "moz");
        style += CreateBackground(arr, "ms");
        style += CreateBackground(arr, "o");
        style += CreateBackground(arr, "webkit");

        style += "}</style>";

        $("head").append(style);
        _x.log("create legend " + name);
    }

    function CreateBackground(data, browser) {
        var str = "";

        str += " background: -" + browser + "-linear-gradient(top";

        for (var v in data) {
            var c = data[v];
            c = c.indexOf("#") === 0 ? c : "#" + c;
            str += ", " + c + " " + v;
        }
        str += ");";

        if (browser === "webkit") {
            ////background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#1e5799), color-stop(50%,#2989d8), color-stop(51%,#207cca), color-stop(100%,#7db9e8)); /* Chrome,Safari4+ */
            str += " background: -" + browser + "-gradient(linear, left top, left bottom";
            for (var x in data) {
                var c = data[x];
                c = c.indexOf("#") === 0 ? c : "#" + c;
                str += ", color-stop(" + x + "," + c + ")";
            }
            str += ");";
        }

        return str;
    }



    return _x;
}(window, document, jQuery));