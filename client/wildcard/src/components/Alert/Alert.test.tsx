import { render } from '@testing-library/react'
import React from 'react'

import { Alert } from './Alert'
import { SEMANTIC_COLORS } from './constants'

describe('Alert', () => {
    it('renders a simple Alert correctly', () => {
        const { container } = render(<Alert>Simple Alert</Alert>)
        expect(container.firstChild).toMatchInlineSnapshot(`
            <div
              class=""
            >
              Simple Alert
            </div>
        `)
    })

    it.each(SEMANTIC_COLORS)("Renders variant '%s' correctly", variant => {
        const { container } = render(
            <Alert variant={variant}>
                <h4>A shiny {variant} alert - check it out!</h4>
                It can also contain <a href="/">links like this</a>
            </Alert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
