/*! vue-number-input v2.0.1 | (c) 2018-present Chen Fengyuan | MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
  typeof define === 'function' && define.amd ? define(['vue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueNumberInput = factory(global.Vue));
})(this, (function (vue) { 'use strict';

  const isNaN$1 = Number.isNaN || window.isNaN;
  const REGEXP_NUMBER = /^-?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/;
  const REGEXP_DECIMALS = /\.\d*(?:0|9){10}\d*$/;
  const normalizeDecimalNumber = (value, times = 100000000000) => (REGEXP_DECIMALS.test(String(value)) ? (Math.round(value * times) / times) : value);
  var script = vue.defineComponent({
      name: 'VueNumberInput',
      props: {
          attrs: {
              type: Object,
              default: undefined,
          },
          center: Boolean,
          controls: Boolean,
          disabled: Boolean,
          inputtable: {
              type: Boolean,
              default: true,
          },
          inline: Boolean,
          max: {
              type: Number,
              default: Infinity,
          },
          min: {
              type: Number,
              default: -Infinity,
          },
          name: {
              type: String,
              default: undefined,
          },
          placeholder: {
              type: String,
              default: undefined,
          },
          readonly: Boolean,
          rounded: Boolean,
          size: {
              type: String,
              default: undefined,
          },
          step: {
              type: Number,
              default: 1,
          },
          modelValue: {
              type: Number,
              default: NaN,
          },
      },
      emits: [
          'update:modelValue',
      ],
      data() {
          return {
              value: NaN,
          };
      },
      computed: {
          /**
           * Indicate if the value is increasable.
           * @returns {boolean} Return `true` if it is decreasable, else `false`.
           */
          increasable() {
              return isNaN$1(this.value) || this.value < this.max;
          },
          /**
           * Indicate if the value is decreasable.
           * @returns {boolean} Return `true` if it is decreasable, else `false`.
           */
          decreasable() {
              return isNaN$1(this.value) || this.value > this.min;
          },
      },
      watch: {
          modelValue: {
              immediate: true,
              handler(newValue, oldValue) {
                  if (
                  // Avoid triggering change event when created
                  !(isNaN$1(newValue) && typeof oldValue === 'undefined')
                      // Avoid infinite loop
                      && newValue !== this.value) {
                      this.setValue(newValue);
                  }
              },
          },
      },
      methods: {
          isNaN: isNaN$1,
          /**
           * Change event handler.
           * @param {string} value - The new value.
           */
          change(event) {
              this.setValue(event.target.value);
          },
          /**
           * Paste event handler.
           * @param {Event} event - Event object.
           */
          paste(event) {
              const clipboardData = event.clipboardData || window.clipboardData;
              if (clipboardData && !REGEXP_NUMBER.test(clipboardData.getData('text'))) {
                  event.preventDefault();
              }
          },
          /**
           * Decrease the value.
           */
          decrease() {
              if (this.decreasable) {
                  let { value } = this;
                  if (isNaN$1(value)) {
                      value = 0;
                  }
                  this.setValue(normalizeDecimalNumber(value - this.step));
              }
          },
          /**
           * Increase the value.
           */
          increase() {
              if (this.increasable) {
                  let { value } = this;
                  if (isNaN$1(value)) {
                      value = 0;
                  }
                  this.setValue(normalizeDecimalNumber(value + this.step));
              }
          },
          /**
           * Set new value and dispatch change event.
           * @param {number} value - The new value to set.
           */
          setValue(value) {
              const oldValue = this.value;
              let newValue = typeof value !== 'number' ? parseFloat(value) : value;
              if (!isNaN$1(newValue)) {
                  if (this.min <= this.max) {
                      newValue = Math.min(this.max, Math.max(this.min, newValue));
                  }
                  if (this.rounded) {
                      newValue = Math.round(newValue);
                  }
              }
              this.value = newValue;
              if (newValue === oldValue) {
                  // Force to override the number in the input box (#13).
                  this.$refs.input.value = String(newValue);
              }
              this.$emit('update:modelValue', newValue, oldValue);
          },
      },
  });

  const _hoisted_1 = ["disabled"];
  const _hoisted_2 = ["name", "value", "min", "max", "step", "readonly", "disabled", "placeholder"];
  const _hoisted_3 = ["disabled"];

  function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (vue.openBlock(), vue.createElementBlock("div", {
      class: vue.normalizeClass(["vue-number-input", {
        'vue-number-input--inline': _ctx.inline,
        'vue-number-input--center': _ctx.center,
        'vue-number-input--controls': _ctx.controls,
        [`vue-number-input--${_ctx.size}`]: _ctx.size,
      }])
    }, [
      (_ctx.controls)
        ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "vue-number-input__button vue-number-input__button--minus",
            type: "button",
            tabindex: "-1",
            disabled: _ctx.disabled || _ctx.readonly || !_ctx.decreasable,
            onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.decrease && _ctx.decrease(...args)))
          }, null, 8 /* PROPS */, _hoisted_1))
        : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("input", vue.mergeProps({
        ref: "input",
        class: "vue-number-input__input"
      }, _ctx.attrs, {
        type: "number",
        name: _ctx.name,
        value: isNaN(_ctx.value) ? '' : _ctx.value,
        min: _ctx.min,
        max: _ctx.max,
        step: _ctx.step,
        readonly: _ctx.readonly || !_ctx.inputtable,
        disabled: _ctx.disabled || (!_ctx.decreasable && !_ctx.increasable),
        placeholder: _ctx.placeholder,
        autocomplete: "off",
        onChange: _cache[1] || (_cache[1] = (...args) => (_ctx.change && _ctx.change(...args))),
        onPaste: _cache[2] || (_cache[2] = (...args) => (_ctx.paste && _ctx.paste(...args)))
      }), null, 16 /* FULL_PROPS */, _hoisted_2),
      (_ctx.controls)
        ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 1,
            class: "vue-number-input__button vue-number-input__button--plus",
            type: "button",
            tabindex: "-1",
            disabled: _ctx.disabled || _ctx.readonly || !_ctx.increasable,
            onClick: _cache[3] || (_cache[3] = (...args) => (_ctx.increase && _ctx.increase(...args)))
          }, null, 8 /* PROPS */, _hoisted_3))
        : vue.createCommentVNode("v-if", true)
    ], 2 /* CLASS */))
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".vue-number-input[data-v-188efc8c]{display:block;font-size:0;max-width:100%;overflow:hidden;position:relative}.vue-number-input__button[data-v-188efc8c]{background-color:#fff;border:0;border-radius:.25rem;bottom:1px;position:absolute;top:1px;width:2.5rem;z-index:1}.vue-number-input__button[data-v-188efc8c]:focus{outline:none}.vue-number-input__button[data-v-188efc8c]:hover:after,.vue-number-input__button[data-v-188efc8c]:hover:before{background-color:#0074d9}.vue-number-input__button[data-v-188efc8c]:disabled{opacity:.65}.vue-number-input__button[data-v-188efc8c]:disabled:after,.vue-number-input__button[data-v-188efc8c]:disabled:before{background-color:#ddd}.vue-number-input__button[data-v-188efc8c]:after,.vue-number-input__button[data-v-188efc8c]:before{background-color:#111;content:\"\";left:50%;position:absolute;top:50%;transform:translate(-50%,-50%);transition:background-color .15s}.vue-number-input__button[data-v-188efc8c]:before{height:1px;width:50%}.vue-number-input__button[data-v-188efc8c]:after{height:50%;width:1px}.vue-number-input__button--minus[data-v-188efc8c]{border-bottom-right-radius:0;border-right:1px solid #ddd;border-top-right-radius:0;left:1px}.vue-number-input__button--minus[data-v-188efc8c]:after{visibility:hidden}.vue-number-input__button--plus[data-v-188efc8c]{border-bottom-left-radius:0;border-left:1px solid #ddd;border-top-left-radius:0;right:1px}.vue-number-input__input[data-v-188efc8c]{-moz-appearance:textfield;background-color:#fff;border:1px solid #ddd;border-radius:.25rem;display:block;font-size:1rem;line-height:1.5;max-width:100%;min-height:1.5rem;min-width:3rem;padding:.4375rem .875rem;transition:border-color .15s;width:100%}.vue-number-input__input[data-v-188efc8c]::-webkit-inner-spin-button,.vue-number-input__input[data-v-188efc8c]::-webkit-outer-spin-button{-webkit-appearance:none}.vue-number-input__input[data-v-188efc8c]:focus{border-color:#0074d9;outline:none}.vue-number-input__input[data-v-188efc8c]:disabled,.vue-number-input__input[readonly][data-v-188efc8c]{background-color:#f8f8f8}.vue-number-input--inline[data-v-188efc8c]{display:inline-block}.vue-number-input--inline>input[data-v-188efc8c]{display:inline-block;width:12.5rem}.vue-number-input--center>input[data-v-188efc8c]{text-align:center}.vue-number-input--controls>input[data-v-188efc8c]{padding-left:3.375rem;padding-right:3.375rem}.vue-number-input--small>input[data-v-188efc8c]{border-radius:.1875rem;font-size:.875rem;padding:.25rem .5rem}.vue-number-input--small.vue-number-input--inline>input[data-v-188efc8c]{width:10rem}.vue-number-input--small.vue-number-input--controls>button[data-v-188efc8c]{width:2rem}.vue-number-input--small.vue-number-input--controls>input[data-v-188efc8c]{padding-left:2.5rem;padding-right:2.5rem}.vue-number-input--large>input[data-v-188efc8c]{border-radius:.3125rem;font-size:1.25rem;padding:.5rem 1rem}.vue-number-input--large.vue-number-input--inline>input[data-v-188efc8c]{width:15rem}.vue-number-input--large.vue-number-input--controls>button[data-v-188efc8c]{width:3rem}.vue-number-input--large.vue-number-input--controls>input[data-v-188efc8c]{padding-left:4rem;padding-right:4rem}";
  styleInject(css_248z);

  script.render = render;
  script.__scopeId = "data-v-188efc8c";

  return script;

}));