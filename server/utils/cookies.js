const isProduction = process.env.NODE_ENV === 'production';

/** HttpOnly cookie defaults — strict + secure in production. */
function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  };
}

function cookieOptionsWithMaxAge(maxAgeMs) {
  return { ...baseCookieOptions(), maxAge: maxAgeMs };
}

module.exports = {
  isProduction,
  baseCookieOptions,
  cookieOptionsWithMaxAge
};
