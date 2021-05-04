// Interactive ACG Scoping App
// Parallel Coordinates
// Copyright (c) 2012, Kai Chang.
// Released under the BSD License: http://opensource.org/licenses/BSD-3-Clause
// Modifications and adaptations by Dwight Barry, 2014.
//<canvas id="sbackground" width="200" height="100" style="border:1px solid #000000;"></canvas>

var width = document.body.clientWidth*1.3,
    height = d3.max([document.body.clientHeight-540, 240]);

var m = [60, 0, 10, 0],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2],
    xscale = d3.scale.ordinal().rangePoints([0, w], 1),
    yscale = {},
    xscale2 = d3.scale.ordinal().rangePoints([0,(w*0.5)], 1),
    yscale2 = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(1+height/50),
    data,
    foreground,
    background,
    highlighted,
    dimensions,                           
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [];

var colors = {
   "S": '#66c2a5',
    "NS": '#fc8d62'
  //"M": '#66c2a5', // [166,206,227],
  //"F": '#fc8d62', //[178,223,138],
  // "N": '#8da0cb', // [251,154,153], , , 
  /*"APV": '#fdbf6f', //[253,191,111],
  "AIPV":'#cab2d6', //[202,178,214],
  "Untreated": '#ffff99', // [255,255,153]
  "AIP Tumor": '#1f78b4', // [166,206,227],
  "AIV Tumor": '#33a02c', //[178,223,138], '#', '#', '#', '#'
  "IPV Tumor": '#e31a1c', // [251,154,153], , , 
  "APV Tumor": '#ff7f00', //[253,191,111],
  "AIPV Tumor":'#6a3d9a', //[202,178,214],
  "Untreated Tumor": '#b15928' // [255,255,153]*/
};

var colors2 = {
  "AIP": '#1f78b4', // [166,206,227],
  "AIV": '#33a02c', //[178,223,138], '#', '#', '#', '#'
  "IPV": '#e31a1c', // [251,154,153], , , 
  "APV": '#ff7f00', //[253,191,111],
  "AIPV":'#6a3d9a', //[202,178,214],
  "Untreated": '#b15928' // [255,255,153]
};

/* var categories = {
  "1": "M",
  "2": "F",
  "3": "N"
};*/
var categories = {
  "1": "S",
  "2": "NS"
};

var conditions_at_0 = {};
var conditions_at_4 = {};
var conditions_at_8 = {};
var conditions_at_12 = {};

//var colors = ['#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'];

// Scale chart and canvas height
d3.select("#chart")
    .style("height", (h + m[0] + m[2]) + "px")

d3.selectAll("#background")
    .attr("width", w)
    .attr("height", h)
    .style("padding", m.join("px ") + "px");

d3.selectAll("#foreground")
    .attr("width", w)
    .attr("height", h)
    .style("padding", m.join("px ") + "px");

d3.selectAll("#highlight")
    .attr("width", w)
    .attr("height", h)
    .style("padding", m.join("px ") + "px");

d3.selectAll("#svg1")
    .attr("width", w)
    .attr("height", h);
    //.style("padding", m.join("px ") + "px");

/*d3.selectAll("#sbackground")
    .attr("width", (w*0.5))
    .attr("height", h);*/

// Foreground canvas for primary view
foreground = document.getElementById('foreground').getContext('2d');
foreground.globalCompositeOperation = "destination-over";
foreground.strokeStyle = "rgba(0,100,160,0.1)";
// foreground.lineWidth = 1.7;
foreground.lineWidth = 0.2;
foreground.fillText("Loading...",w/2,h/2);

// Highlight canvas for temporary interactions
highlighted = document.getElementById('highlight').getContext('2d');
highlighted.strokeStyle = "rgba(0,100,160,1)";
highlighted.lineWidth = 4;

// Background canvas
background = document.getElementById('background').getContext('2d');
background.strokeStyle = "rgba(0,100,160,0.1)";
background.lineWidth = 1.7;

