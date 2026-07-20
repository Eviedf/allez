// Web stub for react-native-maps — maps are not supported in the browser.
// The map screen shows a fallback message on web instead.
const React = require('react')
const { View, Text } = require('react-native')

const stub = () => React.createElement(View, null)
stub.displayName = 'MapViewStub'

const Marker   = () => React.createElement(View, null)
const Callout  = () => React.createElement(View, null)
const UrlTile  = () => React.createElement(View, null)

module.exports = stub
module.exports.default         = stub
module.exports.Marker          = Marker
module.exports.Callout         = Callout
module.exports.UrlTile         = UrlTile
module.exports.PROVIDER_DEFAULT = null
module.exports.PROVIDER_GOOGLE  = null
