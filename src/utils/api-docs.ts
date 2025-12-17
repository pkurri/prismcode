/**
 * API Documentation - Swagger/OpenAPI spec generation
 *
 * Implements #20 - API Documentation
 */

import { Application } from 'express';
import logger from './logger';

/**
 * API endpoint documentation
 */
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<number, ApiResponse>;
}

/**
 * API parameter
 */
export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description?: string;
}

/**
 * API request body
 */
export interface ApiRequestBody {
  required: boolean;
  content: {
    'application/json': {
      schema: Record<string, unknown>;
    };
  };
}

/**
 * API response
 */
export interface ApiResponse {
  description: string;
  content?: {
    'application/json': {
      schema: Record<string, unknown>;
    };
  };
}

/**
 * OpenAPI specification
 */
export interface OpenAPISpec {
  openapi: '3.0.0';
  info: {
    title: string;
    version: string;
    description: string;
    license?: { name: string; url?: string };
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  tags: Array<{ name: string; description: string }>;
}

/**
 * Generate OpenAPI specification
 */
export function generateOpenAPISpec(): OpenAPISpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'PrismCode API',
      version: '1.0.0',
      description: 'AI-powered multi-agent project orchestration platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['System'],
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                      version: { type: 'string' },
                      uptime: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/plans': {
        post: {
          summary: 'Create execution plan',
          tags: ['Orchestration'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    feature: { type: 'string' },
                    techStack: { type: 'array', items: { type: 'string' } },
                    scale: { type: 'string', enum: ['mvp', 'startup', 'enterprise'] },
                  },
                  required: ['feature'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Plan created' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/plans/{planId}': {
        get: {
          summary: 'Get execution plan',
          tags: ['Orchestration'],
          parameters: [
            {
              name: 'planId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Plan details' },
            404: { description: 'Plan not found' },
          },
        },
      },
      '/api/agents': {
        get: {
          summary: 'List registered agents',
          tags: ['Agents'],
          responses: {
            200: {
              description: 'List of agents',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        status: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        FeatureInput: {
          type: 'object',
          properties: {
            feature: { type: 'string' },
            techStack: { type: 'array', items: { type: 'string' } },
            scale: { type: 'string', enum: ['mvp', 'startup', 'enterprise'] },
            platform: { type: 'string', enum: ['web', 'mobile', 'desktop', 'api'] },
          },
          required: ['feature'],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'System', description: 'System endpoints' },
      { name: 'Orchestration', description: 'Execution plan management' },
      { name: 'Agents', description: 'Agent management' },
    ],
  };
}

/**
 * Setup API documentation endpoints
 */
export function setupApiDocs(app: Application): void {
  const spec = generateOpenAPISpec();

  // Serve OpenAPI spec
  app.get('/api/docs/openapi.json', (req, res) => {
    res.json(spec);
  });

  // Serve Swagger UI HTML
  app.get('/api/docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>PrismCode API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui',
    });
  </script>
</body>
</html>
    `);
  });

  logger.info('API documentation available at /api/docs');
}