// SVG for ticks, labels, and interactions
var svg = d3.select("#svg1")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  /*var svg2 = d3.select("#svg2")
              .attr("width", (w*0.5))
              .attr("height", h)
            .append("svg:g")
              .attr("transform", "translate(" + m[3] + "," + m[0] + ")");*/
  var min = 0.001147767;
  var max = 70; 

  /*var dims2 = [
  {
    name: "Category",
    scale: d3.scale.ordinal().rangePoints([0, h]),
    type: "string"
  },
  {
    name: "Eotaxin",
    scale: d3.scale.log().domain([min, max]).range([h, 0]),
    type: "number"
  }];

  xscale2 = d3.scale.ordinal()
            .domain(dims2.map(function(d){return d.name;}))
            .rangePoints([0, w]);
*/
  var line = d3.svg.line()
              .defined(function(d){return !isNaN(d[1])});

  var yAxis = d3.svg.axis()
                .orient("left");


/*  var dimensions2 = svg2.selectAll(".dimension")
                      .data(dims2)
                      .enter().append("g")
                      .attr("class", "dimension")
                      .attr("transform", function(d){return "translate( "+ xscale2(d.name) + " )"; });
*/


// Load the data and visualization
/*d3.csv("meta.csv", function(raw_data) {
  // Convert quantitative scales to floats
  data = raw_data.map(function(d) {
    for (var k in d) {
      if (!_.isNaN(raw_data[0][k] - 0) && k != 'id') {
        d[k] = parseFloat(d[k]) || 0;
      }
    };
    return d;
  });*/
// TODO: Change the data path -- Done
// Statin_Diab.csv

