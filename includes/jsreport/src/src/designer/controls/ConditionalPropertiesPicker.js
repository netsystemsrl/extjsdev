import { PropTypes } from '../../elements/ReportElement';
import _ from 'underscore';
import Textarea from 'textcomplete/lib/textarea';
import Textcomplete from 'textcomplete/lib/textcomplete';

// TODO fix build step to allow css files outside of /styles and move this file here
require('../../styles/ConditionalPropertiesPicker.css');

const operators = [
  ['is', 'is equal to'],
  ['isnot', 'is not equal to'],
  ['contains', 'contains'],
  ['doesnotcontain', 'does not contain'],
  ['gt', 'is greater than', 'number'],
  ['lt', 'is less than', 'number'],
  ['gte', 'is greater than or equal to', 'number'],
  ['lte', 'is less than or equal to', 'number'],
  ['before', 'is before', 'date'],
  ['after', 'is after', 'date'],
  ['onorbefore', 'is on or before', 'date'],
  ['onorafter', 'is on or after', 'date'],
];

const defaultCondition = {
  field: '',
  operator: '',
  operand: ''
};

const defaultEffect = {
  property: '',
  value: ''
};

const defaultRule = {
  conditions: [ defaultCondition ],
  effects: [ defaultEffect ]
};

const ownSelect2DropDownClass = 'jsr-condprops-select2-dropdown';
const select2DropDownCssClass = `jsr-select2-dropdown ${ownSelect2DropDownClass}`;

const supportedPropertyTypes = [
  PropTypes.string,
  PropTypes.boolean,
  PropTypes.number,
  PropTypes.color,
  PropTypes.font
];

/** Generic function to enable Select2 to support freely-entered text */
const createSearchChoice = (term, data) => {
  if (data.filter(existing => 
    existing.text.localeCompare(term) === 0).length === 0
  ) {
      return { id: term, text: term };
  }
}

const select2DefaultConfig = {
  createSearchChoice: createSearchChoice,
  allowClear: true,
  placeholder: 'Enter a value',
  dropdownAutoWidth: true,
  dropdownCssClass: select2DropDownCssClass
};

const getTextSuggestions = (schema) => {
    if (!schema) return [];
    const fields = jsreports.elements.Text.getTextSuggestions(schema);
    /** Fields can include dot-separated object properties.  We split on the dot and only suggest one piece at a time,
        so we need to maintain a nested lookup level-by-level.  Keep pointers to all lists so we can sort them later. */
    const getEmptyNode = () => ({ list: [], dict: {} });
    let autoCompleteData = getEmptyNode();
    const listsToSort = [ autoCompleteData.list ];
    fields.forEach(fieldName => {
        if (fieldName[0] === '[' && fieldName[fieldName.length - 1] === ']') {
            const parts = fieldName.replace(/[\[\]]/g, '').split('.');
            let part, 
                node = autoCompleteData;
            for (let i = 0; i < parts.length; i++) {
                let part = parts[i];
                if (node.dict[part] !== undefined) {
                    node = node.dict[part];
                } else {
                    // Must convert e.g. [partA.partB.partC] -> [partA]
                    node.list.push(part);
                    node.dict[part] = node = getEmptyNode();
                    listsToSort.push(node.list);
                }
            }
        } else {
            // Not brackets, push verbatim
            autoCompleteData.list.push(fieldName);
        }
    });
    listsToSort.forEach(list => list.sort());
    return autoCompleteData;
};

