d3.csv("data.csv").then(data => {
  // Convert values to numbers and ensure dates are parsed
  data.forEach(d => {
    d.value = +d.value;
    d.date = new Date(d.date); // Ensure the `date` column is parsed as a Date object
  });
  console.log("Data loaded:", data);

  const svg = d3.select("#chart"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 40, right: 20, bottom: 30, left: 100 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().range([0, innerWidth]);
  const yScale = d3.scaleBand().range([0, innerHeight]).padding(0.1);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const renderChart = (stat) => {
    console.log("Rendering chart for stat:", stat);

    // Filter the data for the selected stat
    const filteredData = data.filter(d => d.stat === stat);
    console.log("Filtered data:", filteredData);

    if (!filteredData.length) {
      console.error("No data found for the selected stat:", stat);
      return;
    }

    // Group data by date
    const groupedByDate = d3.groups(filteredData, d => d.date);
    console.log("Grouped data by date:", groupedByDate);

    let currentIndex = 0;

    const update = () => {
      if (currentIndex >= groupedByDate.length) return;

      const [date, stats] = groupedByDate[currentIndex];
      currentIndex++;

      console.log("Rendering date:", date, "with stats:", stats);

      // Sort the data for this date by value in descending order
      stats.sort((a, b) => b.value - a.value);

      // Update the scales
      xScale.domain([0, d3.max(stats, d => d.value)]);
      yScale.domain(stats.map(d => d.player));

      // Update the bars
      g.selectAll(".bar")
        .data(stats, d => d.player)
        .join(
          enter => enter.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.player))
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .transition().duration(1000)
            .attr("width", d => xScale(d.value)),
          update => update.transition().duration(1000)
            .attr("y", d => yScale(d.player))
            .attr("width", d => xScale(d.value)),
          exit => exit.transition().duration(1000).attr("width", 0).remove()
        );

      // Update the labels
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
          update => update.transition().duration(1000)
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.player) + yScale.bandwidth() / 2)
            .text(d => d.player),
          exit => exit.transition().duration(1000).style("opacity", 0).remove()
        );

      // Update the x-axis
      svg.select(".x-axis")
        .transition().duration(1000)
        .call(d3.axisTop(xScale).ticks(6));

      // Add a date label at the top
      svg.selectAll(".date-label")
        .data([date])
        .join(
          enter => enter.append("text")
            .attr("class", "date-label")
            .attr("x", innerWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(d => d3.timeFormat("%B %d, %Y")(d)),
          update => update.text(d => d3.timeFormat("%B %d, %Y")(d))
        );

      // Move to the next frame after a delay
      setTimeout(update, 1500);
    };

    // Initialize the chart with the first frame
    update();
  };

  // Add event listener to the "Go" button
  document.getElementById("start-button").addEventListener("click", () => {
    const selectedStat = document.getElementById("stat-select").value;
    console.log("Go button clicked, selected stat:", selectedStat);
    renderChart(selectedStat);
  });

  // Initial setup of x-axis
  svg.append("g").attr("class", "x-axis").attr("transform", `translate(${margin.left},${margin.top})`);
});
