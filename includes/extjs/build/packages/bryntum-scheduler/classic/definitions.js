//@define Robo.Manager
//@require Ext.util.Observable
//@require Robo.util.Array
//@require Robo.Transaction
//@require Robo.data.Model
//@require Robo.action.flat.Update
//@require Robo.action.flat.Add
//@require Robo.action.flat.Remove
//@require Robo.action.tree.Append
//@require Robo.action.tree.Insert
//@require Robo.action.tree.Remove
//@require Robo.action.tree.Update
//@require Ext.data.Store
//@require Ext.data.StoreManager

//@define Robo.Transaction

//@define Robo.action.Base

//@define Robo.action.flat.Add
//@require Robo.action.Base

//@define Robo.action.flat.Remove
//@require Robo.action.Base

//@define Robo.action.flat.Update
//@require Robo.action.Base
//@require Ext.Array

//@define Robo.action.tree.Append
//@require Robo.action.Base

//@define Robo.action.tree.Insert
//@require Robo.action.Base

//@define Robo.action.tree.Remove
//@require Robo.action.Base

//@define Robo.action.tree.Update
//@require Robo.action.flat.Update

//@define Robo.data.Model
//@require Ext.Mixin

//@define Robo.data.Store
//@require Ext.Mixin
//@require Ext.util.Observable

//@define Robo.util.Array

//@define Robo.widget.RedoButton
//@require Robo.widget.UndoButton

//@define Robo.widget.StatusPanel
//@require Ext.tree.Panel

//@define Robo.widget.UndoButton
//@require Ext.button.Split

//@define Sch.app.CrudManagerDomain
//@require Ext.app.EventDomain
//@require Sch.crud.AbstractManager

//@define Sch.column.Day
//@require Ext.grid.column.Column

//@define Sch.column.Resource
//@require Ext.grid.Column

//@define Sch.column.ResourceName
//@require Ext.grid.Column

//@define Sch.column.Summary
//@require Ext.grid.column.Column

//@define Sch.column.timeAxis.Horizontal
//@require Ext.grid.column.Column
//@require Sch.view.HorizontalTimeAxis
//@require Sch.feature.HeaderResize

//@define Sch.column.timeAxis.Vertical
//@require Ext.grid.column.Column

//@define Sch.crud.AbstractManager
//@require Ext.data.StoreManager

//@define Sch.crud.encoder.Json

//@define Sch.crud.encoder.Xml
//@require Ext.XTemplate

//@define Sch.crud.transport.Ajax

//@define Sch.data.AssignmentStore
//@require Ext.data.Store
//@require Sch.patches.CollectionKey
//@require Sch.data.util.EventAssignmentsCache
//@require Sch.data.util.ResourceAssignmentsCache
//@uses Sch.data.util.EventAssignmentsCache
//@uses Sch.data.util.ResourceAssignmentsCache
//@uses Sch.data.util.AssignmentStoreEventResourcesCache
//@uses Sch.data.util.AssignmentStoreResourceEventsCache

//@define Sch.data.Calendar
//@require Ext.data.Store
//@require Ext.Date
//@require Sch.model.CalendarDay
//@require Sch.model.Range
//@require Sch.util.Date

//@define Sch.data.CrudManager
//@require Sch.crud.AbstractManager

//@define Sch.data.DependencyStore
//@require Ext.data.Store
//@require Sch.patches.CollectionKey
//@require Sch.data.util.EventDependencyCache

//@define Sch.data.EventStore
//@require Ext.data.Store

//@define Sch.data.ResourceStore
//@require Ext.data.Store

//@define Sch.data.ResourceTreeStore
//@require Ext.data.TreeStore
//@require Sch.patches.TreeStore
//@require Sch.patches.TreeStoreInternalIdMap

//@define Sch.data.TimeAxis
//@require Ext.data.JsonStore
//@require Sch.util.Date
//@require Sch.model.TimeAxisTick

//@define Sch.data.mixin.CacheHintHelper
//@require Ext.Mixin

//@define Sch.data.mixin.EventStore
//@require Ext.Mixin
//@require Sch.util.Date
//@require Sch.data.util.IdConsistencyManager
//@require Sch.data.util.ModelPersistencyManager
//@require Sch.data.util.ResourceEventsCache