const initTextComplete = ($textarea, schema, onChangeHandler) => {

  const autoCompleteOptions = getTextSuggestions(schema);
  let lastAutocompleteWasSubkey = false;

  const getSubKeys = (autocompleteData, objPath) => {
      const parts = objPath.split('.')
      let node = autocompleteData;
      for (let i = 0; i < parts.length; i++) {
          node = node.dict[parts[i]];
          if (!node) return [];
      }
      return node.list;
  }

  const autocompleteStrategy = {
    id: 'textAutocompleteStrategy',
    match: /(^|\s)([\w\-\.]*)$/,
    search: (term, callback) => {
      if (term[term.length - 1] === '.') {
          lastAutocompleteWasSubkey = true;
          return callback(getSubKeys(autoCompleteOptions, term.substr(0, term.length - 1)));
      }
      lastAutocompleteWasSubkey = false;
      callback(autoCompleteOptions.list.filter(function(name) {
        return name.startsWith(term);
      }));
    },
    template: (name) => {
      return name;
    },
    replace: (name) => {
      return lastAutocompleteWasSubkey ? `$1$2${name}` : ('$1' + name);
    }
  };

  const editor = new Textarea($textarea[0]);
  const textcomplete = new Textcomplete(editor, {
      dropdown: {
          maxCount: Infinity
      }
  });
  $textarea.data('textcomplete', textcomplete);
  textcomplete.register([ autocompleteStrategy ]);
  // $textarea.on('focus', this.onToolbarTextInputFocus.bind(this));
  // $textarea.on('blur', this.onToolbarTextInputBlur.bind(this));
  $textarea.on('change', (evt) => {
      onChangeHandler(evt.target.value);
      // this.onElementEdit();
  });
};

/**
 * Designer toolbar picker for specifying rules that modify
 * an element's properties based on conditional expressions evaluated at runtime
 */
class ConditionalPropertiesPicker {

  constructor(elementPropTypes, elementContext, getAllowedOperators) {
    this.propTypes = this.filterPropTypes(elementPropTypes);
    this.context = elementContext;
    this.rules = [];
    this.allowedOperators = operators;
    if (getAllowedOperators) {
      const allowedOperatorNames = getAllowedOperators();
      this.allowedOperators = this.allowedOperators.filter(operator => allowedOperatorNames.indexOf(operator[0]) >= 0);
    }
  }

  /** Only support primitive and "oneOf" types */
  filterPropTypes(allTypes) {
    const filteredProps = {};
    _.each(allTypes, (propType, propKey) => {
      if (propType && (supportedPropertyTypes.indexOf(propType) >= 0 
        || propType.type === 'oneOf')) {
        filteredProps[propKey] = propType;
      }
    });
    return filteredProps;
  }

  /** Open in popup mode next to an anchor element */
  showPopup(anchorEl) {
    if (!this.popup) {
      this.popup = $(`<div class="jsr-cond-prop-popup"></div>`);
      this.popup.append(`<div class="jsr-cond-prop-popup-arrow"></div>`);
      $(document.body).append(this.popup);
    }
    const screenHeight = $(window).height();
    const screenWidth = $(window).width();
    const anchorOffset = $(anchorEl).offset();
    // Make visible for measurement
    this.popup.css({
      display: 'block',
      visibility: 'hidden'
    });
    this.render(this.popup[0]);
    // Now measure and position correctly
    const anchorMiddle = anchorOffset.left + ($(anchorEl).outerWidth() / 2);
    const popupLeft = Math.max(10, anchorMiddle - (this.popup.width() / 2));
    const popupTop = Math.max(0, anchorOffset.top + $(anchorEl).outerHeight() + 3);
    const arrowLeft = Math.max(4, anchorMiddle - popupLeft - 7);
    this.popup.css({
      left: `${popupLeft}px`,
      top: `${popupTop}px`,
      // TODO: constrain to viewport
      visibility: 'visible'
    });
    this.popup.find('.jsr-cond-prop-popup-arrow').css('left', `${arrowLeft}px`);
    this.popup.find('.jsr-cond-prop-picker').css('max-height', `${Math.max(400, screenHeight - popupTop - 50)}px`);
    // Stop clicks on elements within the picker from triggering a body click blur
    this.popup.on('click', (evt) => { evt.stopPropagation(); });
    this.isOpen = true;
    setTimeout(() => {
      $(document.body).on({
        'click': this.onBodyClick.bind(this),
        'resize': this.onWindowResize.bind(this)
      });
    }, 0);
  }

  onBodyClick(evt) {
    if (this.isOpen) {
      // If this is a click-out that's closing one of our own select2 sub-popups, don't close whole picker
      // (We have to check here because of how the select2 mask works)
      if ($(`.${ownSelect2DropDownClass}.select2-drop-active`).length > 0) return;
      this.forceClose();
    }
  }

  onWindowResize(evt) {
    if (this.isOpen) {
      this.forceClose();
    }
  }

