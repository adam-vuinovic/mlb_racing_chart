d3.csv("data.csv").then(data => {
  // Parse and debug the data
  data.forEach(d => {
    d.player = d.player; // Ensure player name is correctly populated
    d.value = +d.value;  // Convert value to a number
    d.date = new Date(d.date); // Parse date
  });

  console.log("Parsed data:", data); // Log parsed data for debugging

  // Initialize cumulative stats
  const playerStats = {};
  data.forEach(d => {
    if (!playerStats[d.player]) {
      playerStats[d.player] = 0; // Initialize for each player
    }
  });

  // Sort data by date
  data.sort((a, b) => a.date - b.date);

  let currentIndex = 0;

  const update = () => {
    if (currentIndex >= data.length) return;

    const currentDate = data[currentIndex].date;
    const dailyData = data.slice(0, currentIndex + 1);

    // Aggregate cumulative stats
    dailyData.forEach(d => {
      playerStats[d.player] += d.value;
    });

    // Get top 10 players
    const topPlayers = Object.entries(playerStats)
      .map(([player, value]) => ({ player, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    console.log("Top players:", topPlayers);

    // Update bars and labels (as before)
    const bars = g.selectAll(".bar")
      .data(topPlayers, d => d.player); // Key by player

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.player))
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", d => colorScale(d.player))
      .merge(bars)
      .transition().duration(1000)
      .attr("width", d => xScale(d.value))
      .attr("y", d => yScale(d.player));

    bars.exit()
      .transition().duration(1000)
      .attr("width", 0)
      .remove();

    currentIndex++;
    setTimeout(update, 1500);
  };

  update();
});
