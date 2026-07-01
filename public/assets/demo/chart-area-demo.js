window.renderIncomeTrend = async function renderIncomeTrend() {
  try {
    const chartElement = document.getElementById('myAreaChart');

    if (!chartElement || window.currentAdmin?.account_type !== 'admin') return;

    // Set global font family and color
    Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#292b2c';

    // Fetch data for Income (Line Graph)
    const incomeResponse = await fetch('/chacco/incomes/data');

    if (!incomeResponse.ok) {
      throw new Error('Could not load income trend data');
    }

    const incomesData = await incomeResponse.json();
    const months = incomesData.map(item => item.month);
    const totalIncome = incomesData.map(item => item.totalIncome);

    if (window.incomeTrendChart) {
      window.incomeTrendChart.destroy();
    }

    // Render Income Line Graph
    window.incomeTrendChart = new Chart(chartElement, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Total Income',
            lineTension: 0.3,
            backgroundColor: 'rgba(15, 118, 110, 0.08)',
            borderColor: 'rgba(15, 118, 110, 1)',
            pointRadius: 3,
            pointBackgroundColor: 'rgba(15, 118, 110, 1)',
            pointBorderColor: 'rgba(15, 118, 110, 1)',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: 'rgba(15, 118, 110, 1)',
            pointHoverBorderColor: 'rgba(15, 118, 110, 1)',
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: totalIncome,
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: { left: 10, right: 25, top: 25, bottom: 0 }
        },
        scales: {
          xAxes: [{
            gridLines: { display: false, drawBorder: false },
            ticks: { maxTicksLimit: 7 }
          }],
          yAxes: [{
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              callback: function(value) { return `R${value}`; }
            },
            gridLines: {
              color: 'rgb(234, 236, 244)',
              zeroLineColor: 'rgb(234, 236, 244)',
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2],
            }
          }]
        },
        legend: { display: false },
        tooltips: {
          backgroundColor: 'rgb(255,255,255)',
          bodyFontColor: '#858796',
          titleMarginBottom: 10,
          titleFontColor: '#6e707e',
          titleFontSize: 14,
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          intersect: false,
          mode: 'index',
          caretPadding: 10,
        }
      }
    });

  } catch (error) {
    console.error('Error rendering graphs:', error);
  }
};

window.addEventListener('admin-ready', () => {
  window.renderIncomeTrend?.();
});
