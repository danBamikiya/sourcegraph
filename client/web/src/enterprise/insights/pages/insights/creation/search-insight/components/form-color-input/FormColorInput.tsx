import classNames from 'classnames'
import { startCase } from 'lodash'
import openColor from 'open-color'
import React, { ChangeEventHandler, memo } from 'react'
import { noop } from 'rxjs'

import { RadioButton } from '@sourcegraph/wildcard'

import styles from './FormColorInput.module.scss'

interface FormColorInputProps {
    /** Name of data series color */
    name?: string
    /** Title of color input. */
    title?: string
    /** Value of data series color ()*/
    value?: string
    /** Different values of preset color. */
    colours?: { color: string; name?: string }[]
    /** Change listener to track changes of color radio group. */
    onChange?: ChangeEventHandler<HTMLInputElement>
    /** Custom class name. */
    className?: string
}

const DEFAULT_COLOURS = Object.keys(openColor)
    .filter(name => name !== 'white' && name !== 'black' && name !== 'gray')
    .map(name => ({ name: startCase(name), color: `var(--oc-${name}-7)` }))

export const DEFAULT_ACTIVE_COLOR = 'var(--oc-grape-7)'

/** Displays custom radio group for picking color of code insight chart line. */
export const FormColorInput: React.FunctionComponent<FormColorInputProps> = memo(props => {
    const {
        className,
        value = null,
        title,
        name = 'form_color_input',
        colours = DEFAULT_COLOURS,
        onChange = noop,
    } = props

    return (
        <fieldset className={classNames('d-flex flex-column', className)}>
            <legend className={classNames('mb-3', styles.formColorPickerTitle)}>{title}</legend>

            <div>
                {colours.map((colorInfo, index) => (
                    <div key={colorInfo.color} className="d-inline">
                        <RadioButton
                            id={`color_${index}`}
                            name={name}
                            value={colorInfo.color}
                            checked={value === colorInfo.color}
                            className={styles.formColorPickerNativeRadioControl}
                            onChange={onChange}
                            label={
                                <span
                                    /* eslint-disable-next-line react/forbid-dom-props */
                                    style={{ color: colorInfo.color }}
                                    title={colorInfo.name}
                                    className={styles.formColorPickerColorBlock}
                                >
                                    <span className={styles.formColorPickerRadioControl} />
                                </span>
                            }
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    )
})
