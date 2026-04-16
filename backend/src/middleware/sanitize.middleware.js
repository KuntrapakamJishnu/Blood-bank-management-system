const sanitizeObjectInPlace = (input) => {
  if (!input || typeof input !== "object") return;

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i += 1) {
      if (typeof input[i] === "object") {
        sanitizeObjectInPlace(input[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(input)) {
    // Prevent MongoDB operator and dot-notation injection.
    if (key.startsWith("$") || key.includes(".")) {
      delete input[key];
      continue;
    }

    if (typeof input[key] === "object") {
      sanitizeObjectInPlace(input[key]);
    }
  }
};

const sanitizeRequest = (req, _res, next) => {
  sanitizeObjectInPlace(req.body);
  sanitizeObjectInPlace(req.params);
  next();
};

export default sanitizeRequest;
