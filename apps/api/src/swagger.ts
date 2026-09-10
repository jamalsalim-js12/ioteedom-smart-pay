import { type INestApplication } from "@nestjs/common";
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

export const SWAGGER_PATH = "docs";
const SWAGGER_JSON_PATH = "docs-json";

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle("IoTeedom Smart Pay API")
    .setDescription("Auth, session, ops invites, payments, onboarding, and health for Smart Pay.")
    .setVersion("0.1.0")
    .addTag("Auth", "Phone and PIN sign-in, token refresh, logout, and PIN change.")
    .addTag("Me", "The signed-in household user or IoTeedom staff member.")
    .addTag("Onboarding", "First-login property confirmation for invited owners.")
    .addTag("ops", "Staff invite, account list, and audit. Suspend and module edits are later.")
    .addTag(
      "Payments",
      "MoMo charges through Paystack. Collection success is a webhook, not this POST.",
    )
    .addTag("Health", "Liveness of the API process and Postgres.")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "access-token")
    .addCookieAuth("refresh_token", {
      type: "apiKey",
      in: "cookie",
      name: "refresh_token",
    })
    .addServer("http://localhost:3001", "Local")
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication) {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    jsonDocumentUrl: SWAGGER_JSON_PATH,
  });
}
