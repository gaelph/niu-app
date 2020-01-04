module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    "plugins": [
      [ "inline-dotenv" ],
      [ 'module-resolver', {
        'root': ['./src'],
        "extensions": [
          ".ios.ts", 
          ".ios.tsx",
          ".android.ts", 
          ".android.tsx",
          ".ts", 
          ".tsx",
          ".json"
        ]
      }],
    ]
  };
};