d3.csv("../static/data/StatinConsuming_PersonIDs.csv", function(statin) {
  console.log(statin);
d3.csv("../static/data/t2d_9.csv", function(comorbids) {
  console.log(comorbids);
  var precs = create_patient_recs_at_max_sep(comorbids);
  console.log(precs);
  var unique_conditions = create_unique_conditions(precs);
  console.log(unique_conditions);
  data = create_data(statin, precs, unique_conditions);
  var threshold = 10
  data = trunc_threshold(data, unique_conditions, threshold)
  


/*
dimensions2.append("g")
            .attr("class", "axis")
            .each(function(d) {d3.select(this).call(yAxis.scale(d.scale)); })
          .append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d){ return d.name; });


*/
console.log('Here 1');
var dims = Object.keys(data[0]);
console.log(data); 

/*for(var i =0; i < 40; i++){
  var chunk = data.slice(i*50, (i+1)*50);
  console.log('Here 2');
handleJSON('../static/php/submit.php', function(){},
                        {
                          
                          type: 'POST',
                                    data: {
                                       "data": chunk 
                                      }
                        });


}*/

/*xscale.domain(dimensions = dims.filter(function(k) {
                                    return  yscale[k] =  d3.scale.ordinal()
                                        .domain(Object.keys(categories))
                                        .range([h,0]) 
                               }));*/

/*xscale.domain(dimensions = dims.filter(function(d) {
    return (_.isNumber(data[0][d])) && (yscale[d] = d3.scale.linear()
        .domain(d3.extent(data, function(p) { return +p[d]; }))
        .range([h, 0]));
  }));
*/

  xscale.domain(dimensions =dims.filter(function(k) {
    // (k ==="gender") ?  d3.scale.ordinal().domain(["M", "F", "N"]).range([h, 0])  :  // (yscale[k] = d3.scale.linear()
    /*return (_.isNumber(data[0][k])) && (k!=="")  && (yscale[k] =  (k ==="age") ? d3.scale.linear().domain([0,120]).range([h,0]) :
              d3.scale.linear()
              //.domain([0,2000])
              .domain(d3.extent(data, function(p) { return +p[k]; }))
              .range([h, 0])); */
      
      return (k!=="") && (k!=="person_id") && (k!=="gender") && (yscale[k] =  (k ==="statin") ? d3.scale.ordinal().domain(['S', 'NS']).range([h, 0]) :
              d3.scale.linear()
              //.domain([0,2000])
              .domain(d3.extent(data, function(p) { return +p[k]; }))
              .range([h, 0])); 
      //.domain(d3.extent(data, function(d) { return +d[k]; }))
     // .range([h, 0]));
  }));

  console.log(dimensions);

/*
  xscale2.domain(dimensions2 = dims2.filter(function(k) {
                                    return  yscale2[k] =  d3.scale.ordinal()
                                        .domain(Object.keys(categories))
                                        .range([h,0]) 
                               }));



  var g2= svg2.selectAll(".dimension")
            .data(dimensions2)
          .enter().append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function(d) {  
              return "translate(" + xscale2(d) + ")"; });
*/

    
                  
  // Add a status element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xscale(d);
          this.__dragged__ = false;
          // d3.select("#foreground").style("opacity", "0.35");
          d3.select("#foreground").style("opacity", "0.35");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          xscale.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
          brush_count++;
          this.__dragged__ = true;

          // Feedback for axis deletion if dropped
          if (dragging[d] < 12 || dragging[d] > w-12) {
            d3.select(this).select(".background").style("fill", "#b00");
          } else {
            d3.select(this).select(".background").style("fill", null);
          }
        })
        .on("dragend", function(d) {
          if (!this.__dragged__) {
            // no movement, invert axis
            var extent = invert_axis(d);

          } else {
            // reorder axes
            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
            var extent = yscale[d].brush.extent();
          }

          // remove axis if dragged all the way left
          if (dragging[d] < 12 || dragging[d] > w-12) {
            remove_axis(d,g);
          }

          // TODO required to avoid a bug
          xscale.domain(dimensions);
          //xscale2.domain(dimensions2);
          update_ticks(d, extent);


          // rerender
          d3.select("#foreground").style("opacity", null);
          brush();
          delete this.__dragged__;
          delete this.__origin__;
          delete dragging[d];
        }));
  
  var formatter = d3.format(',.0f');
  var logFormatter = d3.format('.3f');
  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d]).tickFormat(function(d){ if(d>=1) return formatter(d); else return logFormatter(d);} ));
                          //.tickValues([0.001, 0.01, 0.1, 0.5, 1.0, 10, 20, 40, 60])); 
                          })   // 
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
      .attr("x", 0)
      .attr("class", "label")
      .text(String)
      .append("title")
        .text("Click to invert. Drag to reorder");


  // Add an axis and title for the summary graph.
  /*
  g2.append("svg:g")
      .attr("class", "axis")
      .attr("id", "summary")
      .attr("transform", "translate(0,0)")
      .each(function(d) {
         d3.select(this).call(axis.scale(yscale2[d]).ticks(Object.keys(categories)).tickFormat("%B")); })   // 
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
      .attr("x", 0)
      .attr("class", "label")
      .text(String)
      .append("title")
        .text("Click to invert. Drag to reorder");
      */

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -23)
      .attr("width", 36)
      .append("title")
        .text("Drag up or down to brush along this axis");

  g.selectAll(".extent")
      .append("title")
        .text("Drag or resize this filter");


  legend = create_legend(colors,brush);

  // Render full foreground
  brush();

  });
});
// Global
// creating a conditions list
var unique_conditions_length = [];
function create_unique_conditions(precs){
      var unique_conditions = {};
      var unique_condition_ids = {};

      for(var p in precs){
        for(key in precs[p]['concepts'])
        {
          var concept = precs[p]['concepts'][key]['ancestor_name'];
          if(!unique_conditions[concept]) unique_conditions[concept] = [];
          if(unique_conditions[concept].indexOf(p) < 0) unique_conditions[concept].push(p); // keep a list of patient IDs for every condition 
          unique_condition_ids[precs[p]['concepts'][key]['ancestor_id']] =0;
        }
      }

      // makes an array pf dictionaries, with each condition and its size, i.e., frequency 
      for(k in unique_conditions){
        tempDict = {}
        tempDict['concept'] = k;
        tempDict['length'] = unique_conditions[k]['length'];
        unique_conditions_length.push(tempDict); 
      }

    // sorts the condition list
    unique_conditions_length.sort(function(a, b) {
      return b.length - a.length;
    }); 
    
    console.log('unique_conditions_length : ', unique_conditions_length)
    // This was reversing the list before
    // console.log('unique_conditions_length reverse : ', unique_conditions_length.reverse(unique_conditions_length.values))
   
    // deleting all the unique condition records expect for the top 10 conditions of the sorted list
   /* for(i = 10; i < Object.keys(unique_conditions_length).length; ++i){
      delete unique_conditions[unique_conditions_length[i].concept];
    }*/
      
      console.log('unique_conditions')
      console.log(unique_conditions);
      return unique_conditions;
    }


    function trunc_threshold(data, unique_conditions, threshold){
      var ordered_keys = [];
      console.log('unique_conditions_length[14] : ', unique_conditions_length[14])
      for(var u=0;u < unique_conditions_length.length; u++){
      // for(var u= threshold-1; u >= 0; u--){
        // console.log('u : ', u)
        // console.log('unique_conditions_length[u] : ', unique_conditions_length[u])
        ordered_keys.push(unique_conditions_length[u]['concept']);
      }
      console.log('ordered_keys : ', ordered_keys)
      
      var included = ["age", "person_id", "gender", "statin"];
      for(var p=0; p < data.length; p++){
        for(var key in data[p]){
          if(included.indexOf(key) <0){ // this is not one of the person_id, age or gender keys
            // check the rank of this condition
            var rank = ordered_keys.indexOf(key);
            if(rank >= threshold)
              delete data[p][key];
          }
        }
      }
      console.log("data trunc : ", data)
      return data;
    }
    

    /*function handleJSON(url, callback, params){
      console.log('Here 3');
      var call, config, count = 0;
    config = {
        dataType: 'json',
        url: url,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
            if ('timeout' === textStatus) {
                call();}
            else {
                console.error(errorThrown);
                console.error(textStatus);}},
        timeout: 12000000,
        success: callback};
    if (params) {config = $.extend(config, params);}
    call = function call() {
                    ++count;
                    if (count < 5) {
                        $.ajax(config);}};
    call();
    }*/

    function create_data(statin, precs, unique_conditions){
      dict_length = {}
      for(var len in unique_conditions_length){
        dict_length[unique_conditions_length[len]['concept']] = unique_conditions_length[len]['length']
      }

      console.log('dict_length : ', dict_length)
      var data = [];
      var idxcounts = {};
      for(var cond in unique_conditions){
        idxcounts[cond] = 0;
      }

      for(var p in precs){
        var tmp = {};
        
        tmp['person_id'] = p;
        tmp['age'] = parseInt(precs[p]['age']);
        tmp['gender'] = precs[p]['gender'];
        tmp['statin'] = 'NS';
      
        for(var cond in unique_conditions){
          tmp[cond]= 0;
          var size = dict_length[cond]
          // new column = ancestor_name_desc
          // cond_desc = cond + '_desc'
          // tmp[cond_desc] = []
          if(unique_conditions[cond].indexOf(p) >=0 ){
            // tmp[cond] = idxcounts[cond] + parseInt(unique_conditions[cond].length *0.7);
            for(var s in statin){
              if(p === statin[s]["person_id"]){
                tmp["statin"] = 'S';
                // console.log('statin user : ', p)
                break;
              }
            }

            if(tmp["statin"] === 'S'){
              tmp[cond] =  Math.floor(Math.random() * (size - (size/1.5) + 1) ) + size/1.5;
              // tmp[cond] =  Math.floor(Math.random() * (size - (size/0.5) + 1) ) + size/0.5; // inverted
              // tmp[cond] = idxcounts[cond] + parseInt(unique_conditions[cond].length *0)
            }
            else{
              tmp[cond] =  Math.floor(Math.random() * (size/2.5 - 1 + 1) ) + 1;
              // tmp[cond] =  Math.floor(Math.random() * (((size - (size/0.5))/0.5) - 1 + 1) ) + 1; // inverted
              // tmp[cond] = idxcounts[cond] + parseInt(unique_conditions[cond].length *0)
            }
            
              /*for(var concept in precs[p]['concepts']){
                if(precs[p]['concepts'][concept]['ancestor_name'] === cond){
                  tmp[cond_desc].push(precs[p]['concepts'][concept]['concept_name'])
                }
              }*/
            idxcounts[cond]++;
            } 
        }
        data.push(tmp);
      }

      // change 2
      // Updating Statin Column according to the person_id
      /*for(var d in data){
        for(var s in statin){
          if(data[d]["person_id"] === statin[s]["person_id"]){
            data[d]["statin"] = 'S';
            break;
          }
      }
    
    }*/
      console.log('data : ', data);
      return data; 
    }
    
    function create_patient_recs_at_max_sep(comorbids){
     
      var records = {};

      for(var c=0; c < comorbids.length; c++){
        var person_id = comorbids[c]['person_id'];
        var seplevel = parseInt(comorbids[c]['seplevel']);
        var concept_id = comorbids[c]['concept_id'];
        var concept_name = comorbids[c]['concept_name'];

        if(!records[person_id]){ // add a new patient
           records[person_id] = {};
           records[person_id]['age']= comorbids[c]['age'];
           records[person_id]['gender'] = comorbids[c]['gender'];
           records[person_id]['concepts'] = {};
        }
        if(!records[person_id]['concepts'][concept_id]){
          records[person_id]['concepts'][concept_id] = {};
          records[person_id]['concepts'][concept_id]['seplevel'] =seplevel;
          records[person_id]['concepts'][concept_id]['ancestor_id'] = comorbids[c]['ancestor_id'];
          records[person_id]['concepts'][concept_id]['ancestor_name'] = comorbids[c]['ancestor_name'];
          records[person_id]['concepts'][concept_id]['concept_name'] = comorbids[c]['concept_name'];
        }

        /*if(records[person_id]['concepts'][concept_id]['seplevel'] < seplevel ){
          // concept becomes the higher ancestor
          records[person_id]['concepts'][concept_id]['ancestor_id'] = comorbids[c]['ancestor_id'];
          records[person_id]['concepts'][concept_id]['ancestor_name'] = comorbids[c]['ancestor_name'];
          records[person_id]['concepts'][concept_id]['seplevel'] = seplevel;
          records[person_id]['concepts'][concept_id]['concept_name'] = concept_name;
        }*/
        
      }

      // remove lower separation levels
      /*for(var person_id in records){
        for(var concept_id in records[person_id]['concepts'] ){
            if(records[person_id]['concepts'][concept_id]['seplevel'] < 0)
            {
                records[person_id]['concepts'][concept_id]['ancestor_id'] = 'other';
                records[person_id]['concepts'][concept_id]['ancestor_name'] = 'other';
                records[person_id]['concepts'][concept_id]['concept_name'] = 'other';
                
            }
        }
      }*/
      console.log('records : ', records)
      return records;
    }


      function downloadCSV(args) {
        var data, filename, link;
        var csv = convertArrayOfObjectsToCSV({
        data: stockData
        });
        if (csv == null) return;
        
        filename = args.filename || 'export.csv';
        
        if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);
        
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
        }

    

