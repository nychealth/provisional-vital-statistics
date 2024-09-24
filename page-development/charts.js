
/*
 Stuff to do in here:
    - Add data to data file, one chart at a time
    - Figure out padding so that the x-axis doesn't change based on label
    - Add variable tickSize to x-axis legend so that Q1 is emphasized
    - thicken stroke on hover
    - Remove actions before demoing
*/


// MAIN CHART-DRAWING FUNCTION
async function drawChart(destination, metric, label, multi, tooltip, schemaFlag = "default", selectedCauses = []) {
  /*
        Arguments:
            - destination: the ID of the vis container
            - metric is a string that filters the data: eg, 'Total births' or 'By maternal age'
            - label is a string that determines the chart's subtitle/y-axis label
            - multi is a true/false: false sets fill, true inserts the 'color' mark property on encoding
            - tooltip is a string that determines the label in the tooltip
            - schemaFlag (optional) is a string that determines which schema to use. Defaults to "default".
            - selectedCauses: array of selected causes for dynamic filtering.

   */

  // INITIALIZE VARIABLES
  let fillColor = multi === false ? "#f3f3f3" : "#f3f3f300";
  let subSeries = multi === false ? "" : "submetric";
  let tooltipLabel = tooltip ? tooltip : "";
  let tooltipField = tooltip ? "submetric" : "";

  // DEFAULT SCHEMA
  var spec1 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "",
    height: 250,
    width: "container",
    title: {
      text: label,
      subtitlePadding: 10,
      fontWeight: "normal",
      anchor: "start",
      fontSize: 12,
      font: "sans-serif",
      baseline: "top",
      dy: -10,
      subtitleFontSize: 13,
    },
    config: {
      range: {
        category: [
          "#003f5c",
          "#374c80",
          "#7a5195",
          "#bc5090",
          "#ef5675",
          "#ff764a",
          "#ffa600"
        ]
    },
      view: { stroke: null },
      axisX: {
        labelAngle: 0,
        grid: false,
        tickSize: {
          condition: {
            test: { field: "value", timeUnit: "quarter", equal: 1 },
            value: 15,
          },
          value: 9,
        },
        tickWidth: {
          condition: {
            test: { field: "value", timeUnit: "quarter", equal: 1 },
            value: 1.25,
          },
          value: 0.5,
        },
        labelExpr:
          "[quarter(datum.value) === 1 ? timeFormat(datum.value, '%Y') + ' Q' + quarter(datum.value) : 'Q' + quarter(datum.value)]",
      },
      axisY: { tickCount: 2 },
      legend: {
        disable: true,
      },
    },
    data: {
      url: "../data.csv",
    },
    transform: [
      { filter: `datum.metric === '${metric}'` },
      {
        calculate:
          "quarter(datum.date) === 1 ? year(datum.date) : 'Q' + quarter(datum.date)",
        as: "axisLabel",
      },
    ],
    layer: [
      {
        mark: { type: "area", color: fillColor },
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "value", type: "quantitative" },
        },
      },
      {
        mark: { type: "line", point: { filled: false, fill: "white" } },
        encoding: {
          x: {
            timeUnit: "quarteryear",
            field: "date",
            title: "",
            axis: { zindex: 1 },
            scale: { padding: 30 },
          },
          y: {
            field: "value",
            type: "quantitative",
            title: "",
            axis: { zindex: 1 },
          },
          color: { field: `${subSeries}`, type: "nominal", title: "" },
          tooltip: [
            { title: "Quarter", field: "date", timeUnit: "quarteryear" },
            { title: `${label}`, field: "value", format: "," },
            { title: `${tooltip}`, field: `${tooltipField}` },
          ],
        },
      },
      {
        mark: { type: "text", align: "left", dx: 5 },
        encoding: {
          x: { aggregate: "max", timeUnit: "quarteryear", field: "date" },
          y: { aggregate: { "argmax": "date" }, field: "value", type: "quantitative" },
          text: { field: "submetric", type: "nominal" },
          color: { field: "submetric", type: "nominal" },
        },
      },
    ],
  };

  // AlT SCHEMA
  const spec2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "",
    "height": 250,
    "width": "container",
    "title": {
      "text": label,
      "subtitlePadding": 10,
      "fontWeight": "normal",
      "anchor": "start",
      "fontSize": 12,
      "font": "sans-serif",
      "baseline": "top",
      "dy": -10,
      "subtitleFontSize": 13
    },
    "config": {
      "view": { "stroke": null },
      "axisX": {
        "labelAngle": 0,
        "grid": false,
        "tickSize": {
          "condition": {
            "test": { "field": "value", "timeUnit": "quarter", "equal": 1 },
            "value": 15
          },
          "value": 9
        },
        "tickWidth": {
          "condition": {
            "test": { "field": "value", "timeUnit": "quarter", "equal": 1 },
            "value": 1.25
          },
          "value": 0.5
        },
        "labelExpr": "[quarter(datum.value) === 1 ? timeFormat(datum.value, '%Y') + ' Q' + quarter(datum.value) : 'Q' + quarter(datum.value)]"
      },
      "axisY": { "tickCount": 2 },
      "legend": {
        "disable": true
      }
    },
    "data": {
      "url": "../data.csv",
      "format": { "type": "csv" }
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
      }
    ],    
    "layer": [
      {
        "mark": "line",
        "encoding": {
          "x": { "field": "date", "type": "temporal", "title": "Date" },
          "y": { "field": "value", "type": "quantitative", "title": "Deaths" },
          "color": { "field": "submetric", "type": "nominal", "title": "Cause of Death" }
        }
      },
      {
        "mark": { "type": "text", "align": "left", "dx": 5 },
        "encoding": {
          "x": { "aggregate": "max", "field": "date", "type": "temporal" },
          "y": { "aggregate": { "argmax": "date" }, "field": "value", "type": "quantitative" },
          "text": { "field": "submetric", "type": "nominal" },
          "color": { "field": "submetric", "type": "nominal" }
        }
      }
    ]
  };
  

  const chosenSpec = schemaFlag === "alternative" ? spec2 : spec1;

  try {
    // RUN VEGA EMBED
    await vegaEmbed(destination, chosenSpec, { actions: true });
  } catch (error) {
    console.log('Error embedding chart:', error);
  }
}




