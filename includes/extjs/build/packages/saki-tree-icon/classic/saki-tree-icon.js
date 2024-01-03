Ext.define("Ext.saki.tree.Icon",{extend:"Ext.AbstractPlugin",alias:["plugin.saki-treeicon","plugin.ux-treeicon"],alternateClassName:["Ext.ux.tree.Icon"],iconCls:"fa",iconFolder:"fa-folder-o",iconLeaf:"fa-file-o",cellTpl:['<tpl for="lines">','<img src="{parent.blankUrl}" class="{parent.childCls} {parent.elbowCls}-img ','{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>" role="presentation"/>',"</tpl>",'<img src="{blankUrl}" class="{childCls} {elbowCls}-img {elbowCls}','<tpl if="isLast">-end</tpl><tpl if="expandable">-plus {expanderCls}</tpl>" role="presentation"/>','<tpl if="checked !== null">','<input type="button" {ariaCellCheckboxAttr}',' class="{childCls} {checkboxCls}<tpl if="checked"> {checkboxCls}-checked</tpl>"/>',"</tpl>",'<i style="color:{[values.record.get("iconColor")||"#5c5957"]}" class="{childCls} {baseIconCls} ','{[values.iconCls?values.iconCls:(values.leaf?this.owner.iconLeaf||"":this.owner.iconFolder||"")]} fa-icon"','<tpl if="icon">style="background-image:url({icon})"</tpl>></i>','<tpl if="href">','<a href="{href}" role="link" target="{hrefTarget}" class="{textCls} {childCls}">{value}</a>',"<tpl else>",'<span class="{textCls} {childCls}">{value}</span>',"</tpl>"],init:function(a){var c=this,b;b=Ext.Array.findBy(a.columns,function(d){return d.isXType("treecolumn")});if(b){b.iconCls=b.iconCls||"";b.iconCls+=(b.iconCls?" ":"")+c.iconCls;Ext.applyIf(b,{iconFolder:c.iconFolder,iconLeaf:c.iconLeaf});b.cellTpl=c.cellTpl}else{Ext.Error.raise("IconTree plugin has not found any tree column.")}}});