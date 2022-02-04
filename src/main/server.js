import express from 'express';
import ip from 'ip';
import fs from 'fs';
import cors from 'cors';

function createServer() {
  const PORT = 3000;
  const URL = `http://localhost:${PORT}`;

  const app = express();
  app.use(cors());

  const inMemoryStorage = {};

  function getContentFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/upload', (req, res) => {
    const { path } = req.body;
    try {
      inMemoryStorage.file = getContentFile(path);
      res.json({ ok: true });
    } catch {
      res.json({ ok: false });
    }
  });

  app.get('/preview', (req, res) => {
    res.send(inMemoryStorage.file);
  });

  app.get('/api/server-info', (req, res) => {
    res.json({
      ip: ip.address(),
      port: PORT,
    });
  });

  app.listen(3000, () => {
    console.log(`Server is running at ${URL}`);
  });
}

export default createServer;
