import ApiError from "../errors/api-error.js";

const validate = (schema) => {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }

    req.body = parsed.data;
    return next();
  };
};

export default validate;
