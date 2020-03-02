'use strict' 

const fs            = require('fs') //FileSistem
const gulp 			= require('gulp') //Gulp
const concat 		= require ('gulp-concat') //Concatena arquivos
const sourcemaps 	= require('gulp-sourcemaps') //Mapea codigo SASS para debug no console
const sass 			= require('gulp-sass') //SASS
const postcss 		= require('gulp-postcss') //PostCSS
const autoprefixer 	= require('autoprefixer') //Aplica prefixo de navegadores antigos
const cssnano 		= require('cssnano') //Minifica css
const cssnext 		= require('postcss-preset-env') //CSS do futuro
const mqpacker 		= require('css-mqpacker') //Unifica todas as @medias da mesma condição em apenas uma
const terser        = require('gulp-terser') //Minifica os arquivos js
const imagemin      = require('gulp-imagemin') //Otimiza as imagens
const changed       = require('gulp-changed') //Verifica se houve alterações
const browserSync   = require('browser-sync').create() //Synca os arquivos com o browser e faz o proxy reverso dos arquivos
const b             = require('browserify') //Converte commonJs para ES
const source        = require('vinyl-source-stream')
const buffer        = require('vinyl-buffer')
const babelify      = require('babelify') //Transpila arquivos js para versões antigas do ES
const glob          = require('glob') //Possibilita o uso da escrita do terminal no browserify

const config = {
    nickName: 'lv',
    accountName: 'leveros',
    https: true
}

const paths = {
    dist: {
        dest: '/'
    },
    styles: {
        src: './src/styles/**/*.scss',
        dest: `./${config.accountName}/`,
        input: `./src/styles/**/${config.nickName}-style.scss`
    },
    scripts: {
        src: './src/scripts/**/*.js',
        dest: `./${config.accountName}/`
    },
    images: {
        src: './src/images/**/*',
        dest: `./${config.accountName}/`
    },
    fonts: {
        src: './src/fonts/**/*.woff',
        dest: `./${config.accountName}/`
    }
}

gulp.task('style', () => {
	let processors = [
		autoprefixer,
		cssnano,
		cssnext,
        mqpacker
	]
    return gulp.src(paths.styles.input)
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe( gulp.dest(paths.styles.dest))
});

gulp.task('script', () => {
    let testFiles = glob.sync(paths.scripts.src)
    return b({
        entries: testFiles
    })
    .transform('babelify',{
        presets: ['@babel/env']
    })
    .bundle()
    .pipe(source(`${config.nickName}-script.js`))
    .pipe(buffer())
    .pipe(terser({
        toplevel: true
    }))
    .pipe(gulp.dest(paths.scripts.dest))
})

gulp.task('image', () => {
    return gulp.src(paths.images.src)
    .pipe(changed(paths.images.dest))
    .pipe(imagemin({
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
            {
                removeViewBox: true
            }
        ]
    }))
    .pipe( gulp.dest(paths.images.dest))
})

gulp.task('font', () => {
    return gulp.src(paths.fonts.src)
    .pipe( gulp.dest(paths.fonts.dest))
})

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: `./${config.accountName}`
        }
    });
});

// gulp.task('browserSyncProxy', () => {
//     return browserSync.init({
//       open: true,
//       watch: true,
//       https: config.https || true,
//       host: config.accountName + '.com.br',
//       startPath: '/',
//       proxy: 'https://' + config.accountName + '.com.br',
//       serveStatic: [{
//         route: '/catalog/view/theme/rapida/leveros',
//         dir: ['../leveros']
//       }]
//     })
// })

const watch = () => {
	gulp.watch(paths.styles.src, gulp.series('style')).on('change', browserSync.reload)
	gulp.watch(paths.scripts.src, gulp.series('script')).on('change', browserSync.reload)
	gulp.watch(paths.images.src, gulp.series('image')).on('change', browserSync.reload)
}

gulp.task('dev', gulp.parallel('style', 'script', 'image', 'font', 'browserSync', watch))

gulp.task('build', gulp.parallel('style', 'script', 'image', 'font', 'browserSync', watch))
