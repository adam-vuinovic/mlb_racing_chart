
// Load the data
d3.csv("data.csv").then(data => {
  // Parse the data
  data.forEach(d => {
    d.value = +d.value; // Ensure 'value' is numeric
  });

  const svg = d3.select("#chart"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = {top: 40, right: 20, bottom: 30, left: 100};

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().range([0, innerWidth]);
  const yScale = d3.scaleBand().range([0, innerHeight]).padding(0.1);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const renderChart = (stat) => {
    const filteredData = data.filter(d => d.stat === stat);

    const groupedByMonth = d3.groups(filteredData, d => d.month);

    let currentIndex = 0;

    const update = () => {
      if (currentIndex >= groupedByMonth.length) return;

      const [month, stats] = groupedByMonth[currentIndex];
      currentIndex++;

      xScale.domain([0, d3.max(stats, d => d.value)]);
      yScale.domain(stats.map(d => d.player));

      g.selectAll(".bar")
        .data(stats, d => d.player)
        .join(
          enter => enter.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.player))
            .attr("width", d => xScale(d.value))
            .attr("height", yScale.bandwidth())
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1),
          update => update
            .transition().duration(1000)
            .attr("y", d => yScale(d.player))
            .attr("width", d => xScale(d.value)),
          exit => exit.transition().duration(1000).style("opacity", 0).remove()
        );

      g.selectAll(".label")
        .data(stats, d => d.player)
        .join(
          enter => enter.append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.player) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => d.player)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1),
          update => update
            .transition().duration(1000)
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.player) + yScale.bandwidth() / 2)
            .text(d => d.player),
          exit => exit.transition().duration(1000).style("opacity", 0).remove()
        );

      svg.select(".x-axis")
        .transition().duration(1000)
        .call(d3.axisTop(xScale).ticks(6));

      setTimeout(update, 1500); // Wait for animation before updating next frame
    };

    update();
  };

  // Add event listener to the button
  document.getElementById("start-button").addEventListener("click", () => {
    const selectedStat = document.getElementById("stat-select").value;
    renderChart(selectedStat);
  });

  // Initial setup of axis
  svg.append("g").attr("class", "x-axis").attr("transform", `translate(${margin.left},${margin.top})`);
  svg.append("g").attr("class", "y-axis").attr("transform", `translate(${margin.left},${margin.top})`);
});
