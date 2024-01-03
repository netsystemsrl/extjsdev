Ext.define("Ext.saki.grid.MultiSearch",{extend:"Ext.container.Container",alternateClassName:"Ext.ux.grid.MultiSearch",alias:["plugin.saki-gms","plugin.ux-gms"],config:{store:null,columns:null},layout:"hbox",dock:"top",baseCls:"saki-gms-ct",buffer:500,clearItemIconCls:"icon-clear-filter",clearItemT:"Clear Filter",filterOnEnter:false,height:24,iconColumn:true,inSeparator:",",operatorRe:/^(=|!=|<=|>=|<|>|in |like )/,parseOperator:true,weight:1000,applyStore:function(a){a=a||this.grid.getStore();if(!a.getFilters){a.getFilters=function(){return this.filters}}return a},updateStore:function(b,d){var c=this,a={filterchange:{scope:this,fn:c.onStoreFilterChange}};if(d){d.un(a)}if(b){b.on(a);c.setValuesFromStore()}},onStoreFilterChange:function(){var a=this;if(!a.filtering){a.setValuesFromStore()}},setValuesFromStore:function(){var b=this,a=b.getStoreFilters();if(a){b.setValues(a,true)}else{b.clearValues(true)}},getStoreFilters:function(){var c=this,b=c.getStore(),a=null;if(b){b.getFilters().each(function(e){var h=e.getProperty?e.getProperty():e.property,d=e.getOperator?e.getOperator():e.operator,g=e.getValue?e.getValue():e.value,f="";if("in"===d){g=g.join(",")}if(Ext.Array.contains(["in","like"],d)){f=" "}a=a||{};a[h]=(d?d+f:"")+g})}return a},updateColumns:function(){var b=this,c=b.headerCt,a=b.grid.getSelectionModel();c.suspendEvents();if(b.iconColumn){b.iconCol=c.add(b.getIconCol())}b.removeAll(true);b.add(b.getFields());if("Ext.selection.CheckboxModel"===a.$className){b.items.insert(a.injectCheckbox,Ext.widget({itemId:"item-"+a.injectCheckbox,xtype:"component",cls:"saki-gms-nofilter",height:b.height}))}c.resumeEvents();b.setValuesFromStore();b.grid.getView().refresh();Ext.Function.defer(function(){b.syncCols();b.syncUi()},1)},init:function(a){var b=this,d=a.getView().getHeaderCt(),c=Ext.versions.extjs.major;if(Ext.isString(b.operatorRe)){b.operatorRe=new RegExp(b.operatorRe.replace(/(^\/|\/$)/g,""))}Ext.apply(b,{grid:a,headerCt:d,extVersion:c});d.on({afterlayout:{fn:b.afterHdLayout,scope:b},afterrender:{fn:b.afterHdRender,scope:b,single:true},columnmove:{fn:b.onColumnMove,scope:b}});a.on({scope:b,reconfigure:b.onReconfigure});b.on({afterrender:{fn:b.onAfterRender,scope:b,single:true}});b.onReconfigure(a,a.store,a.columns);a.getFilter=function(){return b}},onReconfigure:function(c,a,b){this.setColumns(b);this.setStore(a)},getFields:function(){var d=this,b=[],c=d.headerCt.getGridColumns(),a=d.grid.getSelectionModel();Ext.Array.each(c,function(h,f){var g=h.filterField||h.filter,e={xtype:"component"},j=null;if(true===g){e.xtype="textfield"}else{if(g&&g.isComponent){e=g}else{if("string"===typeof g){e.xtype=g}else{if(Ext.isObject(g)){Ext.apply(e,g)}else{e.cls="saki-gms-nofilter";e.height=d.height}}}}if("iconCol"===h.itemId){Ext.apply(e,d.getIcon())}Ext.apply(e,{itemId:h.itemId?h.itemId:h.dataIndex||"item"+f});j=Ext.widget(e);if(d.filterOnEnter){j.on("specialkey",d.onSpecialKey,d)}else{j.on("change",d.onChange,d,{buffer:d.buffer})}b.push(j)});return b},onChange:function(b){var a=this;if(b.isDirty()){b.resetOriginalValue();a.doFieldChange(b)}},doFieldChange:function(e){var b=this,d=e.getSubmitValue(),c=e.getItemId(),f=b.parseOperator,a;a=f?b.parseUserValue(d):{value:d};a.property=c;a.id=c;b.setFilter(a);b.updateClearIcon(e)},getFilters:function(){var b=this,a=[];b.items.each(function(d){var c;if(d.isFormField){c=b.getFilterFromField(d);if(c){a.push(c)}}});return a},getFilterFromField:function(d){var b=this,c=d.getSubmitValue(),a;if(c){a=b.parseUserValue(c);a.property=d.getItemId();return a}return null},setFilter:function(b){var c=this,a=c.getStore();if(Ext.isArray(b)){a.clearFilter(0<b.length);a.addFilter(b)}else{c.filtering=true;if(!b.value){if(4===c.extVersion){a.filters.removeAtKey(b.property);if(a.filters.getCount()){a.filter()}else{a.clearFilter()}}else{a.removeFilter(b.property)}}else{a.addFilter(b)}c.filtering=false}},clearField:function(c,b){var a=this;if(c&&Ext.isFunction(c.setValue)&&!c.readOnly&&!c.disabled){if(true===b){c.suspendEvents()}c.setValue("");c.resetOriginalValue();if(true===b){c.resumeEvents()}if(true!==b){a.doFieldChange(c)}}},setValues:function(a,c){var b=this,d;if(a&&Ext.isObject(a)){b.clearValues(true);Ext.Object.each(a,function(e,f){d=b.items.get(e);if(d&&Ext.isFunction(d.setValue)){if(true===c){d.suspendEvents()}d.setValue(f);d.resetOriginalValue();if(true===c){d.resumeEvents()}}})}},clearValues:function(b){var a=this;a.items.each(function(c){a.clearField(c,b)});if(!b){a.getStore().clearFilter()}},onAfterRender:function(){var c=this,a,b;if(!Ext.isFunction(c.getScrollerEl)){c.getScrollerEl=function(){return c.layout.innerCt}}a=c.getScrollerEl();b=5===c.extVersion?"scroll":"keyup";a.on(b,c.onFilterScroll,c)},onFilterScroll:function(){var a=this,b=a.getScrollerEl().getScrollLeft();if(5===a.extVersion){a.grid.getView().scrollTo(b,0)}else{a.grid.getView().getEl().scrollTo("left",b)}},parseUserValue:function(c){var g=this,e=g.operatorRe,d=g.inSeparator,f,b,h,a=Ext.String.trim;if(!c){return{value:""}}f=c.split(e);if(2>f.length){return{value:c}}h=a(f[2]);b=a(f[1]);if("in"!==b){return{value:h,operator:b}}return{value:a(h).split(d),operator:b}},onSpecialKey:function(c,b){var a=this;if(Ext.EventObject.ENTER===b.getKey()){a.setFilter(a.getFilters())}},onIconClick:function(b){var a=this;if(a.filterMenu){a.filterMenu.showBy(b.getTarget("div.x-tool"))}},getIconCol:function(){return{width:21,menuDisabled:true,hideable:false,sortable:false,itemId:"iconCol",draggable:false,hoverCls:"",baseCls:""}},getIcon:function(){return{autoEl:{tag:"div",children:[{tag:"img",src:"data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",cls:"saki-gms-icon x-tool-img x-tool-gear"}]},cls:"saki-gms-nofilter x-tool",overCls:"x-tool-over",listeners:{click:{fn:this.onIconClick,scope:this,element:"el"}}}},createFilterMenu:function(){var b=this,a=[];if(!b.filterMenu){a.push({text:b.clearItemT,iconCls:b.clearItemIconCls,scope:b,handler:function(){b.clearValues(true);b.getStore().clearFilter()}});b.filterMenu=Ext.widget("menu",{defaultAlign:"tr-br?",items:a})}},updateClearIcon:function(e){var c=this,b="saki-gms-hasvalue",a=e.bodyEl?e.bodyEl.down("input"):null,d=e.getValue?e.getValue():null;if(a){a=c.extVersion===4?a.up("td"):a.up("div");if(false!==e.clearIcon){if(!e.clearIcon){e.clearIcon=a.createChild({tag:"div",cls:"saki-gms-clear"});e.clearIcon.on("click",Ext.bind(c.clearField,c,[e]));a.applyStyles({position:"relative"})}if(d&&!e.readOnly&&!e.disabled){a.addCls(b)}else{a.removeCls(b)}}}},markFiltered:function(d){var b=this,c=d.getValue?d.getValue():null,a=b.headerCt.getGridColumns()[b.items.indexOf(d)];if(!a){return}a=a.getEl();a.removeCls("saki-gms-filtered");if(c){a.addCls("saki-gms-filtered")}else{a.removeCls("saki-gms-filtered")}},syncUi:function(){var a=this;a.items.each(function(b){if(b&&b.rendered){a.updateClearIcon(b);a.markFiltered(b)}})},syncCols:function(){var a=this,b=a.headerCt.getGridColumns(),c;if(!a.rendered){return}c=a.headerCt.layout.innerCt.getWidth();Ext.Array.each(b,function(d,e){var f=a.items.getAt(e);if(f){f.setWidth(d.getWidth())}});a.layout.targetEl.setWidth(c)},onGridScroll:function(){var b=this,a=b.grid.getView().getEl().getScroll(),c=b.getLayout().innerCt;c.scrollTo("left",a.left)},onColumnMove:function(){var a=this;a.syncOrder();a.grid.getView().refresh();a.syncUi();a.syncCols();Ext.Function.defer(a.onGridScroll,1,a)},syncOrder:function(){var b=this,d=b.headerCt.getGridColumns(),a,c;for(a=0;a<d.length;a++){c=b.items.get(d[a].dataIndex);if(c){b.items.insert(a,c)}}b.doLayout()},afterHdLayout:function(){var a=this;if(!a.grid.reconfiguring){a.syncCols();a.syncUi()}},afterHdRender:function(){var b=this,a=b.grid;a.dockedItems.add(b);if(0<Ext.versions.extjs.minor&&4!==b.extVersion){a.getView().on({scroll:{fn:b.onGridScroll,scope:b}})}else{a.getView().on({bodyscroll:{fn:b.onGridScroll,scope:b}})}b.createFilterMenu()}});