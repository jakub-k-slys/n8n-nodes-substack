const baseConfig = require('./eslint.config.js');

// Create a copy of the base config
const prepublishConfig = [...baseConfig];

// Find and modify the package.json configuration
const packageJsonConfigIndex = prepublishConfig.findIndex(
  config => config.files && config.files.includes('package.json')
);

if (packageJsonConfigIndex !== -1) {
  prepublishConfig[packageJsonConfigIndex] = {
    ...prepublishConfig[packageJsonConfigIndex],
    rules: {
      ...prepublishConfig[packageJsonConfigIndex].rules,
      'n8n-nodes-base/community-package-json-name-still-default': 'error',
    },
  };
}

module.exports = prepublishConfig;