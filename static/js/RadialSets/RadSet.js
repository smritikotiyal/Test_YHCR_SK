

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

$(function () {

    /* UNKNOWN ERROR ON LOADING CSS with <link> tag , reloading jquer-ui.css with ajax*/
    $.ajax({
        url: "../static/css/RadialSets/jquery-ui-1.10.2.custom.css",
        success: function (data) {
            $("head").append("<style>" + data + "</style>");
            //loading complete code here
        },
        error: function (xhr, msg, x) {
            alert(xhr);
        }
    });

    var diaHelp = $("#diaHelp").dialog({
        modal: true,
        autoOpen: false,
        width: 400
    });

    $("#openHelp").click(function () {
        $("#diaHelp").dialog("open");
    });

    /* Running part*/
    var diaInit = $("#initDialog").dialog({
        autoOpen: true,
        modal: true,
        width: 400,
        buttons: {
            "Open File": function () {

                var options = {
                    File: "YHCR_Diabetes_Comorbidities.csv",
                    // File: "3322.csv",
                    EntryLimit: 4000,
                    TableSelectedEntitiesID: "tabSelEntities",
                    DivSetOfCardinalityID: "setOfCardinality",
                    DivElementsByDegreeID: "elementsByDegree",
                    LogListElementID: "log",
                    SelectionAlignConnectionArc: "left",
                    SelectionAlignHistogram: "center",
                    HighlightColor: "#D64741",
                }

                var entrylimit = $("#inpEntryLimit").val();
                if (entrylimit !== null && entrylimit !== undefined && !isNaN(entrylimit)) {
                    RadSet.EntryLimit = parseInt(entrylimit);
                    options.EntryLimit = parseInt(entrylimit);
                }

                var fileName = $("#selFiles").val();
                console.log('filename : ', fileName)
                options.File = $("#selFiles").val();



                var showLog = $("#chkLog").is(":checked");
                if (showLog === true) {
                    outerLayout.sizePane("south", 300);
                    outerLayout.toggle("south");
                }

                RadSet.Init(options);

                $(this).dialog("close");
            }
        }
    });

    var diaLegend = $("#diaLegend").dialog({
        autoOpen: false,
        modal: false,
        width: 100
    });

    $("#openLegend").click(function () {
        RadSet.ShowLegend();
    });

    $("#reload").click(function () {
        RadSet.Draw();
    });
    $("#clearSel").click(function () {
        RadSet.ClearSelection();
    });
});

