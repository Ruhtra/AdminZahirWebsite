# Gemini Project Rules - AdminZahirWebsite

## API Documentation (Scalar)
- **Rule**: Every time a new API route is created or an existing one is modified, its documentation MUST be updated in the Scalar configuration file.
- **Location**: `src/app/api/docs/route.ts`
- **Standard**: Follow the OpenAPI 3.1.0 specification.
- **Objective**: Ensure the codebase remains scalable, documentable, and maintainable for both human developers and AI assistants. This facilitates testing through the Scalar interface and provides a clear contract of available endpoints.
- **Context**: The documentation serves as a live contract. Keeping it up-to-date reduces technical debt and improves the efficiency of future developments and AI-assisted maintenance.
