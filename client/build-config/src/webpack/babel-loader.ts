import path from 'path'

import { ROOT_PATH } from '../paths'

export const babelLoader = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: true,
        configFile: path.join(ROOT_PATH, 'babel.config.js'),
    },
}
