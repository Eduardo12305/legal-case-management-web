import { spawnSync } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const indexFile = path.join(distDir, 'index.html')
const port = Number(process.env.PORT || 3000)

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function runBuild() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = spawnSync(command, ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    throw new Error('Falha ao gerar o build de producao.')
  }
}

function sendFile(response, filePath, statusCode = 200) {
  const extension = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[extension] || 'application/octet-stream'

  response.writeHead(statusCode, { 'Content-Type': contentType })
  createReadStream(filePath).pipe(response)
}

function resolveRequestPath(urlPath) {
  const sanitizedPath = decodeURIComponent((urlPath || '/').split('?')[0])
  const normalizedPath = path.normalize(sanitizedPath).replace(/^(\.\.[/\\])+/, '')
  const relativePath = normalizedPath === path.sep ? 'index.html' : normalizedPath.replace(/^[/\\]+/, '')

  return path.join(distDir, relativePath)
}

runBuild()

createServer((request, response) => {
  const requestPath = resolveRequestPath(request.url || '/')

  if (existsSync(requestPath) && statSync(requestPath).isFile()) {
    sendFile(response, requestPath)
    return
  }

  if (existsSync(indexFile)) {
    sendFile(response, indexFile)
    return
  }

  response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Nao foi possivel localizar o build da aplicacao.')
}).listen(port, () => {
  console.log(`Advon Web ativo na porta ${port}`)
})
