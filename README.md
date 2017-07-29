# Manticore

A Typescript program to generate encounters for [*13th Age*](http://13thage.com/). 

## Usage

The easy way is to visit the online instance at [http://manticore.brehaut.net](http://manticore.brehaut.net).
	
If you want to run/develop it locally you will need [Node JS](https://nodejs.org/), [Yarn](https://yarnpkg.com/en/), [Gulp](http://gulpjs.com), and `make` installed to build this project:

    $ yarn
    $ gulp

will install the typescript compiler in the project, and compile the typescript source and move it and other resources into the `dist` directory ready for deployment. 

The application is a simple client side web app, so you need to place the `dist` directory into your webserver and point your browser there. If you have python installed running `make server` will launch a simple http server on port 8080 for testing.

##  Known issues:

 * It will never work in Internet Explorer 10 or lower (Version 0.4 works in IE9), but [you shouldn’t be using IE10 or earlier](https://www.microsoft.com/en-us/WindowsForBusiness/End-of-IE-support) anyway.
 * Internet Explorer 11 is supported by TypeScripts downlevel iteration compiler mode and performs significantly slower than the native version used by every other browser. Consider using something else. Edge is better (if not as snappy as Chrome or Firefox)
See [Issues](https://github.com/brehaut/manticore/issues) for more. 

## Thanks

William Byrd provided feedback and revision to an initial draft of this program. While none of that code has survived into the current version, the changes made were enlightening and pushed forward my understanding of logic programming greatly.

## License

This program uses trademarks and/or copyrights owned by Fire Opal Media, which are used under the Fire Opal Media, 13th Age Community Use Policy. We are expressly prohibited from charging you to use or access this content. This program is not published, endorsed, or specifically approved by Fire Opal Media. For more information about Fire Opal Media's 13th Age Community Use Policy, please visit [www.fireopalmedia.com/communityuse](http://www.fireopalmedia.com/communityuse). For more information about Fire Opal Media and *13th Age* products, please visit [www.fireopalmedia.com](http://www.fireopalmedia.com) and [www.pelgranepress.com](http://www.pelgranepress.com).

Source code copyright © 2014-2017 Andrew Brehaut

Distributed under the Eclipse Public License
