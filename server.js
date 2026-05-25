const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sirve el index.html desde esta misma carpeta
app.use(express.static(path.join(__dirname)));

// Ruta del proxy
app.post('/proxy', async (req, res) => {
  const { url, method, headers, body } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Falta el campo "url"' });
  }

  const options = {
    method: method || 'GET',
    headers: headers || {},
  };

  if (body && !['GET', 'HEAD'].includes(method)) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const t0 = Date.now();
    const response = await fetch(url, options);
    const elapsed = Date.now() - t0;

    // Leer respuesta como texto para no perder nada
    const responseText = await response.text();

    // Recolectar headers de la respuesta
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseText,
      elapsed,
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error al hacer la petición: ' + err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ API Tester corriendo en http://localhost:${PORT}`);
  console.log(`   Abre esa URL en tu navegador\n`);
});