//@define Sch.data.mixin.FilterableTreeStore

//@define Sch.data.mixin.RecurringEvents
//@require Ext.Mixin
//@require Sch.model.Recurrence
//@require Sch.data.util.DelayedCalls
//@require Sch.data.util.recurrence.DailyIterator
//@require Sch.data.util.recurrence.WeeklyIterator
//@require Sch.data.util.recurrence.MonthlyIterator
//@require Sch.data.util.recurrence.YearlyIterator

//@define Sch.data.mixin.ResourceStore

//@define Sch.data.mixin.UniversalModelGetter

//@define Sch.data.util.AssignmentStoreEventResourcesCache
//@require Sch.util.Cache
//@require Ext.data.Model

//@define Sch.data.util.AssignmentStoreResourceEventsCache
//@require Sch.util.Cache
//@require Ext.data.Model

//@define Sch.data.util.DelayedCalls

//@define Sch.data.util.EventAssignmentsCache
//@require Sch.util.Cache
//@require Ext.data.Model

//@define Sch.data.util.EventDependencyCache
//@require Sch.util.Cache

//@define Sch.data.util.IdConsistencyManager

//@define Sch.data.util.ModelPersistencyManager

//@define Sch.data.util.ResourceAssignmentsCache
//@require Sch.util.Cache
//@require Ext.data.Model

//@define Sch.data.util.ResourceEventsCache
//@require Sch.util.Cache
//@require Ext.data.Model

//@define Sch.data.util.recurrence.AbstractIterator

//@define Sch.data.util.recurrence.DailyIterator
//@require Sch.data.util.recurrence.AbstractIterator
//@require Sch.util.Date

//@define Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.data.util.recurrence.Legend
//@require Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.data.util.recurrence.MonthlyIterator
//@require Sch.data.util.recurrence.AbstractIterator
//@require Sch.util.Date
//@require Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.data.util.recurrence.WeeklyIterator
//@require Sch.data.util.recurrence.AbstractIterator
//@require Sch.util.Date
//@require Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.data.util.recurrence.YearlyIterator
//@require Sch.data.util.recurrence.AbstractIterator
//@require Sch.util.Date
//@require Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.eventlayout.Horizontal

//@define Sch.eventlayout.Table
//@require Sch.eventlayout.Horizontal

//@define Sch.eventlayout.Vertical
//@require Sch.util.Date

//@define Sch.feature.AbstractTimeSpan
//@require Ext.AbstractPlugin

//@define Sch.feature.ColumnLines
//@require Sch.plugin.Lines
//@require Ext.data.JsonStore

//@define Sch.feature.DragCreator
//@require Ext.XTemplate
//@require Ext.ToolTip
//@require Sch.util.Date
//@require Sch.util.ScrollManager
//@require Sch.util.DragTracker
//@require Sch.tooltip.Tooltip
//@require Sch.tooltip.HoverTip

//@define Sch.feature.DragDrop
//@require Ext.XTemplate
//@require Sch.feature.SchedulerDragZone

//@define Sch.feature.Grouping
//@require Ext.grid.feature.Grouping
//@require Sch.patches.Grouping

//@define Sch.feature.HeaderResize
//@require Ext.AbstractPlugin

//@define Sch.feature.RecurringEvents
//@require Sch.widget.RecurrenceConfirmation

//@define Sch.feature.ResizeZone
//@require Ext.util.Observable
//@require Ext.resizer.Resizer
//@require Sch.tooltip.Tooltip
//@require Sch.util.ScrollManager

//@define Sch.feature.SchedulerDragZone
//@require Ext.dd.DragZone
//@require Ext.dd.StatusProxy
//@require Sch.tooltip.Tooltip
//@uses Sch.model.Event
//@uses Sch.model.Assignment
//@uses Sch.util.Date
//@uses Sch.patches.DragZone

//@define Sch.field.CellEditor
//@require Ext.form.field.Text

//@define Sch.field.SegmentedButton
//@require Ext.button.Segmented

//@define Sch.layout.TableLayout
//@require Ext.view.TableLayout

