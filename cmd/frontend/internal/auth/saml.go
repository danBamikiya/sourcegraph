package auth

import (
	"context"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"

	log15 "gopkg.in/inconshreveable/log15.v2"
	"sourcegraph.com/sourcegraph/sourcegraph/cmd/frontend/internal/session"

	"github.com/crewjam/saml/samlsp"
	"sourcegraph.com/sourcegraph/sourcegraph/pkg/actor"
	"sourcegraph.com/sourcegraph/sourcegraph/pkg/conf"
	"sourcegraph.com/sourcegraph/sourcegraph/pkg/localstore"
)

var (
	// SAML App creation vars
	samlSPCert         = conf.Get().SamlSPCert
	samlSPKey          = conf.Get().SamlSPKey
	samlIDPMetadataURL = conf.Get().SamlIDProviderMetadataURL

	idpMetadataURL *url.URL
)

func init() {
	var err error
	idpMetadataURL, err = url.Parse(samlIDPMetadataURL)
	if err != nil {
		log.Fatalf("Could not parse the Identity Provider metadata URL: %s", err)
	}
}

// newSAMLAuthHandler wraps the passed in handler with SAML authentication, adding endpoints under the auth
// path prefix to enable the login flow an requiring login for all other endpoints.
//
// 🚨 SECURITY
func newSAMLAuthHandler(createCtx context.Context, handler http.Handler, appURL string) (http.Handler, error) {
	if samlIDPMetadataURL == "" {
		return nil, errors.New("No SAML ID Provider specified")
	}
	if samlSPCert == "" {
		return nil, errors.New("No SAML Service Provider certificate")
	}
	if samlSPKey == "" {
		return nil, errors.New("No SAML Service Provider private key")
	}

	entityIDURL, err := url.Parse(appURL + authURLPrefix)
	if err != nil {
		return nil, err
	}
	keyPair, err := tls.X509KeyPair([]byte(samlSPCert), []byte(samlSPKey))
	if err != nil {
		return nil, err
	}
	keyPair.Leaf, err = x509.ParseCertificate(keyPair.Certificate[0])
	if err != nil {
		return nil, err
	}

	samlSP, err := samlsp.New(samlsp.Options{
		URL:            *entityIDURL,
		Key:            keyPair.PrivateKey.(*rsa.PrivateKey),
		Certificate:    keyPair.Leaf,
		IDPMetadataURL: idpMetadataURL,
		CookieSecure:   entityIDURL.Scheme == "https",
	})
	if err != nil {
		return nil, err
	}
	samlSP.CookieName = "sg-session"

	idpID := samlSP.ServiceProvider.IDPMetadata.EntityID
	authedHandler := session.SessionHeaderToCookieMiddleware(samlSP.RequireAccount(samlToActorMiddleware(handler, idpID)))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle SAML ACS and metadata endpoints
		if strings.HasPrefix(r.URL.Path, authURLPrefix+"/saml/") {
			samlSP.ServeHTTP(w, r)
			return
		}
		// Handle all other endpoints
		authedHandler.ServeHTTP(w, r)
	}), nil
}

// samlToActorMiddleware translates the SAML session into an Actor and sets it in the request context
// before delegating to its child handler.
func samlToActorMiddleware(h http.Handler, idpID string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		actr, err := getActorFromSAML(r, idpID)
		if err != nil {
			log15.Error("could not map SAML assertion to user", "error", err)
			http.Error(w, "could not map SAML assertion to user", http.StatusInternalServerError)
			return
		}
		h.ServeHTTP(w, r.WithContext(actor.WithActor(r.Context(), actr)))
	})
}

// getActorFromSAML translates the SAML session into an Actor.
func getActorFromSAML(r *http.Request, idpID string) (*actor.Actor, error) {
	ctx := r.Context()
	subject := r.Header.Get("X-Saml-Subject") // this header is set by the SAML library after extracting the value from the JWT cookie
	authID := samlToAuthID(idpID, subject)

	usr, err := localstore.Users.GetByAuth0ID(ctx, authID)
	if _, notFound := err.(localstore.ErrUserNotFound); notFound {
		email := r.Header.Get("X-Saml-Email")
		if email == "" && mightBeEmail(subject) {
			email = subject
		}
		login := r.Header.Get("X-Saml-Login")
		if login == "" {
			login = r.Header.Get("X-Saml-Uid")
		}
		displayName := r.Header.Get("X-Saml-DisplayName")
		if displayName == "" {
			displayName = login
		}
		if displayName == "" {
			displayName = email
		}
		if displayName == "" {
			displayName = subject
		}
		if login == "" {
			login = email
		}
		if login == "" {
			return nil, fmt.Errorf("could not create user, because SAML assertion did not contain email attribute statement")
		}

		login, err = NormalizeUsername(login)
		if err != nil {
			return nil, err
		}

		usr, err = localstore.Users.Create(ctx, authID, email, login, displayName, idpID, nil, "", "")
		if err != nil {
			return nil, fmt.Errorf("could not create user with authID %q, login %q: %s", authID, login, err)
		}
	} else if err != nil {
		return nil, fmt.Errorf("could not get user with authID %q: %s", authID, err)
	}
	return actor.FromUser(usr), nil
}

func samlToAuthID(idpID, subject string) string {
	return fmt.Sprintf("%s:%s", idpID, subject)
}

func mightBeEmail(s string) bool {
	return strings.Count(s, "@") == 1
}
