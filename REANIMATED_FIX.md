# Fixed: react-native-reanimated Plugin Error

## Problem
```
ERROR  index.js: [BABEL]: Cannot find module 'react-native-worklets/plugin'
```

## Root Cause
In a workspace/mono-repo setup, `react-native-reanimated` is installed at the root `node_modules`, but the mobile app's babel config was looking for it in `mobile/node_modules`.

## Solution Applied

1. **Installed worklets dependency:**
   ```bash
   npm install react-native-worklets-core --legacy-peer-deps
   ```

2. **Updated babel.config.js to use absolute path:**
   ```javascript
   const path = require('path');

   module.exports = function(api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         // Use path.resolve to find plugin in root node_modules
         path.resolve(__dirname, '../node_modules/react-native-reanimated/plugin'),
       ],
     };
   };
   ```

## Next Steps

1. **Restart Expo with cleared cache:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

2. **The error should now be resolved!** ✅

The babel config now correctly points to the reanimated plugin in the root node_modules directory.




