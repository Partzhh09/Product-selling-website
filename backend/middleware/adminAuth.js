export function requireAdminAuth(req, res, next) {
  const expectedSecret = process.env.ADMIN_API_KEY;

  if (!expectedSecret) {
    return res.status(500).json({
      message: "ADMIN_API_KEY is not configured on the server."
    });
  }

  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || token !== expectedSecret) {
    return res.status(401).json({
      message: "Unauthorized admin request."
    });
  }

  return next();
}