// CREATE CHART CONFIGS

const chartConfigs = [
  { destination: '#bbd', metric: 'Total births', label: 'Births', multi: false, schemaFlag: "default" },
  { destination: '#bbc', metric: 'By method', label: 'Percent of births', multi: true, schemaFlag: "default" },
  { destination: '#dim', metric: 'IMR', label: 'Infant mortality rate (per 1,000 live births)', multi: false, schemaFlag: "default" },
  { destination: '#ddc', metric: 'Deaths', label: 'Deaths', multi: false, schemaFlag: "alternative"  },
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


// GENERATE CHECKBOXES FOR DEATH BY CAUSE DROPDOWN
function generateCheckboxes() {
  fetch('../data.csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = d3.csvParse(csvText);
      const deathsByCauseData = parsedData.filter(d => d.metric === "Deaths by cause");
      const uniqueCauses = [...new Set(deathsByCauseData.map(d => d.submetric))];
      const checkboxContainer = document.getElementById('checkboxContainer');
      
      checkboxContainer.innerHTML = "";

      uniqueCauses.forEach((cause, index) => {
        const checkboxId = `cause${index + 1}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = cause;
        checkbox.checked = index < 5; // Check first 5 causes by default
        
        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.innerText = cause;

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);

        // EVENT LISTENER TO UPDATE CHART BASED ON SELECTION
        checkbox.addEventListener('change', function() {
          const selectedCauses = getSelectedCauses();
          drawChart('#ddc', 'Deaths', 'Deaths', true, "", 'alternative', selectedCauses); 
        });
      });

      // DRAW CHART WITH TOP 5 CAUSES OF DEATH
      const initialSelection = uniqueCauses.slice(0, 5); 
      drawChart('#ddc', 'Deaths', 'Deaths', true, "", 'alternative', initialSelection);
    });
}

// CHOOSE CAUSES BASED ON SELECTION
function getSelectedCauses() {
  const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
  return Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
}

function toggleCauseDropdown(show) {
  const dropdown = document.getElementById('causeDropdown');
  dropdown.style.display = show ? 'inline-block' : 'none';
}

document.querySelectorAll('.mort').forEach((element) => {
  element.addEventListener('click', function(e) {
    if (e.target.innerText.includes('Cause')) {
      toggleCauseDropdown(true);
      generateCheckboxes(); 
    } else {
      toggleCauseDropdown(false);
    }
  });
});



/* ALT SPEC WITH BETTER HOVER & LABELLING? (NOT FUNCTIONALIZED)
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "",
  "height": 250,
  "width": "container",
  "title": {
    "text": "Births, by maternal age",
    "subtitlePadding": 10,
    "fontWeight": "normal",
    "anchor": "start",
    "fontSize": 12,
    "font": "sans-serif",
    "baseline": "top",
    "dy": -10,
    "subtitleFontSize": 13
  },
  "config": {
    "range": {
      "category": [
        "#003f5c",
        "#374c80",
        "#7a5195",
        "#bc5090",
        "#ef5675",
        "#ff764a",
        "#ffa600"
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
      "tickCount": 3,
      "orient": "right"
      // "offset": 50
      },
    "legend": {"disable": true}
  },
  "data": {
    "url": "https://gist.githubusercontent.com/mmontesanonyc/97dcb574a506a596da437c34a0f6257f/raw/00fe25c603d4e9977e0a743f06cdbf5d734fe443/ovs.csv"
  },
  "transform": [
        {"filter": "datum.metric === 'By maternal age'"},
    {
      "calculate": "format(datum.value, ',') + ' per 100,000 adults'",
      "as": "valueWithDisplay"
    },
    
  ],
  "encoding": {
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
          "title": "",
          "axis": {"zindex": 1}
        },
    "color": {
      "condition": {
        "param": "hover",
        "field": "submetric",
        "type": "nominal",
        "legend": null
      },
      "value": "gray"
    },
    "opacity": {"condition": {"param": "hover", "value": 1}, "value": 0.35},
        "tooltip": [
          {"title": "Quarter", "field": "date", "timeUnit": "quarteryear"},
          {"title": "Births", "field": "value", "format": ","},
          {"title": "Group", "field": "submetric"}
        ]
  },
  "layer": [
    {
      "description": "Transparent layer to easier trigger hover",
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
      "mark": {"type": "line", "stroke": "transparent", "strokeWidth": 10}
    },
    {"mark": {"type": "line", "point": {"size": 70}}},
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
        "text": {"field": "submetric", "type": "nominal"},
        "color": {"field": "submetric", "type": "nominal"}

      },
      "mark": {"type": "text", "align": "right", "dx": -8}
    }
  ]
}


*/
