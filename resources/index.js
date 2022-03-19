 /* eslint-env browser */
getAllPlays();
google.charts.load('current', {packages: ['corechart','bar','line']});
google.charts.setOnLoadCallback(function(){
    drawChart("data/GerDracor_andre-der-comoedienfeind_xml.json")});

var emotion_colors = {
    //
    "Schadenfreude": "#bac500",
    "admiration": '#be1c72',
    "anger": '#bd0404',
    "compassion": "#f96f20" ,
    "fear": "#1060cb",
    "friendship": "#fdde1a",
    "hate, disgust": "#14461b",
    "joy": "#61eba8",
    "love": "#fc0242",
    "suffering": "#680aae",
    "despair":"#000fc5",
    //
    "emotional movement": "#c4c4c4",
    //
    "emotions of affection": "#c4c4c4",
    "emotions of fear": "#00cdff",
    "emotions of joy": "#f6ff38",
    "emotions of rejection": "#5d7080",
    "emotions of suffering": "#1f3d56",
}
var emotion_order = [
    "love",
    "admiration",
    "compassion",
    "friendship",
    "joy",
    "Schadenfreude",
    "hate, disgust",
    "fear",
    "despair",
    "suffering",
    "anger",
    "emotional movement"
]
var emotion_dict = {
    "love":0,
    "admiration":0,
    "compassion":0,
    "friendship":0,
    "joy":0,
    "Schadenfreude":0,
    "hate, disgust":0,
    "fear":0,
    "despair":0,
    "suffering":0,
    "anger":0,
    "emotional movement":0};

var current_mode1 = "absolute";
var current_act1 = 0;
var current_mode2 = "absolute";
var current_act2 = 0;
var current_mode_pie1 = "absolute";
var current_act_pie1 = 0;
var current_mode_pie2 = "absolute";
var current_act_pie2 = 0;
var current_style_pie1 = "sub";

var polarity_dict = { "negative": 0, "emotional movement": 0, "positive": 0 }
var polarity_colors = { "negative": '#bd0404', "emotional movement": "#c4c4c4", "positive": "#25ae0a" }

var main_emotion_dict = { 
    "emotions of affection":0, 
    "emotions of joy": 0,
    "emotions of rejection": 0,
    "emotions of fear":0,
    "emotions of suffering": 0,
    "emotional movement": 0,
}

function getAllPlays(){
    fetch("data/all_plays.json")
    .then((response) => response.json())
    .then((data) => initializeDropdown(data));
}



function initializeDropdown(all_plays){
    for (let author of all_plays.authors){
        var current_author = author.name;
        if (current_author == ""){
            current_author = "Various Authors"
        }
        var drop_entry = 
                "<button class=\"dropbtn_play\">"+current_author+"</button>"+
                "<div id=\"" + current_author + "_dropdown\" class=\"dropdown-content_play\"></div>";
        var node = document.createElement("div");
        node.innerHTML = drop_entry;
        node.className = "dropdown_play";
        document.getElementById("author_dropdown").appendChild(node);
        for(let play of author.plays){
            var drop_entry = play.name;
            if (drop_entry == ""){
                drop_entry = play.json;
            }
            var node = document.createElement("a");
            node.innerHTML = drop_entry;
            node.addEventListener("click",function(){
                drawChart("data/"+play.json)})
            document.getElementById(current_author + "_dropdown").appendChild(node);
        }
    }
}



function drawChart(play){
    fetch(play)
    .then((response) => response.json())
    .then((data) => visualize(data));
}

