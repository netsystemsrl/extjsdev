Item = require './Item.coffee'

module.exports = class Stack
  @HEIGHT: 10

  constructor: (options) ->
    @items = []
    @scene = options.scene
    @maxItems = options.maxItems
    @geometry = new THREE.BoxGeometry(Item.WIDTH, Stack.HEIGHT, Item.WIDTH)
    @texture = THREE.ImageUtils.loadTexture('textures/stack.gif')
    @texture.anisotropy = 4
    @material = new THREE.MeshBasicMaterial(map: @texture)
    @mesh = new THREE.Mesh(@geometry, @material)

    @mesh.position = options.position

    @scene.add @mesh

  addItem: (item, callback) ->
    itemCounter = @items.length
    stackIsFull = itemCounter >= @maxItems
    unless stackIsFull
      pos =
        x: @mesh.position.x
        y: @getTopPosY()
        z: @mesh.position.z

      item.mesh.position = pos
      @items.push item

    callback?()
    not stackIsFull

  unload: (callback) ->
    item = @_getTopItem()
    if item
      @items = @items[0..-2]

      clock = new THREE.Clock()
      animate = =>
        if item.mesh.position.y < @mesh.position.y + (@maxItems+1)*Item.HEIGHT
          requestAnimationFrame(animate)
          item.mesh.position.y += Item.HEIGHT*2 * clock.getDelta()
        else
          setTimeout((=> @_removeItem(item, callback)), 1000)
          
      animate()
      clock.start()

    item?

  relocateTo: (otherStack, callback) ->
    item = @_getTopItem()
    canRelocate = not @isEmpty() and otherStack? and not otherStack.isFull() and otherStack isnt @
    if canRelocate
      needsLiftingUp = true
      needsShiftingX = true
      needsShiftingZ = true
      needsLowering = true

      clock = new THREE.Clock()
      animate = =>
        moveSize = Item.HEIGHT*2*clock.getDelta()
        if needsLowering
          requestAnimationFrame(animate)
        else
          @items = @items[0..-2]
          otherStack.addItem item
          callback?()

        needsLiftingUp &= item.mesh.position.y < (@maxItems+2) * Item.HEIGHT
        item.mesh.position.y += moveSize if needsLiftingUp
        unless needsLiftingUp
          needsShiftingX &= Math.abs(item.mesh.position.x - otherStack.mesh.position.x) > moveSize
          needsShiftingZ &= Math.abs(item.mesh.position.z - otherStack.mesh.position.z) > moveSize
          item.mesh.position.x += moveSize * (if otherStack.mesh.position.x > item.mesh.position.x then 1 else -1) if needsShiftingX
          item.mesh.position.z += moveSize * (if otherStack.mesh.position.z > item.mesh.position.z then 1 else -1) if needsShiftingZ

          unless needsShiftingX or needsShiftingZ
            item.mesh.position.x = (item.mesh.position.x + otherStack.mesh.position.x)/2
            item.mesh.position.z = (item.mesh.position.z + otherStack.mesh.position.z)/2
            needsLowering &= item.mesh.position.y - otherStack.getTopPosY() > moveSize
            item.mesh.position.y -= moveSize

      animate()
      clock.start()

    callback?() unless canRelocate
    canRelocate

  isFull: ->
    @items.length is @maxItems

  isEmpty: ->
    @items.length is 0

  getTopPosY: ->
    @mesh.position.y + Stack.HEIGHT/2 + (@items.length+.5)*Item.HEIGHT

  _getTopItem: ->
    @items[-1..][0]

  _removeItem: (item, callback) ->
    @scene.remove item.mesh
    callback?()