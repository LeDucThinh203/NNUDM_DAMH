const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const normalizeBody = (req) => {
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
    return;
  }

  if (typeof req.body.email === 'string') req.body.email = req.body.email.trim();
  if (typeof req.body.username === 'string') req.body.username = req.body.username.trim();
  if (typeof req.body.password === 'string') req.body.password = req.body.password.trim();
};

const validateEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUsername = (username) => {
  return typeof username === 'string' && /^[a-zA-Z0-9_]+$/.test(username);
};

const validateStrongPassword = (password) => {
  return typeof password === 'string' && passwordPattern.test(password);
};

const collectErrors = (checks) => {
  return checks.filter((item) => !item.valid).map((item) => ({
    field: item.field,
    code: item.code,
    message: item.message
  }));
};

export const handleValidation = (validator) => {
  return (req, res, next) => {
    normalizeBody(req);
    const errors = validator(req);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'du lieu khong hop le',
        errors
      });
    }

    next();
  };
};

export const registerValidator = handleValidation((req) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  return collectErrors([
    {
      field: 'email',
      code: 'EMAIL_REQUIRED',
      valid: typeof email === 'string' && email.length > 0,
      message: 'email khong duoc de trong'
    },
    {
      field: 'email',
      code: 'EMAIL_INVALID',
      valid: !email || validateEmail(email),
      message: 'email sai dinh dang'
    },
    {
      field: 'username',
      code: 'USERNAME_REQUIRED',
      valid: typeof username === 'string' && username.length > 0,
      message: 'username khong duoc de trong'
    },
    {
      field: 'username',
      code: 'USERNAME_INVALID',
      valid: !username || validateUsername(username),
      message: 'username khong duoc chua ki tu dac biet'
    },
    {
      field: 'password',
      code: 'PASSWORD_REQUIRED',
      valid: typeof password === 'string' && password.length > 0,
      message: 'password khong duoc de trong'
    },
    {
      field: 'password',
      code: 'PASSWORD_WEAK',
      valid: !password || validateStrongPassword(password),
      message:
        'password dai it nhat 8 ki tu, co it nhat 1 so, 1 chu hoa, 1 chu thuong va 1 ky tu dac biet'
    }
  ]);
});

export const loginValidator = handleValidation((req) => {
  return collectErrors([
    {
      field: 'email',
      code: 'EMAIL_REQUIRED',
      valid: typeof req.body.email === 'string' && req.body.email.trim().length > 0,
      message: 'email khong duoc rong'
    },
    {
      field: 'password',
      code: 'PASSWORD_REQUIRED',
      valid: typeof req.body.password === 'string' && req.body.password.trim().length > 0,
      message: 'password khong duoc rong'
    }
  ]);
});

export const changePasswordValidator = handleValidation((req) => {
  return collectErrors([
    {
      field: 'oldPassword',
      code: 'OLD_PASSWORD_REQUIRED',
      valid: typeof req.body.oldPassword === 'string' && req.body.oldPassword.trim().length > 0,
      message: 'old password khong duoc de trong'
    },
    {
      field: 'newPassword',
      code: 'NEW_PASSWORD_WEAK',
      valid: validateStrongPassword(req.body.newPassword),
      message:
        'new password phai manh: it nhat 8 ky tu, co chu hoa, chu thuong, so va ky tu dac biet'
    }
  ]);
});
