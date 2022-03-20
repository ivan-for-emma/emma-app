module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.test\\.tsx?$',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
    },
  },
};
