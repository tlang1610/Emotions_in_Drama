 /* eslint-env browser */

getAllPlays();
google.charts.load('current', {packages: ['corechart']});

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
                drawChart("data/"+play.json,'myPieChart1')})
            document.getElementById(current_author + "_dropdown").appendChild(node);
        }
    }
}



function drawChart(play,chart){
    fetch(play)
    .then((response) => response.json())
    .then((data) => visualize(data,chart));
}

function visualize(data,chart){
    var g_data = new google.visualization.DataTable();
    g_data.addColumn('string', "Emotion");
    g_data.addColumn('number', "count");
    console.log(data.aggregation_data.emotions);
            
    for (let emotion of data.aggregation_data.emotions){
        g_data.addRow([Object.keys(emotion)[0],Object.values(emotion)[0]]);
    }

    var element = document.getElementById("playInformation");

    var infoString = "";
    infoString +=  "title: " + data.metadata.title + "<br>";
    infoString +=  "author: " + data.metadata.author + "<br>";
    infoString +=  "genretitle: " + data.metadata["genretitle"] + "<br>";
    element.innerHTML = infoString;


    var options = {
        title: data.metadata.title           
        };

    var chart = new google.visualization.PieChart(document.getElementById(chart));
    chart.draw(g_data, options);
    console.log("Drawn")
               
}