//@define Sch.locale.En
//@require Sch.locale.Locale

//@define Sch.locale.Locale

//@define Sch.mixin.AbstractSchedulerPanel
//@require Sch.model.Event
//@require Sch.model.Resource
//@require Sch.data.EventStore
//@require Sch.data.ResourceStore
//@require Sch.util.Date
//@require Sch.plugin.ResourceZones

//@define Sch.mixin.AbstractSchedulerView
//@require Sch.template.Event
//@require Sch.eventlayout.Horizontal
//@require Sch.view.Vertical
//@require Sch.eventlayout.Vertical

//@define Sch.mixin.AbstractTimelinePanel
//@require Sch.data.TimeAxis
//@require Sch.view.model.TimeAxis
//@require Sch.feature.ColumnLines
//@require Sch.preset.Manager

//@define Sch.mixin.AbstractTimelineView
//@require Sch.data.TimeAxis
//@require Sch.template.Event
//@require Sch.view.Horizontal
//@uses Ext.dom.Query

//@define Sch.mixin.FilterableTreeView

//@define Sch.mixin.GridViewCanvas
//@require Ext.Mixin

//@define Sch.mixin.Localizable
//@require Ext.Mixin
//@require Sch.locale.En

//@define Sch.mixin.PartnerTimelinePanel
//@require Ext.Mixin

//@define Sch.mixin.SchedulerPanel
//@require Sch.mixin.AbstractSchedulerPanel
//@require Sch.view.SchedulerGridView
//@require Sch.feature.RecurringEvents
//@require Sch.selection.EventModel
//@require Sch.selection.AssignmentModel
//@require Sch.column.Resource
//@require Sch.column.timeAxis.Vertical
//@require Sch.column.ResourceName
//@uses Sch.panel.AllDayHeader

//@define Sch.mixin.SchedulerView
//@require Sch.mixin.AbstractSchedulerView
//@require Sch.patches.BoundList
//@require Sch.patches.DragDropManager
//@require Sch.patches.NavigationModel
//@require Sch.patches.NavigationModel6_0_2
//@require Sch.feature.DragCreator
//@require Sch.feature.DragDrop
//@require Sch.feature.ResizeZone
//@require Sch.column.Resource
//@require Sch.column.Day
//@require Sch.view.WeekView
//@require Ext.Factory
//@require Ext.XTemplate

//@define Sch.mixin.TimelinePanel
//@require Sch.mixin.AbstractTimelinePanel
//@require Sch.column.timeAxis.Horizontal
//@require Sch.preset.Manager
//@require Sch.data.Calendar
//@require Sch.plugin.CurrentTimeLine
//@require Sch.layout.TableLayout
//@require Sch.patches.LockingScroller
//@require Sch.plugin.NonWorkingTime
//@require Ext.grid.plugin.BufferedRenderer
//@uses Ext.layout.container.Border
//@uses Sch.patches.TablePanel_6_2_1
//@uses Sch.patches.TableView
//@uses Sch.patches.BufferedRenderer
//@uses Sch.patches.BufferedRenderer_6_2_1
//@uses Sch.patches.BufferedRendererResize
//@uses Sch.patches.CellContext
//@uses Sch.patches.TimelineGridView
//@uses Sch.patches.TimelineGridViewScroll6_2
//@uses Sch.patches.TimelinePanel
//@uses Sch.patches.TouchAction
//@uses Sch.plugin.NonWorkingTime

//@define Sch.mixin.TimelineView
//@require Sch.mixin.AbstractTimelineView
//@require Ext.tip.ToolTip
//@require Sch.patches.Element_6_7
//@require Sch.patches.NavigationModel6_0_2
//@require Sch.patches.View
//@require Sch.patches.Scroller_6_5
//@require Sch.patches.Scroller_7_3
//@require Sch.patches.LayoutContext_6_5
//@require Sch.patches.ToolTip
//@require Sch.patches.AbstractView
//@require Sch.patches.SpreadsheetModel
//@require Sch.patches.CellEditingPlugin
//@require Sch.patches.TableScroller
//@require Sch.tooltip.EventTip

//@define Sch.mixin.Zoomable

//@define Sch.model.Assignment
//@require Sch.model.Customizable