function visualize(data){

    // initialize information with metadata --------------------------------------------------

    var element = document.getElementById("playInformation");

    var infoString = "<div class=\"play_info\">" 
                    + "<div  class=\"info_field\"><div style=\"font-weight:bold\">Title:</div><div>" + data.metadata.title + "</div></div>"
                    + "<div  class=\"info_field\"><div style=\"font-weight:bold\">Subtitle:</div><div>" + data.metadata["Untertitel1"] + "</div></div>"
                    + "<div  class=\"info_field\"><div style=\"font-weight:bold\">Author:</div><div>" + data.metadata.author + "</div></div>"
                    + "<div  class=\"info_field\"><div style=\"font-weight:bold\">Genretitle:</div><div>" + data.metadata["genretitle"] + "</div></div>"
                    + "<div  class=\"info_field\"><div style=\"font-weight:bold\">Year:</div><div>" + data.metadata["Sortierdatum"] + "</div></div>"
                    + "</div>";

    element.innerHTML = infoString;

    // draw pie chart 1 ----------------------------------------------------------------------

    
    element =document.getElementById("drop_pie1_full");
    element.addEventListener("click",function(){
        updatePieChart1(data, "","",0)});
    element =document.getElementById("drop_pie1_1");
    element.addEventListener("click",function(){
        updatePieChart1(data, "","",1)});
    element =document.getElementById("drop_pie1_2");
    element.addEventListener("click",function(){
        updatePieChart1(data, "","",2)});
    element =document.getElementById("drop_pie1_3");
    element.addEventListener("click",function(){
        updatePieChart1(data, "","",3)});
    element =document.getElementById("drop_pie1_4");
    element.addEventListener("click",function(){
        updatePieChart1(data, "","",4)});
    element =document.getElementById("drop_pie1_5");
    element.addEventListener("click",function(){updatePieChart1(data, "","",5)});


    element =document.getElementById("drop_pie1_absolute");
    element.addEventListener("click",function(){updatePieChart1(data, "absolute","",-1)});
    element =document.getElementById("drop_pie1_weighted");
    element.addEventListener("click",function(){updatePieChart1(data, "weighted","",-1)});

    element =document.getElementById("drop_pie1_sub");
    element.addEventListener("click",function(){updatePieChart1(data, "","sub",-1)});
    element =document.getElementById("drop_pie1_main");
    element.addEventListener("click",function(){updatePieChart1(data, "","main",-1)});

    var g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Emotion");
    g_data.addColumn('number', "count");


    var color_order = [];

    for(let em in emotion_dict){
        emotion_dict[em] = 0;
    }

    for (let line of data.lines){
        emotion_dict[line.pre1_tag_type] += 1;
    }
    for (let em in emotion_dict){
        g_data.addRow([em,emotion_dict[em]]);
        emotion_dict[em]=0;
        color_order.push(emotion_colors[em]);
    }

    var options = {
        title: "absolute distribution of sub emotion classes",
        colors: color_order, 
        chartArea:{left:20,top:20,height:"90%",width:"90%"}, 
        legend:{alignment:"center"},
    };

    var chart = new google.visualization.PieChart(document.getElementById('PieChart1'));

    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        element =document.getElementById("DownloadPie1");
        element.onclick = function(){
            window.open(imageURI);
        };
    });

    chart.draw(g_data, options);

    /*
    
    */


    /*

    g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Emotion");
    g_data.addColumn('number', "count");


    color_order = [];
            
    for(let main_em in main_emotion_dict){
        main_emotion_dict[main_em]=0;
    }
    
     for (let line of data.lines){
        main_emotion_dict[line.pre1_main_emotion_class] += 1;
    }
             
     for (let main_em in main_emotion_dict){
         g_data.addRow([main_em,main_emotion_dict[main_em]]);
         main_emotion_dict[main_em]=0;
         color_order.push(emotion_colors[main_em]);
     }

    options = {
        title: null,
        colors: color_order, 
        chartArea:{left:20,top:20,height:"90%",width:"90%"},        
        };

    chart = new google.visualization.PieChart(document.getElementById('PieChart12'));
    chart.draw(g_data, options);
*/

 // draw pie chart 2 ----------------------------------------------------------------------

 
 element =document.getElementById("drop_pie2_full");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",0)});
 element =document.getElementById("drop_pie2_1");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",1)});
 element =document.getElementById("drop_pie2_2");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",2)});
 element =document.getElementById("drop_pie2_3");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",3)});
 element =document.getElementById("drop_pie2_4");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",4)});
 element =document.getElementById("drop_pie2_5");
 element.addEventListener("click",function(){
     updatePieChart2(data, "",5)});

 g_data = new google.visualization.DataTable();
 g_data.addColumn('string', "Polarity");
 g_data.addColumn('number', "count");


 color_order = [];

 for(let pol in polarity_dict){
    polarity_dict[pol]=0;
}

 for (let line of data.lines){
    polarity_dict[line.pre1_base_polarity] += 1;
}
         
 for (let pol in polarity_dict){
     g_data.addRow([pol,polarity_dict[pol]]);
     polarity_dict[pol]=0;
     color_order.push(polarity_colors[pol]);
 }

 var options = {
     title: "absolute distribution of polarities",
     colors: color_order, 
     chartArea:{left:20,top:20,height:"90%",width:"90%"},   
     legend:{alignment:"center"},      
     };

 var chart = new google.visualization.PieChart(document.getElementById('PieChart2'));
 chart.draw(g_data, options);


    // draw column chart 1 -----------------------------------------------------------------------

    element =document.getElementById("weighted1_button");
    element.addEventListener("click",function(){
        updateChart1(data, "weighted",10,-1)});
    element =document.getElementById("absolute1_button");
    element.addEventListener("click",function(){
        updateChart1(data, "absolute",10,-1)});


    // Quintile Dropdown
    element =document.getElementById("drop_col1_full");
    element.addEventListener("click",function(){updateChart1(data, "",10,0)});
    for(let i = 1;i<=5;i++){
        element =document.getElementById("drop_col1_"+i);
        element.addEventListener("click",function(){updateChart1(data, "",10,i)});
    }

    /*
    // Column Count Dropdown
    for(let i in [5,10,20,50,100]){
        element =document.getElementById("drop_col1_"+i+"_columns");
        element.addEventListener("click",function(){updateChart1(data, "",i,-1)});
    }
    */

    for(let em in emotion_dict){
        emotion_dict[em] = 0;
    }

    var i = 0;
    var k = 0;
    var data_array = [['Monologues','Percentage',{ role: 'style' },{ role: 'tooltip' }]];
    for (let line of data.lines){
        emotion_dict[line.pre1_tag_type] += 1;
        i+=1;
        if(i == 10){
            var max_value = 0;
            var max_emotion = "";
            for(let em in emotion_dict){
                if(emotion_dict[em] > max_value){
                    max_value = emotion_dict[em];
                    max_emotion = em;
                }
                emotion_dict[em]=0;
            }
            i = 0;
            data_array.push([k*10,max_value/10.0,emotion_colors[max_emotion],max_emotion]);
            k+=1;
            
        }
    }
                   
    // add the last row if it was not complete.
    if(i!=0){
        console.log("had to add: "+i);
        var max_value = 0;
        var max_emotion = "";
        for(let em in emotion_dict){
            if(emotion_dict[em] > max_value){
                max_value = emotion_dict[em];
                max_emotion = em;
            }
            emotion_dict[em]=0;
        }
        data_array.push([k*10,max_value/i,emotion_colors[max_emotion],max_emotion]);
    }

    g_data = google.visualization.arrayToDataTable(data_array);

    options = {
        title: 'Timeline of Emotions',
        seriesType: 'bars',
        legend: {position: 'none'},
        hAxis: {title: "Textlines"},
        vAxis: {title: "Percentage of strongest emotion",baseline : 0.0},
      };

    chart = new google.visualization.ComboChart(document.getElementById('ColumnChart1'));
    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadColumn1");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    chart.draw(g_data, options);

    // draw column chart 2 -----------------------------------------------------------------------

    element =document.getElementById("weighted2_button");
    element.addEventListener("click",function(){
         updateChart2(data, "weighted",10,-1)});
    element =document.getElementById("absolute2_button");
    element.addEventListener("click",function(){
        updateChart2(data, "absolute",10,-1)});
    element =document.getElementById("drop_col2_full");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,0)});
    element =document.getElementById("drop_col2_1");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,1)});
    element =document.getElementById("drop_col2_2");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,2)});
    element =document.getElementById("drop_col2_3");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,3)});
    element =document.getElementById("drop_col2_4");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,4)});
    element =document.getElementById("drop_col2_5");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,5)});
    

     i = 0;
     k = 0;
     data_array = [['Monologues','Percentage',{ role: 'style' },{ role: 'tooltip' }]];
     for (let line of data.lines){
         polarity_dict[line.pre1_base_polarity] += 1;
         i+=1;
         if(i == 10){
             var max_value = 0;
             var max_polarity = "";
             for(let pol in polarity_dict){
                 if(polarity_dict[pol] > max_value){
                     max_value = polarity_dict[pol];
                     max_polarity = pol;
                 }
                 polarity_dict[pol]=0;
             }
             i = 0;
             if(max_polarity=="negative")max_value=-max_value;
             data_array.push([k*10,max_value/10.0,polarity_colors[max_polarity],max_polarity]);
             k+=1;
             
         }
     }
     console.log(polarity_dict)
                    
     // add the last row if it was not complete.
     if(i!=0){
         console.log("had to add: "+i);
         var max_value = 0;
         var max_polarity = "";
         for(let pol in polarity_dict){
             if(polarity_dict[pol] > max_value){
                 max_value = polarity_dict[pol];
                 max_polarity = pol;
             }
             polarity_dict[pol]=0;
         }
         data_array.push([k*10,max_value/i,polarity_colors[max_polarity],max_polarity]);
     }
 
     g_data = google.visualization.arrayToDataTable(data_array);
 
     options = {
         title: 'Timeline of Polarity',
         seriesType: 'bars',
         legend: {position: 'none'},
         hAxis: {title: "Textlines"},
         vAxis: {title: "Percentage of strongest polarity",baseline : 0.0},
       };
 
     chart = new google.visualization.ComboChart(document.getElementById('ColumnChart2'));
     google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadColumn2");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
     chart.draw(g_data, options);

    //----------- Line Chart 1 ----------------------------------------------------------------------------

    element =document.getElementById("weighted2_button");
    element.addEventListener("click",function(){
         updateChart2(data, "weighted",10,-1)});
    element =document.getElementById("absolute2_button");
    element.addEventListener("click",function(){
        updateChart2(data, "absolute",10,-1)});
    element =document.getElementById("drop_col2_full");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,0)});
    element =document.getElementById("drop_col2_1");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,1)});
    element =document.getElementById("drop_col2_2");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,2)});
    element =document.getElementById("drop_col2_3");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,3)});
    element =document.getElementById("drop_col2_4");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,4)});
    element =document.getElementById("drop_col2_5");
    element.addEventListener("click",function(){
        updateChart2(data, "",10,5)});

    for(let em in emotion_dict){
        emotion_dict[em] = 0;
    }    

    var i = 0;
    var k = 1;
    var act_length = Math.ceil(data.lines.length/5);

    color_order = [];

    g_data = new google.visualization.DataTable();
    g_data.addColumn("number","Textlines");

    for (let em in emotion_dict){
        g_data.addColumn("number",em);
        color_order.push(emotion_colors[em]);
    }


    for (let line of data.lines){
        emotion_dict[line.pre1_tag_type] += 1;
        i+=1;
        if(i == act_length){
            var emotion_list_temp = [];
            emotion_list_temp.push(k);
            for(let em in emotion_dict){
                emotion_list_temp.push(emotion_dict[em]);
                emotion_dict[em]=0;
            }
            i = 0;
            g_data.addRow(emotion_list_temp);
            k+=1;
            
        }
    }
                   
    // add the last row if it was not complete.
    if(i!=0){
        var emotion_list_temp = [];
        emotion_list_temp.push(k);
        for(let em in emotion_dict){
            emotion_list_temp.push(emotion_dict[em]);
            emotion_dict[em]=0;
        }
        i = 0;
        g_data.addRow(emotion_list_temp);
    }


    options = {
        seriesType: 'line',
        title: 'Timeline of single Emotions',
        legend: {position: 'right',alignment:"center"},
        hAxis: {title: "Textlines"},
        vAxis: {title: "Number of appearances",baseline : 0.0},
        colors: color_order,  
      };

    chart = new google.visualization.ComboChart(document.getElementById('LineChart1'));

    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadLine");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    chart.draw(g_data, options);
}
           

