const fs = require('fs').promises;
const path = require('path')
const os = require('os')
const { spawn } = require('node:child_process')
const crypto = require('crypto')
const ejs = require("ejs")
const { log, logError } = require('../commons/log')

const TEMPLATES_DIR = path.join(process.cwd(), 'views');
const PDF_TIMEOUT_MS = parseInt(process.env.PDF_TIMEOUT_MS || '30000', 10);

const renderEjsToFile = async (templateName, data) => {
  const html = await ejs.renderFile(path.join(TEMPLATES_DIR, `${templateName}.ejs`), data, {
    cache: true,
    rmWhitespace: false,
    // Helps EJS resolve relative includes within templates
    filename: path.join(TEMPLATES_DIR, `${templateName}.ejs`)
  });
  const tmpPath = path.join(os.tmpdir(), `pdfsvc-${templateName}-${crypto.randomUUID()}.html`);
  await fs.writeFile(tmpPath, html, 'utf-8');
  return tmpPath;
}

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

  // Optional tweaks you might enable based on layout needs
  // args.push('--disable-smart-shrinking');
  // args.push('--zoom', '1.0');

  return args;
}

const htmlFileToPdfBuffer = async (inputHtmlPath, wkArgs) => {
  return new Promise((resolve, reject) => {
    const child = spawn('wkhtmltopdf', [...wkArgs, inputHtmlPath, '-'], { stdio: ['ignore', 'pipe', 'pipe'] });

    const chunks = [];
    let stderr = '';

    const killTimer = setTimeout(() => {
      child.kill('SIGKILL');
    }, PDF_TIMEOUT_MS);

    child.stdout.on('data', (d) => { 
        chunks.push(d)
        log("chunk called")
    });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      clearTimeout(killTimer);
      if (code !== 0) {
        reject(new Error(`wkhtmltopdf exited ${code}: ${stderr.trim() || 'unknown error'}`));
      } else {
        log("finish", chunks)
        resolve(Buffer.concat(chunks));
      }
    });

    child.on('error', (err) => {
      clearTimeout(killTimer);
      reject(err);
    });
  });
}

/**
 * POST /pdf
 * Body:
 * {
 *   "template": "invoice",
 *   "data": { ... },
 *   "options": {
 *     "pageSize": "A4",
 *     "dpi": 300,
 *     "margin": { "top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm" }
 *   },
 *   "headerTemplate": "header", // optional
 *   "footerTemplate": "footer"  // optional
 * }
 */
exports.build = async (req, res, next) => {
  const { template, data = {}, options = {} } = req.body || {};
  if (!template) return res.status(400).json({ error: 'Missing "template" in body' });

  // Enforce template existence to avoid arbitrary file reads
  const mainPath = path.join(TEMPLATES_DIR, `${template}.ejs`);
  log(mainPath)
  try {
    await fs.access(mainPath);
  } catch {
    return res.status(404).json({ error: `Template "${template}" not found` });
  }

  try {
    const pdfBuffer = await (async () => {
      // Render main HTML
      const inputHtmlPath = await renderEjsToFile(template, data);

      const wkArgs = buildWkhtmlArgs({
        pageSize: options.pageSize,
        margin: options.margin,
        dpi: options.dpi
      });

      try {
        const pdf = await htmlFileToPdfBuffer(inputHtmlPath, wkArgs);
        return { pdf, tmpPaths: [inputHtmlPath].filter(Boolean) };
      } catch (err) {
        throw err;
      } finally {
        // Cleanup temp files
        const toDelete = [inputHtmlPath].filter(Boolean);
        await Promise.allSettled(toDelete.map((p) => fs.unlink(p)));
      }
    })();

    //log(pdfBuffer.pdf)

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    log(pdfBuffer.pdf.toString('base64'))
    res.send(pdfBuffer.pdf.toString('base64'))

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'PDF generation failed' });
  }
};