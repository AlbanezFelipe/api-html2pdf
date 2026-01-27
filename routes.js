// --------------------------------------------------------------------------------------
// Controllers
// --------------------------------------------------------------------------------------
const html2pdf = require('./controllers/html2pdf.js')

// --------------------------------------------------------------------------------------
// Middlewares
// --------------------------------------------------------------------------------------
const hmac = require('./middlewares/hmac.js')

// --------------------------------------------------------------------------------------
// Router
// --------------------------------------------------------------------------------------
module.exports = router => {
    // ----------------------------------------------------------------------------------
    // Html to Pdf Service
    // ----------------------------------------------------------------------------------
    router.post('/', html2pdf.build /*
        #swagger.tags = ['HTML to PDF']
        #swagger.summary = 'Generate a PDF from HTML'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["template"],
                        properties: {
                            template: {
                                type: "string",
                                description: "Name of the HTML template to render",
                                example: "invoice"
                            },
                            data: {
                                type: "object",
                                description: "Dynamic data injected into the template"
                            },
                            options: {
                                type: "object",
                                description: "PDF generation options",
                                properties: {
                                    pageSize: {
                                        type: "string",
                                        description: "Paper size of the generated PDF",
                                        example: "A4"
                                    },
                                    dpi: {
                                        type: "number",
                                        description: "Rendering resolution in dots per inch",
                                        example: 300
                                    },
                                    margin: {
                                        type: "object",
                                        description: "Page margins",
                                        properties: {
                                            top: {
                                                type: "string",
                                                description: "Top margin",
                                                example: "20mm"
                                            },
                                            right: {
                                                type: "string",
                                                description: "Right margin",
                                                example: "15mm"
                                            },
                                            bottom: {
                                                type: "string",
                                                description: "Bottom margin",
                                                example: "20mm"
                                            },
                                            left: {
                                                type: "string",
                                                description: "Left margin",
                                                example: "15mm"
                                            }
                                        }
                                    },
                                    response: {
                                        type: "string",
                                        description: "Response format (pdf, base64, raw)",
                                        example: "pdf"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        #swagger.responses[200] = {
            description: 'PDF generated successfully'
        }
    */)

    // ----------------------------------------------------------------------------------
    // Tests
    // ----------------------------------------------------------------------------------
    if(process.env.NODE_ENV !== 'production') {

        // ------------------------------------------------------------------------------
        // Test Controllers
        // ------------------------------------------------------------------------------
        const ejsTest = require('./test/controllers/ejs.js')

        // ------------------------------------------------------------------------------
        // Ejs Preview Tests
        // ------------------------------------------------------------------------------
        router.get('/rabrune-faturamento', ejsTest.rabruneFaturamento 
            /* #swagger.tags = ['Preview Tests'] */
        )

        // ------------------------------------------------------------------------------
        // HMAC validation Test
        // ------------------------------------------------------------------------------
        router.get('/hmac', hmac 
            /* #swagger.tags = ['HMAC Tests'] */, 
            (req, res, next) => res.send('ok')
        )
    }

    // ----------------------------------------------------------------------------------
    // Not found
    // ----------------------------------------------------------------------------------
    router.use((req, res) => {
        res.status(404).json({ error: `Route not found: (${req.method}) ${req.url}` })
    })

    return router
}