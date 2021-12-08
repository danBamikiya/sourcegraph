import { select } from '@storybook/addon-knobs'
import { DecoratorFn, Meta, Story } from '@storybook/react'
import React from 'react'

import { BrandedStory } from '@sourcegraph/branded/src/components/BrandedStory'
import webStyles from '@sourcegraph/web/src/SourcegraphWebApp.scss'

import { PANEL_POSITION } from './constants'
import { Panel } from './Panel'

const decorator: DecoratorFn = story => <BrandedStory styles={webStyles}>{() => <div>{story()}</div>}</BrandedStory>

const config: Meta = {
    title: 'wildcard/Panel',

    decorators: [decorator],

    parameters: {
        component: Panel,
    },
}

export default config

export const PanelExample: Story = () => (
    <Panel onDismiss={() => {}} position={select('Position', PANEL_POSITION, 'bottom')} />
)
