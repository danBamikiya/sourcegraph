import classNames from 'classnames'
import React from 'react'

import styles from './Card.module.scss'
import { CardBody, CardHeader, CardSubtitle, CardTitle } from './Components'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: string
    title?: string
    subtitle?: string
    /**
     * Interactive variant, shows blue border on hover and focus
     */
    variant?: 'interactive' | 'default'
}

/**
 * Card Element
 */
export const Card: React.FunctionComponent<CardProps> = ({
    header,
    title,
    subtitle,
    children,
    className,
    variant = 'default',
    ...attributes
}) => {
    const cardHeader = header ? <CardHeader>{header}</CardHeader> : null
    const cardTitle = title ? <CardTitle>{title}</CardTitle> : null
    const cardSubtitle = subtitle ? <CardSubtitle>{subtitle}</CardSubtitle> : null
    const cardBody =
        title || subtitle ? (
            <CardBody>
                {cardTitle}
                {cardSubtitle}
                {children}
            </CardBody>
        ) : (
            children
        )

    return (
        <div
            {...attributes}
            className={classNames(styles.card, className, variant === 'interactive' && styles.cardInteractive)}
        >
            {cardHeader}
            {cardBody}
        </div>
    )
}