//@define Sch.model.CalendarDay
//@require Ext.data.Types
//@require Sch.model.Customizable

//@define Sch.model.Customizable
//@require Ext.data.Model
//@require Sch.util.Date

//@define Sch.model.Dependency
//@require Sch.model.DependencyBase

//@define Sch.model.DependencyBase
//@require Sch.model.Customizable

//@define Sch.model.Event
//@require Sch.model.Range
//@uses Sch.util.Date

//@define Sch.model.Range
//@require Sch.model.Customizable
//@require Sch.util.Date
//@require Sch.patches.DateFieldConvertDate

//@define Sch.model.Recurrence
//@require Sch.model.Customizable

//@define Sch.model.Resource
//@require Sch.model.Customizable

//@define Sch.model.TimeAxisTick
//@require Sch.model.Range

//@define Sch.model.mixin.RecurrableEvent
//@require Ext.Mixin
//@require Sch.model.Recurrence

//@define Sch.panel.AllDayHeader
//@require Sch.panel.SchedulerGrid
//@require Sch.view.AllDay

//@define Sch.panel.SchedulerGrid
//@require Sch.panel.TimelineGridPanel

//@define Sch.panel.SchedulerTree
//@require Sch.panel.TimelineTreePanel

//@define Sch.panel.TimelineGridPanel
//@require Ext.grid.Panel

//@define Sch.panel.TimelineTreePanel
//@require Ext.tree.Panel
//@require Ext.grid.Panel
//@require Ext.data.TreeStore
//@require Sch.mixin.FilterableTreeView

//@define Sch.patches.AbstractView
//@require Sch.util.Patch

//@define Sch.patches.BoundList
//@require Sch.util.Patch
//@require Ext.view.BoundList

//@define Sch.patches.BufferedRenderer
//@require Sch.util.Patch

//@define Sch.patches.BufferedRendererResize
//@require Sch.util.Patch

//@define Sch.patches.BufferedRenderer_6_2_1
//@require Sch.util.Patch

//@define Sch.patches.CellContext
//@require Sch.util.Patch

//@define Sch.patches.CellEditingPlugin
//@require Sch.util.Patch
//@require Ext.grid.plugin.CellEditing

//@define Sch.patches.CollectionKey
//@require Sch.util.Patch

//@define Sch.patches.DateField
//@require Sch.util.Patch

//@define Sch.patches.DateFieldConvertDate
//@require Sch.util.Patch

//@define Sch.patches.DragDropManager
//@require Sch.util.Patch
//@require Ext.dd.ScrollManager

//@define Sch.patches.DragZone
//@require Sch.util.Patch

//@define Sch.patches.DragZoneDupIds
//@require Sch.util.Patch

//@define Sch.patches.Element
//@require Sch.util.Patch

//@define Sch.patches.Element_6_5
//@require Sch.util.Patch

//@define Sch.patches.Element_6_7
//@require Sch.util.Patch

//@define Sch.patches.Grouping
//@require Sch.util.Patch

//@define Sch.patches.LayoutContext_6_5
//@require Sch.util.Patch

//@define Sch.patches.LockingScroller
//@require Sch.util.Patch

//@define Sch.patches.NavigationModel
//@require Sch.util.Patch

//@define Sch.patches.NavigationModel6_0_2
//@require Sch.util.Patch

//@define Sch.patches.Scroller_6_5
//@require Sch.util.Patch

//@define Sch.patches.Scroller_7_3
//@require Sch.util.Patch

//@define Sch.patches.SpreadsheetModel
//@require Sch.util.Patch
//@require Ext.grid.selection.SpreadsheetModel

//@define Sch.patches.TablePanelScroll6.2
//@require Sch.util.Patch

//@define Sch.patches.TablePanel_6_2_1
//@require Sch.util.Patch

//@define Sch.patches.TableScroller
//@require Sch.util.Patch

//@define Sch.patches.TableView
//@require Sch.util.Patch

//@define Sch.patches.TimelineGridView
//@require Sch.util.Patch

//@define Sch.patches.TimelineGridViewScroll6_2
//@require Sch.util.Patch

//@define Sch.patches.TimelinePanel
//@require Sch.util.Patch

