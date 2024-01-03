/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.dataview.ItemHeader', {
    override: 'Ext.dataview.ItemHeader',

    updateGroup: function (group) {
        var me = this,
            data, grouper, html, list, tpl, parent;

        // if(me.isPinnedItem) {
            if (group) {
                list = me.parent;

                parent = group;

                while (parent && parent.isGroup) {
                    grouper = parent.getGrouper();

                    // See if the grouper belongs to this list and has a headerTpl override
                    // in place (see Ext.grid.Column).
                    tpl = (grouper && grouper.owner === list && grouper.headerTpl) || me.getTpl();

                    if (tpl) {
                        data = me.getGroupHeaderTplData(false, parent);
                        html = tpl.apply(data) + (html ? ' > ' + html : '');
                    }

                    parent = parent.getParent();
                }
            }

            me.setHtml(html || '\xa0');
        // } else {
        //     this.callParent(arguments);
        // }
    },

    privates: {
        getGroupHeaderTplData: function (skipHtml, group) {
            var data;

            group = group || this.getGroup();

            data = group && {
                name: group.getGroupKey(),
                group: group,
                groupField: group.getGrouper().getProperty(),
                children: group.items,
                count: group.length
            };

            if (data) {
                data.value = group.getLabel();

                if (!skipHtml) {
                    data.html = Ext.htmlEncode(data.name);
                }

                // For Classic compat:
                data.groupValue = data.value;
            }

            return data;
        }

    }
});