// copy one canvas to another, grayscale
function gray_copy(source, target) {
  var pixels = source.getImageData(0,0,w,h);
  target.putImageData(grayscale(pixels),0,0);
}

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function grayscale(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

function create_legend(colors,brush) {
 
  // create legend
  var legend_data = d3.select("#legend")
    .html("")
    .selectAll(".row")
    .data( _.keys(colors).sort() )

  // filter by Therapy
  var legend = legend_data
    .enter().append("div")
      .attr("title", "Hide group")
      .on("click", function(d) { 
        // toggle group
        if (_.contains(excluded_groups, d)) {
          d3.select(this).attr("title", "Hide group")
          excluded_groups = _.difference(excluded_groups,[d]);
          brush();
        } else {
          d3.select(this).attr("title", "Show group")
          excluded_groups.push(d);
          console.log('excluded_groups : ', excluded_groups)
          brush();
        }
      });

  legend
    .append("span")
    .style("background", function(d,i) {return color(d,0.85) })
    .attr("class", "color-bar");

  legend
    .append("span")
    .attr("class", "tally")
    .text(function(d,i) { return 0});  

  legend
    .append("span")
    .text(function(d,i) 
      { var t = d;   
       return " " + t});  

  return legend;
}
 
// render polylines i to i+render_speed 
function render_range(selection, i, max, opacity) {
  selection.slice(i,max).forEach(function(d) {
    // change 3
     // var col = (d.Organ === 'Tumor')? color2(d.Therapy,opacity) : color(d.gender,opacity);
     // var col = (d.Organ === 'Tumor')? color2(d.Therapy,opacity) : color(d.gender,opacity);
     // console.log('opacity : ', opacity)
     var col = (d.Organ === 'Tumor')? color2(d.Therapy,opacity) : color(d.statin,opacity);
    path(d, foreground,col);
  });
};

// sample data table
function data_table(sample) {
  // sort by first column
  var sample = sample.sort(function(a,b) {
    var col = d3.keys(a)[0];
    return a[col] < b[col] ? -1 : 1;
  });

  var table = d3.select("#clinic-list")
    .html("")
    .selectAll(".row")
      .data(sample)
    .enter().append("div")
      .on("mouseover", highlight)
      .on("mouseout", unhighlight);

  table
    .append("span")
      .attr("class", "color-block")
      .style("background", function(d) { 
        // var col = color(d.gender,0.85); 
        var col = color(d.statin,0.85); 
        return col; })

  table
    .append("span")
      .text(function(d) { 
        // console.log('d,',d)
        var concept_desc = [];
        var res = "Gender : " + d.gender;
        /*res = res +  ", Conditions";
        var des = '';
        var cond = '';
        var num_of_cond = 0;
        for(var u=0;u < unique_conditions_length.length; u++){  
          des = unique_conditions_length[u]['concept'] + "_desc";
          if(d[des].length > 0){
            // d[des] = list of all the concepts in one ancestor
            // res = res + "; " + unique_conditions_length[u]['concept'] + " includes "+ d[des];
            if(num_of_cond > 1){
              cond = cond + ", "
            }
             cond = cond + " " + d[des];
             num_of_cond = num_of_cond + d[des].length
          }
        }
        res = res + " (" + num_of_cond + ") : " + cond;*/
        return res; })
}

// Adjusts rendering speed 
function optimize(timer) {
  var delta = (new Date()).getTime() - timer;
  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
  render_speed = Math.min(render_speed, 300);
  return (new Date()).getTime();
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
  d3.select("#rendered-count").text(i);
  d3.select("#rendered-bar")
    .style("width", (100*i/n) + "%");
  d3.select("#render-speed").text(render_speed);
}

// Feedback on selection
function selection_stats(opacity, n, total) {
  d3.select("#data-count").text(total);
  d3.select("#selected-count").text(n);
  d3.select("#selected-bar").style("width", (100*n/total) + "%");
  d3.select("#opacity").text((""+(opacity*100)).slice(0,4) + "%");
}

// Highlight single polyline
function highlight(d) {
  d3.select("#foreground").style("opacity", "0.25");
  d3.selectAll(".row").style("opacity", function(p) { return (d.Therapy == p) ? null : "0.1" });
  // var col = (d.Organ === 'Tumor')? color2(d.Therapy,1) : color(d.Therapy,1);
  var col = (d.Organ === 'Tumor')? color2(d.Therapy,1) : color(d.statin,2);
  path(d, highlighted, col);
}

// Remove highlight
function unhighlight() {
  d3.select("#foreground").style("opacity", null);
  d3.selectAll(".row").style("opacity", null);
  highlighted.clearRect(0,0,w,h);
}


function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  ctx.beginPath();
  var x0 = xscale(0)-3,
      y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
  ctx.moveTo(x0,y0);
  dimensions.map(function(p,i) {
    var x = xscale(p),
        y = yscale[p](d[p]);
    var cp1x = x - 0.88*(x-x0);
    var cp1y = y0;
    var cp2x = x - 0.12*(x-x0);
    var cp2y = y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    x0 = x;
    y0 = y;
  });
  ctx.lineTo(x0+3, y0);                               // right edge
  ctx.stroke();
};