//@define Sch.patches.ToolTip
//@require Sch.util.Patch

//@define Sch.patches.TouchAction
//@require Sch.util.Patch
//@require Ext.dom.TouchAction

//@define Sch.patches.TreeStore
//@require Sch.util.Patch

//@define Sch.patches.TreeStoreInternalIdMap
//@require Sch.util.Patch

//@define Sch.patches.View
//@require Sch.util.Patch

//@define Sch.plugin.CellPlugin
//@require Ext.AbstractPlugin
//@require Ext.form.field.Base
//@require Sch.field.CellEditor
//@require Sch.util.Date
//@require Sch.eventlayout.Table

//@define Sch.plugin.CurrentTimeLine
//@require Sch.plugin.Lines
//@require Ext.data.JsonStore

//@define Sch.plugin.DragSelector
//@require Sch.util.DragTracker
//@require Sch.util.ScrollManager

//@define Sch.plugin.EditorWindow
//@require Ext.window.Window
//@require Sch.widget.EventEditor

//@define Sch.plugin.EventEditor
//@require Sch.widget.EventEditor
//@require Ext.util.Region

//@define Sch.plugin.EventTools
//@require Ext.Container

//@define Sch.plugin.Export
//@require Ext.util.Observable
//@require Ext.XTemplate
//@require Sch.plugin.exporter.SinglePage
//@require Sch.plugin.exporter.MultiPage
//@require Sch.plugin.exporter.MultiPageVertical
//@require Sch.widget.ExportDialog

//@define Sch.plugin.HeaderTooltip
//@require Ext.AbstractPlugin
//@require Ext.tip.ToolTip
//@require Ext.Date
//@require Sch.view.HorizontalTimeAxis

//@define Sch.plugin.HeaderZoom
//@require Sch.util.DragTracker

//@define Sch.plugin.Lines
//@require Sch.feature.AbstractTimeSpan

//@define Sch.plugin.NonWorkingTime
//@require Sch.plugin.Zones
//@require Ext.data.Store
//@require Sch.model.Range

//@define Sch.plugin.Pan
//@require Ext.AbstractPlugin

//@define Sch.plugin.Printable
//@require Sch.plugin.Export
//@require Ext.XTemplate
//@require Ext.window.Toast

//@define Sch.plugin.ResourceZones
//@require Sch.plugin.RowZones

//@define Sch.plugin.RowZones
//@require Sch.plugin.Zones
//@require Ext.XTemplate
//@require Sch.util.Date

//@define Sch.plugin.SimpleEditor
//@require Ext.Editor
//@require Ext.form.TextField

//@define Sch.plugin.Split
//@require Ext.AbstractPlugin
//@require Ext.menu.Menu

//@define Sch.plugin.SummaryBar
//@require Ext.AbstractPlugin
//@require Ext.XTemplate

//@define Sch.plugin.TimeGap
//@require Sch.plugin.Zones
//@require Ext.data.JsonStore
//@require Sch.model.Range

//@define Sch.plugin.TreeCellEditing
//@require Ext.grid.plugin.CellEditing
//@require Sch.patches.Element_6_5

//@define Sch.plugin.Zones
//@require Sch.feature.AbstractTimeSpan
//@require Sch.model.Range

//@define Sch.plugin.exporter.AbstractExporter
//@require Ext.util.Observable
//@require Ext.XTemplate

//@define Sch.plugin.exporter.MultiPage
//@require Sch.plugin.exporter.AbstractExporter

//@define Sch.plugin.exporter.MultiPageVertical
//@require Sch.plugin.exporter.AbstractExporter

//@define Sch.plugin.exporter.SinglePage
//@require Sch.plugin.exporter.AbstractExporter

//@define Sch.plugin.mixin.Editor
//@require Ext.Mixin

//@define Sch.preset.Manager
//@require Ext.util.MixedCollection
//@require Sch.util.Date
//@require Sch.preset.ViewPreset

//@define Sch.preset.ViewPreset
//@require Sch.util.Date

//@define Sch.preset.ViewPresetHeaderRow

//@define Sch.selection.AssignmentModel
//@require Sch.selection.EventModel

