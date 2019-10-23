# optract_extension
Extension related source code are under optract_extension/extension

## Howto
After downloading source code / github sync

- change into extension folder and run:
``` npm install ```
- change into extension/UI folder and run:
``` npm install ```
- back to extension folder and run:
``` npm run release ```

After that the extension distribution should be under dist/chrome

## Testing 
(native host binary and browser integration setup required)

 For development, one can, after hooked up native host, change directory into dist/chrome
 and then run
 ../../node_modules/.bin/web-ext run
