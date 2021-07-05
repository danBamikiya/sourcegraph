import SourceRepositoryIcon from 'mdi-react/SourceRepositoryIcon'
import React, { useCallback, useEffect, useMemo } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { FileLocations } from '@sourcegraph/branded/src/components/panel/views/FileLocations'
import { Location } from '@sourcegraph/extension-api-types'
import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import { dataOrThrowErrors, gql } from '@sourcegraph/shared/src/graphql/graphql'
import { VersionContextProps } from '@sourcegraph/shared/src/search/util'
import { SettingsCascadeProps } from '@sourcegraph/shared/src/settings/settings'
import { ThemeProps } from '@sourcegraph/shared/src/theme'
import { memoizeObservable } from '@sourcegraph/shared/src/util/memoizeObservable'
import { makeRepoURI } from '@sourcegraph/shared/src/util/url'
import { useObservable } from '@sourcegraph/shared/src/util/useObservable'

import { requestGraphQL } from '../../backend/graphql'
import { BreadcrumbSetters } from '../../components/Breadcrumbs'
import { UsagePageVariables, UsagePageFields, UsagePageResult } from '../../graphql-operations'
import { fetchHighlightedFileLineRanges } from '../../repo/backend'
import { RepoHeaderContributionsLifecycleProps } from '../../repo/RepoHeader'
import { RepoRevisionContainerContext } from '../../repo/RepoRevisionContainer'
import { eventLogger } from '../../tracking/eventLogger'

import styles from './UsagePage.module.scss'

const UsagePageFieldsGQLFragment = gql`
    fragment UsagePageFields on ExpSymbol {
        text
        url

        usage {
            references {
                nodes {
                    range {
                        start {
                            line
                            character
                        }
                        end {
                            line
                            character
                        }
                    }
                    resource {
                        path
                        commit {
                            oid
                        }
                        repository {
                            name
                        }
                    }
                }
            }
        }
    }
`
const queryUsagePageUncached = (vars: UsagePageVariables): Observable<UsagePageFields | null> =>
    requestGraphQL<UsagePageResult, UsagePageVariables>(
        gql`
            query UsagePage($repo: ID!, $commitID: String!, $inputRevspec: String!, $moniker: MonikerInput!) {
                node(id: $repo) {
                    ... on Repository {
                        commit(rev: $commitID, inputRevspec: $inputRevspec) {
                            tree(path: "/") {
                                expSymbol(moniker: $moniker) {
                                    ...UsagePageFields
                                }
                            }
                        }
                    }
                }
            }
            ${UsagePageFieldsGQLFragment}
        `,
        vars
    ).pipe(
        map(dataOrThrowErrors),
        map(data => data.node?.commit?.tree?.expSymbol || null)
    )

const queryUsagePage = memoizeObservable(queryUsagePageUncached, parameters => JSON.stringify(parameters))

export interface UsageRouteProps {
    scheme: string
    identifier: string
}

interface Props
    extends Pick<RepoRevisionContainerContext, 'repo' | 'resolvedRev' | 'revision'>,
        RouteComponentProps<UsageRouteProps>,
        RepoHeaderContributionsLifecycleProps,
        BreadcrumbSetters,
        SettingsCascadeProps,
        ThemeProps,
        VersionContextProps {}

export const UsagePage: React.FunctionComponent<Props> = ({
    repo,
    revision,
    resolvedRev,
    match: {
        params: { scheme, identifier },
    },
    useBreadcrumb,
    history,
    ...props
}) => {
    useEffect(() => {
        eventLogger.logViewEvent('Usage')
    }, [])

    const symbol = useObservable(
        useMemo(
            () =>
                queryUsagePage({
                    repo: repo.id,
                    commitID: resolvedRev.commitID,
                    inputRevspec: revision,
                    moniker: { scheme, identifier },
                }),
            [identifier, repo.id, resolvedRev.commitID, revision, scheme]
        )
    )

    useBreadcrumb(
        useMemo(
            () =>
                symbol === null
                    ? null
                    : {
                          key: 'usage',
                          element: symbol ? (
                              <>
                                  Usage: <Link to={symbol.url}>{symbol.text}</Link>
                              </>
                          ) : (
                              <LoadingSpinner className="icon-inline" />
                          ),
                      },
            [symbol]
        )
    )

    const onClick = useCallback<React.MouseEventHandler>(e => {
        window.parent.postMessage({ type: 'usageClick' }, '*')
    }, [])

    return symbol === null ? (
        <p className="p-3 text-muted h3">Not found</p>
    ) : symbol === undefined ? (
        <LoadingSpinner className="m-3" />
    ) : (
        <>
            {symbol.usage.references.nodes.length > 1 && (
                <section id="refs" className="" onClick={onClick}>
                    {/* <h2 className="mt-0 mx-3 mb-0 h4">Examples</h2> */}
                    <style>
                        {
                            'td.line { display: none; } .code-excerpt .code { padding-left: 0.25rem !important; } .result-container__header { display: none; } .result-container { border: solid 1px var(--border-color) !important; border-width: 1px !important; margin: 1rem; }'
                        }
                    </style>
                    <FileLocations
                        locations={of(
                            symbol.usage.references.nodes
                                .slice(0, -1)
                                .slice(0, 25)
                                .map<Location>(reference => ({
                                    uri: makeRepoURI({
                                        repoName: reference.resource.repository.name,
                                        commitID: reference.resource.commit.oid,
                                        filePath: reference.resource.path,
                                    }),
                                    range: reference.range!,
                                }))
                        )}
                        icon={SourceRepositoryIcon}
                        fetchHighlightedFileLineRanges={fetchHighlightedFileLineRanges}
                        parentContainerIsEmpty={true}
                        {...props}
                    />
                </section>
            )}
        </>
    )
}