  /** 
   * Close the picker.  Called directly by the designer when a different element
   * is selected; also called internally when a click is detected outside the
   * picker.  Prompts to save any changes.
   */
  forceClose() {
    // TODO don't prompt if no actual changes (can diff the JSON)
    // TODO always saving for now (revisit later)
    // if (confirm(`Save changes to conditional properties?`)) {
      $(this).trigger('save', [ this.rules ]);
    // }
    this.popup.hide();
    this.isOpen = false;
    // FIXME stop using jquery for events - if a method has same name as event, it will call it
    // FIXME which is why this method is named forceClose instead of close
    $(this).trigger('close');
  }

  render(containerDomEl) {
    this.container = containerDomEl;
    const $container = $(containerDomEl);
    let $wrap = $container.find(`.jsr-cond-prop-picker`);
    if ($wrap.length === 0) {
      $wrap = $(`<div class="jsr-cond-prop-picker"></div>`);
      $container.append($wrap);
    }
    $wrap.empty();
    const $rules = $(`<div class="jsr-cond-prop-rules"></div>`);
    $wrap.append($rules);
    if (this.rules.length === 0) {
      $wrap.append(`<div class="jsr-cond-prop-picker-empty-text">No conditional rules defined.</div>`);
    } else {
      this.rules.forEach(rule => $rules.append(this.renderRule(rule)));
    }
    $wrap.append(`
      <div class="jsr-cond-prop-picker-controls">
        <a class="jsr-cond-prop-add-rule" href="javascript:;" role="button">Add a rule</a>
        <button class="jsr-btn jsr-cond-prop-close-btn">Close</button>
      </div>
    `);
    $wrap.find('.jsr-cond-prop-picker-controls a.jsr-cond-prop-add-rule').click(e => this.addRule());
    $wrap.find('.jsr-cond-prop-close-btn').click(this.forceClose.bind(this));
  }

  /** A rule is the top-level grouping, a set of conditions plus a set of effects */
  renderRule(rule) {
    const $rule = $(`<div class="jsr-cond-prop-rule"></div>`);
    $rule.append(`<div>When...<div class="jsr-cond-prop-delete-rule jsr-cond-prop-delete-button"></div></div>`);
    const $conds = $(`<div class="jsr-cond-prop-conditions"></div>`);
    $rule.append($conds);
    rule.conditions.forEach((cond, ix) => {
      if (ix > 0) {
        $rule.find('.jsr-cond-prop-condition:last-child').append(`<span>and</span>`);
      }
      $conds.append(this.renderCondition(rule, cond));
    });
    $rule.append(`<div>then set:</div>`);
    const $effects = $(`<div class="jsr-cond-prop-effects"></div>`);
    $rule.append($effects);
    rule.effects.forEach(effect => $effects.append(this.renderEffect(rule, effect)));
    const $addEffect = $(`<div class="jsr-cond-prop-add-effect"><a href="javascript:;" role="button">+</a></div>`);
    $rule.find('.jsr-cond-prop-effect:last-child').append($addEffect);
    $addEffect.click(e => this.addEffect(rule));
    $rule.find('.jsr-cond-prop-delete-rule').on('click', this.deleteRule.bind(this, rule));
    return $rule;
  }

