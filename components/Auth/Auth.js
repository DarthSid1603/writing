// src/Auth/Auth.js

import auth0 from "auth0-js";
import nookies from "nookies";

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: "icco.auth0.com",
    clientID: "MwFD0COlI4F4AWvOZThe1psOIletecnL",
    redirectUri: "http://localhost:8080/callback",
    responseType: "token id_token",
    scope: "openid"
  });

  login() {
    this.auth0.authorize();
  }

  constructor(ctx) {
    this.ctx = ctx;
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    cookieParams = {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      secure: false
    };

    nookies.set(this.ctx, "access_token", authResult.accessToken, cookieParams);
    nookies.set(this.ctx, "id_token", authResult.idToken, cookieParams);
    nookies.set(this.ctx, "expires_at", expiresAt, cookieParams);
  }

  logout() {
    // Clear Access Token and ID Token from local storage
    nookies.destroy(this.ctx, "access_token");
    nookies.destroy(this.ctx, "id_token");
    nookies.destroy(this.ctx, "expires_at");
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = nookies.get(this.ctx, "expires_at") || 0;
    return new Date().getTime() < expiresAt;
  }
}
