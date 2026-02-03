const fs = require('fs').promises;
const path = require('path')
const os = require('os')
const { spawn } = require('node:child_process')
const crypto = require('crypto')
const ejs = require("ejs")
const { logVerbose, logError, deep } = require('../commons/log')
const utils = require('../commons/utils')

// Wkhtmltopdf Path
const wkhtmltopdfPath = os.platform() === 'win32' ? 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe' : 'wkhtmltopdf'

// Templates Path
const TEMPLATES_DIR = path.join(process.cwd(), 'views')
const PDF_TIMEOUT_MS = parseInt(process.env.PDF_TIMEOUT_MS || '60000', 10)

// EJS to HTML
const renderEjsToFile = async (templatePath, data) => {
  const html = await ejs.renderFile(templatePath, { ...data, utils}, {
    cache: true,
    strict: false,
    rmWhitespace: false,
    filename: templatePath,
    localsName: 'data'
  })
  const tmpPath = path.join(os.tmpdir(), `html2pdf-${crypto.randomUUID()}.html`)
  await fs.writeFile(tmpPath, html, 'utf-8')
  return tmpPath
}

// Args to Wkhtmltopdf
const buildWkhtmlArgs = ({ pageSize = 'A4', margin, dpi = 300, headerHtmlPath, footerHtmlPath }) => {
  const args = [
    '--quiet',
    '--encoding', 'utf-8',
    '--print-media-type',
    '--enable-local-file-access',
    '--dpi', String(dpi),
    '--page-size', pageSize,
  ];

  const m = {
    top: margin?.top ?? '20mm',
    right: margin?.right ?? '15mm',
    bottom: margin?.bottom ?? '20mm',
    left: margin?.left ?? '15mm',
  };

  args.push('--margin-top', m.top, '--margin-right', m.right, '--margin-bottom', m.bottom, '--margin-left', m.left)
  
  if (headerHtmlPath) args.push('--header-html', headerHtmlPath)
  if (footerHtmlPath) args.push('--footer-html', footerHtmlPath)

  // args.push('--disable-smart-shrinking')
  // args.push('--zoom', '1.0')

  return args
}

// HTML to PDF with Wkhtmltopdf
const htmlFileToPdfBuffer = (inputHtmlPath, wkArgs) => {
  return new Promise((resolve, reject) => {
    // Output Path
    const outputPdfPath = path.join(os.tmpdir(), `html2pdf-${crypto.randomUUID()}.pdf`)

    // Spawn process
    const child = spawn(wkhtmltopdfPath, [...wkArgs, inputHtmlPath, outputPdfPath], { stdio: ['ignore', 'pipe', 'pipe'] })

    // Storage for Output Data
    // const chunks = [] // (not works in linux)
    let stderr = ''

    // Kill Process if timeout threshold exceed
    const killTimer = setTimeout(() => { child.kill('SIGKILL'); }, PDF_TIMEOUT_MS)

    // Push chunk data
    // child.stdout.on('data', (d) => { chunks.push(d) }) // (not works in linux)

    // Push error data
    child.stderr.on('data', (d) => { stderr += d.toString() })

    // On Process Close
    child.on('close', code => {
      // Clear Timeout Event
      clearTimeout(killTimer)

      // Process closed with error
      if (code !== 0) return reject(new Error(`wkhtmltopdf exited ${code}: ${stderr.trim() || 'unknown error'}`))

      // Process successfully closed
      // resolve(Buffer.concat(chunks));
      fs.readFile(outputPdfPath).then(buf => resolve(buf)).catch(e => reject(e))
    });

    // On Process Error
    child.on('error', err => {
      // Clear Timeout Event
      clearTimeout(killTimer)

      // Reject with error
      reject(err)
    })
  })
}

exports.build = async (req, res, next) => {
  // Read request body
  const { template: templateBody, data = {}, options = {} } = req.body || {}
  logVerbose('REQUEST BODY\n', deep(req.body))

  // Missing template
  if (!templateBody) return res.status(400).json({ error: 'Missing "template" in body' })

  // Template Sanitize
  const template = templateBody.replace(/[^a-zA-Z0-9/-]/g, '')

  // Enforce template existence to avoid arbitrary file reads
  const mainPath = path.join(TEMPLATES_DIR, `${template}.ejs`)

  const headerPath = options.header && path.join(TEMPLATES_DIR, `${utils.firstSplit(template)}/partials/header.ejs`)
  const footerPath = options.header && path.join(TEMPLATES_DIR, `${utils.firstSplit(template)}/partials/footer.ejs`)

  // Verify if templates exists
  try {
    await fs.access(mainPath)
    if (headerPath) await fs.access(headerPath)
    if (footerPath) await fs.access(footerPath)
  } catch {
    return res.status(404).json({ error: `Template "${template}" or partials header and footer not found` })
  }

  // Render template to HTML
  const mainHtmlPath = await renderEjsToFile(mainPath, data)
  const headerHtmlPath = headerPath && (await renderEjsToFile(headerPath, data))
  const footerHtmlPath = footerPath && (await renderEjsToFile(footerPath, data))

  // Build args for Wkhtmltopdf
  const wkArgs = buildWkhtmlArgs({
    pageSize: options.pageSize,
    margin: options.margin,
    dpi: options.dpi,
    headerHtmlPath,
    footerHtmlPath
  })
  logVerbose('WKHTMLTOPDF Args\n', wkArgs)

  // HTML to PDF
  const pdf = await htmlFileToPdfBuffer(mainHtmlPath, wkArgs)
  
  // Clear temp HTML files
  const toDelete = [mainHtmlPath, headerHtmlPath, footerHtmlPath].filter(Boolean)
  await Promise.allSettled(toDelete.map((p) => fs.unlink(p))) // i think it not need await, should be better just .then(_ => _).catch(e => errorLog(e))

  // Response as Base64 as text
  if(options.response === 'raw' || options.response === 'base64') {
    res.setHeader('Content-Type', 'application/text')
    return res.send(pdf.toString('base64'))
  }

  // Response as File
  if (options.response === 'pdf') {
    res.setHeader('Content-Length', pdf.length)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${utils.firstSplit(template)}.pdf`)
    return res.send(pdf)
  }

  // Response as Base64 in JSON
  return res.json({
    base64: pdf.toString('base64')
  })
};