  /** Conditions come under the When... section, e.g. "[category] [is equal to] [apparel]" */
  renderCondition(rule, cond) {
    let fields = this.getDataFields().map(f => f.name);
    const $cond = $(`<div class="jsr-cond-prop-condition"></div>`);

    // ---
    // const $fieldSelect = $(`<select></select>`);
    // fields.forEach(field => $fieldSelect.append(`<option value="${field}">${field}</option>`));
    // $cond.append($fieldSelect);
    // $fieldSelect.val(cond.field)
    //   .select2(_.extend({}, select2DefaultConfig, {
    //     placeholder: 'Select a data field',
    //     createSearchChoice: undefined,
    //     formatNoMatches: (term) => 'No data fields. Check that element is in a data section.'
    //   }));
    // $fieldSelect.on('change', e => {
    //   cond.field = $(e.target).val();
    // });
    const $textarea = $(`<textarea type="text" class="jsr-cond-prop-field"></textarea>`);
    $textarea.val(cond.field);
    $cond.append($textarea);
    initTextComplete.call(this, $textarea, this.context.schema, (newValue) => {
      cond.field = newValue;
    });

    const $operatorInput = $(`<input type="text" />`);
    $cond.append($operatorInput);
    $operatorInput.val(cond.operator)
      .select2(_.extend({}, select2DefaultConfig, { 
        data: this.allowedOperators.map(op => ({ id: op[0], text: op[1] }))
      }));
    $operatorInput.on('change', e => {
      cond.operator = $(e.target).val();
    }); 
    const $operandInput = $(`<input type="text" />`);
    $cond.append($operandInput);
    $operandInput.val(cond.operand)
      .select2(_.extend({}, select2DefaultConfig, {
        query: this.valueInputQuery.bind(this),
        initSelection: this.valueInputInitSelection.bind(this)
      }));
    $operandInput.on('change', e => {
      cond.operand = $(e.target).val();
    });
    // Add button
    const $addCond = $(`<div class="jsr-cond-prop-add-condition"><a href="javascript:;" role="button">+</a></div>`);
    $cond.append($addCond);
    $addCond.click(e => this.addCondition(rule));
    // Delete button
    $cond.append(`<div class="jsr-cond-prop-delete-button"></div>`);
    $cond.find(`.jsr-cond-prop-delete-button`).click(e => this.deleteCondition(rule, cond));
    return $cond;
  }

  /** 
   * Convert 'snake_case' and 'camelCase' to 'Snake case' and 'Camel case'
   */
  capitalizePropertyName(propKey) {
    const spaced = propKey.replace(/_/g, ' ')
      .replace(/([A-Z])/g, (_, capitalLetter) => ` ${capitalLetter.toLowerCase()}`);
    return spaced[0].toUpperCase() + spaced.substr(1);
  }

  renderEffect(rule, effect) {
    // TODO get correct display names for properties, somehow - should be defined by elt
    // TODO fall back to capitalization logic
    const propNames = Object.keys(this.propTypes);
    propNames.sort();
    const props = propNames.map(propKey => 
      ({ key: propKey, name: this.capitalizePropertyName(propKey) }));
    const $eff = $(`<div class="jsr-cond-prop-effect"></div>`);
    const $propSelect = $(`<select></select>`);
    $propSelect.append(props.map(prop => $(`<option value="${prop.key}">${prop.name}</option>`)));
    $eff.append($propSelect);
    $propSelect.val(effect.property);
    $propSelect.select2(_.extend({}, select2DefaultConfig, {
      placeholder: 'Select a property',
      createSearchChoice: undefined
    }));
    $propSelect.on('change', e => {
      effect.property = $(e.target).val();
      effect.value = '';
      this.refresh();
    });         
    $eff.append(`<div>to</div>`);
    const $effectValueWrap = $(`<div></div>`);
    $eff.append($effectValueWrap);
    this.renderEffectValueInput($effectValueWrap, effect);
    $eff.append(`<div class="jsr-cond-prop-delete-button"></div>`);
    $eff.find(`.jsr-cond-prop-delete-button`).click(e => this.deleteEffect(rule, effect));
    return $eff;
  }

