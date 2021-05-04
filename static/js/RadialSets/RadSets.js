/**
Module for web implementation of Radial Sets
@module RadSets
**/

/**
@class RadSet
@constructor
**/
var RadSet = (function (window, document, $, undefined) {
    var _x = window.RadSet || {};


    /**
    @class Options
    @constructor
    **/
    _x.options = {
        /**
        Filename of the CSV file containing the Data
        @property File
        @type String
        @default "YHCR_Diabetes_Comorbidities.csv"
        @for Options
        **/
        File: "YHCR_Diabetes_Comorbidities.csv",
        /**
        Maximum Number of Entries
        @property EntryLimit
        @type Integer
        @default 4000
        @for Options
        **/
        EntryLimit: 4000,
        /**
        Idicates if the selected entities will be writen in the log
        @property LogSelectionEntries
        @type Bool
        @default false
        @for Options
        **/
        LogSelectionEntries: false,
        /**
        ID from the table where the selected elements will be displayed
        @property TableSelectedEntitiesID
        @default "tabSelEntities"
        @type String
        @for Options
        **/
        TableSelectedEntitiesID: "tabSelEntities",
        /**
        ID of the div element where the sets of cardinality will be displayed
        @property DivSetOfCardinalityID
        @default "setOfCardinality"
        @type String
        @for Options
        **/
        DivSetOfCardinalityID: "setOfCardinality",
        /**
        ID from the table where the sets by degree will be displayed
        @property DivElementsByDegreeID
        @default "elementsByDegree"
        @type String
        @for Options
        **/
        DivElementsByDegreeID: "elementsByDegree",
        /**
        ID for the log element - must be "ul"
        @property LogListElementID
        @default "log"
        @type String
        @for Options
        **/
        LogListElementID: "log",
        /**
        List of Property displayed in the Selected Entries View
        @property ListOfVisableProps
        @type List<String>
        @default ["person_id", "age", "gender", "Sets"]
        @for Options
        */
        ListOfVisableProps: ["gender", "statin", "Sets"],
        /**
        List of NonCategoires in CSV File
        @property ListOfNonCategories
        @type List<String>
        @default ["other"]
        @for Options
        */
        ListOfNonCategories: ["person_id", "age", "gender", "statin", "other", "Cognitive_function_finding", "Disorder_due_to_infection", 
        "Disorder_of_abdomen", "Abdominal_organ_finding", "Finding_of_limb_structure"],
        /**
        List of Histogram Colors 
        @property HistoColors
        @type List<String>
        @for Options
        */
        HistoColors: [], //["00FFFF", "33FFCC", "66FF99", "99FF66", "CCFF33", "FFFF00"];
        /**
        Default Histogram color when no other colors are defined in "HistoColors"
        @property HistoColor
        @type String
        @default "grey"
        @for Options
        */
        HistoColor: "grey",
        /**
        Color of the connection arcs
        @property ConnectionArcColor
        @type String
        @default "lightgrey"
        @for Options
        */
        ConnectionArcColor: "lightgrey",
        /**
        Color of the sectors
        @property SectorColor
        @type String
        @default "lightgrey"
        @for Options
        */
        SectorColor: "lightgrey",
        /**
        Indicates if the Hover effect is enabled
        @property EnableHover
        @type Bool
        @default false
        @for Options
        */
        EnableHover: false,
        /**
        color of the hover effect , only when EnableHover
        @property HoverColor
        @type String
        @default "red"
        @for Options
        */
        HoverColor: "red",
        /**
        color of the highlighted/selected elements
        @property HighlightColor
        @type String
        @default "red"
        @for Options
        */
        HighlightColor: "red",
        /**
        SortOrder of Categories
        @property CategoryOrder
        @type List<String>
        @for Options
        @default ["Finding_of_upper_trunk", "General_finding_of_soft_tissue", "Integumentary_system_finding", "Finding_of_head_and_neck_region", "Inflammatory_disorder", "Musculoskeletal_finding", "General_finding_of_observation_of_patient", "Abdominal_organ_finding", "Clinical_finding", "Measurement_finding", "Cognitive_function_finding", "Finding_of_limb_structure", "Sensory_nervous_system_finding", "Disorder_due_to_infection", "Disorder_of_abdomen"] 
        */
        CategoryOrder: [], //["Finding_of_head_and_neck_region", "Musculoskeletal_finding","Finding_of_upper_trunk", "General_finding_of_observation_of_patient", "Clinical_finding", "Inflammatory_disorder", "Integumentary_system_finding", "Measurement_finding", "General_finding_of_soft_tissue", "Finding_of_limb_structure", "Abdominal_organ_finding", "Cognitive_function_finding", "Disorder_of_abdomen", "Respiratory_finding", "Sensory_nervous_system_finding", "Neurological_lesion"],
        /**
        Indicates if Entries without Categories are ignored
        
        @property IgnoreEntriesWithoutCategories
        @type Bool
        @for Options
        @default true
        */
        IgnoreEntriesWithoutCategories: true,
        /**
        Indicates which align the selection will have in the histogram
        @property SelectionAlignHistogram
        @type String
        @for Options
        @default "center"
        */
        SelectionAlignHistogram: "center",
        /**
        Indicates which align the selection will have in the connection arc
        @property SelectionAlignConnectionArc
        @type String
        @for Options
        @default "center"
        */
        SelectionAlignConnectionArc: "center",
        /**
        Multiplier for ConnectionArc Size
        @property ConnectionArcMultiply 
        @type Float
        @for Options
        @default 1.5
        */
        ConnectionArcMultiply: 1.5,
        /**
        Adds a search function to speicifc textbox
        @property SearchTextBox
        @type String
        @for Options
        @default "txtSearch"
        */
        SearchTextBox: "txtSearch",
        /**
        Search the entries case sensitiv
        @property SeachCaseSensitiv
        @type bool
        @for Options
        @default "false"
        */
        SearchCaseSensitiv : false
    };


    var StartTime = new Date();
    _x.ScaleModes = { SetSize: 0, Compact: 1, Equal: 2 };

    /**
    Indicates how to scale the Radial Sets view
    @attribute ScaleMode
    @for RadSet
    */
    _x.ScaleMode = _x.ScaleModes.Compact;


    /**
    Creates the Elements in all views for Radial Sets
    @method Init
    @for RadSet 
    @param {Object} options
    **/
    _x.Init = function (options) {
        //merge default with options
        $.extend(_x.options, options);

        _x.ReadCSV(_x.options.File);
        _x.FillSelectedElements(_x.options.TableSelectedEntitiesID, _x.Entries);
        _x.ElementsByCardinality = _x.FillCardinality(_x.options.DivSetOfCardinalityID, _x.CatList);
        _x.ElementsByDegree = _x.FillElementsByDegree(_x.options.DivElementsByDegreeID, _x.Entries);
        _x.BindKeyListeners();
        _x.BindSearchTextbox(_x.options.SearchTextBox);
        _x.CreateStyleTag();
        

        _x.Draw();
    };

    /**
    Internal Log Function 
    @method log
    @for RadSet  
    @param {String} text
    **/
    _x.logLastAction = new Date();
    _x.log = function log(text) {
        if (typeof (console) !== "undefined") {
            console.log(text);
        }
        var now = new Date();
        var diff = (now - StartTime) / 1000;
        var diffDur = (now - _x.logLastAction) / 1000;
        var logEle = $("#" + _x.options.LogListElementID);
        if (logEle.length > 0 && logEle.is(":visible")) {
            logEle.append("<li>After " + diff + " seconds (Action duration aprox: " + diffDur + " seconds) : " + text + "</li>");
        }

        _x.logLastAction = new Date();
    };

    /**
    Creates a Degree list out of an list of entries
    @method GetDegreeList
    @for RadSet  
    @param {List} entries
    **/
    _x.GetDegreeList = function GetDegreeList(entries) {
        var DegreeList = [];
        for (var i = entries.length - 1; i >= 0; i--) {
            if (DegreeList[entries[i].Degree] === undefined) {
                DegreeList[entries[i].Degree] = { Degree: entries[i].Degree, Count: 1 };
            } else {
                DegreeList[entries[i].Degree].Count += 1;
            }
        }
        return DegreeList;
    };

    /**
    Get a list of entries grouped by category
    @method GetEntriesGroupedByCategory
    @for RadSet  
    @param {List} entries
    **/
    _x.GetEntriesGroupedByCategory = function (entries) {
        return _x.GetEntriesGroupedByCategoryAndDegree(entries);
    };
    /**
    Get a list of entries grouped by category and by degree
    @method GetEntriesGroupedByCategoryAndDegree
    @for RadSet  
    @param {List} entries
    @param {bool} andDegree
    **/
    _x.GetEntriesGroupedByCategoryAndDegree = function (entries, andDegree) {
        var catList = {};
        for (var i = entries.length - 1; i >= 0; i--) {
            var entry = entries[i];
            for (var c = entry.Cats.length - 1; c >= 0; c--) {
                var cname = entry.Cats[c];
                if (catList[cname] === undefined) {
                    catList[cname] = { Category: cname, Count: 1 };
                } else {
                    catList[cname].Count += 1;
                }
                //add Degree Grouping
                if (andDegree !== undefined && andDegree === true) {
                    if (catList[cname][entry.Degree] === undefined) {
                        catList[cname][entry.Degree] = { Degree: entry.Degree, Count: 1 };
                    } else {
                        catList[cname][entry.Degree].Count += 1;
                    }
                }
            }
        }
        return catList;
    };

    /**
    Get a list of entries from a list of entryIds
    @method GetEntriesFromIDs
    @for RadSet  
    @for RadSet 
    @param {List} ids
    **/
    _x.GetEntriesFromIDs = function (ids) {
        var entries = [];
        for (var i = ids.length - 1 ; i >= 0 ; i--) {
            var id = ids[i];
            var entry = _x.Entries[id];
            entries.push(entry);
        }
        return entries;
    };

    return _x;
}(window, document, jQuery));


// Adds format function when not available
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}