const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return {
    ...config,
    resolver: {
      ...config.resolver,
      extraNodeModules: {
        path: require.resolve("path-browserify"),
        assert: require.resolve("assert"),
        fs: require.resolve("react-native-fs"),
      },
    },
  };
})();
