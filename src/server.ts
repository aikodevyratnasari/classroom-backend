import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  console.log(`Request URL: ${req.url}`);
  res.send('Hello from the Express server!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
