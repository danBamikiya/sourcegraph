import { SEMANTIC_COLORS } from './constants'

export const preventDefault = <E extends React.SyntheticEvent>(event: E): E => {
    event.preventDefault()
    return event
}

interface GetAlertStyleParameters {
    variant: typeof SEMANTIC_COLORS[number]
}

export const getAlertStyle = ({ variant }: GetAlertStyleParameters): string => `alert alert-${variant}`
