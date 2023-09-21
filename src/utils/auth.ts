export default function authenticationMiddleware() {
  // eslint-disable-next-line consistent-return
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.send({
      success: false,
      isLoggedIn: false,
    });
  };
}
