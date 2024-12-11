d3.csv("data.csv").then(data => {
  // Parse data
  data.forEach(d => {
    d.value = +d.value; // Ensure 'value' is numeric
    d.date = new Date(d.date); // Parse 'date' as a Date object
  });

  // Set up SVG dimensions and margins
  const svg = d3.select("#chart"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 50, right: 20, bottom: 30, left: 200 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3.scaleLinear().range([0, innerWidth]);
  const yScale = d3.scaleBand().range([0, innerHeight]).padding(0.1);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Unique colors for each player

  // Chart container
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Add axes
  g.append("g").attr("class", "x-axis");
  g.append("g").attr("class", "y-axis");

  // Render chart function
  const renderChart = (stat) => {
    // Filter data for the selected stat
    const filteredData = data.filter(d => d.stat === stat);
    if (!filteredData.length) return;

    // Order data by date
    filteredData.sort((a, b) => a.date - b.date);

    // Initialize player stats
    const playerStats = {};
    const allPlayers = Array.from(new Set(filteredData.map(d => d.player))); // List of all players
    allPlayers.forEach(player => playerStats[player] = 0); // Initialize cumulative totals for each player

    let currentIndex = 0; // To iterate over dates

    // Function to update the chart for each date
    const update = () => {
      if (currentIndex >= filteredData.length) return;

      // Get the current date and filter rows for this date
      const currentDate = filteredData[currentIndex].date;
      const dailyData = filteredData.filter(d => d.date <= currentDate);

      // Aggregate cumulative stats for players up to the current date
      dailyData.forEach(d => {
        playerStats[d.player] += d.value;
      });

      // Get the top 10 players by cumulative value
      const topPlayers = Object.entries(playerStats)
        .map(([player, value]) => ({ player, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Update scales
      xScale.domain([0, d3.max(topPlayers, d => d.value)]);
      yScale.domain(topPlayers.map(d => d.player));

      // Update bars
      const bars = g.selectAll(".bar")
        .data(topPlayers, d => d.player);

      bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.player))
        .attr("height", yScale.bandwidth())
        .attr("width", 0) // Start with 0 width for animation
        .attr("fill", d => colorScale(d.player))
        .merge(bars)
        .transition().duration(1000)
        .attr("x", 0)
        .attr("y", d => yScale(d.player))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth());

      bars.exit()
        .transition().duration(1000)
        .attr("width", 0)
        .remove();

      // Update labels
      const labels = g.selectAll(".label")
        .data(topPlayers, d => d.player);

      labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => yScale(d.player) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.player)
        .merge(labels)
        .transition().duration(1000)
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => yScale(d.player) + yScale.bandwidth() / 2)
        .text(d => d.player);

      labels.exit()
        .transition().duration(1000)
        .style("opacity", 0)
        .remove();

      // Update axes
      g.select(".x-axis")
        .transition().duration(1000)
        .call(d3.axisTop(xScale).ticks(6));

      g.select(".y-axis")
        .transition().duration(1000)
        .call(d3.axisLeft(yScale));

      // Add date label at the top
      svg.selectAll(".date-label")
        .data([currentDate])
        .join(
          enter => enter.append("text")
            .attr("class", "date-label")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(d => d3.timeFormat("%B %d, %Y")(d)),
          update => update.text(d => d3.timeFormat("%B %d, %Y")(d))
        );

      // Move to the next time step
      currentIndex++;
      setTimeout(update, 1500); // Wait 1.5 seconds before updating for the next date
    };

    // Start the update loop
    update();
  };

  // Add event listener to the "Go" button
  document.getElementById("start-button").addEventListener("click", () => {
    const selectedStat = document.getElementById("stat-select").value;
    renderChart(selectedStat);
  });
});
