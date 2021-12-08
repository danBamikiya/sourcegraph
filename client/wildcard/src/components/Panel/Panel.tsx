import classNames from 'classnames'
import CloseIcon from 'mdi-react/CloseIcon'
import React from 'react'

import styles from './Panel.module.scss'

interface PanelProps {
    position: 'bottom' | 'side'
    onDismiss: () => void
}

export const Panel: React.FunctionComponent<PanelProps> = ({ children, position, onDismiss }) => (
    <div className={classNames(styles.panel, styles[position])}>
        <div className={classNames('d-flex', position === 'bottom' ? 'justify-content-end' : 'justify-content-start')}>
            <button
                type="button"
                onClick={onDismiss}
                className={classNames('btn btn-icon', styles.dismissButton)}
                title="Close panel"
                data-tooltip="Close panel"
                data-placement="left"
                data-testid="panel-onDismiss-button"
            >
                <CloseIcon className="icon-inline" />
            </button>
        </div>
        {children}
    </div>
)
