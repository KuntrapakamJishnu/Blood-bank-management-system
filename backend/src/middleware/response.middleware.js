const DEFAULT_SUCCESS_MESSAGE = "Request successful";
const DEFAULT_ERROR_MESSAGE = "Request failed";

const META_KEYS = new Set([
  "success",
  "message",
  "data",
  "details",
  "errors",
  "error",
  "stack",
]);

const isPlainObject = (value) => {
  if (!value || typeof value !== "object") return false;
  return Object.getPrototypeOf(value) === Object.prototype;
};

const inferMessage = (statusCode, success) => {
  if (success) {
    if (statusCode === 201) return "Resource created successfully";
    if (statusCode === 204) return "Request successful";
    return DEFAULT_SUCCESS_MESSAGE;
  }

  if (statusCode === 404) return "Resource not found";
  if (statusCode === 401) return "Unauthorized";
  if (statusCode === 403) return "Forbidden";
  if (statusCode === 400) return "Bad request";
  return DEFAULT_ERROR_MESSAGE;
};

const extractData = (payload) => {
  if (!isPlainObject(payload)) return null;

  const entries = Object.entries(payload).filter(([key]) => !META_KEYS.has(key));
  if (!entries.length) {
    return null;
  }

  return Object.fromEntries(entries);
};

const normalizePayload = (payload, statusCode) => {
  const success = statusCode < 400;

  if (payload === null || payload === undefined) {
    return {
      success,
      message: inferMessage(statusCode, success),
      data: null,
    };
  }

  if (Array.isArray(payload)) {
    return {
      success,
      message: inferMessage(statusCode, success),
      data: payload,
    };
  }

  if (!isPlainObject(payload)) {
    return {
      success,
      message: inferMessage(statusCode, success),
      data: payload,
    };
  }

  const normalizedSuccess =
    typeof payload.success === "boolean" ? payload.success : success;
  const normalizedMessage =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message
      : inferMessage(statusCode, normalizedSuccess);

  const normalized = {
    ...payload,
    success: normalizedSuccess,
    message: normalizedMessage,
  };

  if (!Object.prototype.hasOwnProperty.call(payload, "data")) {
    normalized.data = extractData(payload);
  }

  if (!Object.prototype.hasOwnProperty.call(normalized, "data")) {
    normalized.data = null;
  }

  return normalized;
};

export const responseNormalizer = (_req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const normalizedPayload = normalizePayload(payload, res.statusCode || 200);
    return originalJson(normalizedPayload);
  };

  next();
};
