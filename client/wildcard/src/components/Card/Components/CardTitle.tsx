import classNames from 'classnames'
import React from 'react'

import styles from './CardTitle.module.scss'

export const CardTitle: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...attributes
}) => (
    <div className={classNames(styles.cardTitle, className)} {...attributes}>
        {children}
    </div>
)
