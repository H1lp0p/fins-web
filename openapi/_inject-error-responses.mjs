/**
 * После каждого блока ответа '200' добавляет стандартные коды ошибок,
 * если следующий ответ — не '401' (ещё не инжектили).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ERROR_BLOCK = `        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '422':
          $ref: '#/components/responses/UnprocessableEntity'
        '500':
          $ref: '#/components/responses/InternalServerError'`;

const COMPONENTS_SNIPPET = `    BffErrorBody:
      type: object
      description: Обобщённое тело ошибки (BFF/шлюз; фактический JSON может отличаться).
      properties:
        message:
          type: string
        code:
          type: string
        fieldErrors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
  responses:
    BadRequest:
      description: Некорректный запрос (синтаксис, параметры пути/запроса).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BffErrorBody'
    Unauthorized:
      description: Нет или недействительная аутентификация (сессия, JWT, API-ключ).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BffErrorBody'
    Forbidden:
      description: Доступ запрещён (недостаточно прав).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BffErrorBody'
    UnprocessableEntity:
      description: Ошибка валидации тела запроса или бизнес-правил.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BffErrorBody'
    InternalServerError:
      description: Внутренняя ошибка сервера.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BffErrorBody'
`;

function injectComponents(text) {
  if (text.includes("\n  responses:\n    BadRequest:\n")) {
    return text;
  }
  const anchor = "\n  securitySchemes:\n";
  const idx = text.indexOf(anchor);
  if (idx === -1) {
    throw new Error("Не найден блок securitySchemes");
  }
  return text.slice(0, idx) + "\n" + COMPONENTS_SNIPPET + text.slice(idx + 1);
}

function isAnotherResponseKey(line) {
  return /^        '[^']+':/.test(line) && line !== "        '200':";
}

function isEndOfResponsesSection(line) {
  return (
    /^    (get|put|post|delete|patch|options|head):$/.test(line) ||
    /^  \//.test(line) ||
    line === "components:"
  );
}

function injectAfter200Blocks(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (
      line === "      responses:" &&
      i + 1 < lines.length &&
      lines[i + 1] === "        '200':"
    ) {
      out.push(line);
      i++;
      out.push(lines[i]);
      i++;

      while (i < lines.length) {
        const L = lines[i];
        if (isAnotherResponseKey(L)) {
          if (L.trimStart().startsWith("'400'")) {
            break;
          }
          if (!L.includes("'401'")) {
            out.push(ERROR_BLOCK);
          }
          break;
        }
        if (isEndOfResponsesSection(L)) {
          out.push(ERROR_BLOCK);
          break;
        }
        out.push(L);
        i++;
      }
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join("\n");
}

function processFile(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  text = injectComponents(text);
  text = injectAfter200Blocks(text);
  fs.writeFileSync(filePath, text.endsWith("\n") ? text : text + "\n", "utf8");
}

for (const f of [
  "openApi.public.yaml",
  "openApi.sso.yaml",
  "openApi.backend-gateway.yaml",
]) {
  processFile(path.join(__dirname, f));
}

console.log("Injected error responses into openApi.*.yaml");