  renderEffectValueInput($container, effect) {
    const propType = this.propTypes[effect.property || ''] || 'string';
    switch (propType) {
      case PropTypes.color:
        const $colorInput = $(`<input type="text" />`);
        $colorInput.val(effect.value);
        $container.append($colorInput);
        $colorInput.spectrum({
            color: effect.value || '',
            showPalette: true,
            palette: this.colorPalette,
            showAlpha: false,
            allowEmpty: false,
            showInput: true,
            change: (color) => {
              effect.value = (color === null ? "transparent" : color.toHexString());
            }
        });      
        break;
      case PropTypes.number:
        const $numberInput = $(`<input type="text" />`);
        $numberInput.val(effect.value);
        $container.append($numberInput);
        $numberInput.on('change', e => {
          const strVal = $(e.target).val();
          const numeric = Number(strVal);
          // Save as number if numeric; otherwise leave as string (for formulas)
          effect.value = isNaN(numeric) ? strVal : numeric;
        });
        break;
      case PropTypes.boolean:
        const $valInput = $(`<input type="text" />`);
        $valInput.val(effect.value);
        $container.append($valInput);
        $valInput.select2(_.extend({}, select2DefaultConfig, {
          data: [{id:'true', text: 'true'},{id:'false', text: 'false'}],
        }));
        $valInput.on('change', e => {
          effect.value = ($(e.target).val() === 'true');
        });
        break;
      case PropTypes.font:
        const $fontSelect = $(`<select></select>`);
        const selectedFont = effect.value;
        $fontSelect.append(this.fonts.map(font => $(`<option value="${font.name}">${font.name}</option>`)));
        $fontSelect.val(selectedFont && selectedFont.name ? selectedFont.name : '');
        $container.append($fontSelect);
        $fontSelect.select2(_.extend({}, select2DefaultConfig, {
          placeholder: 'Select a font',
          createSearchChoice: undefined
        }));
        $fontSelect.on('change', e => {
          const fontName = $(e.target).val();
          const fontNameLower = fontName.toLowerCase();
          let css = '';
          if (fontName != "default") {
              css = this.fonts.filter(function(font) {
                  return (font.name.toLowerCase() === fontNameLower);
              })[0].css;
          }
          effect.value = { name: fontName, css: css };
        });          
        break;
      default:
        if (propType.type === 'oneOf') {
          const $valSelect = $(`<select></select>`);
          $valSelect.append(propType.values.map(opt => $(`<option value="${opt}">${opt}</option>`)));
          $valSelect.val(effect.value);
          $container.append($valSelect);
          $valSelect.select2(_.extend({}, select2DefaultConfig, {
            placeholder: 'Select an option',
            /** For OneOf, limited to options in list */
            createSearchChoice: undefined
          }));
          $valSelect.on('change', e => {
            effect.value = $(e.target).val();
          });          
        } else {
          // Default is string input
          const $valInput = $(`<input type="text" />`);
          $valInput.val(effect.value);
          $container.append($valInput);
          $valInput.select2(_.extend({}, select2DefaultConfig, {
            query: this.valueInputQuery.bind(this),
            initSelection: this.valueInputInitSelection.bind(this),
            /** Provide the list of data fields as suggestions */
            data: this.getDataFields().map(
              f => ({ id: `[${f.name}]`, text: `[${f.name}]` }))
          }));
          $valInput.on('change', e => {
            effect.value = $(e.target).val();
          });          
        }
    }
  }

  deleteRule(rule) {
    if (confirm('Are you sure you want to remove this rule with all of its conditions and effects?')) {
      this.rules.splice(this.rules.indexOf(rule), 1);
      this.refresh();
    }
  }

  addRule() {
    this.rules.push(JSON.parse(JSON.stringify(defaultRule)));
    this.refresh();
  }

  addEffect(rule) {
    rule.effects.push(JSON.parse(JSON.stringify(defaultEffect)));
    this.refresh();
  }

  addCondition(rule) {
    rule.conditions.push(JSON.parse(JSON.stringify(defaultCondition)));
    this.refresh();
  }

  deleteEffect(rule, effect) {
    if (!confirm(`Delete this effect?`)) return;
    rule.effects.splice(rule.effects.indexOf(effect), 1);
    this.refresh();
  }

  deleteCondition(rule, cond) {
    if (!confirm(`Delete this condition?`)) return;
    rule.conditions.splice(rule.conditions.indexOf(cond), 1);
    this.refresh();
  }

  refresh() {
    this.render(this.container);
  }

  valueInputQuery(options) {
    options.callback({
      more: false,
      results: this.getDataFields().map(
        f => ({ id: `[${f.name}]`, text: `[${f.name}]` }))
    });
  }

  getDataFields() {
    return (this.context && this.context.schema) ? 
      this.context.schema.fields : [];
  }

  valueInputInitSelection(element, callback) {
    const selectedVal = element.val();
    callback({ id: selectedVal, text: selectedVal });
  }

  setValue(val) {
    this.rules = val || [];
  }

  getValue() {
    return this.rules;
  }

  setColorPalette(palette) {
    this.colorPalette = palette;
  }

  setFonts(fonts) {
    this.fonts = fonts;
  } 
}

export default ConditionalPropertiesPicker;
