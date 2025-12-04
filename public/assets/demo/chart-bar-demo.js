// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

async function loadAgentPerformanceBarChart() {
  try {
    const response = await fetch('/chacco/agents/performance');
    const data = await response.json();

    // Adjust this depending on your actual JSON structure
    const agentNames = data.map(agent => agent.agentName || agent.name || 'Unknown');
    const clientCounts = data.map(agent => agent.clientCount || agent.clients || 0);

    const ctx = document.getElementById("myBarChart").getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: agentNames,
        datasets: [{
          label: "Number of Clients",
          backgroundColor: "rgba(2,117,216,1)",
          borderColor: "rgba(2,117,216,1)",
          data: clientCounts,
        }],
      },
      options: {
        scales: {
          xAxes: [{
            gridLines: { display: false },
            ticks: { maxTicksLimit: 10, autoSkip: false }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 4
            },
            gridLines: { display: true }
          }],
        },
        legend: {
          display: false
        }
      }
    });

  } catch (error) {
    console.error('Failed to load chart data:', error);
  }
}

// Load the chart on page load
loadAgentPerformanceBarChart();