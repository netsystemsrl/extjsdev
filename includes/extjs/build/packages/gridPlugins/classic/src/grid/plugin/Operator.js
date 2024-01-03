/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
/**
 * Plugin that will add an operator selection to a form field
 */
Ext.define('Ext.grid.plugin.Operator', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.operator',

    config: {
        /**
         * @cfg {String} operator
         * Default selected operator
         */
        operator: '=',
        /**
         * @cfg {String[]} operators
         *
         * Array of operators displayed in the operator selection menu
         *
         * Supported operators:
         *
         * - `=`
         * - `==`
         * - `!=`
         * - `!==`
         * - `>`
         * - `>=`
         * - `<`
         * - `<=`
         * - `like`
         * - `in`
         * - `notin`
         * - `empty`
         * - `nempty`
         * - `/=` -> regex
         *
         * More operators could be added via the `addOperator` method on the prototype of this class
         */
        operators: null
    },

    operatorCls: Ext.baseCSSPrefix + 'operator-button',
    triggerCls: Ext.baseCSSPrefix + 'form-trigger',

    operatorsIconsMap: {
        eq: Ext.baseCSSPrefix + 'operator-eq',
        ne: Ext.baseCSSPrefix + 'operator-neq',
        gt: Ext.baseCSSPrefix + 'operator-gt',
        ge: Ext.baseCSSPrefix + 'operator-gte',
        lt: Ext.baseCSSPrefix + 'operator-lt',
        le: Ext.baseCSSPrefix + 'operator-lte',
        like: Ext.baseCSSPrefix + 'operator-like',
        nlike: Ext.baseCSSPrefix + 'operator-nlike',
        in: Ext.baseCSSPrefix + 'operator-in',
        notin: Ext.baseCSSPrefix + 'operator-nin',
        empty: Ext.baseCSSPrefix + 'operator-empty',
        nempty: Ext.baseCSSPrefix + 'operator-exists',
        identical: Ext.baseCSSPrefix + 'operator-identical',
        nidentical: Ext.baseCSSPrefix + 'operator-nidentical',
        regex: Ext.baseCSSPrefix + 'operator-fn'
    },

    operatorsTextMap: {
        eq: 'Is equal',
        ne: 'Not equal',
        gt: 'Greater than',
        ge: 'Greater than or equal to',
        lt: 'Less than',
        le: 'Less than or equal to',
        like: 'Like',
        nlike: 'Not like',
        empty:  'Empty',
        nempty:  'Not empty',
        identical: 'Identical',
        nidentical: 'Not identical',
        regex: 'Regular expression',
        in: 'Is in',
        notin: 'Is not in'
    },

    inheritableStatics: {
        /**
         * Add support for a new operator that could be used by this plugin
         */
        addOperator: function (name, iconCls, text) {
            var proto = this.prototype;
            proto.operatorsIconsMap[name] = iconCls;
            proto.operatorsTextMap[name] = text;
        }
    },

    init: function (field) {
        var me = this;

        me.callParent([field]);
        //<debug>
        if(!field.isFormField) {
            Ext.raise('This plugin should be used with form fields');
        }
        //</debug>

        if(field.rendered) {
            me.onFieldRender(field);
        } else {
            me.fieldListeners = field.on({
                afterrender: 'onFieldRender',
                scope: me,
                destroyable: true
            });
        }
        me.field = field;
    },

    destroy: function () {
        var me = this;

        me.field = Ext.destroy(me.fieldListeners, me.menu);
        me.callParent();
    },

    onFieldRender: function(textField) {
        var me = this,
            op = me.getOperator(),
            btn;

        btn = me.operatorButtonEl = textField.triggerWrap.insertFirst({
            tag: 'div',
            cls: [me.operatorCls, me.triggerCls, me.operatorsIconsMap[op]],
            'data-qtip': me.operatorsTextMap[op]
        });

        btn.on({
            click: 'onOperatorClick',
            scope: me
        });
    },

    onOperatorClick: function (e, el) {
        var me = this,
            menu = me.menu;

        if(!menu) {
            me.menu = menu = Ext.widget({
                xtype: 'menu',
                items: me.getMenuForOperators()
            });
        }

        menu.showBy(el, 'bl');
        menu.focus();
    },

    getMenuForOperators: function () {
        var me = this,
            operators = me.getOperators(),
            items = [],
            len, i, op;

        if(operators) {
            len = operators.length;
            for(i = 0; i < len; i++) {
                op = operators[i];
                items.push({
                    iconCls: me.operatorsIconsMap[op],
                    text: me.operatorsTextMap[op],
                    handler: 'onChangeOperator',
                    scope: me,
                    operator: op
                });
            }
        }

        return items;
    },

    onChangeOperator: function (menu) {
        this.setOperator(menu.operator);
    },

    updateOperator: function (op, oldOp) {
        var me = this,
            field = me.field,
            btn = me.operatorButtonEl;

        if(!me.isConfiguring && btn) {
            field.fireEvent('operatorchange', field, op);
            btn.removeCls(me.operatorsIconsMap[oldOp]);
            btn.addCls(me.operatorsIconsMap[op]);
            btn.set({
                'data-qtip': me.operatorsTextMap[op]
            });
        }
    }


}, function () {
    var prototype = this.prototype,
        icons = prototype.operatorsIconsMap,
        texts = prototype.operatorsTextMap;

    icons['='] = icons['eq'];
    icons['=='] = icons['eq'];
    icons['!='] = icons['ne'];
    icons['==='] = icons['identical'];
    icons['!=='] = icons['nidentical'];
    icons['>'] = icons['gt'];
    icons['>='] = icons['ge'];
    icons['<'] = icons['lt'];
    icons['<='] = icons['le'];
    icons['/='] = icons['regex'];

    texts['='] = texts['eq'];
    texts['=='] = texts['eq'];
    texts['!='] = texts['ne'];
    texts['==='] = texts['identical'];
    texts['!=='] = texts['nidentical'];
    texts['>'] = texts['gt'];
    texts['>='] = texts['ge'];
    texts['<'] = texts['lt'];
    texts['<='] = texts['le'];
    texts['/='] = texts['regex'];

});