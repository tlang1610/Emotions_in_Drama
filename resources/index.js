 /* eslint-env browser */

getAllPlays();
google.charts.load('current', {packages: ['corechart','bar']});

var emotion_colors = {
    "Schadenfreude": "#bac500",
    "admiration": '#be1c72',
    "anger": '#bd0404',
    "compassion": "#f96f20" ,
    "emotional movement": "#c4c4c4",
    "emotions of affection": "#c4c4c4",
    "emotions of fear": "#00cdff",
    "emotions of joy": "#f6ff38",
    "emotions of rejection": "#5d7080",
    "emotions of suffering": "#1f3d56",
    "fear": "#1060cb",
    "friendship": "#fdde1a",
    "hate, disgust": "#14461b",
    "joy": "#61eba8",
    "love": "#fc0242",
    "suffering": "#000fc5"
}
var emotion_dict = {};

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

    var infoString = "";
    infoString +=  "title: " + data.metadata.title + "<br>";
    infoString += "subtitle 1: " + data.metadata["Untertitel1"] + "<br>";
    infoString += "subtitle 2: " + data.metadata["Untertitel2"] + "<br>";
    infoString +=  "author: " + data.metadata.author + "<br>";
    infoString +=  "genretitle: " + data.metadata["genretitle"] + "<br>";
    infoString += "Year: " + data.metadata["Sortierdatum"] + "<br>"
    element.innerHTML = infoString;

    // draw pie chart 1 ----------------------------------------------------------------------

    var g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Emotion");
    g_data.addColumn('number', "count");


    var color_order = [];
            
    for (let emotion of data.aggregation_data.emotions){
        emotion_dict[Object.keys(emotion)[0]]=0;
        g_data.addRow([Object.keys(emotion)[0],Object.values(emotion)[0]]);
        color_order.push(emotion_colors[Object.keys(emotion)[0]]);
    }
    console.log(emotion_dict);

    var options = {
        title: data.metadata.title,
        colors: color_order,          
        };

    var chart = new google.visualization.PieChart(document.getElementById('PieChart'));
    chart.draw(g_data, options);


    // draw column chart 1 -----------------------------------------------------------------------

    element = document.getElementById("column_buttons");
    element.innerHTML = 
        "<div id=\"weighted_button\" class=\"graph_button\">Weighted</div>"+
        "<div id=\"absolute_button\" class=\"graph_button\">Absolute</div>";
    element =document.getElementById("weighted_button");
    element.addEventListener("click",function(){
        updateChart(data, "weighted",10)});
    element =document.getElementById("absolute_button");
    element.addEventListener("click",function(){
        updateChart(data, "absolute",10)});

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
      };

    chart = new google.visualization.ComboChart(document.getElementById('ColumnChart'));
    chart.draw(g_data, options);

               
}
function updateChart(data,mode,seg) {

    for (let button of document.getElementsByClassName("graph_button")) {
        button.setAttribute("style", "background-color: #c9c9c9;");
    }

    var element =document.getElementById(mode+"_button");
    element.setAttribute("style", "background-color: #7e7e7e;");
    
    var i = 0;
    var k = 0;
    var segment_length = 0;
    var data_array = [['Monologues','Percentage',{ role: 'style' },{ role: 'tooltip' }]];
    for (let line of data.lines){
        var factor = 1;
        if (mode == "weighted") {
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
            data_array.push([k*seg,max_value/segment_length,emotion_colors[max_emotion],max_emotion]);
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
        data_array.push([k*seg,max_value/segment_length,emotion_colors[max_emotion],max_emotion]);
    }

    var g_data = google.visualization.arrayToDataTable(data_array);

    var options = {
        title: 'Timeline of Emotions',
        seriesType: 'bars',
      };

    var chart = new google.visualization.ComboChart(document.getElementById('ColumnChart'));
    chart.draw(g_data, options);

}