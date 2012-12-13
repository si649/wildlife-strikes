var margin = {top: 10, right: 10, bottom: 10, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    barPadding = 1;

var parseDate = d3.time.format("%Y_%m").parse;

var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x)
    .on("brush", brush);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var brushChart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  brushChart.selectAll(".brushBars")
      .data(data)
    .enter().append("rect")
      .attr("class", "brushbar")
      .attr("fill", "black")
      .attr("x", function(d, i) { return i * (width/data.length);})
      .attr("width",(width/data.length) - barPadding)
      .attr("y", function(d) { return y(d.hits); })
      .attr("height", function(d) { return height - y(d.hits); });

  brushChart.append("g")
      .attr("class", "x axis")
      //.attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  brushChart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  brushChart.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height + 7)
      .on("click", clearBrush);
});

function brush() {

  //Find out how many months there are between the brush extent
  var arrayOfDates = function( date1, date2 ) {
    //Make new dates from the given ones, set for first of the month year
    var d1 = new Date(date1.getFullYear(), date1.getMonth(), 1);
    var d2 = new Date(date2.getFullYear(), date2.getMonth(), 1);
    var one_month=1000*60*60*24*30;


    var monthsBetween = Math.floor(Math.abs(((d1 - d2)/one_month)));

    //Given the number of months btw the two dates construct an array with our date format
    var monthsArray = [];

    //We'll be incrimenting over date one
    var month = d1.getMonth() + 1; //b/c this is index 0-11 
    var year = d1.getFullYear();
    var dateStr = year + "_" + month;

    //put in the first date
    monthsArray.push(dateStr);

    for (var i=0; i < monthsBetween; i++) {
      if (month != 12) {
        dateStr = year + '_' + ++month;
      }
      // increment year and set month to january
      else {
        dateStr = ++year + '_1';
        month = 1;
      }
      console.log(dateStr);
      monthsArray.push(dateStr);
    }
    console.log(monthsArray);
    return monthsArray;
  }
  console.log("call to months between", arrayOfDates(brush.extent()[0],brush.extent()[1]));

}

function clearBrush () {
  d3.select("g .x .brush").call(brush.clear());
}