// ---------------------------------------------------------------------------------------------------------


function updatePieChart1(data,mode,style,act){
    
    var use_mode = mode;
    if (mode == ""){
        use_mode = current_mode_pie1;
    }
    
    current_mode_pie1 = use_mode;

    var use_style = style;
    if (style == ""){
        use_style = current_style_pie1;
    }
    
    current_style_pie1 = use_style;

    var use_act = act;
    if(act == -1){
        use_act = current_act_pie1;
    }
    current_act_pie1 = use_act;

    var g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Emotion");
    g_data.addColumn('number', "count");


    var color_order = [];
    
    var act_length = Math.ceil(data.lines.length/5);
    var start = 0;
    var stop = data.lines.length;
    if (use_act != 0){
        start = (use_act - 1)*act_length;
        stop = use_act * act_length;
    }
    var current_line = 0;
    if (use_style=="sub"){
        for(let em in emotion_dict){
            emotion_dict[em]=0;
        }
        for (let line of data.lines){
            if (current_line < start){
                current_line++;
                continue;
            }
            if (current_line >= stop){
                break;
            }
            current_line++;
            var factor = 1;
            if (use_mode == "weighted") {
                factor = line.end - line.start;
            }
            emotion_dict[line.pre1_tag_type] += factor;
        }
        for (let em in emotion_dict){
            g_data.addRow([em,emotion_dict[em]]);
            emotion_dict[em]=0;
            color_order.push(emotion_colors[em]);
        }

    }   
    if (use_style=="main"){
        for(let main_em in main_emotion_dict){
            main_emotion_dict[main_em]=0;
        }
        
         for (let line of data.lines){
            if (current_line < start){
                current_line++;
                continue;
            }
            if (current_line >= stop){
                break;
            }
            current_line++;
            var factor = 1;
            if (use_mode == "weighted") {
                factor = line.end - line.start;
            }
            main_emotion_dict[line.pre1_main_emotion_class] += factor;
        }
                 
         for (let main_em in main_emotion_dict){
             g_data.addRow([main_em,main_emotion_dict[main_em]]);
             main_emotion_dict[main_em]=0;
             color_order.push(emotion_colors[main_em]);
         }
    }        
    
    var part = "";
    if (use_act > 0){
        part = " of quintile "+ use_act;
    }
    var options = {
        title: use_mode + " distribution of "+ use_style + " emotion classes"+ part,
        colors: color_order, 
        chartArea:{left:20,top:20,height:"90%",width:"90%"},        
        legend:{alignment:"center"},
        };

    var chart = new google.visualization.PieChart(document.getElementById('PieChart1'));
    
    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadPie1");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    
    chart.draw(g_data, options);
}

