var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;
    barPadding = 1;

var parseDate = d3.time.format("%Y_%m").parse;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brush);

var area = d3.svg.area()
   .interpolate("monotone")
    .x(function(d) { return x(d.chartDate); })
    .y0(height)
    .y1(function(d) { return y(d.hits); });

var area2 = d3.svg.area()
   .interpolate("monotone")
    .x(function(d) { return x2(d.chartDate); })
    .y0(height2)
    .y1(function(d) { return y2(d.hits); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// d3.csv("sp500.csv", function(error, data) {
// d3.json("../Data/incidents/1999_10_incidents.json", function(error, data) {
d3.json("../Data/incidents/totalincidents.json", function(error, data) {

  //Need to format the dates for chart
  data.forEach(function(d) {
    d.chartDate = parseDate(d.date);
    d.hits = +d.hits;
  });

  //Once we have a date, now sort
  data.sort(function(a,b) { return a.chartDate-b.chartDate; });

  //Setting up the scales for the charts
  x.domain(d3.extent(data.map(function(d) { return d.chartDate; })));
  y.domain([0, d3.max(data.map(function(d) { return d.hits; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.selectAll(".focusBars")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("fill", "black")
      .attr("x", function(d, i) { return i * (width/data.length);})
      .attr("width",(width/data.length) - barPadding)
      .attr("y", function(d) { return y(d.hits); })
      .attr("height", function(d) { return height - y(d.hits); });

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // focus.append("path")
  //     .data([data])
  //     .attr("clip-path", "url(#clip)")
  //     .attr("d", area);

  // focus.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis);

  // focus.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis);

  context.append("path")
      .data([data])
      .attr("d", area2);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);
});

function brush() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());

  console.log(brush.extent());

    //So for this one, to know how what the x position is, I need to know how many
    //dates are in the brush.extent()
    //From: http://www.htmlgoodies.com/html5/javascript/calculating-the-difference-between-two-dates-in-javascript.html#fbid=WJ8P8yZ3FVL
    var monthsBetween = function( date1, date2 ) {
    //Get 1 month in milliseconds
    var one_month=1000*60*60*24*30;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
      
    // Convert back to days and return
    return Math.round(difference_ms/one_month); 
  }

  focus.selectAll("rect").attr("x", function(d, i) { 
    return x(d.chartDate)});
  focus.selectAll("rect")
    .attr("width", (width/(monthsBetween(brush.extent()[0],brush.extent()[1]))) - barPadding); 
  focus.select(".x.axis").call(xAxis);
}
