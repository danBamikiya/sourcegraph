import { render, screen } from '@testing-library/react'
import React from 'react'

import { Card } from './Card'

describe('Card', () => {
    it('renders card correctly', () => {
        const { asFragment } = render(
            <Card title="card title" subtitle="card subtitle" variant="interactive">
                <div>Card Body</div>
            </Card>
        )

        expect(screen.getByText(/card title/)).toHaveClass('card-title')
        expect(screen.getByText(/card subtitle/)).toHaveClass('card-subtitle')
        expect(screen.getByText(/Card Body/)).toHaveClass('class-biody')

        expect(screen.getByText(''))

        expect(asFragment()).toMatchSnapshot()
    })
})