// ---------------------------------------------------------------------------------------------------------

function updatePieChart2(data,mode,act){
    var use_mode = mode;
    if (mode == ""){
        use_mode = current_mode_pie2;
    }
    
    current_mode_pie2 = use_mode;

    var use_act = act;
    if(act == -1){
        use_act = current_act_pie2;
    }
    current_act_pie2 = use_act;
    var color_order = []; 
    
    var g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Polarity");
    g_data.addColumn('number', "count");
   
    for(let pol in polarity_dict){
       polarity_dict[pol]=0;
   }
   
   var act_length = Math.ceil(data.lines.length/5);
    var start = 0;
    var stop = data.lines.length;
    if (use_act != 0){
        start = (use_act - 1)*act_length;
        stop = use_act * act_length;
    }

    var current_line = 0;
    for (let line of data.lines){
        if (current_line < start){
            current_line++;
            continue;
        }
        if (current_line >= stop){
            break;
        }
        current_line++;
        var factor = 1;
        if (use_mode == "weighted") {
            factor = line.end - line.start;
        }
       polarity_dict[line.pre1_base_polarity] += factor;
   }
            
    for (let pol in polarity_dict){
        g_data.addRow([pol,polarity_dict[pol]]);
        polarity_dict[pol]=0;
        color_order.push(polarity_colors[pol]);
    }

    var part = "";
    if (use_act > 0){
        part = " of quintile "+ use_act;
    }
   
    var options = {
        title: use_mode + " distribution of polarities"+ part,
        colors: color_order, 
        chartArea:{left:20,top:20,height:"90%",width:"90%"},         
        legend:{alignment:"center"},
        };
   
    var chart = new google.visualization.PieChart(document.getElementById('PieChart2'));

    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadPie2");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    

    chart.draw(g_data, options);
}


