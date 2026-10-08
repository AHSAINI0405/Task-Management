import 'dotenv/config';
import { env }       from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import app           from './src/app.js';

async function bootstrap() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`  Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10 s if connections don't drain
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (err) => { console.error('Uncaught:', err);  process.exit(1); });
  process.on('unhandledRejection', (err) => { console.error('Unhandled:', err); process.exit(1); });
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
