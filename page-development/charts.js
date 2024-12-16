// DETECT IF SUBMETRIC STARTS WITH NUMERIC VALUE
function isNonNumeric(value) {
  return isNaN(parseInt(value.charAt(0)));
}

// DYNAMICALLY SORT SUBMETRICS FOR LEGEND
function sortSubmetrics(data) {
  const submetrics = Array.from(new Set(data.map(d => d.submetric))); 

  const nonNumeric = submetrics.filter(isNonNumeric);
  const numeric = submetrics.filter(d => !isNonNumeric(d));

  // nonNumeric.sort();
  numeric.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // RETURN COMBINED SORTED ARRAY WITH NON NUMERIC VALUES FIRST
  return [...nonNumeric, ...numeric];
}

// Declare data source
let dataSource = '../data.csv'

// MAIN CHART-DRAWING FUNCTION
async function drawChart(destination, metric, label, multi, schemaFlag = "default", selectedCauses = []) {
  
  /*  Arguments passed into drawChart function:
            - destination: the ID of the vis container
            - metric is a string that filters the data: eg, 'Total births' or 'By maternal age'
            - label is a string that determines the chart's subtitle/y-axis label
            - multi is a true/false: false sets fill, true inserts the 'color' mark property on encoding
            - schemaFlag (optional) is a string that determines which schema to use. Defaults to "default".

            - selectedCauses: array of selected causes for dynamic filtering.
 */

  // INITIALIZE VARIABLES
  let fillColor = multi === false ? "#f3f3f3" : "#f3f3f300";
  let subSeries = multi === false ? "" : "submetric";
  let fillLayer = multi === false ? [{"mark": {"type": "area", "color": "#f0f8ff85", "tooltip": false}}] : [];
  let legend = multi === true ? {"columns": 6, "labelFontSize": 10, "symbolSize": 80} : {"disable": true};

  // CREATE ARRAY OF SUBMETRICS TO PASS INTO SPEC.ENCODING.COLOR.SCALE.DOMAIN
  let groups = [];

  let data;
  await fetch('../data.csv')
    .then(response => response.text())
    .then(csvText => {
      data = d3.csvParse(csvText).filter(d => d.metric === metric);
    });

  const sortedSubmetrics = sortSubmetrics(data);

  // COMMON ELEMENTS OF SCHEMA
var partialConfig = {
    "range": {
      "category": [
        "#003F5C",
        "#FF8440",
        "#7A4694",
        "#FFA600",
        "#EF5E4B",
        "#BD4B86",
        "#425280"
            ]
  },
  "view": {"stroke": null},
  "axisX": {
    "labelAngle": 0,
    "grid": false,
    "tickSize": {
      "condition": {
        "test": {"field": "value", "timeUnit": "quarter", "equal": 1},
        "value": 15
      },
      "value": 9
    },
    "tickWidth": {
      "condition": {
        "test": {"field": "value", "timeUnit": "quarter", "equal": 1},
        "value": 1.25
      },
      "value": 0.5
    },
    "labelExpr": "[quarter(datum.value) === 1 ? timeFormat(datum.value, '%Y') + ' Q' + quarter(datum.value) : 'Q' + quarter(datum.value)]"
  },
  "axisY": {
    "domain": false,
    "ticks": false,
    "tickCount": 3, 
    "orient": "left",
    "zindex": 0, 
    "gridDash": [2]
   }
  }

  const colorRange = partialConfig.range.category;

  let color;
  if (metric === "Deaths by cause") {
    color = {
      "condition": {
        "param": "hover",
        "field": "submetric",
        "type": "nominal",
        "legend": {
          "orient": "bottom", 
          "title": null, 
          "labelLimit": 1000,
          "values": selectedCauses  // Filter the legend to only show selected causes for this chart
        },
        "scale": {
          "domain": selectedCauses.length > 0 ? selectedCauses : sortedSubmetrics,  // Use selected causes if any, otherwise default
          "range": colorRange  
        }
      },
      "value": "gray"
    }
  } else {
    // Default color scale for other charts
    color = multi === true ? {
      "condition": {
        "param": "hover",
        "field": "submetric",
        "type": "nominal",
        "legend": {
          "orient": "bottom", 
          "title": null, 
          "labelLimit": 1000
        },
        "scale": {
          "domain": sortedSubmetrics,  
          "range": colorRange  
        }
      },
      "value": "gray"
    } : {}
  }

  var title = {
    "text": label,
    "subtitlePadding": 10,
    "fontWeight": "normal",
    "anchor": "start",
    "fontSize": 12,
    "font": "sans-serif",
    "baseline": "top",
    "dy": -10,
    "subtitleFontSize": 13
  }

  var tooltipContent = [
    { "title": "Quarter", "field": "date", "timeUnit": "quarteryear" },
    { "title": `${label}`, "field": "valueWithDisplay" },
    { "title": "Group", "field": "submetric"}
  ]

  var encoding = {
    "x": {
      "timeUnit": "quarteryear",
      "field": "date",
      "title": "",
      "axis": {"zindex": 1},
      "scale": {"padding": 30}
    },
    "y": {
      "field": "value",
      "type": "quantitative",
      "title": ""
    },
    "color": color,
    "opacity": {"condition": {"param": "hover", "value": 1}, "value": 0.35}
  }

  // DEFAULT: HOVER SCHEMA
  var spec1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "",
    "height": 250,
    "width": "container",
    "title": title,
    "config": {
      ...partialConfig,
      "legend": legend
    },
    "data": {
      "url": dataSource
    },
    "transform": [
      { "filter": `datum.metric === '${metric}'` },
      {
        "calculate": "datum.display === 'Percent' ? '%' : (datum.display === 'Number' ? '' : datum.display)",
        "as": "formattedDisplay"
      },
      {
        "calculate": "format(datum.value, ',') + ' ' + datum.formattedDisplay",
        "as": "valueWithDisplay"
      }
    ],
    "encoding": encoding,
    "layer": [
      ...fillLayer,
      {
        "description": "Transparent layer to trigger hover more easily",
        "params": [
          {
            "name": "hover",
            "select": {
              "type": "point",
              "fields": ["submetric"],
              "on": "pointerover"
            }
          }
        ],
        "mark": {"type": "line", "stroke": "transparent", "strokeWidth": 15}
      },
      {
        "mark": {"type": "line", "point": {"size": 70}},
        "encoding": {
          "tooltip": tooltipContent
        }
      },
      {
        "transform": [
          {
            "aggregate": [
              {"op": "argmin", "field": "date", "as": "value"},
              {"op": "min", "field": "date", "as": "date"}
            ],
            "groupby": ["submetric"]
          }
        ],
        "encoding": {
          "x": {"field": "date"},
          "y": {"field": "value['value']"},
          "text": {
            "condition": {"param": "hover", "field": "submetric", "empty": false},
            "value": ""
          },
          "color": {"field": "submetric", "type": "nominal"}
        },
        "mark": {"type": "text", "align": "left", "dx": -8, "dy": -15,"fontSize": 12, "fontWeight": "bold"}
      }
    ]
  }

  // AlT SCHEMA - FOR MULTISELECT DEATH CAUSES CHART
  const spec2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "",
    "height": 250,
    "width": "container",
    "title": title,
    "config": {
      ...partialConfig,
      "legend": {"columns": 4, "labelFontSize": 10, "symbolSize": 80}
    },
    "data": {
      "url": dataSource
    },
    "transform": [
      {
        "filter": {
          "field": "metric",
          "equal": "Deaths by cause"
        }
      },
      {
        "filter": {
          "field": "submetric",
          "oneOf": selectedCauses
        }
      },
      {
        "calculate": "datum.display === 'Percent' ? ' %' : (datum.display === 'Number' ? '' : datum.display)",
        "as": "formattedDisplay"
      },
      {
        "calculate": "format(datum.value, ',') + ' ' + datum.formattedDisplay",
        "as": "valueWithDisplay"
      }
    ],  
    "encoding": encoding,
    "layer": [
      {
        "description": "Transparent layer to trigger hover more easily",
        "params": [
          {
            "name": "hover",
            "select": {
              "type": "point",
              "fields": ["submetric"],
              "on": "pointerover"
            }
          }
        ],
        "mark": {"type": "line", "stroke": "transparent", "strokeWidth": 15}
      },
      {
        "mark": {"type": "line", "point": {"size": 70}},
        "encoding": {
          "tooltip": tooltipContent
        }
      },
      {
        "transform": [
          {
            "aggregate": [
              {"op": "argmin", "field": "date", "as": "value"},
              {"op": "min", "field": "date", "as": "date"}
            ],
            "groupby": ["submetric"]
          }
        ],
        "encoding": {
          "x": {"field": "date"},
          "y": {"field": "value['value']"},
          "text": {
            "condition": {"param": "hover", "field": "submetric", "empty": false},
            "value": ""
          },
          "color": {"field": "submetric", "type": "nominal"}
        },
        "mark": {"type": "text", "align": "left", "dx": -8, "dy": -15,"fontSize": 12, "fontWeight": "bold"}
      }
    ]
  }

  const chosenSpec = schemaFlag === "alternative" ? spec2 : spec1;

  try {
    // RUN VEGA EMBED
    await vegaEmbed(destination, chosenSpec, {actions: false });
  } catch (error) {
    console.log('Error embedding chart:', error);
  }


  /* ACTIONS ALTERNATIVES
  {
      actions: {
        export: { png: true, svg: true },
        source: false,  
        compiled: false, 
        editor: true 
      }
    }
  */

  // Show/hide content for each section based on button click
  let copyHolders = "." + (destination + '-copy').slice(1)     // copy holders all have a class of ${destination}-copy
  let viewCopy = metric.toLowerCase().replace(/\s+/g, '-');    // copy holders all have an id of {$metric} (lower case, with - instead of space)
  let viewCopyHolders = document.querySelectorAll(copyHolders) // get all copy holders for this chart section
  viewCopyHolders.forEach(child => child.classList.add('hide')) // hide all of them
  document.getElementById(viewCopy).classList.remove('hide')   // show the one selected

}

