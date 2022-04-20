const registerValidator = (req, res, next) => {
  req
    .check("name")
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[a-z-_\s]+$/i)
    .withMessage("Name must contain only alphabets and space")
    .trim()
    .escape();

  req
    .check("email")
    .notEmpty()
    .withMessage("Email is required!")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid Email");

  req
    .check("phone")
    .notEmpty()
    .withMessage("Phone Number is required!")
    .trim()
    .escape()
    .isLength(10)
    .withMessage("Phone number not valid");

  req
    .check("college")
    .notEmpty()
    .withMessage("College field is required!")
    .trim()
    .escape();

  req
    .check("dept")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Department field is required!");

  req
    .check("year")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Year is required!")
    .isInt({ min: 1, max: 5 })
    .withMessage("Year must be number between 1 and 5 inclusive.");

  req
    .check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain atleast six characters")
    .trim()
    .escape();

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const signinValidator = (req, res, next) => {
  req
    .check("email")
    .notEmpty()
    .withMessage("Email is required!")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid Email");

  req
    .check("pwd")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain atleast six characters")
    .trim()
    .escape();

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const forgotPassword = (req, res, next) => {
  req
    .check("email")
    .notEmpty()
    .withMessage("Email is required!")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid Email");

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const forgotPasswordLink = (req, res, next) => {
  req
    .check("user")
    .notEmpty()
    .withMessage("Bad Link")
    .isAlphanumeric()
    .withMessage("Bad Link");

  req
    .check("key")
    .notEmpty()
    .withMessage("Bad Link")
    .isAlphanumeric()
    .withMessage("Bad Link");

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const resetPassword = (req, res, next) => {
  req
    .check("pwd")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain atleast six characters")
    .trim();

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const googleUserData = (req, res, next) => {
  req
    .check("name")
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[a-z-_\s]+$/i)
    .withMessage("Name must contain only alphabets and space")
    .trim()
    .escape();

  req
    .check("phone")
    .notEmpty()
    .withMessage("Phone Number is required!")
    .trim()
    .escape()
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .isLength(10)
    .withMessage("Phone number not valid");

  req
    .check("college")
    .notEmpty()
    .withMessage("College field is required!")
    .trim()
    .escape();

  req
    .check("dept")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Department field is required!");

  req
    .check("year")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Year is required!")
    .isInt({ min: 1, max: 5 })
    .withMessage("Year must be number between 1 and 5 inclusive.");

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const eventValidator = (req, res, next) => {
  req
    .check("event")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Bad Request. Try again.");

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

const hackathonValidator = (req, res, next) => {
  req
    .check("user2")
    .notEmpty()
    .withMessage("Team of minimum 2 members required.")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email");

  req
    .check("name2")
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[a-z-_\s]+$/i)
    .withMessage("Name must contain only alphabets and space")
    .trim()
    .escape();

  req
    .check("user3")
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email");

  req
    .check("name3")
    .optional({ nullable: true })
    .matches(/^[a-z-_\s]+$/i)
    .withMessage("Name must contain only alphabets and space")
    .trim()
    .escape();

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ message: firstError });
  }
  next();
};

module.exports = {
  registerValidator,
  signinValidator,
  forgotPassword,
  forgotPasswordLink,
  resetPassword,
  googleUserData,
  eventValidator,
  hackathonValidator,
};
