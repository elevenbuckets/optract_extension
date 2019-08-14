# optract_extension
optract_extension
## How to load unpacked extension 

Load the extension from the extension/dist/chrome dir

https://developer.chrome.com/extensions/getstarted

Note: You need to update the "content_scripts"."matches" in extension/dist/chrome/manifest.json based on your extension id.

## How to configure native app

update "path" and "allowed_origins" based on your file path and extension id in host/optract.json 

copy host/optract.json to ~/.config/google-chrome/NativeMessagingHosts/


## How to update the main ui

Go to extension/UI, then `npm install`

After you make changes run `npm run build` then run `npm run mvUItoDist`

