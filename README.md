<link rel="stylesheet" type="text/css" media="all" href="static/css/readme.css" />

# Bottle post recipes

## TIP!

If you've cloned this project, you can view this readme file with
<span class="em">customized</span> 
styling. 

Here's how to do it in VS Code:
1. Right click on README.md
2. Open preview
3. (Optional) Change text color and/or improve the styling by editing the contents of readme.css (found in static/css). 

## Live app

Click [here](https://bottle-post-recipes-eb1abd9c13ee.herokuapp.com/) 
to explore the live app!

## Introduction

Have you ever released a bottled message in the ocean before? 

This is an old concept, and while it may seem inviting to pursue, it's not environmentally friendly. This web app mimics that idea but for recipes and without littering the ocean! 

The goal is to empower the DIY era and create an archive of recipes crafted by the people, and not just professional chefs. Do you have a talent in cooking and just feel the desire to share it to the world? Bottle up your recipe, post it on 
<span class="em">Bottle post recipes</span>
and **it might arrive on someone's digital shore**. Yes, whenever you publish a recipe, there's a chance that your recipe will land as a notification in any of the app's users! **This is how this web app stands out from the crowd**, it leverages the power of sharing while filtering the signal from the noise. Recipes are algorithmically boosted **based on their quality**, not the creator's ability to reach. Say goodbye to **networking skills** and say hello to **delicious, high quality recipes!** Let's break it down below.

In today's age, it is common for social media influencers to use 'unapproved' strategies to gain more reach online. These influencers are buying followers, likes, and comments to boost their social media presence. At 
<span class="em">Bottle post recipes</span>
the most powerful metric for boosting a post is by the number of times it has been put back into the 'ocean'.

#### How it works
1. **User visits the app:**

The algorithm will select a random recipe in the active pool of recipes (ocean) and notify the user.

2. **User reviews it.**
3. **User decides:**

- **If the user removes the recipe**, it will be deleted from the active pool (the ocean). 
- **If the user puts it back**, it remains active, and other users will have the chance to continue boosting it in turns.

When a user submits a review, they will be locked from this feature in 24 hours to prevent abuse of the algorithm.

##### Finishing up
Because the app determines who can boost which recipe, it keeps cheating influencers at bay, **literally**. Posts are still boosted with likes, comments, and shares but the most powerful ranking is the number of times a recipe has been brought back into the active pool (ocean). Remember, users have the power both boost recipes, but also **delete them forever** (from ocean). This not only makes this app perhaps the most democratic platform you've ever heard of, but it also empowers every single user into feeling like they're in control of the algorithm and that they can make a difference. 

## UX

### Initial design

Initially, I laid out the foundational elements through illustration and vector editing to get an idea of how the components could coexist.  

![Initial design](static/images/readme/development_process/initial_design.gif "An illustrated image of the homepage.")

### Thought process

According to 
[this article](https://medium.com/@hayavuk/ui-ux-design-fundamentals-for-the-front-end-developers-688ba43eaed4) written by 
[Hajime Yamasaki Vukelic](https://medium.com/@hayavuk), the most important content should be placed front and center but more towards the top. This follows widely recognized patterns seen on famous platforms such as 
[Youtube](https://youtube.com/),
[Google](https://google.com/),
and just about any social media platform. Therefore I chose to place the recipes accordingly. This should draw the user's immediate attention to the app's most important content.

#### Consitensy, color scheme, and sizing

The illustration follows a 'universal design' and elements throughout the app are in line with universally recognized patterns. Action buttons are marked with common icons (e.g., magnifying glass for search, heart for likes, etc.) and these elements are placed in areas familiar to many mainstream applications. If the user receives a notification, the famous red circle and white number appears, again 
in harmony with other popular apps.

Elements and texts are designed in different (but consistent) sizes to help guide the user. Titles are generally larger, clearly visible, placed conveniently, and aligned to the left to give the user a natural feel and flow of reading.

Colors are designed to provide a strong contrast and to make the main components of the app stand out. 

#### Keeping the user informed 

[Santhosh Adiga U](https://santhosh-adiga-u.medium.com/) wrote an interesting peace about 
[Jakob Nielsen](https://www.nngroup.com/people/jakob-nielsen/)'s idea about keeping the user informed 
([Source](https://santhosh-adiga-u.medium.com/jakob-nielsens-heuristics-for-interaction-design-guidelines-for-user-centered-excellence-609b270c7e6a))
Users should be informed about the status of the system underneath the app. This concept has been followed when designing the 
<span class="em">Bottle post recipes</span>
. Without any navigation, the user can view the immediate app response of user actions when events such as toggling on/off states or receiving notifications happen.

#### Minimalistic design

A minimalistic design has been approached for this project due to a couple of reasons. 
1. To allow and leave room for further implementations.
2. To draw the attention of the users to the contents of the app with minimal distractions.
3. To simplify the user's first impression of the app.

Furthermore, the layout is clean and uncluttered, ensuring that the user can interact and navigate simply throughout the app.  
