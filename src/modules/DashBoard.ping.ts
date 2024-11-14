/* eslint-disable max-lines */

import ApexCharts from 'apexcharts';

const getMainChartOptions = () => {
	let mainChartColors = {};

	if (document.documentElement.classList.contains('dark')) {
		mainChartColors = {
			borderColor: '#374151',
			labelColor: '#9CA3AF',
			opacityFrom: 0,
			opacityTo: 0.15,
		};
	} else {
		mainChartColors = {
			borderColor: '#F3F4F6',
			labelColor: '#6B7280',
			opacityFrom: 0.45,
			opacityTo: 0,
		};
	}

	return {
		chart: {
			height: 420,
			type: 'area',
			fontFamily: 'Inter, sans-serif',
			foreColor: mainChartColors.labelColor,
			toolbar: {
				show: false,
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				enabled: true,
				opacityFrom: mainChartColors.opacityFrom,
				opacityTo: mainChartColors.opacityTo,
			},
		},
		dataLabels: {
			enabled: true,
		},
		tooltip: {
			style: {
				fontSize: '14px',
				fontFamily: 'Inter, sans-serif',
			},
		},
		grid: {
			show: true,
			borderColor: mainChartColors.borderColor,
			strokeDashArray: 1,
			padding: {
				left: 35,
				bottom: 15,
			},
		},
		series: [
			{
				name: 'Máximo',
				color: '#f05252',
			},
			{
				name: 'Mínimo',
				color: '#72f072',
			},
			{
				name: 'Promedio',
				color: '#1A56DB',
			},
		],
		markers: {
			size: 3,
			strokeColors: '#ffffff',
			hover: {
				size: undefined,
				sizeOffset: 2,
			},
		},
		xaxis: {
			type: 'datetime',
			title: {
				text: 'Tiempo',
			},
			labels: {
				style: {
					colors: [mainChartColors.labelColor],
					fontSize: '14px',
					fontWeight: 500,
				},
			},
			axisBorder: {
				color: mainChartColors.borderColor,
			},
			axisTicks: {
				color: mainChartColors.borderColor,
			},
			crosshairs: {
				show: true,
				position: 'back',
				stroke: {
					color: mainChartColors.borderColor,
					width: 1,
					dashArray: 10,
				},
			},
		},
		yaxis: {
			labels: {
				style: {
					colors: [mainChartColors.labelColor],
					fontSize: '14px',
					fontWeight: 500,
				},
				formatter(value) {
					return `${value} ms`;
				},
			},
			title: {
				text: 'Ping [ms]',
			},
		},
		legend: {
			fontSize: '14px',
			fontWeight: 500,
			fontFamily: 'Inter, sans-serif',
			labels: {
				colors: [mainChartColors.labelColor],
			},
			itemMargin: {
				horizontal: 10,
			},
		},
		responsive: [
			{
				breakpoint: 1024,
				options: {
					xaxis: {
						labels: {
							show: false,
						},
					},
				},
			},
		],
	};
};

let chart: ApexCharts | null = null;

async function updateChart(serverUrl: string) {
	try {
		// Realizar la solicitud a la API con la URL del servidor
		const response = await fetch(`/api/getData?serverUrl=${serverUrl}`);

		// Verificar si la respuesta es válida
		if (!response.ok) {
			console.log(response);
			throw new Error(`Error al obtener datos: ${response.statusText}`);
		}

		// Convertir los datos a formato JSON
		const data = await response.json();
		console.log(data)
		// Transformar los datos para el formato de ApexCharts
		const seriesData = data.map((item: { timestamp: string, max: number, min: number, avg: number }) => ({
			x: new Date(item.timestamp).getTime(), // Convertir el timestamp a milisegundos
			y: [item.max, item.min, item.avg],
		}));
		
		// Actualizar el gráfico con los nuevos datos
		if (chart) {
			chart.updateSeries([
				{
					name: 'Máximo',
					data: seriesData.map((d) => ({ x: d.x, y: d.y[0] })), // Usar ping_max
				},
				{
					name: 'Mínimo',
					data: seriesData.map((d) => ({ x: d.x, y: d.y[1] })), // Usar ping_min
				},
				{
					name: 'Promedio',
					data: seriesData.map((d) => ({ x: d.x, y: d.y[2] })), // Usar ping_avg
				},
			]);
		}
	} catch (error) {
		console.error('Error al actualizar el gráfico: ', error);
	}
}



if (document.getElementById('chart_ping')) {
	chart = new ApexCharts(document.getElementById('chart_ping'), getMainChartOptions());
	chart.render();

	// init again when toggling dark mode
	document.addEventListener('dark-mode', () => {
		if (chart) chart.updateOptions(getMainChartOptions());
	});
	
	// Agregar el listener para el cambio del dropdown
	const dropdown = document.getElementById('tabs') as HTMLSelectElement;
	dropdown.addEventListener('change', () => {
		const selectedServerId = dropdown.value;
		//const selectedServerId = dropdown.value;
		updateChart(selectedServerId);
	});
}



const form = document.getElementById('urlForm');
form.addEventListener('submit', async (event) => {
event.preventDefault();

const formData = new FormData(form);
const argument = formData.get('customUrl');
	const response = await fetch('/api/exec_shell', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({ argument }),
	});
	const data = await response.json();
          if (response.ok) {
			console.log("Pass");
            document.getElementById('result').innerHTML = `Resultado: ${data.stdout}`;
          } else {
			console.log("NotPass");
            document.getElementById('result').innerHTML = `Error: ${data.stderr}`;
          }
        }
    );