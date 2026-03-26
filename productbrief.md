# chicago.com prototype
Chicago.com is a new web platform from Chicago Public Media, home to the Chicago Sun-Times and WBEZ. The goal of this platform, broadly speaking, is to create a new hub for hyperlocal engagement and expand CPM's audience by exploring features that are outside of the scope of a traditional newspaper and public radio station.

Specifically, our market research has identified local guides and things to do that is backed by the rigor of our traditional journalism as an opportunity for expansion and conversion among younger audiences. We are currently in the early phases of design and discovery.

## Design principles for the chicago.com project
Some of the principles we have identified some far that we know chicago.com will eventually become:
- Participatory. Rather than journalists telling information to you, creation and curation is collaboration.
- Ethical. The value proposition of this site hinges on our journalistic reputation.
- Not algorithmic. We don't want a "black box" that users can't understand.
- Uniquely Chicago. This website has to scream Chicago — this can't be duplicated anywhere else.

Some of the things we know chicago.com is not:
- Exclusive. It needs to be open to everyone.
- A traditional news publisher. This isn't the front page of the a newspaper, like boston.com.
- A tourism site. This is for locals, built by locals.
- A set of diffuse conversations. This isn't people talking in silos; it should bring people and neighborhoods together.
- Offering a "view from nowhere." It should be transparent who the contributors to this site are and what their lived experience is.

## The role of the prototype you are building
I'm looking for agentic help in developing a lightweight prototype to use for user testing next week. We will have a series of community members in the office who we will be asking questions of about the ideas we have for this platform and what we'd like to see. I'm looking to build on our previous rapid prototyping and build something somewhat functional that we can put in front of users and get their impressions of.

Ideally, this prototype should be focused on the UX and flow of the application rather than building out the full functionality. Specifically, we want to test people's reactions to the ability to build, remix and share guides, how people interact with a feed of guides and articles, etc.

We made a prototype on Vercel for Columbia, Missouri here that we used for user testing a few weeks ago while in Missouri: https://cpm-npa-prototype.vercel.app/admin

## Tech stack and data sources
I'm looking to build a lightweight React native application that I can deploy to Railway and share with our user interviewees and other members of the team. I would like to the extent possible populate this with real-world data from Chicago neighborhoods, so we should:
- reference all 77 community areas in Chicago.
- pull in real data, locations and reviews from the Google Places API.
- pull in articles from chicago.suntimes.com and wbez.org.

Please follow Git version control; I'd like to push this repository to my personal Github account to deploy to Railway.

Eventually, I'd like to build social features for the application based on ATProto. Users should be able to follow each other and see their guides at the top of their feed. Guides should be sorted by likes and shares. Users should be able to remix/fork a guide, making a version with their own modifications, that can be public or private. You can share a private guide with other users and they can upvote or downvote entries on any guide. Users will be identified by their interests (badges, maybe?) and how long they've lived in Chicago as well as an @yourusernamehere.chicago.com handle. Guides created by reporters at the Chicago Sun-Times or WBEZ should be identified clearly as created by journalists from the organization.

## Design references
New Public's Roundabout: https://newpublic.org/local
More about Roundabout: https://joinroundabout.com/
WBEZ: https://www.wbez.org/
Chicago Sun-Times: https://chicago.suntimes.com/
Chicago Public Media: https://www.chicagopublicmedia.org/

We will likely incorporate New Public's Roundabout platform into the final product in some way, so it's OK to make some references to their design and product when you need design references. In general, we should make sure our design is clean, modern, assertive and Chicago-first.

## Where I need support
I'm not an experienced full-stack developer and need a lot of handholding on setting up APIs, thinking through technical questions, etc. I'm also not super experienced with agentic coding, so I may have questions about how to give agents the most useful instructions.