//@define Sch.selection.EventModel
//@require Ext.selection.Model
//@require Ext.util.KeyNav

//@define Sch.template.Dependency
//@require Ext.XTemplate

//@define Sch.template.DependencyInfo
//@require Ext.XTemplate

//@define Sch.template.Event
//@require Ext.XTemplate

//@define Sch.tooltip.ClockTemplate
//@require Ext.XTemplate

//@define Sch.tooltip.EventTip
//@require Ext.tip.ToolTip
//@uses Ext.Number
//@uses Ext.util.Format
//@uses Ext.util.Region
//@uses Ext.util.Point

//@define Sch.tooltip.HoverTip
//@require Ext.tip.ToolTip
//@require Sch.tooltip.ClockTemplate

//@define Sch.tooltip.Tooltip
//@require Ext.tip.ToolTip
//@require Ext.XTemplate
//@require Sch.tooltip.ClockTemplate

//@define Sch.util.Cache

//@define Sch.util.Date
//@require Ext.Date

//@define Sch.util.Debug

//@define Sch.util.DragTracker
//@require Ext.dd.DragTracker
//@require Ext.util.Region

//@define Sch.util.Patch
//@uses Ext.util.Cookies
//@uses Ext.data.Connection
//@uses Ext.Component

//@define Sch.util.RectangularPathFinder
//@uses Ext.Array

//@define Sch.util.ScrollManager

//@define Sch.view.AllDay
//@require Sch.view.SchedulerGridView
//@require Sch.view.AllDayMode

//@define Sch.view.AllDayMode
//@require Sch.view.Horizontal

//@define Sch.view.Horizontal
//@require Ext.util.Region
//@require Ext.Element
//@require Ext.Array
//@require Sch.util.Date

//@define Sch.view.HorizontalTimeAxis
//@require Ext.util.Observable
//@require Ext.XTemplate

//@define Sch.view.SchedulerGridView
//@require Sch.view.TimelineGridView

//@define Sch.view.TimelineGridView
//@require Ext.grid.View

//@define Sch.view.Vertical
//@require Ext.util.Region
//@require Ext.Element
//@require Ext.Array
//@require Sch.util.Date

//@define Sch.view.WeekView
//@require Ext.util.Region

//@define Sch.view.dependency.DragZone
//@require Ext.dd.DragZone
//@require Sch.template.DependencyInfo
//@require Sch.view.dependency.DropZone
//@require Sch.util.ScrollManager

//@define Sch.view.dependency.DropZone
//@require Ext.dd.DropZone

//@define Sch.view.dependency.Mixin
//@require Ext.Mixin
//@require Sch.view.dependency.View

//@define Sch.view.dependency.Painter
//@require Sch.util.RectangularPathFinder
//@require Sch.template.Dependency
//@uses Ext.Array
//@uses Ext.XTemplate
//@uses Ext.dom.Query
//@uses Sch.util.Date
//@uses Sch.util.RectangularPathFinder
//@uses Sch.template.Dependency

//@define Sch.view.dependency.Tooltip
//@require Ext.tip.ToolTip
//@require Sch.template.DependencyInfo

//@define Sch.view.dependency.View
//@require Sch.view.dependency.Tooltip
//@require Sch.view.dependency.DragZone
//@require Sch.view.dependency.Painter
//@require Sch.view.dependency.renderingstrategy.Combined
//@uses Ext.data.StoreManager
//@uses Ext.Array
//@uses Ext.dom.CompositeElementLite

//@define Sch.view.dependency.renderingstrategy.Abstract

//@define Sch.view.dependency.renderingstrategy.Async
//@require Sch.view.dependency.renderingstrategy.Abstract

//@define Sch.view.dependency.renderingstrategy.Bulk
//@require Sch.view.dependency.renderingstrategy.Abstract

//@define Sch.view.dependency.renderingstrategy.Combined
//@require Sch.view.dependency.renderingstrategy.Abstract

//@define Sch.view.model.TimeAxis
//@require Ext.util.Observable
//@require Ext.Date
//@require Sch.util.Date
//@require Sch.preset.Manager

//@define Sch.widget.ColumnPicker
//@require Ext.form.field.ComboBox
//@require Ext.data.Store

