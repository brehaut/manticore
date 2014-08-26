# Manticore

An experimental typescript program to generate encounters for [*13th Age*](http://13thage.com/). 

## Usage

This project is currently a WIP.

The easy way is just to visit the online instance at [http://manticore.brehaut.net](http://manticore.brehaut.net).
	
If you want to run/develop it locally you will need typescript and make installed to build this project:

    $ make

will compile the typescript source and move it and other resources into the `target` directory
ready for deployment. 

The application is a simple client side web app, so you just need to place the `target` directory into your webserver and point your browser there. If you have python installed running `make server` will launch a simple http server on port 8080 for testing.

##  Known issues:

 * It will never work in Internet Explorer 8 or lower.
 * The UI is a bit wacky on a small (phone) screen. This will come later.
 * Only the core book is currently included. I plan to support multiple books in the future, and include that as a  filtering option.  
 * There is no way to select specific monsters.
 * There is no information about the number of monsters that are selected by a filter rule.

## Thanks

William Byrd provided feedback and revision to a very early draft of this program. While none of that code has survived into the current version, the changes made were enlightening and pushed forward my understanding of logic programming greatly.

## License

This program uses trademarks and/or copyrights owned by Fire Opal Media, which are used under the Fire Opal Media, 13th Age Community Use Policy. We are expressly prohibited from charging you to use or access this content. This program is not published, endorsed, or specifically approved by Fire Opal Media. For more information about Fire Opal Media's 13th Age Community Use Policy, please visit [www.fireopalmedia.com/communityuse](http://www.fireopalmedia.com/communityuse). For more information about Fire Opal Media and *13th Age* products, please visit [www.fireopalmedia.com](http://www.fireopalmedia.com) and [www.pelgranepress.com](http://www.pelgranepress.com).

Source code copyright © 2014 Andrew Brehaut

Distributed under the Eclipse Public License
