/**
Module for web implementation of Radial Sets
@module RadSets
@submodule Selector
@main RadSets
**/

/**
@class RadSet
@constructor
**/
var RadSet = (function (window, document, $, undefined) {
    var _x = window.RadSet || {};


    /**
    @class Selection
    @constructor
    **/
    function Selection(cat, degree) {
        /**
        @property Category
        */
        this.Category = (cat === undefined) ? "" : cat;
        /**
        @property Degree
        */
        this.Degree = (degree === undefined) ? -1 : degree;
        /**
        @property type
        */
        this.type = "replace";
        /**
        @property Atomic
        */
        this.Atomic = true;
        /**
        @property Entries
        */
        this.Entries = [];
        /**
        @method toString
        */
        this.toString = function () {
            if (this.Degree <= 0) { return this.Category; }
            if (this.Category === "") { return "Degree-" + this.Degree; }
            return this.Category + "[" + this.Degree + "]";
        };

    }
    /**
    @class UnionSelection
    @constructor
    **/
    function UnionSelection(set1, set2) {
        /**
        @property type
        */
        this.type = "union";
        /**
        @property subsets
        */
        this.subsets = [set1];
        /**
        @property Atomic
        */
        this.Atomic = false;
        /**
        @property Entries
        */
        this.Entries = set1.Entries;
        /**
        @method AddSubSet
        */
        this.AddSubSet = function (set) {
            for (var sidx in this.subsets) {
                var s = this.subsets[sidx];
                if (s.Atomic && set.Atomic) {
                    if (s.Category === set.Category && s.Degree === set.Degree) {
                        return;
                    }
                }
            }
            this.subsets.push(set);
            this.Entries = $.union(this.Entries, set.Entries);
        };

        //happens while creating instance of UnionsSelection
        this.AddSubSet(set2);
        /**
        @method toString
        */
        this.toString = function () {
            var res = "";
            for (var i = 0; i < this.subsets.length; i++) {
                var set = this.subsets[i];
                var setString = (set.Atomic) ? set.toString() : "( " + set.toString() + " )";
                res += setString + " ";
                if (i !== this.subsets.length - 1) {
                    res += "OR ";
                }
            }
            return res;
        };
    }
    /**
    @class IntersectSelection
    @constructor
    **/
    function IntersectSelection(set1, set2) {
        /**
        @property type
        */
        this.type = "intersect";
        /**
        @property subsets
        */
        this.subsets = [set1];
        /**
        @property Atomic
        */
        this.Atomic = false;
        /**
        @property Entries
        */
        this.Entries = set1.Entries;
        /**
        @method AddSubSet
        */
        this.AddSubSet = function (set) {
            for (var sidx in this.subsets) {
                var s = this.subsets[sidx];
                if (s.Atomic && set.Atomic) {
                    if (s.Category === set.Category && s.Degree === set.Degree) {
                        return;
                    }
                }
            }
            this.subsets.push(set);
            this.Entries = $.intersect(this.Entries, set.Entries);
        };
        //happens while creating instance of IntersectSelection
        this.AddSubSet(set2);
        /**
        @method toString
        */
        this.toString = function () {
            var res = "";
            for (var i = 0; i < this.subsets.length; i++) {
                var set = this.subsets[i];
                var setString = (set.Atomic) ? set.toString() : "( " + set.toString() + " )";
                res += setString + " ";
                if (i !== this.subsets.length - 1) {
                    res += "AND ";
                }
            }
            return res;
        };
    }

    /**
    @class SubtractSelection
    @constructor
    **/
    function SubtractSelection(left, right) {
        /**
        @property type
        */
        this.type = "subtract";
        /**
        @property left
        */
        this.left = left;
        /**
        @property right
        */
        this.right = right;
        /**
        @property Atomic
        */
        this.Atomic = false;
        /**
        @property Entries
        */
        this.Entries = $.except(left.Entries, right.Entries);
        /**
        @method AddSetToRight
        */
        this.AddSetToRight = function (set) {
            if (this.right.type === "replace") {
                this.right = new UnionSelection(this.right, set);
            } else if (this.right.type === "union") {
                this.right.AddSubSet(set);
            }
            this.Entries = $.except(this.left.Entries, this.right.Entries);
        };
        /**
        @method toString
        */
        this.toString = function () {
            var res = "";
            if (!this.left.Atomic) {
                res += "(" + this.left.toString() + ")";
            } else {
                res += this.left.toString();
            }
            res += " \\ ";
            if (!this.right.Atomic) {
                res += "(" + this.right.toString() + ")";
            } else {
                res += this.right.toString();
            }
            return res;
        };
    }


    /**
    Holds Current Selction Object
    @attribute CurrentSelection
    */
    _x.CurrentSelection = null;

    /**
    Clears CurrentSelection
    @method ClearSelection
    @for RadSet  
    **/
    _x.ClearSelection = function ClearSelection() {
        _x.CurrentSelection = null;
        _x.Select();
        _x.ReactivateSchema();
    };


    /**
    Creates a list of selected entry ids, given by category and degree
    @method CreateSelectionEntries
    @private
    @for RadSet  
    **/
    function CreateSelectionEntries(cat, degree, name) {
        var list = [];
        var len = _x.Entries.length;
        if (name === null || name === undefined) {
            for (var idx = 0; idx < len; idx++) {
                var entry = _x.Entries[idx];
                if (degree === -1 && entry.Cats.indexOf(cat) !== -1) {
                    list.push(entry.ID);
                } else if (entry.Degree === degree && entry.Cats.indexOf(cat) !== -1) {
                    list.push(entry.ID);
                } else if (entry.Degree === degree && cat === "") {
                    list.push(entry.ID);
                }
            }
        } else {
            var regex = new RegExp(name);
            if (!_x.options.SearchCaseSensitiv) {
                regex = new RegExp(name, "i"); // regex for case insensitiv
            }
            for (var idx = 0; idx < len; idx++) {
                var entry = _x.Entries[idx];
                if (regex.test(entry.Name)) {
                    list.push(entry.ID);
                }
            }
        }
        return list;
    }


    /**
    Update current Selction with given Selection and CurrentSelectionMode
    @method UpdateSelection
    @private
    @for RadSet  
    **/
    function UpdateSelection(newSelection, selmode) {

        if (_x.CurrentSelection === null) {
            _x.CurrentSelection = newSelection;
        } else if (selmode === "replace") {
            _x.CurrentSelection = newSelection;
        } else if (selmode === "union") {
            if (_x.CurrentSelection.type === "union") {
                _x.CurrentSelection.AddSubSet(newSelection)
            } else {
                _x.CurrentSelection = new UnionSelection(_x.CurrentSelection, newSelection);
            }
        } else if (selmode === "intersect") {
            if (_x.CurrentSelection.type === "intersect") {
                _x.CurrentSelection.AddSubSet(newSelection);
            } else {
                _x.CurrentSelection = new IntersectSelection(_x.CurrentSelection, newSelection);
            }
        } else if (selmode === "subtract") {
            if (_x.CurrentSelection.type === "subtract") {
                _x.CurrentSelection.AddSetToRight(newSelection);
            } else {
                _x.CurrentSelection = new SubtractSelection(_x.CurrentSelection, newSelection);
            }
        }

    };

    /**
    When selecting an ConnectionArc, it updates current selection with a intersect selection
    @method SelectArc
    @for RadSet  
    **/
    _x.SelectArc = function SelectArc(cat1, cat2) {

        var newSelection = new Selection(cat1, -1);
        newSelection.Entries = CreateSelectionEntries(cat1, -1);
        var sel2 = new Selection(cat2, -1);
        sel2.Entries = CreateSelectionEntries(cat2, -1);
        var intSel = new IntersectSelection(newSelection, sel2);

        UpdateSelection(intSel, _x.CurrentSelMode);

        if (_x.options.LogSelectionEntries) {
            _x.log(_x.CurrentSelection.Entries);
        }
        _x.log("Select Arc: " + cat1 + " + " + cat2);

        ActiveSelection();
    };

    /**
    Methods updates Selection and redraw and highlight new selection
    @method Select
    @for RadSet  
    **/
    _x.Select = function Select(category, degree, entity) {
        _x.logLastAction = new Date();

        if (entity === "") {
            entity = null;
        }
        if (degree === undefined || degree === null || degree === 0) {
            degree = -1;
        }
        if (category === null || category === undefined) {
            category = "";
        }

        var newSelection = new Selection(category, degree);
        newSelection.Entries = CreateSelectionEntries(category, degree, entity);

        UpdateSelection(newSelection, _x.CurrentSelMode);

        if (_x.options.LogSelectionEntries) {
            _x.log(_x.CurrentSelection.Entries);
        }
        _x.log("CurrentSelMode: " + _x.CurrentSelMode);
        _x.log("selected Category: {0}  Degree: {1}".format(category, degree));

        ActiveSelection();
    };

    /**
    Redraw and highlight CurrentSelection
    @method ActiveSelection
    @private
    @for RadSet  
    **/
    function ActiveSelection() {
        $("#lblSelection").text(_x.CurrentSelection.toString());

        _x.ShowCategoryInEntries();
        //_x.ShowCategoryInRadSet(category,degree);
        _x.Draw();
        _x.ShowCategoryInCardiality();
        _x.ShowCategoryInDegree();

        _x.DeactivateSchema();

        _x.log("CurrentSelection drawn");

    };


    /**
    Current Selection Mode, Options: replace,union,intersect,subtract
    @attribute CurrentSelMode
    */
    _x.CurrentSelMode = "replace";
    /**
    Bind Event for updating CurrentSelectionMode on SHIFT,CTRL and ALT Keys
    @method BindKeyListeners
    @for RadSet  
    **/
    _x.BindKeyListeners = function BindKeyListeners() {
        $(window).keyup(function (event) {
            _x.CurrentSelMode = "replace";
        });
        $(window).keydown(function (event) {
            if (event.which === 16) {
                _x.CurrentSelMode = "union";
            } else if (event.which === 17) {
                _x.CurrentSelMode = "intersect";
            } else if (event.which === 18) {
                _x.CurrentSelMode = "subtract";
            }
        });
    };



    _x.WillSearchInNearFuture = false;
    _x.ActivateSearcher = function (id) {
        if (_x.WillSearchInNearFuture === false) {
            _x.WillSearchInNearFuture = true;
            $("#searchloader").show();
            setTimeout(function () {
                var txt = $(document.getElementById(id));
                var val = txt.val();
                _x.Select(null, null, val);
                _x.WillSearchInNearFuture = false;
                $("#searchloader").hide();
            }, 1000);
        }
    };
    _x.BindSearchTextbox = function (id) {

        var txt = $(document.getElementById(id));
        txt.keyup(function (event) {
            _x.ActivateSearcher(id);
        });
    };

    return _x;
}(window, document, jQuery));