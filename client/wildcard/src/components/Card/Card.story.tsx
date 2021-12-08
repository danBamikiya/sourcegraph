import { Meta } from '@storybook/react'
import React from 'react'

import { BrandedStory } from '@sourcegraph/branded/src/components/BrandedStory'
import { Toggle } from '@sourcegraph/branded/src/components/Toggle'
import { Link } from '@sourcegraph/shared/src/components/Link'
import webStyles from '@sourcegraph/web/src/SourcegraphWebApp.scss'

import { CardSubtitle } from './Components'

import { Card, CardBody, CardHeader, CardText, CardTitle } from '.'

const Story: Meta = {
    title: 'wildcard/Card',

    decorators: [
        story => (
            <BrandedStory styles={webStyles}>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
        ),
    ],

    parameters: {
        component: Card,
        design: {
            type: 'figma',
            name: 'Figma',
            url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=1172%3A285',
        },
    },
}

export default Story

export const Simple = () => (
    <>
        <h1>Cards</h1>
        <p>
            A card is a flexible and extensible content container. It includes options for headers and footers, a wide
            variety of content, contextual background colors, and powerful display options.{' '}
            <a href="https://getbootstrap.com/docs/4.5/components/card/">Bootstrap documentation</a>
        </p>

        <h2>Examples</h2>

        <Card className="mb-3">
            <CardBody>This is some text within a card body.</CardBody>
        </Card>

        {/* eslint-disable-next-line react/forbid-dom-props */}
        <Card
            style={{ maxWidth: '18rem' }}
            className="mb-3"
            header="Card Header"
            title="Card title"
            subtitle="Card subtitle"
        >
            <CardText>
                Some quick example text to build on the card title and make up the bulk of the card's content.
            </CardText>
            <button type="button" className="btn btn-primary">
                Do something
            </button>
        </Card>

        <Card>
            <CardHeader>Featured</CardHeader>
            <CardBody>
                <CardTitle>Special title treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Go somewhere
                </a>
            </CardBody>
        </Card>
    </>
)

export const InteractiveCard = () => (
    <>
        <h2>Interactive Cards</h2>

        <Card variant="interactive">
            <CardBody className="d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                    <CardTitle className="mb-0">Watch for secrets in new commits</CardTitle>
                    <CardSubtitle>New search result → Sends email notifications, delivers webhook</CardSubtitle>
                </div>
                <div className="d-flex align-items-center">
                    <Toggle onClick={() => {}} value={true} className="mr-3" disabled={false} />
                    <Link to="">Edit</Link>
                </div>
            </CardBody>
        </Card>

        <h2 className="mt-4">List Cards</h2>
    </>
)
