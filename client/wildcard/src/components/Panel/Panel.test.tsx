import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import sinon from 'sinon'

import { Panel } from './Panel'

describe('Panel', () => {
    it('renders correctly positioned at page bottom', () => {
        expect(render(<Panel position="bottom" onDismiss={() => {}} />).baseElement).toMatchSnapshot()
    })

    it('renders correctly positioned at page side', () => {
        expect(render(<Panel position="side" onDismiss={() => {}} />).baseElement).toMatchSnapshot()
    })

    test('calls onDismiss function when dismiss icon is clicked', () => {
        const closePanel = sinon.spy(() => undefined)
        render(<Panel position="bottom" onDismiss={closePanel} />)

        userEvent.click(screen.getByTestId('panel-onDismiss-button'))
        sinon.assert.called(closePanel)
    })
})
