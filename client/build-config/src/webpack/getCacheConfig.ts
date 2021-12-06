import path from 'path'

import { Configuration } from 'webpack'

import { ROOT_PATH } from '../paths'

export const getCacheConfig = (...invalidateCacheFiles: string[]): Configuration['cache'] => ({
    type: 'filesystem',
    buildDependencies: {
        // Invalidate cache on config change.
        config: [
            ...invalidateCacheFiles,
            path.resolve(ROOT_PATH, 'babel.config.js'),
            path.resolve(ROOT_PATH, 'postcss.config.js'),
        ],
    },
})
