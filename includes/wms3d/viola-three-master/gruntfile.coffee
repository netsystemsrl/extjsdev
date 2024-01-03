module.exports = (grunt) ->

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-connect'

  grunt.initConfig

    connect:
        server:
          options:
            port: 8080
            base: 'public'

    watch:
      scripts:
        files: 'src/**/*.coffee'
        tasks: ['browserify']
        options:
          spawn: false

    browserify:
      dist:
        files:
          'public/build/main.js': 'src/main.coffee'
        options:
          transform: ['coffeeify']
          bundleOptions:
            debug: true

  grunt.registerTask 'default', 'launch the server for preview', ['browserify', 'connect', 'watch']
