const html2pdf = require('./controllers/html2pdf.js')

module.exports = router => {
    // ----------------------------------------------------------------------------------
    // Html to Pdf Service
    // ----------------------------------------------------------------------------------
    router.post('/',  html2pdf.build)

    // ----------------------------------------------------------------------------------
    // Not found
    // ----------------------------------------------------------------------------------
    router.use((req, res) => {
        res.status(404).json({ error: `Route not found: (${req.method}) ${req.url}` })
    })

    return router
}