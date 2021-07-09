import { useCallback } from 'react'

import { BlockProps } from '.'

type UseBlockShortcutHandlersOptions = { id: string; onEnterBlock: () => void; isMacPlatform: boolean } & Pick<
    BlockProps,
    'onMoveBlockSelection' | 'onDeleteBlock'
>

export const useBlockShortcutHandlers = ({
    id,
    isMacPlatform,
    onMoveBlockSelection,
    onDeleteBlock,
    onEnterBlock,
}: UseBlockShortcutHandlersOptions): { onKeyDown: (event: React.KeyboardEvent) => void } => {
    const onKeyDown = useCallback(
        (event: React.KeyboardEvent): void => {
            const isModifierKeyDown = (isMacPlatform && event.metaKey) || (!isMacPlatform && event.ctrlKey)
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                const direction = event.key === 'ArrowUp' ? 'up' : 'down'
                if (isModifierKeyDown) {
                    // onMoveBlock(id, direction)
                } else {
                    onMoveBlockSelection(id, direction)
                }
            } else if (event.key === 'Enter') {
                if (isModifierKeyDown) {
                    // onRunBlock()
                } else {
                    onEnterBlock()
                }
            } else if (event.key === 'Backspace' && isModifierKeyDown) {
                onDeleteBlock(id)
            } else if (event.key === 'd' && isModifierKeyDown) {
                // onDuplicateBlock(id)
            }
        },
        [id, isMacPlatform, onMoveBlockSelection, onDeleteBlock, onEnterBlock]
    )

    return { onKeyDown }
}