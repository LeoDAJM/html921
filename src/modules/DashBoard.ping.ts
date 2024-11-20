/* eslint-disable max-lines */

import ApexCharts from 'apexcharts';

let selectedServerUrl: string | null = null;
let selectedStartDate: string | null = null;
let selectedEndDate: string | null = null;


const menuItems = document.querySelectorAll("#weekly-sales-dropdown a");
const displayRange = document.getElementById("selected-range");
const displaytxt = document.getElementById("txt_range");
const sitetxt = document.getElementById("sitetxt");
const modal = document.getElementById("custom-range-modal");
const customRangeForm = document.getElementById("custom-range-form");

const customStartDateInput = document.getElementById('custom-start-date');
const customEndDateInput = document.getElementById('custom-end-date');
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
				show: true,
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
			x: {
				format: 'HH:mm',  // El formato también se aplica al tooltip
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
					format: 'dd MMM yy HH:mm',  // Formato que incluye fecha y hora
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

async function updateChart(serverUrl: string, start: string, end: string) {
	try {
		// Realizar la solicitud a la API con la URL del servidor
		const response = await fetch(`/api/getData?serverUrl=${serverUrl}&start=${start}&end=${end}`);

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
		selectedServerUrl = dropdown.value;
		sitetxt.textContent = dropdown.value.toUpperCase()
		//const selectedServerId = dropdown.value;
		if (selectedServerUrl && selectedStartDate && selectedEndDate) {
			updateChart(selectedServerUrl, selectedStartDate, selectedEndDate);
		}
	});

}



const form = document.getElementById('urlForm');
form.addEventListener("submit", async (event) => {
event.preventDefault();

const formData = new FormData(form);
const resultDiv = document.getElementById('resultText');
const tmp = formData.get('customUrl');
const argument = extraerDominio(tmp)
console.log(argument);
	const response = await fetch('/api/exec_shell', {
	method: 'POST',
	headers: {
		'Content-Type': 'text/plain',
	},
	body: argument, })
	    // Verificar si la respuesta es exitosa
		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		  }
	  
		  // Obtener la respuesta como texto
		const data = await response.text();
		resultDiv.innerHTML = data.replace(/\n/g, '<br>');
		updateChart(argument, selectedStartDate, selectedEndDate)
		selectedServerUrl = argument
		sitetxt.textContent = argument.toUpperCase()
		try {
			const response = await fetch('/api/distintc_domains');
			if (!response.ok) {
			  throw new Error('Error al cargar los dominios');
			}
			const opcionesHTML = await response.text();
			document.getElementById('tabs').innerHTML = opcionesHTML;
		  } catch (error) {
			console.error('Error al cargar los datos:', error);
		  }
        //resultDiv.textContent = data; // Esto reemplaza el texto dentro del div
		})

		function extraerDominio(cadena) {
			// Busca la posición de "www." en la cadena
			const indiceWww = cadena.indexOf("www.");
		  
			// Si se encuentra "www.", devuelve la subcadena desde esa posición hasta el final
			if (indiceWww !== -1) {
			  return cadena.slice(indiceWww);
			} else {
			  cadena = "www." + cadena;
			  // Si no se encuentra "www.", devuelve un mensaje indicando que no se encontró
			  return cadena;
			}
		  }

form.addEventListener("submit", async (event) => {
		event.preventDefault();
			try {
			  const response = await fetch('/api/distintc_domains');
			  if (!response.ok) throw new Error('Error al cargar los dominios');
			  const opcionesHTML = await response.text();
			  document.getElementById('tabs').innerHTML = opcionesHTML;
			} catch (error) {
			  console.error(error);
			}
		  ;})
window.onload = async () => {
try {
  const response = await fetch('/api/distintc_domains');
  if (!response.ok) {
    throw new Error('Error al cargar los dominios');
  }
  const opcionesHTML = await response.text();
  document.getElementById('tabs').innerHTML = opcionesHTML;
} catch (error) {
  console.error('Error al cargar los datos:', error);
}
};

function formatDateToSQLUTC(date: Date): string {
	const utcDate = new Date(date.toISOString()); // Convertir a UTC
	const year = utcDate.getUTCFullYear();
	const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
	const day = String(utcDate.getUTCDate()).padStart(2, '0');
	const hours = String(utcDate.getUTCHours()).padStart(2, '0');
	const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
	const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0');
	
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

// Manejo de los rangos predefinidos
menuItems.forEach(item => {
  item.addEventListener("click", (event) => {
	event.preventDefault();
	const range = item.getAttribute("data-range");

	let startDate, endDate;
	const today = new Date();
	const midn_today = new Date();

	
	switch (range) {
	  case "yesterday":
		startDate = new Date(today);
		startDate.setDate(today.getDate() - 1);
		endDate = today;
		break;
	  case "today":
		endDate = today;
		startDate = midn_today;
		startDate.setHours(0,0,0,0);
		break;
	  case "last7":
		endDate = today;
		startDate = new Date(today);
		startDate.setDate(today.getDate() - 7);
		break;
	  case "last30":
		endDate = today;
		startDate = new Date(today);
		startDate.setDate(today.getDate() - 30);
		break;
	  case "last90":
		endDate = today;
		startDate = new Date(today);
		startDate.setDate(today.getDate() - 90);
		break;
	  case "custom":
		// Asegurarse de que las fechas sean válidas
		const customStart = new Date(customStartDateInput.value);
		const customEnd = new Date(customEndDateInput.value);
		console.log(startDate);
		// Verificar si las fechas personalizadas son válidas
		if (isNaN(customStart.getTime()) || isNaN(customEnd.getTime())) {
		console.error('Las fechas personalizadas no son válidas');
		return { startDate: null, endDate: null };  // Devuelve null en caso de fecha no válida
		}

		startDate = customStart;
		endDate = customEnd;
		if (!startDate || !endDate) {
			alert("Por favor selecciona ambas fechas");
			return;
		}
		if (startDate > endDate) {
			alert("Selecciona in intervalo válido");
			return;
		}
	  	break;
	}
	selectedStartDate = formatDateToSQLUTC(startDate);
    selectedEndDate = formatDateToSQLUTC(endDate);
	
	if (selectedServerUrl && selectedStartDate && selectedEndDate) {
		updateChart(selectedServerUrl, selectedStartDate, selectedEndDate);
	}
	// Formatea las fechas
	const formattedStart = formatDateToSQLUTC(startDate);
	const formattedEnd = formatDateToSQLUTC(endDate);

	// Muestra el rango seleccionado
	displayRange.textContent = `${formattedStart} - ${formattedEnd}`;
	displaytxt.textContent = item.innerHTML?.toUpperCase();




  });
});