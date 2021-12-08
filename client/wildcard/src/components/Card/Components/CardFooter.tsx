import classNames from 'classnames'
import React from 'react'

import styles from './CardFooter.module.scss'

export const CardFooter: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...attributes
}) => (
    <div className={classNames(className, styles.cardFooter)} {...attributes}>
        {children}
    </div>
)
