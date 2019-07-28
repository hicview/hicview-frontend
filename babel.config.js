module.exports = api => {
  api.cache(true)
  //const isTest = api.env('test');

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
      '@babel/preset-react'
    ],
  ]
  const plugins = [ "@babel/plugin-transform-runtime"]

  return {
    presets,
    plugins,
  }
};