// Update Column Chart 1---------------------------------------------------------------------------------------------------------

function updateChart1(data,mode,seg,act) {
    var use_mode = mode;
    if (mode == ""){
        use_mode = current_mode1;
    }
    current_mode1 = use_mode;

    var use_act = act;
    if(act == -1){
        use_act = current_act1;
    }
    current_act1 = use_act;

    for (let button of document.getElementsByClassName("graph1_button")) {
        button.setAttribute("style", "background-color: #c9c9c9;");
    }

    var element =document.getElementById(use_mode+"1_button");
    element.setAttribute("style", "background-color: #7e7e7e;");

    var act_length = Math.ceil(data.lines.length/5);
    var start = 0;
    var stop = data.lines.length;
    if (use_act != 0){
        start = (use_act - 1)*act_length;
        stop = use_act * act_length;
        console.log(start + " " + stop);
    }
    var current_line = 0;
    
    var i = 0;
    var k = 0;
    var segment_length = 0;
    var data_array = [['Monologues','Percentage',{ role: 'style' },{ role: 'tooltip' }]];
    for (let line of data.lines){
        if (current_line < start){
            current_line++;
            continue;
        }
        if (current_line >= stop){
            break;
        }
        current_line++;
        var factor = 1;
        if (use_mode == "weighted") {
            factor = line.end - line.start;
        }
        segment_length += factor;
        emotion_dict[line.pre1_tag_type] += factor ;
        i+=1;
        if(i == seg){
            var max_value = 0;
            var max_emotion = "";
            for(let em in emotion_dict){
                if(emotion_dict[em] > max_value){
                    max_value = emotion_dict[em];
                    max_emotion = em;
                }
                emotion_dict[em]=0;
            }
            i = 0;
            data_array.push([start+k*seg,max_value/segment_length,emotion_colors[max_emotion],max_emotion]);
            segment_length = 0;
            k+=1;
            
        }
    }
     // add the last row if it was not complete.
     if(i!=0){
        console.log("had to add: "+i);
        var max_value = 0;
        var max_emotion = "";
        for(let em in emotion_dict){
            if(emotion_dict[em] > max_value){
                max_value = emotion_dict[em];
                max_emotion = em;
            }
            emotion_dict[em]=0;
        }
        data_array.push([start+k*seg,max_value/segment_length,emotion_colors[max_emotion],max_emotion]);
        segment_length = 0;
    }

    var g_data = google.visualization.arrayToDataTable(data_array);
    var part = "";
    if (use_act > 0){
        part = " of Quintile "+ use_act;
    }
    var options = {
        title: 'Timeline of Emotions'+part,
        seriesType: 'bars',
        legend: {position: 'none'},
        hAxis: {title: "Textlines"},
        vAxis: {title: "Percentage of strongest emotion",baseline : 0.0},
      };

    var chart = new google.visualization.ComboChart(document.getElementById('ColumnChart1'));
    
    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadColumn1");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    
    chart.draw(g_data, options);

}


