package database

import (
	"context"
	"testing"
	"time"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/types"
)

type MockRepos struct {
	Get                         func(ctx context.Context, repo api.RepoID) (*types.Repo, error)
	GetByName                   func(ctx context.Context, repo api.RepoName) (*types.Repo, error)
	GetByHashedName             func(ctx context.Context, repo api.RepoHashedName) (*types.Repo, error) // TODO:
	GetByIDs                    func(ctx context.Context, ids ...api.RepoID) ([]*types.Repo, error)
	List                        func(v0 context.Context, v1 ReposListOptions) ([]*types.Repo, error)
	ListMinimalRepos            func(v0 context.Context, v1 ReposListOptions) ([]types.MinimalRepo, error)
	Metadata                    func(ctx context.Context, ids ...api.RepoID) ([]*types.SearchedRepo, error)
	Create                      func(ctx context.Context, repos ...*types.Repo) (err error)
	Count                       func(ctx context.Context, opt ReposListOptions) (int, error)
	GetFirstRepoNamesByCloneURL func(ctx context.Context, cloneURL string) (api.RepoName, error)

	// TODO: we're knowingly taking on a little tech debt by placing these here for now.
	ListExternalServiceUserIDsByRepoID func(ctx context.Context, repoID api.RepoID) ([]int32, error)
	ListExternalServiceRepoIDsByUserID func(ctx context.Context, userID int32) ([]api.RepoID, error)
}

func (s *MockRepos) MockGet(t *testing.T, wantRepo api.RepoID) (called *bool) {
	called = new(bool)
	s.Get = func(ctx context.Context, repo api.RepoID) (*types.Repo, error) {
		*called = true
		if repo != wantRepo {
			t.Errorf("got repo %d, want %d", repo, wantRepo)
			return nil, &RepoNotFoundErr{ID: repo}
		}
		return &types.Repo{ID: repo}, nil
	}
	return
}

func (s *MockRepos) MockGet_Return(t *testing.T, returns *types.Repo) (called *bool) {
	called = new(bool)
	s.Get = func(ctx context.Context, repo api.RepoID) (*types.Repo, error) {
		*called = true
		if repo != returns.ID {
			t.Errorf("got repo %d, want %d", repo, returns.ID)
			return nil, &RepoNotFoundErr{ID: repo}
		}
		return returns, nil
	}
	return
}

func (s *MockRepos) MockGetByName(t testing.TB, want api.RepoName, repo api.RepoID) (called *bool) {
	called = new(bool)
	s.GetByName = func(ctx context.Context, name api.RepoName) (*types.Repo, error) {
		*called = true
		if name != want {
			t.Errorf("got repo name %q, want %q", name, want)
			return nil, &RepoNotFoundErr{Name: name}
		}
		return &types.Repo{ID: repo, Name: name, CreatedAt: time.Now()}, nil
	}
	return
}

func (s *MockRepos) MockList(t testing.TB, wantRepos ...api.RepoName) (called *bool) {
	called = new(bool)
	s.List = func(ctx context.Context, opt ReposListOptions) ([]*types.Repo, error) {
		*called = true
		repos := make([]*types.Repo, len(wantRepos))
		for i, repo := range wantRepos {
			repos[i] = &types.Repo{Name: repo}
		}
		return repos, nil
	}
	return
}

func (s *MockRepos) MockListMinimalRepos(t testing.TB, wantRepos ...api.RepoName) (called *bool) {
	called = new(bool)
	s.ListMinimalRepos = func(ctx context.Context, opt ReposListOptions) ([]types.MinimalRepo, error) {
		*called = true
		repos := make([]types.MinimalRepo, len(wantRepos))
		for i, repo := range wantRepos {
			repos[i] = types.MinimalRepo{Name: repo}
		}
		return repos, nil
	}
	return
}
