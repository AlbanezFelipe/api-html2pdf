// ---------------------------------------------------------------------------------
// Load .env
// ---------------------------------------------------------------------------------
require('dotenv').config({ quiet: true })

// ---------------------------------------------------------------------------------
// Express
// ---------------------------------------------------------------------------------
const express = require('express')
const app = express()

// ---------------------------------------------------------------------------------
// Ejs for render preview
// ---------------------------------------------------------------------------------
// if (process.env.NODE_ENV !== 'production') { app.set('view engine', 'ejs') }

// ---------------------------------------------------------------------------------
// Tell express to trust proxy (only use if behind a nginx proxy)
// ---------------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') { app.set('trust proxy', true) }

// ---------------------------------------------------------------------------------
// Log Utils
// ---------------------------------------------------------------------------------
const color = require('./commons/color.js')
const { log } = require('./commons/log.js')

// ---------------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------------
app.use(require('body-parser').json({ limit: '10mb', verify: (req, res, buf) => { req.bodyBuf = buf } })) // buf for hmac
if (process.env.NODE_ENV === 'production') { app.use(require('helmet')()) } // disabled in dev for pdf-preview
app.use(require('cors')())
app.use(require('compression')())
app.use(require('morgan')(`${color('[HTTP]', 'lightmagenta', 'bold')}${color('[:date[clf]]')}[${color(':remote-addr', 'yellow', 'bold')}] :method :url ${color(':status', 'blue', 'bold')} :total-time ms ":user-agent"`))
app.use(require('express-rate-limit').rateLimit({ windowMs: 60000, limit: 100, message: { error: 'Too many requests, please try again later.' }, standardHeaders: true, legacyHeaders: false, validate: { trustProxy: false } })) // allowed 100 request per minute by ip

// ---------------------------------------------------------------------------------
// Pdf Preview for Dev Environment
// ---------------------------------------------------------------------------------
// if (process.env.NODE_ENV !== 'production') { app.use('/pdf-preview', express.static(require('path').join(__dirname, 'pdf-preview'))) }

// ---------------------------------------------------------------------------------
// Swagger for Dev Environment
// ---------------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express')
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('./swagger/output.json')))
}

// ---------------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------------
app.use('/', require('./routes.js')(express.Router()))

// ---------------------------------------------------------------------------------
// Error Middleware
// ---------------------------------------------------------------------------------
app.use(require('./middlewares/error.js'))

// ---------------------------------------------------------------------------------
// Http Server
// ---------------------------------------------------------------------------------
const server = app.listen(process.env.PORT || 8000, () => {
    log(color('HTTP Server listening on port'), server.address()?.port)
})

// ---------------------------------------------------------------------------------
// Process env logs
// ---------------------------------------------------------------------------------
log(color('NODE_ENV:', 'green'), process.env.NODE_ENV === 'production' ? 'production' : 'dev')
if (process.env.NODE_ENV !== 'production' && process.env.NODEMON_LEGACY === '1') log(color('Nodemon', 'green'), 'with ', color('--legacy-watch', 'yellow'))