//update chart 2 -------------------------------------------------------------------------------------

function updateChart2(data,mode,seg,act) {
    var use_mode = mode;
    if (mode == ""){
        use_mode = current_mode2;
    }
    current_mode2 = use_mode;

    var use_act = act;
    if(act == -1){
        use_act = current_act2;
    }
    current_act2 = use_act;

    for (let button of document.getElementsByClassName("graph2_button")) {
        button.setAttribute("style", "background-color: #c9c9c9;");
    }

    var element =document.getElementById(use_mode+"2_button");
    element.setAttribute("style", "background-color: #7e7e7e;");
    
    var act_length = Math.ceil(data.lines.length/5);
    var start = 0;
    var stop = data.lines.length;
    if (use_act != 0){
        start = (use_act - 1)*act_length;
        stop = use_act * act_length;
        console.log(start + " " + stop);
    }
    var current_line = 0;
    
    var i = 0;
    var k = 0;
    var segment_length = 0;
    var data_array = [['Monologues','Percentage',{ role: 'style' },{ role: 'tooltip' }]];
    for (let line of data.lines){
        if (current_line < start){
            current_line++;
            continue;
        }
        if (current_line >= stop){
            break;
        }
        current_line++;
        var factor = 1;
        if (use_mode == "weighted") {
            factor = line.end - line.start;
        }
        segment_length += factor;
        polarity_dict[line.pre1_base_polarity] += factor;
        i+=1;
        if(i == seg){
            var max_value = 0;
            var max_polarity = "";
            for(let pol in polarity_dict){
                if(polarity_dict[pol] > max_value){
                    max_value = polarity_dict[pol];
                    max_polarity = pol;
                }
                polarity_dict[pol]=0;
            }
            i = 0;
            if(max_polarity=="negative")max_value=-max_value;
            data_array.push([start+k*seg,max_value/segment_length,polarity_colors[max_polarity],max_polarity]);
            segment_length = 0;
            k+=1;
            
        }
    }
    console.log(polarity_dict)
                   
    // add the last row if it was not complete.
    if(i!=0){
        console.log("had to add: "+i);
        var max_value = 0;
        var max_polarity = "";
        for(let pol in polarity_dict){
            if(polarity_dict[pol] > max_value){
                max_value = polarity_dict[pol];
                max_polarity = pol;
            }
            polarity_dict[pol]=0;
        }
        data_array.push([start+k*seg,max_value/segment_length,polarity_colors[max_polarity],max_polarity]);
        segment_length = 0;
    }

    var g_data = google.visualization.arrayToDataTable(data_array);
    var part = "";
    if (use_act > 0){
        part = " of Quintile "+ use_act;
    }
    var options = {
        title: 'Timeline of Polarity'+part,
        seriesType: 'bars',
        legend: {position: 'none'},
        hAxis: {title: "Textlines"},
        vAxis: {title: "Percentage of strongest polarity",baseline : 0.0},
      };

    var chart = new google.visualization.ComboChart(document.getElementById('ColumnChart2'));
    google.visualization.events.addListener(chart, 'ready', function () {
        var imageURI = chart.getImageURI();
        var element =document.getElementById("DownloadColumn2");
        element.onclick = function(){
            window.open(imageURI);
        };
    });
    chart.draw(g_data, options);

}