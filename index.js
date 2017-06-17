#!/usr/bin/env node

const _ = require('lodash');
const cli = require('cli');
const colors = require('colors');

var {name, version} = require('./package.json');

const { Settings, SettingsManifestPath} = require('./lib/settings');
const Saavn = require('./lib/providers/saavn');

const supportedProviders = [ Saavn ];

cli.enable('version');
cli.setApp(name, version);

const options = cli.parse({
  api_key: ['k', 'API Key of YoutTube', 'string']
});

if (!!options.api_key) {
  Settings.setYouTubeApiKey(options.api_key);

  return cli.ok(`Stored key at: ${SettingsManifestPath}`);
}

if (!Settings.getYouTubeApiKey()) {
  cli.fatal("Please set the YouTube API key. Check --help for usage.");
}

if (!cli.args[0]) {
  cli.error("Please provide the URL to the album/playlist of songs which you want to download.")
  console.log("Usage:".bold);
  console.log("  ", name, "URL_OF_ALBUM_OR_PLAYLIST_HERE".dim);
  console.log();
  console.log("For other options, use --help option.");
  return;
}

const tracklistUrl = cli.args.shift();

_.each(supportedProviders, providerKlass => {
  const provider = new providerKlass(tracklistUrl);
  if (provider.canIdentify()) {
    provider.downloadTracks();
  } else {
    cli.fatal(`Couldn't identify the provided playlist/album URL: "${tracklistUrl}"`);
  }
});
