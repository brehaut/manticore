# Manticore

An experimental clojurescript program to generate encounters for [*13th Age*](http://13thage.com/). 

## Usage

This project is currently a WIP. Two major problems:

 * Currently the encounter generation is exhaustive. A single level 1 character generates approximately 350
	“fair” encounters. Exponential explosion occurs rapidly. Not all of these encounters are useful; filtering
	and additional querying is needed for prepping the domain of the search.
 * There is exactly zero UI. 
	
## Thanks

William Byrd provided feedback and revision to a very early draft of this program. While none of that code has survived into the current version, the changes made were enlightening and pushed forward my understanding of logic programming greatly.

## License

This program uses trademarks and/or copyrights owned by Fire Opal Media, which are used under the Fire Opal Media, 13th Age Community Use Policy. We are expressly prohibited from charging you to use or access this content. This program is not published, endorsed, or specifically approved by Fire Opal Media. For more information about Fire Opal Media's 13th Age Community Use Policy, please visit [www.fireopalmedia.com/communityuse](www.fireopalmedia.com/communityuse). For more information about Fire Opal Media and *13th Age* products, please visit [www.fireopalmedia.com](www.fireopalmedia.com) and [www.pelgranepress.com](www.pelgranepress.com).

Source code copyright © 2014 Andrew Brehaut

Distributed under the Eclipse Public License, the same as Clojure.
