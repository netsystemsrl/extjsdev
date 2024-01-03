import _ from 'underscore';

const ElementUtils = {

  commonDef: {
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    visible: true
  },

  builtInDefs: {
    text: {
      type: "text",
      text: "Text",
      fit_content: "vertical"
    },
    box: {
      type: 'box'
    },
    image: {
      type: 'image',
      url: ''
    },
    subreport: {
      type: 'subreport'
    },
    chart_line: {
      type: 'chart_line',
      series: [{ 
        value_field: null
      }],
      x_axis: {
        label_field: null
      }
    },
    chart_pie: {
      type: 'chart_pie'
    },
    chart_bar: {
      type: 'chart_bar',
      series: [{ 
        value_field: null
      }],
      x_axis: {
        label_field: null
      }
    },
    break: {

    },
    barcode: {

    }
  },

  getDefaultDef: (typeName) => {
    return _.extend({}, ElementUtils.commonDef, ElementUtils.builtInDefs[typeName]);
  }
}

export default ElementUtils;
