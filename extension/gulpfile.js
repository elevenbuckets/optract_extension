const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const browserify = require('browserify')
const gulpMultiProcess = require('gulp-multi-process')
const assign = require('lodash.assign')
const watchify = require('watchify')
const envify = require('envify/custom')
const gutil = require('gulp-util')
const watch = require('gulp-watch')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify-es').default

const browserPlatforms = [
    'firefox',
    'chrome',
    'edge',
    'opera',
  ]

function gulpParallel (...args) {
    return function spawnGulpChildProcess (cb) {
      return gulpMultiProcess(args, cb, true)
    }
  }
  
gulp.task('build',
  gulp.series(
    gulpParallel(
      'build:extension:js',
    )
  )
)

const buildJsFiles = [
    'content',
    'background',
  ]

createTasksForBuildJsExtension({ buildJsFiles, taskPrefix: 'build:extension:js' })

function createTasksForBuildJsExtension ({ buildJsFiles, taskPrefix, devMode, testing, bundleTaskOpts = {} }) {
    // inpage must be built before all other scripts:
    const rootDir = './scripts'
    const destinations = browserPlatforms.map(platform => `./dist/${platform}`)
    bundleTaskOpts = Object.assign({
      buildSourceMaps: true,
      sourceMapDir: devMode ? './' : '../sourcemaps',
      minifyBuild: !devMode,
      buildWithFullPaths: devMode,
      watch: devMode,
      devMode,
      testing,
    }, bundleTaskOpts)
    createTasksForBuildJs({ rootDir, taskPrefix, bundleTaskOpts, destinations, buildJsFiles })
  }

  function createTasksForBuildJs ({ rootDir, taskPrefix, bundleTaskOpts, destinations, buildJsFiles = [] }) {
    // bundle task for each file
    const jsFiles = buildJsFiles
    jsFiles.forEach((jsFile) => {
      gulp.task(`${taskPrefix}:${jsFile}`, bundleTask(Object.assign({
        label: jsFile,
        filename: `${jsFile}.js`,
        filepath: `${rootDir}/${jsFile}.js`,
        externalDependencies: jsFile === 'ui' && !bundleTaskOpts.devMode && uiDependenciesToBundle,
        destinations,
      }, bundleTaskOpts)))
    })
    // compose into larger task
    const subtasks = []
    subtasks.push(gulp.parallel(buildJsFiles.map(file => `${taskPrefix}:${file}`)))
  
    gulp.task(taskPrefix, gulp.series(subtasks))
  }

  function bundleTask (opts) {
    const bundler = generateBundler(opts, performBundle)
    // output build logs to terminal
    bundler.on('log', gutil.log)
  
    return performBundle
  
    function performBundle () {
      let buildStream = bundler.bundle()
  
      // handle errors
      buildStream.on('error', (err) => {
        beep()
        if (opts.watch) {
          console.warn(err.stack)
        } else {
          throw err
        }
      })
  
      // process bundles
      buildStream = buildStream
        // convert bundle stream to gulp vinyl stream
        .pipe(source(opts.filename))
        // buffer file contents (?)
        .pipe(buffer())
  
      // Initialize Source Maps
      if (opts.buildSourceMaps) {
        buildStream = buildStream
          // loads map from browserify file
          .pipe(sourcemaps.init({ loadMaps: true }))
      }
  
      // // Minification
      // if (opts.minifyBuild) {
      //   buildStream = buildStream
      //   .pipe(uglify({
      //     mangle: {
      //       reserved: [ 'MetamaskInpageProvider' ],
      //     },
      //   }))
      // }
  
      // Finalize Source Maps (writes .map file)
      if (opts.buildSourceMaps) {
        buildStream = buildStream
          .pipe(sourcemaps.write(opts.sourceMapDir))
      }
  
      // write completed bundles
      opts.destinations.forEach((dest) => {
        buildStream = buildStream.pipe(gulp.dest(dest))
      })
  
      return buildStream
  
    }
  }

  function generateBundler (opts, performBundle) {
    const browserifyOpts = assign({}, watchify.args, {
      plugin: 'browserify-derequire',
      debug: opts.buildSourceMaps,
      fullPaths: opts.buildWithFullPaths,
    })
  
    if (!opts.buildLib) {
      browserifyOpts['entries'] = [opts.filepath]
    }
  
    let bundler = browserify(browserifyOpts)
  
    if (opts.buildLib) {
      bundler = bundler.require(opts.dependenciesToBundle)
    }
  
    if (opts.externalDependencies) {
      bundler = bundler.external(opts.externalDependencies)
    }
  
    // inject variables into bundle
    bundler.transform(envify({
      METAMASK_DEBUG: opts.devMode,
      NODE_ENV: opts.devMode ? 'development' : 'production',
      IN_TEST: opts.testing,
      PUBNUB_SUB_KEY: process.env.PUBNUB_SUB_KEY || '',
      PUBNUB_PUB_KEY: process.env.PUBNUB_PUB_KEY || '',
    }), {
      global: true,
    })
  
    if (opts.watch) {
      bundler = watchify(bundler)
      // on any file update, re-runs the bundler
      bundler.on('update', async (ids) => {
        const stream = performBundle()
        await endOfStream(stream)
        livereload.changed(`${ids}`)
      })
    }
  
    return bundler
  }

  function beep () {
    process.stdout.write('\x07')
  }
  
  
  

