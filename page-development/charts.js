console.log("JS running");

/*
 Stuff to do in here:
    - Add data to data file, one chart at a time
    - Add event listeners to vary button highlight on click
    - Figure out padding so that the x-axis doesn't change based on label
    - Add variable tickSize to x-axis legend so that Q1 is emphasized
    - thicken stroke on hover
    - Remove actions before demoing
*/

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
      fontSize: 14,
      font: "sans-serif",
      baseline: "top",
      dy: -10,
      subtitleFontSize: 13,
    },
    config: {
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
          "[quarter(datum.value) === 1 ? timeFormat(datum.value, '%Y') : 'Q' + quarter(datum.value)]",
      },
      axisY: { tickCount: 2 },
      legend: {
        disable: true,
      },
    },
    data: {
      url: "https://gist.githubusercontent.com/mmontesanonyc/f3a9644eadb36e2d00b71721b165d681/raw/3419dd6471561dd91f5a4e9c675e733b5db18f0f/ovs.csv",
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

drawChart("#bbd", "Total births", "Number of births", false);
