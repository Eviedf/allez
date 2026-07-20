const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Stub react-native-maps on web — it has no web implementation
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return { type: 'sourceFile', filePath: require.resolve('./stubs/react-native-maps.web.js') }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
