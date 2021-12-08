import { Meta } from '@storybook/react'
import React from 'react'

import { BrandedStory } from '@sourcegraph/branded/src/components/BrandedStory'
import webStyles from '@sourcegraph/web/src/SourcegraphWebApp.scss'

import { Alert } from '../Alert'
import { SEMANTIC_COLORS } from '../constants'

import { AlertVariants } from './AlertVariants'

const Story: Meta = {
    title: 'wildcard/Alert',
    decorators: [
        story => (
            <BrandedStory styles={webStyles}>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
        ),
    ],
    parameters: {
        component: Alert,
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url:
                    'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1563%3A196',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url:
                    'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1563%3A525',
            },
        ],
    },
}

export default Story

export const AllAlerts = () => (
    <>
        <h1>Alerts</h1>
	<p>
            Provide contextual feedback messages for typical user actions with the handful of available and flexible
            alert messages.
        </p>
        <AlertVariants variants={SEMANTIC_COLORS} />
    </>
)
