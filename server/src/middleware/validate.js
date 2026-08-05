export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    // If schema is just a raw ZodObject and not a wrapped object with body/query/params keys, 
    // default to validating req.body.
    if (!schema.body && !schema.query && !schema.params) {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return next(parsed.error);
      }
      req.body = parsed.data;
    } else {
      if (schema.body) {
        const parsedBody = schema.body.safeParse(req.body);
        if (!parsedBody.success) return next(parsedBody.error);
        req.body = parsedBody.data;
      }
      if (schema.query) {
        const parsedQuery = schema.query.safeParse(req.query);
        if (!parsedQuery.success) return next(parsedQuery.error);
        req.query = parsedQuery.data;
      }
      if (schema.params) {
        const parsedParams = schema.params.safeParse(req.params);
        if (!parsedParams.success) return next(parsedParams.error);
        req.params = parsedParams.data;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