// CREATE CHART CONFIGS
const chartConfigs = [
  { destination: '#bbd', metric: 'Total births', label: 'Births',  multi: false, tooltip: "", schemaFlag: "default" },
  { destination: '#bbc', metric: 'Births by method', label: 'Percent of births', multi: true, tooltip: "", schemaFlag: "default" },
  { destination: '#bcc', metric: 'Pre-pregnancy diabetes', label: 'Mothers with pre-pregnancy diabetes', multi: false, tooltip: "", schemaFlag: "default" },
  { destination: '#dim', metric: 'Total IMR', label: 'Infant mortality rate', multi: false, tooltip: "", schemaFlag: "default" },
  { destination: '#ddc', metric: 'Total deaths', label: 'Deaths', multi: false, tooltip: "", schemaFlag: "default"  },
];

// INITIALIZE CHART DRAWS
chartConfigs.forEach(({ destination, metric, label, multi, schemaFlag }) => {
  drawChart(destination, metric, label, multi, schemaFlag);
});

// FUNCTIONALISED EVENT LISTENER 
function addClickListeners(elements) {
  elements.forEach((element) => {
    element.addEventListener('click', function() {
      elements.forEach(el => el.classList.remove('highlight'));
      this.classList.add('highlight');
    });
  });
}
// EVENT LISTENERS FOR EACH CHART SECTION
addClickListeners(document.querySelectorAll('.byDemog'));
addClickListeners(document.querySelectorAll('.birthChar'));
addClickListeners(document.querySelectorAll('.care'));
addClickListeners(document.querySelectorAll('.infantMort'));
addClickListeners(document.querySelectorAll('.mort'));

