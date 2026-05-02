import { ApiReference } from '@scalar/nextjs-api-reference';

const config: any = {
  spec: {
    content: {
      openapi: '3.1.0',
      info: {
        title: 'Zahir API',
        version: '1.0.0',
        description: 'Documentação da API do sistema Zahir. Toda nova rota criada deve ser documentada aqui seguindo o padrão OpenAPI 3.1.0.',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server',
        },
      ],
      paths: {
        // As rotas devem ser adicionadas aqui conforme forem sendo criadas
        '/api/exemplo': {
          get: {
            summary: 'Exemplo de rota',
            responses: {
              '200': { description: 'OK' }
            }
          }
        },
        '/api/novo/reviews/profiles': {
          get: {
            summary: 'Lista todos os profiles (restaurantes/estabelecimentos)',
            description: 'Retorna a lista completa de profiles cadastrados, pensada para o infinite-scroll local do front-end.',
            tags: ['Profiles'],
            responses: {
              '200': {
                description: 'Sucesso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              resume: { type: 'string', nullable: true },
                              informations: { type: 'string', nullable: true },
                              imageUrl: { type: 'string', nullable: true },
                              movie: { type: 'string', nullable: true },
                              type: { type: 'array', items: { type: 'string' } },
                              categories: { type: 'array', items: { type: 'string' } },
                              telephones: {
                                type: 'object',
                                properties: {
                                  whatsapp: { type: 'array', items: { type: 'string' } },
                                  telephone: { type: 'array', items: { type: 'string' } }
                                }
                              },
                              local: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  cep: { type: 'string', nullable: true },
                                  uf: { type: 'string', nullable: true },
                                  country: { type: 'string' },
                                  city: { type: 'string', nullable: true },
                                  neighborhood: { type: 'string', nullable: true },
                                  street: { type: 'string', nullable: true },
                                  number: { type: 'string', nullable: true },
                                  complement: { type: 'string', nullable: true }
                                }
                              },
                              promotion: {
                                type: 'object',
                                properties: {
                                  active: { type: 'boolean' },
                                  title: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true }
                                }
                              },
                              createdAt: { type: 'string', format: 'date-time' }
                            }
                          }
                        },
                        total: { type: 'number' }
                      }
                    }
                  }
                }
              },
              '500': {
                description: 'Falha interna do servidor',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/novo/reviews/filters': {
          get: {
            summary: 'Lista todos os filtros de profiles disponíveis',
            description: 'Agrega categorias, tipos, países e cidades únicos baseados nos profiles cadastrados no sistema.',
            tags: ['Profiles'],
            responses: {
              '200': {
                description: 'Sucesso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        types: { type: 'array', items: { type: 'string' } },
                        categories: { type: 'array', items: { type: 'string' } },
                        countries: { type: 'array', items: { type: 'string' } },
                        cities: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  }
                }
              },
              '500': {
                description: 'Falha interna do servidor',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
  },
};

export const GET = ApiReference(config);
