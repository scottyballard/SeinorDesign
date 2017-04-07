//HTTP req
var req = new XMLHttpRequest();
req.open("POST", "url");// host/SelectServerlet
req.send("unemployment");
req.onreadystatechange = function() {
	var theData = JSON.parse(
			'[{' + 
				'"Metric": "MetricName",'+
				'"MaxY": 80,'+
				'"Data": ['+
					'{"Date": 2000.0, "Value": 42},'+
					'{"Date": 2001, "Value": 30},'+
					'{"Date": 2001.4166666, "Value": 35},'+
					'{"Date": 2002, "Value": 50},'+
					'{"Date": 2003, "Value": 60},'+
					'{"Date": 2004, "Value": 58},'+
					'{"Date": 2005, "Value": 75},'+
					'{"Date": 2016, "Value": 80}]'+
			  '},'+
			  '{' + 
				'"Metric": "MetricName2",'+
				'"MaxY": 73,'+
				'"Data": ['+
					'{"Date": 2000, "Value": 52},'+
					'{"Date": 2001, "Value": 73},'+
					'{"Date": 2002, "Value": 64},'+
					'{"Date": 2003, "Value": 40},'+
					'{"Date": 2004, "Value": 32},'+
					'{"Date": 2005, "Value": 50},'+
					'{"Date": 2016, "Value": 59}]'+
				'}]');
	if (req.readyState === XMLHTTPRequest.DONE && req.status == 200) {
		theData = JSON.parse(req.responseText);
	}
	
	// set some info from data to setup graph
	var info = {};
	var max = 0;
	for (var i = 0; i < theData.length; i++) {
		if (theData[i].MaxY > max) {
			max = theData[i].MaxY;
		}
	}
	info.maxY = max;
	
	// create the svg area (width/height defined via css)
	var svg = d3.select("#graphContent")
	.append("svg")
	.attr("transform", "translate(25, 25)") // left + top
	.append("g")
	.attr("transform", "translate(25, -25)") // left + top
	.attr("class","gContainer");

	// save height/width defined in css (different browsers)
	var width, height;
	if (typeof InstallTrigger !== 'undefined') {	// firefox
		width = parseInt(window.getComputedStyle(d3.select("svg")[0][0]).width.slice(0, -2));
		height = parseInt(window.getComputedStyle(d3.select("svg")[0][0]).height.slice(0, -2));
	}
	else {	// chrome...
		width = d3.select("svg")[0][0].clientWidth;
		height = d3.select("svg")[0][0].clientHeight;
	}
		
	// scale the data to fit the graph
	var xScale = d3.scale.linear()
	        .domain([2000, 2017]) // TODO - years to show. Start(2000)/end date from data? change depending on options?
	        .range([0, width]),
	    yScale = d3.scale.linear()
	        .domain([0, info.maxY*1.1])	// metrics value scale
	        .range([height, 0]);

	// orient the axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickFormat(d3.format("d")); // remove commas
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");
	
	// get a color var for each metric
	var color = d3.scale.category10();

	// place axis relative to graph
	svg.append("g")
	    .attr("class", "axis") //Assign "axis" class
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0,0)")
	    .call(yAxis);	
		
	// line function to map data to the graph
	var metricLine = d3.svg.line()
	.x(function(d) { return xScale(d.Date); })
	.y(function(d) { return yScale(d.Value); });
	
	// function to show/hide metric lines
	function update() {
		if(this.checked){
			d3.select("svg g.gContainer > path.metric" + this.dataset.metric)[0][0].style.display = "block";
			document.querySelector(".tableMetric" + this.dataset.metric).style.display = "block";
		}
		else {
			d3.selectAll("svg g.gContainer > path.metric" + this.dataset.metric)[0][0].style.display = "none";
			document.querySelector(".tableMetric" + this.dataset.metric).style.display = "none";
		}
	}

	// "point" to follow mouse for each line array
	var pointsOnHover = [];
	
	// for each metric, graph it by default
	for (var i = 0; i < theData.length; i++) {
		svg.append("svg:path")
		.attr("d", metricLine(theData[i].Data))
		.attr("stroke", color(i))
		.attr("stroke-width", 2)
		.attr("fill", "none")
		.attr("class","metric" + i);
		
		// create "point" to follow mouse
		var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");
		focus.append("circle")
		.attr("r", 4);
		focus.append("text")
		.attr("x", 9)
		.attr("dy", ".35em");
		pointsOnHover.push(focus);
		
		// set up the checkboxes
		var checkboxDiv = document.getElementById("checkboxMetrics");
		var name = theData[i].Metric;
		checkboxDiv.innerHTML +='<div class="checkboxContainer">' +
		'<input type="checkbox" name="showMetrics" id="' + name + '" data-metric="' + i + '" checked/>' +
		'<span style="color:'+ color(i) + '">' + name + '</span>' +
		'</div>';
		
		// add each table
		createTable(name, i);
		
		d3.selectAll(".checkboxContainer input").on("change", update);
	}
		
	// function to find which point the mouse position corresponds to?
	var bisect = d3.bisector(function(d) { return xScale(d.Date); }).left;

	// rect to pick up mouse movement
	svg.append("svg:rect")
	.attr("height", height)
	.attr("width", width)
	.attr("fill", "none")
	.attr("pointer-events", "all")
	.on("mouseout", function(){ // on mouse out hide line, circles and text
		d3.selectAll(".focus")
		.style("display", "none");
	})
	.on("mousemove", function() { // mouse moving over canvas
		var x0 = d3.mouse(this)[0];
		for (var i = 0; i < theData.length; i++) {
			if (d3.selectAll(".checkboxContainer input")[0][i].dataset.metric === i.toString() && d3.selectAll(".checkboxContainer input")[0][i].checked) {
			    var num = bisect(theData[i].Data, x0, 1);
			    var d0 = theData[i].Data[num - 1];
			    var d1 = theData[i].Data[num];
			    var d;
			    if (!d0 || !d1) {
			    	d = !d0 ? d1 : d0;
			    }
			    else {
			    	d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
			    }
			    pointsOnHover[i].attr("transform", "translate(" + xScale(d.Date) + "," + yScale(d.Value) + ")");
			    pointsOnHover[i].select("text").text("(" + formatDate(d.Date, theData[i]) + ", " + d.Value + ")");
			    pointsOnHover[i][0][0].style.display = "block";
			}			
		}
	});
	
	// create a table for each metric
	function createTable(metricName, dataNum) {
		// Column headers = date and whatever metric is being used 
		//var col = ["Date", theData[0].Metric];
		var col = ["Date", metricName];

		// Create the table
		var table = document.createElement("table");
		table.classList.add("tableMetric" + dataNum);
		
		//Create the table headers using var col[]^^
		var tr = table.insertRow(-1);                   // TABLE ROW.
	
		for (var j = 0; j < col.length; j++) {
			var th = document.createElement("th");      // TABLE HEADER.
			th.innerHTML = col[j];
			tr.appendChild(th);
	    }
	
		// Insert json data into the table
		tr = table.insertRow(-1);
		for (var k = 0; k < theData[i]["Data"].length; k++) {
			tr = table.insertRow(-1);
        	var tabCell = tr.insertCell(0);
        	tabCell.innerHTML = formatDate(theData[i]["Data"][k].Date);
        	var tabCell = tr.insertCell(1);
        	tabCell.innerHTML = theData[i]["Data"][k].Value;
        }
	
		//Put table into container ready to display
		var divContainer = document.getElementById("TableHere");
		divContainer.appendChild(table);
	}
	
	// function to change decimal date to <month year>
	function formatDate(date) {
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var monthNum = [0, 1/12, 2/12, 3/12, 4/12, 5/12, 6/12, 7/12, 8/12, 9/12, 10/12, 11/12, 1];

		var formatted = months[0];
		if (date.toString().includes(".")) {
			var date2 = Math.round(parseFloat(date.toString().substring(date.toString().indexOf(".")))* 100)/100;
			for (var i = 0; i < 12; i++) {
				if (date2 === Math.round(monthNum[i]*100)/100) {
					formatted = months[i];
				}
			}
		}
		return formatted + " " + parseInt(date,10); // 10 added
	}
	
	// export/download as png
	d3.select('#exportButton').on('click', function() {
		var doctype = '<?xml version="1.0" standalone="no"?>'
			  + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		// serialize our SVG XML to a string.
		var source = (new XMLSerializer()).serializeToString(d3.select("svg").node());
		var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
		var url = window.URL.createObjectURL(blob);
		var img = d3.select('body').append('img')
		 .attr('width', width)
		 .attr('height', height)
		 .attr('style', 'display:none')
		 .node();
		img.onload = function(){
		  var canvas = d3.select('body').append('canvas').node();
		  canvas.width = width;
		  canvas.height = height;
		  var ctx = canvas.getContext('2d');
		  ctx.drawImage(img, 0, 0);
		  var canvasUrl = canvas.toDataURL("image/png");
		  // this is now the base64 encoded version of our PNG! you could optionally 
		  // redirect the user to download the PNG by sending them to the url with 
		  //window.location.href= canvasUrl;
		};
		img.src = url;
	});
};