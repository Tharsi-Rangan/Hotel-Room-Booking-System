const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,

    // OAuth security
    state: true,
    pkce: 'S256'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile?.emails?.[0]?.value;
      const emailVerified = profile?.emails?.[0]?.verified;

      if (!email || !emailVerified) {
        return done(null, false);
      }

      return done(null, {
        googleId: profile.id,
        email,
        fullName: profile.displayName,
        avatar: profile?.photos?.[0]?.value
      });
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;