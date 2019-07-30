package threads

import (
	"context"
	"strconv"

	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/pkg/errors"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
)

// 🚨 SECURITY: TODO!(sqs): there needs to be security checks everywhere here! there are none

// gqlThread implements the GraphQL type Thread.
type gqlThread struct {
	GQLThreadCommon
	db *dbThread
}

// threadByID looks up and returns the Thread with the given GraphQL ID. If no such Thread exists, it
// returns a non-nil error.
func threadByID(ctx context.Context, id graphql.ID) (*gqlThread, error) {
	dbID, err := unmarshalThreadID(id)
	if err != nil {
		return nil, err
	}
	return threadByDBID(ctx, dbID)
}

func (GraphQLResolver) ThreadByID(ctx context.Context, id graphql.ID) (graphqlbackend.Thread, error) {
	return threadByID(ctx, id)
}

// threadByDBID looks up and returns the Thread with the given database ID. If no such Thread exists,
// it returns a non-nil error.
func threadByDBID(ctx context.Context, dbID int64) (*gqlThread, error) {
	v, err := dbThreads{}.GetByID(ctx, dbID)
	if err != nil {
		return nil, err
	}
	return &gqlThread{
		GQLThreadCommon: GQLThreadCommon{db: &v.DBThreadCommon},
		db:              v,
	}, nil
}

func (v *gqlThread) ID() graphql.ID {
	return marshalThreadID(v.db.ID)
}

func marshalThreadID(id int64) graphql.ID {
	return relay.MarshalID("Thread", id)
}

func unmarshalThreadID(id graphql.ID) (dbID int64, err error) {
	err = relay.UnmarshalSpec(id, &dbID)
	return
}

func (GraphQLResolver) ThreadInRepository(ctx context.Context, repositoryID graphql.ID, number string) (graphqlbackend.Thread, error) {
	threadDBID, err := strconv.ParseInt(number, 10, 64)
	if err != nil {
		return nil, err
	}
	// TODO!(sqs): access checks
	thread, err := threadByDBID(ctx, threadDBID)
	if err != nil {
		return nil, err
	}

	// TODO!(sqs): check that the thread is indeed in the repo. When we make the thread number
	// sequence per-repo, this will become necessary to even retrieve the thread. for now, the ID is
	// global, so we need to perform this check.
	assertedRepo, err := graphqlbackend.RepositoryByID(ctx, repositoryID)
	if err != nil {
		return nil, err
	}
	if thread.db.RepositoryID != assertedRepo.DBID() {
		return nil, errors.New("thread does not exist in repository")
	}

	return thread, nil
}

func (v *gqlThread) Status() graphqlbackend.ThreadStatus {
	return v.db.Status
}
