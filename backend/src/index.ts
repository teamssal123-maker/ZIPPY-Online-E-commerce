import { createApp } from './app.ts';
import { config } from './config/index.ts';

const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Zippy API listening on http://localhost:${config.port}`);
});
