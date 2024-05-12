# Manticore

A Typescript program to generate encounters for [*13th Age*](http://13thage.com/). 

# Maintainance Status — May 2024

With the release of 13th Age 2e I’ve decided to cease maintaining of Manticore. See [this handover document](https://brehaut.net/media/files/the_manticore.pdf) for more details if you wish to use this code in some way.. 


## Usage

The easy way is to visit the online instance at [https://manticore.brehaut.net](https://manticore.brehaut.net).
	
If you want to run/develop it locally you will need [Node JS](https://nodejs.org/).

Install dependancies with:

    $ npm install

Spin up the development build process with 

    $ npm run dev 

Note: At the time of writing, the dev process only works with a Blink based browser such as Chromium, as other browsers have not implemented modules in workers the way the build process expects. This is not a problem during production.

You can build a distributable artefact for production with 

    $ npm run build

Tests are run with:

    $ npm run test:unit

### Platform changes since the 2.0 banch 

Previously manticore was built with react, gulp, and rollup, and tested with mocha. From 2.0 onward, the application is built with Svelte, and Svelte Kit. If you built an earlier version, it pays to just delete your node_modules and reinstall.

## Thanks

William Byrd provided feedback and revision to an initial draft of this program. While none of that code has survived into the current version, the changes made were enlightening and pushed forward my understanding of logic programming greatly.

## License

This program uses trademarks and/or copyrights owned by Fire Opal Media, which are used under the Fire Opal Media, 13th Age Community Use Policy. We are expressly prohibited from charging you to use or access this content. This program is not published, endorsed, or specifically approved by Fire Opal Media. For more information about Fire Opal Media's 13th Age Community Use Policy, please visit [www.fireopalmedia.com/communityuse](http://www.fireopalmedia.com/communityuse). For more information about Fire Opal Media and *13th Age* products, please visit [www.fireopalmedia.com](http://www.fireopalmedia.com) and [www.pelgranepress.com](http://www.pelgranepress.com).

Source code copyright © 2014-2018 Andrew Brehaut

Distributed under the Eclipse Public License
