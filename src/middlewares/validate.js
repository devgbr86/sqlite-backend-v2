export function validate(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Campos obrigatórios faltando: ${missing.join(", ")}`,
      });
    }
    next();
  };
}
