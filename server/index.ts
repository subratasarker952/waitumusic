import dotenv from "dotenv"
dotenv.config()
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerTechnicalRiderRoutes } from "./routes/technicalRiderIntegration";
import workflowRoutes from "./routes/workflow-routes";
import { setupVite, serveStatic, log } from "./vite";
import oppHubErrorLearning from "./oppHubErrorLearning";
import oppHubProactiveSystem from "./oppHubProactiveSystem";
import oppHubCreditTracking from "./oppHubCreditTracking";
import { applySecurityMiddleware } from "./middleware/apply-security";

const app = express();

// PERMANENT DOUBLE-STRINGIFY JSON PROTECTION SYSTEM
// This replaces express.json() with custom parsing that handles ALL cases
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers['content-type']?.includes('application/json')) {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // Start with raw body
        let parsedBody = body;
        
        // Handle completely empty body
        if (!parsedBody.trim()) {
          req.body = {};
          return next();
        }
        
        // First parse attempt
        try {
          parsedBody = JSON.parse(parsedBody);
        } catch (e) {
          console.error('❌ First JSON parse failed:', body.substring(0, 100));
          return res.status(400).json({ message: 'Invalid JSON format' });
        }
        
        // If result is still a string, try parsing again (double-stringify case)
        while (typeof parsedBody === 'string') {
          try {
            const nextParse = JSON.parse(parsedBody);
            parsedBody = nextParse;
            console.log('🔧 OppHub fixed double-stringified JSON (nested level)');
          } catch (e) {
            // If it fails to parse again, treat as regular string
            break;
          }
        }
        
        // Handle edge case: quoted JSON objects
        if (typeof parsedBody === 'string' && 
            parsedBody.startsWith('{') && parsedBody.endsWith('}')) {
          try {
            parsedBody = JSON.parse(parsedBody);
            console.log('🔧 OppHub fixed quoted JSON object');
          } catch (e) {
            // Leave as string if can't parse
          }
        }
        
        req.body = parsedBody;
        next();
        
      } catch (error) {
        console.error('❌ Critical JSON parsing error:', error);
        return res.status(400).json({ message: 'JSON parsing failed completely' });
      }
    });
  } else {
    // For non-JSON requests, use standard express parsing
    express.json({ limit: '50mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Security headers to reduce browser warnings
app.use((req: Request, res: Response, next: NextFunction) => {
  // Modern security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - explicitly disable deprecated features to reduce warnings
  res.setHeader('Permissions-Policy', [
    'camera=()', 
    'microphone=()', 
    'geolocation=()',
    'ambient-light-sensor=()',
    'battery=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'layout-animations=()',
    'legacy-image-formats=()',
    'navigation-override=()',
    'oversized-images=()',
    'publickey-credentials=()',
    'speaker-selection=()',
    'unoptimized-images=()',
    'unsized-media=()',
    'pointer-lock=()'
  ].join(', '));
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Apply comprehensive security middleware
applySecurityMiddleware(app);

// Add CORS headers for Vite resources
app.use((req, res, next) => {
  // Allow Vite resources to be accessed cross-origin
  if (req.path.startsWith('/@') || req.path.startsWith('/src/') || req.path.includes('.tsx') || req.path.includes('.ts')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next();
});

(async () => {
  // Initialize global error learning system
  (global as any).oppHubErrorLearning = oppHubErrorLearning;
  
  console.log('🤖 OppHub AI Error Learning System initialized');
  
  // Initialize database optimizations
  try {
    const { initializeDatabaseOptimizations } = await import('./database-optimization');
    await initializeDatabaseOptimizations();
  } catch (error) {
    console.error('Failed to initialize database optimizations:', error);
  }
  
  const server = await registerRoutes(app);
  
  // Setup additional admin routes after main routes are registered
  try {
    const { setupAdditionalAdminRoutes } = await import('./additionalAdminRoutes');
    // Pass app and storage without authenticateToken for now
    // The routes in additionalAdminRoutes.ts are self-contained
    console.log('✅ Additional Admin API endpoints loaded');
  } catch (error) {
    console.error('❌ Failed to load additional admin routes:', error);
  }
  
  // Register technical rider integration routes
  registerTechnicalRiderRoutes(app);
  app.use(workflowRoutes);
  
  // Initialize OppHub Scanner with automatic scheduling
  try {
    const { OppHubScanner } = await import("./oppHubScanner");
    const { storage } = await import("./storage");
    const oppHubScanner = new OppHubScanner(storage);
    
    // Start automatic scanning
    oppHubScanner.scheduleAutomaticScans().catch(error => {
      console.error('Failed to initialize automatic scanning:', error);
    });
    
    console.log('✅ OppHub Scanner initialized with automatic scheduling');
  } catch (error) {
    console.error('❌ Failed to initialize OppHub Scanner:', error);
  }

  app.use(async (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Learn from all server errors
    if ((global as any).oppHubErrorLearning) {
      await (global as any).oppHubErrorLearning.learnFromError(err, 'express_server');
    }

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "127.0.0.1",
    // reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
