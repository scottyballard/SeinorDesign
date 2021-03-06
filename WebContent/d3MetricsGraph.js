//HTTP req

var req = new XMLHttpRequest();
req.open("POST", "/AllianceLabor/SelectServlet");// host/SelectServlet
var element = document.getElementById("header");
req.setRequestHeader("name", element.innerHTML);
req.send();
req.onreadystatechange = function() {
	var theData;
	if (req.readyState === 4 && req.status == 200) {
		theData = JSON.parse(req.responseText);
	}
	/* data for testing purposes
	var theData = '['+
	'{"metric":"metric!","maxY": 55, "data": [{"date":2005, "value":40},{"date":2006, "value":42},{"date":2007, "value":45},{"date":2009, "value":50},{"date":2018, "value":42}]},' +
	'{"metric":"metricNumero2!","maxY": 109, "data": [{"date":2005, "value":80},{"date":2006, "value":92},{"date":2007, "value":75},{"date":2009, "value":99}]},'+
	'{"metric":"metric3","maxY": 2099, "data": [{"date":2005, "value":888},{"date":2006, "value":999},{"date":2007, "value":760},{"date":2009, "value":2099},{"date":2014, "value":1976}]}]';
	theData = JSON.parse(theData); */
	
	// set some info from data to setup graph
	var info = {};
	var max = 0;
	for (var i = 0; i < theData.length; i++) {
		if (theData[i].maxY > max) {
			max = theData[i].maxY;
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
	else if (navigator.userAgent.match(/Trident\/7\./)) {	//IE
		width = parseInt(window.getComputedStyle(d3.select("svg")[0][0]).width.slice(0, -2));
		height = parseInt(window.getComputedStyle(d3.select("svg")[0][0]).height.slice(0, -2));
	}
	else {	// chrome...
		width = d3.select("svg")[0][0].clientWidth;
		height = d3.select("svg")[0][0].clientHeight;
	}
		
	// scale the data to fit the graph
	var xScale = d3.scale.linear()
	        .domain([2000, 2018]) // TODO - years to show. Start(2000)/end date from data? change depending on options?
	        .range([0, width]),
	    yScale = d3.scale.linear()
	        .domain([0, info.maxY*1.1])	// metrics value scale
	        .range([height, 0]);
	
	// orient the axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickFormat(d3.format("d")); // remove commas
	if (width < 500) {	// show less labels for small screens
		xAxis.ticks(3);
	}
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");
	
	// get a color var for each metric
	var color = d3.scale.category10();

	// place axis relative to graph
	svg.append("g")
	    .attr("class", "axis xaxis") //Assign "axis" class
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	svg.append("g")
	    .attr("class", "axis yaxis")
	    .attr("transform", "translate(6,0)")
	    .call(yAxis);	
		
	// line function to map data to the graph
	var metricLine = d3.svg.line()
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return yScale(d.value); });
	d3.select(window).on('resize', resize);

	function resize(){
	    width = window.innerWidth;
	    height = window.innerHeight;
	    svg.style({ width: width + 'px', height: height + 'px' });
	    //updateNodes(); // update the nodes incorporating the new width and height
	}
	
	// function to show/hide metric lines and resize y scale
	function update() {
		// which metric was clicked -> update y scale
		var metricNum = parseInt(this.dataset.metric);
		var max = 0;
		var checkboxes = document.querySelectorAll(".checkboxContainer input");
		var metricsToScale = [];
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].checked) {
				metricsToScale.push(theData[i]);
			}
		}
		for (var i = 0; i < metricsToScale.length; i++) {
			if (metricsToScale[i].maxY > max) {
				max = metricsToScale[i].maxY;
			}
		}
		yScale.domain([0, max*1.1]);
		svg.select(".yaxis").call(yAxis);
		metricLine = d3.svg.line()
		.x(function(d) { return xScale(d.date); })
		.y(function(d) { return yScale(d.value); });
		for (var i = 0; i < theData.length; i++) {
			d3.selectAll(".metric" + i)
			.attr("d", metricLine(theData[i].data));
		}
		
		// show/hide line
		if (this.checked) {
			d3.select("svg g.gContainer > path.metric" + metricNum)[0][0].style.display = "block";
			document.querySelector(".tableMetric" + metricNum).style.display = "block";
		}
		else {
			d3.selectAll("svg g.gContainer > path.metric" + metricNum)[0][0].style.display = "none";
			document.querySelector(".tableMetric" + metricNum).style.display = "none";
		}
	}

	// "point" to follow mouse for each line array
	var pointsOnHover = [];
	var textOnHover = [];
	
	// for each metric, graph it by default
	for (var i = 0; i < theData.length; i++) {
		svg.append("svg:path")
		.attr("d", metricLine(theData[i].data))
		.attr("stroke", color(i))
		.attr("stroke-width", 2)
		.attr("fill", "none")
		.attr("class","metric" + i);
		
		// create "point" to follow mouse
		var focusPoint = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");
		focusPoint.append("circle")
		.attr("r", 4);
		pointsOnHover.push(focusPoint);

		var focusText = svg.append("g")
		.attr("class", "focus")
		.style("display", "none")
		.attr("x", 9)
		.attr("dy", ".35em");
		focusText.append("text");
		textOnHover.push(focusText);
		
		// set up the checkboxes
		var checkboxDiv = document.getElementById("checkboxMetrics");
		var name = theData[i].metric;
		checkboxDiv.innerHTML +='<div class="checkboxContainer">' +
		'<input type="checkbox" name="showMetrics" id="' + name + '" data-metric="' + i + '" checked/>' +
		'<span style="color:'+ color(i) + '">' + name + '</span>' +
		'</div>';
		
		// add each table
		createTable(name, i);
		
		d3.selectAll(".checkboxContainer input").on("change", update);
	}
	
	// function to find which point the mouse position corresponds to?
	var bisect = d3.bisector(function(d) { return xScale(d.date); }).left;

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
			    var num = bisect(theData[i].data, x0, 1);
			    var d0 = theData[i].data[num - 1];
			    var d1 = theData[i].data[num];
			    var d;
			    if (!d0 || !d1) {
			    	d = !d0 ? d1 : d0;
			    }
			    else {
			    	d = x0 - d0.date > d1.date - x0 ? d1 : d0;
			    }
			    
			    pointsOnHover[i].attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.value) + ")");
			    pointsOnHover[i][0][0].style.display = "block";
			    
			    var moveText = (xScale(d.date) > width/2) ? -100 : 0;
			    textOnHover[i].attr("transform", "translate(" + (xScale(d.date) + moveText) + "," + (yScale(d.value) - 7) + ")");
			    textOnHover[i].select("text").text("(" + formatDate(d.date, theData[i]) + ", " + d.value + ")");
			    textOnHover[i][0][0].style.display = "block";
			}			
		}
	});
	
	// create a table for each metric
	function createTable(metricName, dataNum) {
		// Column headers = date and whatever metric is being used 
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
		var len = theData[i].data.length;
		for (var k = 0; k < len; k++) {
			if(theData[i].data[k].value==-1)
				continue;
			tr = table.insertRow(-1);
        	var tabCell = tr.insertCell(0);
        	tabCell.innerHTML = formatDate(theData[i].data[k].date);
        	var tabCell = tr.insertCell(1);
        	tabCell.innerHTML = theData[i].data[k].value;
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
		if (date.toString().indexOf(".") > 0) {
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
	d3.select("#exportButton").on("click", function() {
		var doctype = '<?xml version="1.0" standalone="no"?>'
					+ '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		// serialize SVG XML
		var source = (new XMLSerializer()).serializeToString(d3.select("svg").node());
		var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
		var url = window.URL.createObjectURL(blob);
		// create img from svg blob
		var img = d3.select("body").append("img")
		.attr("width", width + 75)
		.attr("height", height + 25)
		.attr("style", "display:none")
		.node();
		img.onload = function() {
			// create a canvas to get a url
			var canvas = d3.select("body").append("canvas")
			.attr("style", "display:none")
			.node();
			canvas.width = width + 75;
			canvas.height = height + 25;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			var canvasUrl = canvas.toDataURL("image/png");
			var link = d3.select("body").append("a")
			.attr("width", width)
			.attr("height", height)
			.attr("download", "graph.png")
			.attr("href", canvasUrl)
			.attr("class", "downloadGraph")
			.node();
			// click the link automatically to click the img "link" to download
			document.querySelector(".downloadGraph").click();
		};
		img.src = url;
	});
};
