/**

@class Sch.model.Dependency
@extends Sch.model.DependencyBase

This class represents a single Dependency between two events. It is a subclass of the {@link Sch.model.DependencyBase}
class, which in its turn subclasses {@link Sch.model.Customizable} and {@link Ext.data.Model}.
Please refer to documentation of those classes to become familar with the base interface of this class.

Subclassing the Dependency class
--------------------

The name of any model field can be customized in the subclass, see the example below. Please also refer to {@link Sch.model.Customizable}
for details.

    Ext.define('MyProject.model.Dependency', {
        extend      : 'Sch.model.Dependency',

        toField     : 'targetId',
        fromField   : 'sourceId',

        ...
    })

*/
Ext.define('Sch.model.Dependency', {
    extend              : 'Sch.model.DependencyBase',

    /**
     * Returns `true` if the dependency is valid. Has valid type and both source and target ids set and not links to itself.
     *
     * @return {Boolean}
     */
    isValid : function (taskStore) {
        var me          = this,
            valid       = me.callParent(arguments),
            sourceId    = me.getSourceId(),
            targetId    = me.getTargetId(),
            type        = me.getType();

        return Ext.isNumber(type) && !Ext.isEmpty(sourceId) && !Ext.isEmpty(targetId) && sourceId != targetId;
    },

    // Determines the type of dependency based on fromSide and toSide
    // TODO: Check with vertical orientation
    getTypeFromSides : function (fromSide, toSide, rtl) {
        var types     = this.self.Type,
            startSide = rtl ? 'right' : 'left',
            endSide   = rtl ? 'left' : 'right';

        if (fromSide === startSide) {
            return (toSide === startSide) ? types.StartToStart : types.StartToEnd;
        }

        return (toSide === endSide) ? types.EndToEnd : types.EndToStart;
    }
});
