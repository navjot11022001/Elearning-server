Why we need cookie parser.
As express wokrs in a modular design philoshy which gives the users to choose their own parser and can customize things according to there need
so to keep express light weight too parsung of cookies is not there

## THis is the small peice of darta that is sent from the server that is being sotred in the client's browser.

Usages :-
used in maintaining the user token , session sand many more

Also cookies is sent over the netwokr throught client also in the form of http header
Where server receive the cookie headers and this middle wasre `cookie-parser` is used to reteive and parse the values received in the cookies.
When a request reaches the server, the cookie-parser middleware parses the Cookie header, extracting the key-value pairs.
