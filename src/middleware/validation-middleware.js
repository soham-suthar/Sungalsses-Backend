const validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    const message = err.issues[0].message;
    console.error(err);

    return res.status(400).json({ message: message });
  }
};

export default validate;