function color(d,a) {
  var hex = colors[d];
  var c; 
  //return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.8)';
    }
    throw new Error('Bad Hex');
  return c; 
}
 
function color2(d,a) {
  var c = colors2[d];
  //return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
  return c; 
}

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}


function drawSummary() {

}
// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
  brush_count++;
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  // hack to hide ticks beyond extent
  var b = d3.selectAll('.dimension')[0]
    .forEach(function(element, i) {
      var dimension = d3.select(element).data()[0];
      if (_.include(actives, dimension)) {
        var extent = extents[actives.indexOf(dimension)];
        d3.select(element)
          .selectAll('text')
          .style('font-weight', 'bold')
          .style('font-size', '13px')
          .style('display', function() { 
            var value = d3.select(this).data();
            return extent[0] <= value && value <= extent[1] ? null : "none"
          });
      } else {
        d3.select(element)
          .selectAll('text')
          .style('font-size', null)
          .style('font-weight', null)
          .style('display', null);
      }
      d3.select(element)
        .selectAll('.label')
        .style('display', null);
    });
    
 
  // bold dimensions with label
  d3.selectAll('.label')
    .style("font-weight", function(dimension) {
      if (_.include(actives, dimension)) return "bold";
      return null;
    });

  // Get lines within extents
  var selected = [];
  data
    .filter(function(d) {
       var result = true;
      excluded_groups.forEach(function(group){
        // if(group === d.gender) result = false; 
        if(group === d.statin) result = false; 
      }); 
      // var inc = !(_.contains(excluded_groups, d.Therapy) &&   );
      return result;
    })
    .map(function(d) {
      return actives.every(function(p, dimension) {
        return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
      }) ? selected.push(d) : null;
    });

  // free text search
  var query = d3.select("#search")[0][0].value;
  if (query.length > 0) {
    selected = search(selected, query);
  }

  if (selected.length < data.length && selected.length > 0) {
    d3.select("#keep-data").attr("disabled", null);
    d3.select("#exclude-data").attr("disabled", null);
  } else {
    d3.select("#keep-data").attr("disabled", "disabled");
    d3.select("#exclude-data").attr("disabled", "disabled");
  };

  // total by Medicare status
  
