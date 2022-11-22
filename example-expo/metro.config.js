/**
 * The following file is not needed for standard use of solid-authn-react-native
 */

const path = require("path");
const extraNodeModules = {
  "solid-authn-react-native": path.resolve(__dirname + "/../"),
};
const watchFolders = [path.resolve(__dirname + "/../")];
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules,
  },
  watchFolders,
};
