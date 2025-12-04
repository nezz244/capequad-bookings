// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

async function loadClientCategoryPieChart() {
  try {
    const response = await fetch('/chacco/clients/category');
    const data = await response.json();

    const categoryNames = data.map(category => category.categoryName || 'Unknown');
    const categoryCounts = data.map(category => category.clientCount || 0);

    const ctx = document.getElementById("myPieChart").getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categoryNames,
        datasets: [{
          data: categoryCounts,
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#c92a2a'],
          hoverBorderColor: 'rgba(234, 236, 244, 1)',
        }]
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: 'rgb(255,255,255)',
          bodyFontColor: '#858796',
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: true,
          caretPadding: 10,
        },
        legend: {
          display: true,
          position: 'right'
        },
      }
    });

  } catch (error) {
    console.error("Error loading pie chart data:", error);
  }
}

// Load chart after DOM is ready
loadClientCategoryPieChart();