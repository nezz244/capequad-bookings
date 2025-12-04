document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Set global font family and color
    // Set new default font family and font color to mimic Bootstrap's default styling
    Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#292b2c';



    // Fetch data for Income (Line Graph)
    const incomeResponse = await fetch('/chacco/incomes/data');
    const incomesData = await incomeResponse.json();
    const months = incomesData.map(item => item.month);
    const installmentsAmount = incomesData.map(item => item.installmentsAmount);
    const amountPaid = incomesData.map(item => item.amountPaid);
    console.log("pano",incomesData);

    // Render Income Line Graph
    new Chart(document.getElementById('myAreaChart'), {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Installments Amount',
            lineTension: 0.3,
            backgroundColor: 'rgba(78, 115, 223, 0.05)',
            borderColor: 'rgba(78, 115, 223, 1)',
            pointRadius: 3,
            pointBackgroundColor: 'rgba(78, 115, 223, 1)',
            pointBorderColor: 'rgba(78, 115, 223, 1)',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
            pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: installmentsAmount,
          },
          {
            label: 'Deposits Paid',
            lineTension: 0.3,
            backgroundColor: 'rgba(54, 185, 204, 0.05)',
            borderColor: 'rgba(54, 185, 204, 1)',
            pointRadius: 3,
            pointBackgroundColor: 'rgba(54, 185, 204, 1)',
            pointBorderColor: 'rgba(54, 185, 204, 1)',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: 'rgba(54, 185, 204, 1)',
            pointHoverBorderColor: 'rgba(54, 185, 204, 1)',
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: amountPaid,
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
          }
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
              callback: function(value) { return `$${value}`; }
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
});