/*var hash = {"M": 0,
            "F": 1, 
            "N": 2
            };*/

// change 1
var hash = {"NS": 0,
            "S": 1
            };

  var tallies = {}; // _(selected).groupBy(function(d) {return d.Therapy;});
  /*tallies['M'] = [];
  tallies['F'] = [];
  tallies['N'] = [];*/
  tallies['NS'] = [];
  tallies['S'] = [];
  
  

  _(selected).forEach(function(obj){
      // var cat = ''+ obj.gender;
      var cat = ''+ obj.statin;
      // console.log('cat : ', cat)
      //if(obj.Organ === 'Tumor'){
      //    cat += ' Tumor';
      //}
      
      tallies[cat].push(obj);
  });

  // include empty groups
  _(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });


  legend
    .style("text-decoration", function(d) { return _.contains(excluded_groups,d) ? "line-through" : null; })
    .attr("class", function(d) {
      return (tallies[d].length > 0)
           ? "row"
           : "row off";
    });

  legend.selectAll(".color-bar")
    .style("width", function(d) {
      return Math.ceil(100*tallies[d].length/data.length) + "px"
    });

  legend.selectAll(".tally")
    .text(function(d,i) {
      return tallies[d].length });  

  // Render selected lines
  paths(selected, foreground, brush_count, true);
}