// TOGGLE THE VISIBILITY OF THE MULTISELECT CONTAINER
function toggleMultiselect(show) {
  const multiselectWrapper = document.getElementById('multiselectWrapper');
  
  if (show) {
    multiselectWrapper.style.display = 'block'; // Show both title and buttons
    generateButtons(); // Populate the multiselect
  } else {
    multiselectWrapper.style.display = 'none'; // Hide the multiselect container
  }
}

// GENERATE DEATH BY CAUSE BUTTONS
function generateButtons() {
  fetch(dataSource)
    .then(response => response.text())
    .then(csvText => {
      const parsedData = d3.csvParse(csvText);
      const deathsByCauseData = parsedData.filter(d => d.metric === "Deaths by cause");
      
      // Calculate total value for each cause
      const causeTotals = {};
      deathsByCauseData.forEach(d => {
        if (!causeTotals[d.submetric]) {
          causeTotals[d.submetric] = 0;
        }
        causeTotals[d.submetric] += +d.value; 
      });

      // Sort the causes by their total values and get the top 3
      const topCauses = Object.keys(causeTotals)
        .sort((a, b) => causeTotals[b] - causeTotals[a]) 
        .slice(0, 3); // Take the top 3

      const uniqueCauses = [...new Set(deathsByCauseData.map(d => d.submetric))];
      const buttonContainer = document.getElementById('buttonContainer');
      
      buttonContainer.innerHTML = ""; 

      uniqueCauses.forEach((cause) => {
        const button = document.createElement('button');
        button.textContent = cause;
        button.setAttribute('data-cause', cause); 
        button.classList.add('cause-button'); 

        if (topCauses.includes(cause)) {
          button.classList.add('selected');
        }

        button.addEventListener('click', function () {
          this.classList.toggle('selected');
          updateChart();
        });

        buttonContainer.appendChild(button);
      });

      updateChart();
    });
}

// GET SELECTED CAUSES FROM BUTTONS
function getSelectedCauses() {
  const selectedButtons = document.querySelectorAll('.cause-button.selected');
  return Array.from(selectedButtons).map(button => button.getAttribute('data-cause'));
}

// DYNAMICALLY ADJUST MARGIN WHEN ALL CAUSES ARE CHOSEN
function adjustMarginBasedOnCauses() {
  const selectedCauses = getSelectedCauses(); 
  const baseMargin = 20; 
  const additionalMargin = selectedCauses.length * 5;
  const totalMargin = baseMargin + additionalMargin;
  
  document.querySelector('.ddc-copy').style.marginTop = `${totalMargin}px`;
}


// UPDATE CHART BASED ON SELECTED BUTTONS
function updateChart() {
  const selectedCauses = getSelectedCauses();

  drawChart('#ddc', 'Deaths by cause', 'Deaths', true, 'alternative', selectedCauses);
  adjustMarginBasedOnCauses(); // Adjust margin based on selection

  // document.getElementById('deaths-by-cause').classList.remove('hide')
}
