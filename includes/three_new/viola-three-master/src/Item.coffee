module.exports = class Item
  @HEIGHT: 30
  @WIDTH: 100

  constructor: (options) ->
    img = new Image
    
    console.warn 'No name provided for item!' unless options.name
    options.name ?= '#'
    
    @scene = options.scene
    @geometry = new THREE.BoxGeometry(Item.WIDTH, Item.HEIGHT, Item.WIDTH)
    bitmap = document.createElement 'canvas'
    
    img.onload = =>
      g = bitmap.getContext '2d'
      textureSize = Math.min img.width, img.height
      bitmap.width = img.width
      bitmap.height = img.height
      g.font = 'Bold ' + textureSize/1.5 + 'px Helvetica'
    
      g.drawImage(img, 0, 0);
      
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      
      g.strokeStyle = 'black'
      g.lineWidth = textureSize/20
      tmp = textureSize/2
      g.strokeText(options.name, tmp, tmp);
      g.fillStyle = 'white'
      g.fillText(options.name, tmp, tmp)
      
      @texture.needsUpdate = true
    
    img.src = 'textures/crate.gif'
    
    @texture = new THREE.Texture bitmap
    @texture.anisotropy = 4
    @material = new THREE.MeshBasicMaterial(map: @texture)
    @mesh = new THREE.Mesh(@geometry, @material)
    @mesh.position = options.position

    @scene.add @mesh