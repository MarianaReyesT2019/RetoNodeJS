const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Ruta para mostrar el formulario HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para manejar el envío del formulario y guardar el archivo
app.post('/submit', upload.single('archivoAdjunto'), (req, res) => {
  const { nombre, email } = req.body;
  const archivoAdjunto = req.file;

  // Guardar los datos en un archivo JSON
  const contacto = {
    nombre,
    email,
    archivoAdjunto: archivoAdjunto ? archivoAdjunto.filename : null,
  };

  fs.readFile('contactos.json', 'utf8', (err, data) => {
    if (err) {
      fs.writeFileSync('contactos.json', JSON.stringify([contacto]));
    } else {
      const contactos = JSON.parse(data);
      contactos.push(contacto);
      fs.writeFileSync('contactos.json', JSON.stringify(contactos));
    }
  });

  res.redirect('/list');
});

// Ruta para mostrar la lista de contactos
app.get('/list', (req, res) => {
  fs.readFile('contactos.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error al leer la lista de contactos');
      return;
    }
    const contactos = JSON.parse(data);
    res.render('list.html', { contactos });
  });
});

app.listen(port, () => {
  console.log(`Aplicación escuchando en http://localhost:${port}`);
});
