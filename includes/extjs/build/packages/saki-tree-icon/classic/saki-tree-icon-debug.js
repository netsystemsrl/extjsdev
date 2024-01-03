// vim: sw=4:ts=4:nu:nospell:fdc=4
/*global Ext:true */
/*jslint browser: true, devel:true, sloppy: true, white: true, plusplus: true */
/*
 This file is part of Tree Icon Plugin package

 Copyright (c) 2015, Jozef Sakalos, Saki

 Package:  saki-tree-icon
 Author:   Jozef Sakalos, Saki
 Contact:  http://extjs.eu/contact
 Date:     1. February 2015

 Commercial License
 Developer, or the specified number of developers, may use this file in any number
 of projects during the license period in accordance with the license purchased.

 Uses other than including the file in the project are prohibited.
 See http://extjs.eu/licensing for details.
 */
/**
 * ## Description
 *
 * Out-of-the-box Ext JS tree does support configurable icons via "icon" and "iconCls"
 * properties, nevertheless, icon fonts are not supported very well. Also, even if we
 * would somehow implement an icon font support it would still be difficult to set
 * color of icons.
 *
 * This plugin finds first tree column in the tree panel or tree grid it is plugged
 * into and implements a custom template that renders tree nodes with Font Awesome
 * in mind so setting iconCls of a node to "fa-globe" produces the expected result.
 * It also understands iconColor field that can be used to set icon colors.
 *
 * It works with other icon fonts as well, you only need to change iconCls and
 * CSS classes for tree nodes.
 *
 * {@img IconTree.png Icon Tree}
 * <em>Screenshot of Icons in tree<em>
 *
 * ## Usage
 * 1. First of all you need to add link to Font Awesome, or other icon font css to
 * <code>app.json</code>. It should read similar to this:
 *
 *
 *          "css":[{
 *              "path": "bootstrap.css",
 *              "bootstrap": true
 *          },{
 *              "path":"http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css",
 *              "bootstrap":false
 *          }]
 *
 *
 * 2. We also need to add Tree Icon Plugin Package to requires array in <code>app.json</code>
 *
 *          "requires": [
 *              "saki-tree-icon"
 *          ]
 *
 * 3. It is also a good idea to define a model to be used with the tree store and configure
 * "iconColor" field as String, if you want to use it.
 *
 * 4. After you require the plugin class in a view or application then you only need to configure
 * the plugin for tree panel:
 *
 *               plugins: [{
 *                   ptype:'saki-treeicon'
 *               }]
 *
 */
Ext.define('Ext.saki.tree.Icon', {
    extend: 'Ext.AbstractPlugin',
    alias: [
        'plugin.saki-treeicon',
        'plugin.ux-treeicon'
    ],
    alternateClassName: [
        'Ext.ux.tree.Icon'
    ],
    /**
     * @cfg {String} iconCls CSS class for all nodes.
     */
    iconCls: 'fa',
    /**
     * @cfg {String} iconFolder CSS class used for folders (nodes that have children)
     * if iconCls does not come in the server response.
     */
    iconFolder: 'fa-folder-o',
    /**
     * @cfg {String} iconLeaf CSS class used for leafs
     * if iconCls does not come in the server response.
     */
    iconLeaf: 'fa-file-o',
    /**
     * @cfg {Array} cellTpl XTemplate definition that overrides the default template.
     * This is necessary because we want to support Font Awesome font icons and we
     * also want to honor iconColor field.
     */
    cellTpl: [
        '<tpl for="lines">',
        '<img src="{parent.blankUrl}" class="{parent.childCls} {parent.elbowCls}-img ',
        '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>" role="presentation"/>',
        '</tpl>',
        '<img src="{blankUrl}" class="{childCls} {elbowCls}-img {elbowCls}',
        '<tpl if="isLast">-end</tpl><tpl if="expandable">-plus {expanderCls}</tpl>" role="presentation"/>',
        '<tpl if="checked !== null">',
        '<input type="button" {ariaCellCheckboxAttr}',
        ' class="{childCls} {checkboxCls}<tpl if="checked"> {checkboxCls}-checked</tpl>"/>',
        '</tpl>',
        '<i style="color:{[values.record.get("iconColor")||"#5c5957"]}" class="{childCls} {baseIconCls} ',
        '{[values.iconCls?values.iconCls:(values.leaf?this.owner.iconLeaf||"":this.owner.iconFolder||"")]} fa-icon"',
        '<tpl if="icon">style="background-image:url({icon})"</tpl>></i>',
        '<tpl if="href">',
        '<a href="{href}" role="link" target="{hrefTarget}" class="{textCls} {childCls}">{value}</a>',
        '<tpl else>',
        '<span class="{textCls} {childCls}">{value}</span>',
        '</tpl>'
    ],
    /**
     * @private
     * @param {Ext.tree.Panel|Ext.tree.TreeGrid} tree
     */
    init: function(tree) {
        var me = this,
            col;
        col = Ext.Array.findBy(tree.columns, function(c) {
            return c.isXType('treecolumn');
        });
        if (col) {
            // apply iconCls
            col.iconCls = col.iconCls || '';
            col.iconCls += (col.iconCls ? ' ' : '') + me.iconCls;
            // apply default icons
            Ext.applyIf(col, {
                iconFolder: me.iconFolder,
                iconLeaf: me.iconLeaf
            });
            // apply cell template
            col.cellTpl = me.cellTpl;
        } else {
            Ext.Error.raise('IconTree plugin has not found any tree column.');
        }
    }
});