// render a set of polylines on a canvas
function paths(selected, ctx, count) {
  var n = selected.length,
      i = 0,
      opacity = d3.min([1/Math.pow(n,0.6),0.2]),
      timer = (new Date()).getTime();

  selection_stats(opacity, n, data.length)

  shuffled_data = _.shuffle(selected);

  data_table(shuffled_data.slice(0,108));

  ctx.clearRect(0,0,w+1,h+1);

  // render all lines until finished or a new brush event
  function animloop(){
    if (i >= n || count < brush_count) return true;
    var max = d3.min([i+render_speed, n]);
    render_range(shuffled_data, i, max, opacity);
    render_stats(max,n,render_speed);
    i = max;
    timer = optimize(timer);  // adjusts render_speed
  };

  d3.timer(animloop);
}

// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
  // update brushes
  if (d) {
    var brush_el = d3.selectAll(".brush")
        .filter(function(key) { return key == d; });
    // single tick
    if (extent) {
      // restore previous extent
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush));
    } else {
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
    }
  } else {
    // all ticks
    d3.selectAll(".brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
  }

  brush_count++;

  show_ticks();

  // update axes
  d3.selectAll(".axis")
    .each(function(d,i) {
      // hide lines for better performance
      d3.select(this).selectAll('line').style("display", "none");

      // transition axis numbers
      d3.select(this)
        .transition()
        .duration(720)
        .call(axis.scale(yscale[d]));

      // bring lines back
      d3.select(this).selectAll('line').transition().delay(800).style("display", null);

      d3.select(this)
        .selectAll('text')
        .style('font-weight', null)
        .style('font-size', null)
        .style('display', null);
    });
}

