const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const { createApp } = require('./createApp');

const port = 5000;
const useClustering = process.env.USE_CLUSTER === 'true';

if (useClustering && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking server across ${numCPUs} CPU cores to handle high concurrency...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = createApp();
  const serverMsg = useClustering
    ? `Worker ${process.pid} listening securely on port ${port} across all interfaces`
    : `Server listening securely on port ${port} (Single Process Mode)`;

  app.listen(port, '0.0.0.0', () => {
    console.log(serverMsg);
  });
}

module.exports = { createApp };
