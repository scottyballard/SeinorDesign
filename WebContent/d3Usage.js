/**
 * data will have different metrics, so show checkboxes to choose which metric(s)
 * 
 * All data, last 5 years, this year - buttons??
 */


	// sample data
	var theData2 = JSON.parse(
			'[{' + 
				'"Metric": "MetricName",'+
				'"MaxY": 80,'+
				'"Data": ['+
					'{"Date": 2000, "Value": 42},'+
					'{"Date": 2001, "Value": 30},'+
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
	
	// TODO - set the title based on something (program title)?
	document.querySelector(".title").innerText = "Title";
	
	// set some info from data to setup graph
	var info = {};
	var max = 0;
	for (var i = 0; i < theData2.length; i++) {
		if (theData2[i].MaxY > max) {
			max = theData2[i].MaxY;
		}
	}
	info.maxY = max;
	// TODO - if all percentage data, leave max at 100
	
	// create the svg area (width/height defined via css)
	var svg = d3.select("#graphContent")
	.append("svg")
	.append("g")
	.attr("class","gContainer");

	var width = d3.select("svg")[0][0].clientWidth;
	var height = d3.select("svg")[0][0]	.clientHeight;
	
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
	    .call(yAxis);	
	
	//d3.json(filename, function (data) {
	
	// line function to map data to the graph
	var metricLine = d3.svg.line()
	.x(function(d) { return xScale(d.Date); })
	.y(function(d) { return yScale(d.Value); });

	// "point" to follow mouse for each line array
	var pointsOnHover = [];
	
	// function to show/hide metric lines
	function update() {
		if(this.checked){
			d3.select("svg g.gContainer > path.metric" + this.dataset.metric)[0][0].style.display = "block";
		}
		else {
			d3.selectAll("svg g.gContainer > path.metric" + this.dataset.metric)[0][0].style.display = "none";
		}
	}

	// for each metric, graph it by default
	for (var i = 0; i < theData2.length; i++) {
		svg.append("svg:path")
		.attr("d", metricLine(theData2[i].Data))
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
		var name = theData2[i].Metric;
		checkboxDiv.innerHTML +='<div class="checkboxContainer">' +
		'<input type="checkbox" name="showMetrics" id="' + name + '" data-metric="' + i + '" checked/>' +
		//'<label for="' + name + '"></label>' +
		'<span>' + name + '</span>' +
		'</div>';
		
		d3.selectAll(".checkboxContainer input").on("change", update);
	}
	
	// hook up the checkboxes to the lines
	
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
		for (var i = 0; i < theData2.length; i++) {
			if (d3.selectAll(".checkboxContainer input")[0][i].dataset.metric === i.toString() && d3.selectAll(".checkboxContainer input")[0][i].checked) {
			    var num = bisect(theData2[i].Data, x0, 1);
			    var d0 = theData2[i].Data[num - 1];
			    var d1 = theData2[i].Data[num];
			    var d;
			    if (!d0 || !d1) {
			    	d = !d0 ? d1 : d0;
			    }
			    else {
			    	d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
			    }
			    pointsOnHover[i].attr("transform", "translate(" + xScale(d.Date) + "," + yScale(d.Value) + ")");
			    pointsOnHover[i].select("text").text(d.Value);
			    pointsOnHover[i][0][0].style.display = "block";
			}			
		}
	});
	//});