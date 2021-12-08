import classNames from 'classnames'
import React from 'react'

import styles from './CardLink.module.scss'

export const CardLink: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...attributes
}) => (
    <div className={classNames(className, styles.cardLink)} {...attributes}>
        {children}
    </div>
)