//@define Sch.widget.EventEditor
//@require Ext.form.Panel
//@require Ext.util.Region
//@require Ext.form.Label
//@require Ext.form.field.ComboBox
//@require Ext.form.field.Date
//@require Ext.form.field.Hidden
//@require Ext.form.field.Time
//@require Ext.Button
//@require Sch.model.Event
//@require Sch.util.Date
//@require Sch.patches.DateField

//@define Sch.widget.ExportDialog
//@require Ext.window.Window
//@require Ext.ProgressBar
//@require Sch.widget.ExportDialogForm

//@define Sch.widget.ExportDialogForm
//@require Ext.form.Panel
//@require Ext.data.Store
//@require Ext.XTemplate
//@require Ext.form.field.Number
//@require Ext.form.field.ComboBox
//@require Ext.form.field.Date
//@require Ext.form.FieldContainer
//@require Ext.form.field.Checkbox
//@require Sch.widget.ResizePicker
//@require Sch.widget.ColumnPicker

//@define Sch.widget.PagingToolbar
//@require Ext.toolbar.Paging

//@define Sch.widget.RecurrenceConfirmation
//@require Sch.widget.recurrence.ConfirmationDialog

//@define Sch.widget.ResizePicker
//@require Ext.Panel

//@define Sch.widget.mixin.CustomizableRecordForm
//@require Ext.Mixin

//@define Sch.widget.recurrence.ConfirmationDialog
//@require Ext.window.MessageBox

//@define Sch.widget.recurrence.Dialog
//@require Ext.window.Window
//@require Ext.button.Button
//@require Sch.model.Recurrence
//@require Sch.widget.recurrence.Form

//@define Sch.widget.recurrence.EventEditorMixin
//@require Ext.Mixin
//@require Ext.form.field.Hidden
//@require Sch.widget.recurrence.field.RecurrenceComboBox
//@require Sch.widget.recurrence.LegendButton
//@require Sch.widget.recurrence.Dialog
//@require Sch.widget.RecurrenceConfirmation

//@define Sch.widget.recurrence.Form
//@require Ext.form.Panel
//@require Ext.layout.container.HBox
//@require Ext.layout.container.VBox
//@require Ext.form.field.Display
//@require Ext.form.field.Number
//@require Ext.form.field.Radio
//@require Sch.model.Recurrence
//@require Sch.widget.recurrence.field.FrequencyComboBox
//@require Sch.widget.recurrence.field.PositionsComboBox
//@require Sch.widget.recurrence.field.DaysComboBox
//@require Sch.widget.recurrence.field.DaysSegmentedButton
//@require Sch.widget.recurrence.field.MonthDaysSegmentedButton
//@require Sch.widget.recurrence.field.MonthsSegmentedButton
//@require Sch.widget.recurrence.field.StopConditionComboBox

//@define Sch.widget.recurrence.LegendButton
//@require Ext.button.Button
//@require Sch.data.util.recurrence.Legend

//@define Sch.widget.recurrence.field.DaysComboBox
//@require Ext.form.field.ComboBox
//@require Ext.data.StoreManager
//@require Ext.data.ArrayStore
//@require Ext.Date
//@require Sch.data.util.recurrence.DayRuleEncoder

//@define Sch.widget.recurrence.field.DaysSegmentedButton
//@require Sch.field.SegmentedButton

//@define Sch.widget.recurrence.field.FrequencyComboBox
//@require Ext.form.field.ComboBox

//@define Sch.widget.recurrence.field.MonthDaysSegmentedButton
//@require Sch.field.SegmentedButton

//@define Sch.widget.recurrence.field.MonthsSegmentedButton
//@require Sch.field.SegmentedButton

//@define Sch.widget.recurrence.field.PositionsComboBox
//@require Ext.form.field.ComboBox
//@require Ext.data.StoreManager
//@require Ext.data.ArrayStore

//@define Sch.widget.recurrence.field.RecurrenceComboBox
//@require Sch.widget.recurrence.field.FrequencyComboBox

//@define Sch.widget.recurrence.field.StopConditionComboBox
//@require Ext.form.field.ComboBox
