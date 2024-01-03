// https://app.assembla.com/spaces/bryntum/tickets/8118-ext-dom-element-addcls-overrides-existing-classes-on-svg-elements
Ext.define('Sch.patches.Element_6_7', {
    extend : 'Sch.util.Patch',

    target : ['Ext.dom.Element'],
    
    minVersion : '6.7.0',
    
    applyFn  : function () {
        Ext.override(Ext.dom.Element, {
            synchronize : function () {
                var result      = this.callParent(arguments),
                    me          = this,
                    dom         = me.dom,
                    hasClassMap = {},
                    className   = dom.className,
                    classList, name, i, ln,
                    elementData = me.getData(/* sync= */
                        false);
        
                if (window.SVGAnimatedString && className instanceof window.SVGAnimatedString) {
                    className = className.animVal;
            
                    if (className && className.length > 0) {
                        classList = className.split(/[\s]+/);
                        for (i = 0 , ln = classList.length; i < ln; i++) {
                            name = classList[i];
                            hasClassMap[name] = true;
                        }
                    }
                    elementData.classList = classList;
                    elementData.classMap = hasClassMap;
                    elementData.isSynchronized = true;
                }
        
                return result;
            }
        });
    }
});