// Rescale to new dataset domain
function rescale() {
  // reset yscales, preserving inverted state
  dimensions.forEach(function(d,i) {
    if (yscale[d].inverted) {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([0, h]);
      yscale[d].inverted = true;
    } else {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([h, 0]);
    }
  });

  update_ticks();

  // Render selected data
  paths(data, foreground, brush_count);
}

// Get polylines within extents
function actives() {
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  // filter extents and excluded groups
  var selected = [];
  data
    .filter(function(d) {
      // return !_.contains(excluded_groups, d.gender);
      return !_.contains(excluded_groups, d.statin);
    })
    .map(function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? selected.push(d) : null;
  });

  // free text search
  var query = d3.select("#search")[0][0].value;
  if (query > 0) {
    selected = search(selected, query);
  }

  return selected;
}

// Export data
function export_csv() {
  var keys = d3.keys(data[0]);
  var rows = actives().map(function(row) {
    return keys.map(function(k) { return row[k]; })
  });
  var csv = d3.csv.format([keys].concat(rows)).replace(/\n/g,"<br/>\n");
  var styles = "<style>body { font-family: sans-serif; font-size: 12px; }</style>";
  window.open("text/csv").document.write(styles + csv);
}

// scale to window size
window.onresize = function() {
  width = document.body.clientWidth,
  height = d3.max([document.body.clientHeight-500, 220]);

  w = width - m[1] - m[3],
  h = height - m[0] - m[2];

  d3.select("#chart")
      .style("height", (h + m[0] + m[2]) + "px")

  d3.selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px");

  d3.select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  
  xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions);
  dimensions.forEach(function(d) {
    yscale[d].range([h, 0]);
  });

  d3.selectAll(".dimension")
    .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
  // update brush placement
  d3.selectAll(".brush")
    .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
  brush_count++;

  // update axis placement
  axis = axis.ticks(1+height/50),
  d3.selectAll(".axis")
    .each(function(d) { 
      var thy = d3.select(this);
      if(thy[0][0].id === "summary")
        thy.call(axis.scale(yscale2[d]));
      else
        thy.call(axis.scale(yscale[d])); });

  // render data
  brush();
};

// Remove all but selected from the dataset
function keep_data() {
  new_data = actives();
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
    return false;
  }
  data = new_data;
  rescale();
}

// Exclude selected from the dataset
function exclude_data() {
  new_data = _.difference(data, actives());
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'.");
    return false;
  }
  data = new_data;
  rescale();
}

function remove_axis(d,g) {
  dimensions = _.difference(dimensions, [d]);
  xscale.domain(dimensions);
  g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
  g.filter(function(p) { return p == d; }).remove(); 
  update_ticks();
}

d3.select("#keep-data").on("click", keep_data);
d3.select("#exclude-data").on("click", exclude_data);
d3.select("#export-data").on("click", export_csv);
d3.select("#search").on("keyup", brush);


// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks);
d3.select("#show-ticks").on("click", show_ticks);
d3.select("#dark-theme").on("click", dark_theme);
d3.select("#light-theme").on("click", light_theme);

function hide_ticks() {
  d3.selectAll(".axis g").style("display", "none");
  //d3.selectAll(".axis path").style("display", "none");
  d3.selectAll(".background").style("visibility", "hidden");
  d3.selectAll("#hide-ticks").attr("disabled", "disabled");
  d3.selectAll("#show-ticks").attr("disabled", null);
};

function show_ticks() {
  d3.selectAll(".axis g").style("display", null);
  //d3.selectAll(".axis path").style("display", null);
  d3.selectAll(".background").style("visibility", null);
  d3.selectAll("#show-ticks").attr("disabled", "disabled");
  d3.selectAll("#hide-ticks").attr("disabled", null);
};

function dark_theme() {
  d3.select("body").attr("class", "dark");
  d3.selectAll("#dark-theme").attr("disabled", "disabled");
  d3.selectAll("#light-theme").attr("disabled", null);
}

function light_theme() {
  d3.select("body").attr("class", null);
  d3.selectAll("#light-theme").attr("disabled", "disabled");
  d3.selectAll("#dark-theme").attr("disabled", null);
}

function search(selection,str) {
  pattern = new RegExp(str,"i")
  return _(selection).filter(function(d) { return pattern.exec(d.id); });
}
