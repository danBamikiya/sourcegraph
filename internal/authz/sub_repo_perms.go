package authz

import (
	"context"
	"path"

	"github.com/cockroachdb/errors"
	"github.com/gobwas/glob"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/conf"
)

// RepoContent specifies data existing in a repo. It currently only supports
// paths but will be extended in future to support other pieces of metadata, for
// example branch.
type RepoContent struct {
	Repo api.RepoName
	Path string
}

// SubRepoPermissionChecker is the interface exposed by the SubRepoPermsClient and is
// exposed to allow consumers to mock out the client.
type SubRepoPermissionChecker interface {
	CheckPermissions(ctx context.Context, userID int32, content RepoContent) (Perms, error)
}

var _ SubRepoPermissionChecker = &SubRepoPermsClient{}

// SubRepoPermissionsGetter allow getting sub repository permissions.
type SubRepoPermissionsGetter interface {
	GetByUser(ctx context.Context, userID int32) (map[api.RepoName]SubRepoPermissions, error)
}

// SubRepoPermsClient is responsible for checking whether a user has access to
// data within a repo. Sub-repository permissions enforcement is on top of existing
// repository permissions, which means the user must already have access to the
// repository itself. The intention is for this client to be created once at startup
// and passed in to all places that need to check sub repo permissions.
//
// Note that sub-repo permissions are currently opt-in via the
// experimentalFeatures.enableSubRepoPermissions option.
type SubRepoPermsClient struct {
	PermissionsGetter SubRepoPermissionsGetter
}

func (s *SubRepoPermsClient) CheckPermissions(ctx context.Context, userID int32, content RepoContent) (Perms, error) {
	if !conf.Get().ExperimentalFeatures.EnableSubRepoPermissions {
		return Read, nil
	}

	if s.PermissionsGetter == nil {
		return None, errors.New("SubRepoPermissionsGetter is nil")
	}

	srp, err := s.PermissionsGetter.GetByUser(ctx, userID)
	if err != nil {
		return None, errors.Wrap(err, "getting permissions")
	}

	// Check repo
	repoRules, ok := srp[content.Repo]
	if !ok {
		// All repos that support sub-repo permissions should at the very least have an
		// "allow all" rule. If no rules exist it implies that we haven't performed a
		// permissions sync yet and it is safer to assume no access is allowed.
		return None, nil
	}

	// TODO: This will be very slow until we can cache compiled rules
	includeMatchers := make([]glob.Glob, 0, len(repoRules.PathIncludes))
	for _, rule := range repoRules.PathIncludes {
		g, err := glob.Compile(rule, '/')
		if err != nil {
			return None, errors.Wrap(err, "building include matcher")
		}
		includeMatchers = append(includeMatchers, g)
	}
	excludeMatchers := make([]glob.Glob, 0, len(repoRules.PathExcludes))
	for _, rule := range repoRules.PathExcludes {
		g, err := glob.Compile(rule, '/')
		if err != nil {
			return None, errors.Wrap(err, "building exclude matcher")
		}
		excludeMatchers = append(excludeMatchers, g)
	}

	// Rules are created including the repo name
	toMatch := path.Join(string(content.Repo), content.Path)

	// The current path needs to either be included or NOT excluded and we'll give
	// preference to exclusion.
	for _, rule := range excludeMatchers {
		if rule.Match(toMatch) {
			return None, nil
		}
	}
	for _, rule := range includeMatchers {
		if rule.Match(toMatch) {
			return Read, nil
		}
	}

	// Return None if no rule matches to be safe
	return None, nil
}