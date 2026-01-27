const fs = require('fs').promises;
const path = require('path')
const os = require('os')
const { spawn } = require('node:child_process')
const crypto = require('crypto')
const ejs = require("ejs")
const { log, logError } = require('../commons/log')
const utils = require('../commons/utils')
const { logDev } = require('../commons/log')

// Wkhtmltopdf Path
const wkhtmltopdfPath = os.platform() === 'win32' ? 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe' : 'wkhtmltopdf'

// Templates Path
const TEMPLATES_DIR = path.join(process.cwd(), 'views')
const PDF_TIMEOUT_MS = parseInt(process.env.PDF_TIMEOUT_MS || '30000', 10)

// EJS to HTML
const renderEjsToFile = async (templateName, data) => {
  const html = await ejs.renderFile(path.join(TEMPLATES_DIR, `${templateName}.ejs`), { ...data, utils}, {
    cache: true,
    rmWhitespace: false,
    // Helps EJS resolve relative includes within templates
    filename: path.join(TEMPLATES_DIR, `${templateName}.ejs`)
  });
  const tmpPath = path.join(os.tmpdir(), `pdfsvc-${templateName}-${crypto.randomUUID()}.html`);
  await fs.writeFile(tmpPath, html, 'utf-8');
  return tmpPath;
}

// Args to Wkhtmltopdf
const buildWkhtmlArgs = ({ pageSize = 'A4', margin, dpi = 300 }) => {
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

  args.push('--margin-top', m.top, '--margin-right', m.right, '--margin-bottom', m.bottom, '--margin-left', m.left);

  // args.push('--disable-smart-shrinking');
  // args.push('--zoom', '1.0');

  return args;
}

// HTML to PDF with Wkhtmltopdf
const htmlFileToPdfBuffer = (inputHtmlPath, wkArgs) => {
  return new Promise((resolve, reject) => {
    // Spawn process
    const child = spawn(wkhtmltopdfPath, [...wkArgs, inputHtmlPath, '-'], { stdio: ['ignore', 'pipe', 'pipe'] });

    // Storage for Output Data
    const chunks = [];
    let stderr = '';

    // Kill Process if timeout threshold exceed
    const killTimer = setTimeout(() => { child.kill('SIGKILL'); }, PDF_TIMEOUT_MS);

    // Push chunk data
    child.stdout.on('data', (d) => { chunks.push(d); });

    // Push error data
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    // On Process Close
    child.on('close', code => {
      // Clear Timeout Event
      clearTimeout(killTimer);

      // Process closed with error
      if (code !== 0) return reject(new Error(`wkhtmltopdf exited ${code}: ${stderr.trim() || 'unknown error'}`));

      // Process successfully closed
      resolve(Buffer.concat(chunks));
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
  const { template, data = {}, options = {} } = req.body || {};

  logDev(data)

  // Missing template
  if (!template) return res.status(400).json({ error: 'Missing "template" in body' });

  // Enforce template existence to avoid arbitrary file reads
  const mainPath = path.join(TEMPLATES_DIR, `${template}.ejs`);

  // Verify if template exist
  try {
    await fs.access(mainPath);
  } catch {
    return res.status(404).json({ error: `Template "${template}" not found` });
  }

  // Render template to HTML
  const inputHtmlPath = await renderEjsToFile(template, data);

  // Build args for Wkhtmltopdf
  const wkArgs = buildWkhtmlArgs({
    pageSize: options.pageSize,
    margin: options.margin,
    dpi: options.dpi
  });

  // HTML to PDF
  const pdf = await htmlFileToPdfBuffer(inputHtmlPath, wkArgs);
  
  // Clear temp HTML file
  const toDelete = [inputHtmlPath].filter(Boolean);
  await Promise.allSettled(toDelete.map((p) => fs.unlink(p)));

  // Response as Base64 as text
  if(options.response === 'raw') {
    res.setHeader('Content-Type', 'application/text')
    return res.send(pdf.toString('base64'))
  }

  // Response as File
  if (options.response === 'pdf') {
    res.setHeader('Content-Length', pdf.length)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${template}.pdf`)
    return res.send(pdf)
  }

  // Response as Base64 in JSON
  return res.json({
    base64: pdf.toString('base64')
  })
};