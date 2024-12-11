d3.csv("data.csv").then(data => {
  // Parse data and initialize cumulative stats
  const playerStats = {};
  data.forEach(d => {
    d.value = +d.value; // Ensure 'value' is numeric
    d.date = new Date(d.date); // Parse 'date' as a Date object
    d.player = d.player; // Ensure 'player' is properly assigned
    if (!playerStats[d.player]) {
      playerStats[d.player] = 0; // Initialize cumulative value for each player
    }
  });

  // Sort data by date to ensure correct chronological progression
  data.sort((a, b) => a.date - b.date);

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

  // Render chart
  const renderChart = (stat) => {
    // Filter data for the selected stat
    const filteredData = data.filter(d => d.stat === stat);
    if (!filteredData.length) return;

    let currentIndex = 0;

    const update = () => {
      if (currentIndex >= filteredData.length) return;

      // Process data up to the current date
      const currentDate = filteredData[currentIndex].date;
      const dailyData = filteredData.slice(0, currentIndex + 1);

      // Aggregate cumulative stats
      dailyData.forEach(d => {
        playerStats[d.player] += d.value;
      });

      // Get top 10 players by cumulative value
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

      // Increment the index and call update for the next time step
      currentIndex++;
      setTimeout(update, 1500);
    };

    update();
  };

  // Add event listener to the "Go" button
  document.getElementById("start-button").addEventListener("click", () => {
    const selectedStat = document.getElementById("stat-select").value;
    renderChart(selectedStat);
  });
});
