/**
 * Разбор потока text/event-stream: события разделяются пустой строкой,
 * полезная нагрузка в строках `data:` (возможны несколько строк data подряд).
 */

function flushDataLines(lines: string[], onData: (payload: string) => void): void {
  if (lines.length === 0) {
    return;
  }
  const payload = lines.join("\n");
  onData(payload);
}

/**
 * Читает тело ответа fetch и для каждого полного SSE-события вызывает onData с текстом из data.
 */
export async function readNotificationSseStream(
  body: ReadableStream<Uint8Array> | null,
  onData: (payload: string) => void,
): Promise<void> {
  if (body === null) {
    return;
  }
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? "";

      for (const rawLine of parts) {
        const line = rawLine.replace(/\r$/, "");
        if (line === "") {
          flushDataLines(dataLines, onData);
          dataLines = [];
          continue;
        }
        if (line.startsWith("data:")) {
          const rest = line.startsWith("data: ")
            ? line.slice(6)
            : line.slice(5);
          dataLines.push(rest);
        }
      }
    }
    if (buffer.length > 0) {
      const line = buffer.replace(/\r$/, "");
      if (line.startsWith("data:")) {
        const rest = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
        dataLines.push(rest);
      }
    }
    flushDataLines(dataLines, onData);
  } finally {
    reader.releaseLock();
  }
}
