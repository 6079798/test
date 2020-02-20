const fs = require("fs")
const { series, parallel, src, dest, watch } = require("gulp")
const browserSync = require("browser-sync")
const del = require("del")
const plumber = require("gulp-plumber")
const nunjucks = require("gulp-nunjucks-render")
const removeEmptyLines = require("gulp-remove-empty-lines")
const base64 = require("gulp-base64-inline")
const rename = require("gulp-rename")
const webpackStream = require("webpack-stream")
const webpack = require("webpack")
const rev = require("gulp-rev")
const revRw = require("gulp-rev-rewrite")
const revDelete = require("gulp-rev-delete-original")

// PostCss Plugins (https://www.postcss.parts)

const postcss = require("gulp-postcss")
const postcssImport = require("postcss-import")
const postcssMixins = require("postcss-mixins")
const postcssNested = require("postcss-nested")
const postcssExtend = require("postcss-extend")
const postcssVariables = require("postcss-css-variables")
const postcssCustomMedia = require("postcss-custom-media")
const postcssColor = require("postcss-color-function")
const postcssEasing = require("postcss-easings") // https://easings.net
const objectFitImages = require("postcss-object-fit-images")
const autoprefixer = require("autoprefixer")
const mqPacker = require("css-mqpacker")
const cssnano = require("cssnano")

const customCssPlugins = [
	postcssImport(),
	postcssMixins(),
	postcssNested(),
	postcssExtend(),
	postcssVariables(),
	postcssCustomMedia(),
	postcssColor(),
	postcssEasing(),
	objectFitImages(),
	autoprefixer(),
	mqPacker({ sort: true }),
	cssnano(),
]

const vendorCssPlugins = [postcssImport(), cssnano()]

const paths = {
	src: {
		dir: "src",
		njk: {
			all: "src/pages/**/*.*",
			templates: "src/pages/includes",
		},
		css: {
			all: "src/css/**/*.*",
			custom: "src/css/styles.{pcss, css}",
			vendor: "src/css/vendor.css",
		},
		js: {
			all: "src/js/**/*.*",
			dir: "src/js",
		},
		img: {
			all: "src/img/**/*.*",
			inline: "../img/inline",
		},
		copy: "src/copy/**/*.*",
	},
	build: {
		dir: "public",
		css: "public/css",
		js: "public/js",
		img: "public/img",
	},
}

const isDev = !process.env.BUILD

const cleanBuild = () => {
	return del(paths.build.dir)
}
exports.clean = cleanBuild

const njkRender = () => {
	return src([paths.src.njk.all, `!${paths.src.njk.templates}/**/*.*`])
		.pipe(plumber())
		.pipe(
			nunjucks({
				path: paths.src.njk.templates,
			})
		)
		.pipe(
			removeEmptyLines({
				removeComments: true,
			})
		)
		.pipe(dest(paths.build.dir))
}

const buildCss = () => {
	return src(paths.src.css.custom)
		.pipe(plumber())
		.pipe(base64(paths.src.img.inline))
		.pipe(postcss(customCssPlugins))
		.pipe(rename("styles.min.css"))
		.pipe(dest(paths.build.css))
		.pipe(browserSync.stream())
}

const buildVendorCss = () => {
	return src(paths.src.css.vendor)
		.pipe(plumber())
		.pipe(postcss(vendorCssPlugins))
		.pipe(rename("vendor.min.css"))
		.pipe(dest(paths.build.css))
		.pipe(browserSync.stream())
}

const buildJs = () => {
	const { files } = JSON.parse(
		fs.readFileSync(`./${paths.src.dir}/entryPoints.json`, "utf8")
	)

	const entry = files.reduce((res, file) => {
		res[file] = `./${paths.src.js.dir}/${file}.js`
		return res
	}, {})

	const webpackConfig = {
		devtool: isDev ? "source-map" : "",
		mode: isDev ? "development" : "production",
		entry,
		output: {
			path: __dirname + paths.build.js,
			filename: "[name].min.js",
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: "jquery",
				jQuery: "jquery",
				"window.jQuery": "jquery",
			}),
		],
		module: {
			rules: [
				{
					test: /\.(js)$/,
					exclude: /(node_modules)/,
					loader: "babel-loader",
					query: {
						presets: [
							[
								"@babel/preset-env",
								{
									useBuiltIns: "entry",
									corejs: "3.6",
								},
							],
						],
					},
				},
				{
					test: /\.css$/,
					loader: "ignore-loader",
				},
			],
		},
	}

	return src(paths.src.js.all)
		.pipe(plumber())
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(dest(paths.build.js))
}

const copyImages = () => {
	return src([paths.src.img.all, "!src/img/inline/**/*.*"]).pipe(
		dest(paths.build.img)
	)
}

const copyAsIs = () => {
	return src(paths.src.copy).pipe(dest(paths.build.dir))
}

const revRename = () => {
	return src(`${paths.build.dir}/{css,js}/*.{css,js}`)
		.pipe(rev())
		.pipe(revDelete())
		.pipe(dest(paths.build.dir))
		.pipe(rev.manifest())
		.pipe(dest(paths.src.dir))
}

const revRewrite = () => {
	const manifest = src(`${paths.src.dir}/rev-manifest.json`)
	return src(`${paths.build.dir}/**/*.html`)
		.pipe(revRw({ manifest }))
		.pipe(dest(paths.build.dir))
}

const reload = done => {
	browserSync.reload()
	done()
}

const serve = () => {
	browserSync.init({
		server: paths.build.dir,
		port: 3000,
		notify: false,
		open: false,
	})

	watch(
		paths.src.njk.all,
		{
			events: ["change", "add"],
			delay: 100,
		},
		series(njkRender, reload)
	)

	watch(
		paths.src.css.all,
		{ events: ["change", "add"], delay: 100 },
		parallel(buildVendorCss, buildCss)
	)

	watch(
		paths.src.js.all,
		{ events: ["change", "add"], delay: 100 },
		series(buildJs, reload)
	)

	watch(
		paths.src.js.all,
		{ events: ["unlink"], delay: 100 },
		series(() => del(paths.build.js), buildJs, reload)
	)

	watch(
		paths.src.img.all,
		{ events: ["all"], delay: 100 },
		series(copyImages, reload)
	)

	watch(
		paths.src.copy,
		{ events: ["all"], delay: 100 },
		series(copyAsIs, reload)
	)
}

exports.default = series(
	cleanBuild,
	parallel(njkRender, buildCss, buildVendorCss),
	parallel(buildJs, copyImages, copyAsIs),
	serve
)

exports.build = series(
	cleanBuild,
	parallel(njkRender, buildCss, buildVendorCss),
	parallel(buildJs, copyImages, copyAsIs),
	revRename,
	revRewrite
)
