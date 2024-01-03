Stack = require './Stack.coffee'
Item = require './Item.coffee'

module.exports = class Storehouse

  constructor: (options) ->
    @promised = []
    @maxItems = options.maxItems
    @stacks = []
    @canvas = options.canvas
    @renderer = new THREE.WebGLRenderer(canvas: @canvas)

    @camera = new THREE.PerspectiveCamera(70, 1, 1, 1000)

    @controls = new THREE.OrbitControls @camera
    @controls.movementSpeed = 200;
    @controls.lookSpeed = .25

    @scene = new THREE.Scene()

    @initStacks(options.items)

    @resize()
    @render()

  resize: ->
    @camera.aspect = @canvas.width / @canvas.height
    @camera.updateProjectionMatrix()
    @renderer.setSize(@canvas.width, @canvas.height)
    #@controls.handleResize();

  render: ->
    requestAnimationFrame(=> @render())
    @renderer.render(@scene, @camera)
    @controls.update()

  initStacks: (stacks) ->
    @size = Math.ceil Math.sqrt stacks.length
    
    tmp = @size * Item.WIDTH
    @camera.position.x = tmp
    @camera.position.z = tmp
    @camera.position.y = @maxItems * 2 * Item.HEIGHT
    
    for items in stacks
      @addStack items

  addStack: (items = []) ->
    stackCounter = @stacks.length
    pos =
      x: Math.floor(stackCounter / @size)*120
      y: 0
      z: Math.floor(stackCounter % @size)*120
    @stacks.push new Stack
      scene: @scene
      position: pos
      maxItems: @maxItems
    i = 0
    for itemName in items
      @addItem stackCounter, itemName

  addItem: (stackId, itemName) ->
    if @stacks[stackId]?
      @_lock() and @stacks[stackId].addItem(
        (new Item
          scene: @scene
          name: itemName
        ),
        => @_unlock()
      )

  relocate: (originStackId, targetStackId, callback = ->) ->
    result = false
    if @stacks[originStackId]? and @_lock() 
      result = @stacks[originStackId].relocateTo @stacks[targetStackId], => 
        @_unlock() 
        callback()
      @_unlock() unless result
    result

  unload: (stackId, callback = ->) ->
    result = false
    if @stacks[stackId]? and  @_lock() 
      result = @stacks[stackId].unload => 
        @_unlock()
        callback()
      @_unlock() unless result
    result
    
  promiseTo: ->
    promised = @promised
    self = @
    {
      relocate: (originStackId, targetStackId) ->
        promised.push -> self.relocate(originStackId, targetStackId)
        self._unlock() unless self.locked
        @
      unload: (stackId) ->
        promised.push -> self.unload(stackId)
        self._unlock() unless self.locked
        @
    }

  _lock: ->
    result = not @locked
    @locked = true
    result

  _unlock: ->
    @locked = false
    if @promised.length > 0
      @promised.shift().call()
