
/*
 Stuff to do in here:
    - Add data to data file, one chart at a time
    - Figure out padding so that the x-axis doesn't change based on label
    - Add variable tickSize to x-axis legend so that Q1 is emphasized
    - thicken stroke on hover
    - Remove actions before demoing
*/


// MAIN CHART-DRAWING FUNCTION
function drawChart(destination, metric, label, multi, tooltip) {
  /*
        Arguments:
            - destination: the ID of the vis container
            - metric is a string that filters the data: eg, 'Total births' or 'By maternal age'
            - label is a string that determines the chart's subtitle/y-axis label
            - multi is a true/false: false sets fill, true inserts the 'color' mark property on encoding
            - tooltip is a string that determines the label in the tooltip

    */

  // INITIALIZE VARIABLES
  var fillColor;
  var subSeries;
  var tooltipLabel = "";
  var tooltipField = "";

  multi === false ? (fillColor = "#f3f3f3") : (fillColor = "#f3f3f300");
  multi === false ? (subSeries = "") : (subSeries = "submetric");

  if (tooltip) {
    tooltipLabel = tooltip;
    tooltipField = "submetric";
  } else {
    tooltipLabel = "";
    tooltipField = "";
  }

  // CHART SPEC
  var spec = {
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
            { title: "Births", field: "value", format: "," },
            { title: `${tooltip}`, field: `${tooltipField}` },
          ],
        },
      },
      {
        mark: { type: "text", align: "left", dx: 5 },
        encoding: {
          x: { aggregate: "max", timeUnit: "quarteryear", field: "date" },
          y: { aggregate: "max", field: "value", type: "quantitative" },
          text: { field: "submetric", type: "nominal" },
          color: { field: "submetric", type: "nominal" },
        },
      },
    ],
  };

  // RUN VEGA EMBED
  vegaEmbed(destination, spec, { actions: true });
  // vegaEmbed("#bbd",spec)
}

// INITIALIZE CHART DRAWS
drawChart("#bbd", "Total births", "Number of births", false);



// EVENT LISTENERS FOR EACH CHART SECTION
const demogElements = document.querySelectorAll('.byDemog');
demogElements.forEach((element) => {
  element.addEventListener('click', function() {
    demogElements.forEach(el => el.classList.remove('highlight'));
    this.classList.add('highlight');
  });
});

const birthChar = document.querySelectorAll('.birthChar');
birthChar.forEach((element) => {
  element.addEventListener('click', function() {
    birthChar.forEach(el => el.classList.remove('highlight'));
    this.classList.add('highlight');
  });
});

const infantMort = document.querySelectorAll('.infantMort');
infantMort.forEach((element) => {
  element.addEventListener('click', function() {
    infantMort.forEach(el => el.classList.remove('highlight'));
    this.classList.add('highlight');
  });
});

const mort = document.querySelectorAll('.mort');
mort.forEach((element) => {
  element.addEventListener('click', function() {
    mort.forEach(el => el.classList.remove('highlight'));
    this.classList.add('highlight');
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