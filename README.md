<link rel="stylesheet" type="text/css" media="all" href="static/css/readme.css" />

# Bottle post recipes

## TIP!

If you've cloned this project, you can view this readme file with
<span class="em">customized</span> 
styling. 

Here's how to do it in VS Code:
1. Right click on `README.md`
2. Open preview
3. (Optional) Change text color and/or improve the styling by editing the contents of `readme.css` (found in `static/css`). 

## Live app

Click [here](https://bottle-post-recipes-eb1abd9c13ee.herokuapp.com/) 
to explore the live app!

## Introduction

Have you ever released a bottled message in the ocean? 

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
Because the app determines who can boost which recipe, it keeps cheating influencers at bay, **literally**. Posts are still boosted with likes, comments, and shares but the most powerful ranking is the number of times a recipe has been brought back into the active pool (ocean). Remember, users have the power both boost recipes but also **delete them forever** (from the ocean). This not only makes this app perhaps the most democratic platform you've ever heard of, but it also empowers every single user into feeling like they're in control of the algorithm and that they can make a difference. 

## UX

### Initial design

Initially, I laid out the foundational elements through illustration and vector editing to get an idea of how the components could coexist.  

![Initial design](static/images/readme/development_process/initial_design.gif "An illustrated mockup video of the homepage.")

### Thought process

According to 
[this article](https://medium.com/@hayavuk/ui-ux-design-fundamentals-for-the-front-end-developers-688ba43eaed4) written by 
[Hajime Yamasaki Vukelic](https://medium.com/@hayavuk), the most important content should be placed front and center but more towards the top. This follows widely recognized patterns seen on famous platforms such as 
[Youtube](https://youtube.com/),
[Google](https://google.com/),
and just about any social media platform. Therefore I chose to place the recipes accordingly. This should draw the users' immediate attention to the app's most important content.

#### Consistensy, color scheme, and sizing

The illustration follows a 'universal design' and elements throughout the app are in line with universally recognized patterns. Action buttons are marked with common icons (e.g., magnifying glass for search, heart for likes, etc.) and these elements are placed in areas familiar to many mainstream applications. If the user receives a notification, the famous red circle and white number appears, again 
in harmony with other popular apps.

Elements and texts are designed in different (but consistent) sizes to help guide the user. Titles are generally larger, clearly visible, placed conveniently, and aligned to the left to give the user a natural feel and flow of reading.

Colors are designed to provide a strong contrast and to make the main components of the app stand out. 

#### Keeping the user informed 

[Santhosh Adiga U](https://santhosh-adiga-u.medium.com/) wrote an interesting piece about 
[Jakob Nielsen](https://www.nngroup.com/people/jakob-nielsen/)'s idea about keeping the user informed 
([Source](https://santhosh-adiga-u.medium.com/jakob-nielsens-heuristics-for-interaction-design-guidelines-for-user-centered-excellence-609b270c7e6a))
Users should be informed about the status of the system underneath the app. This concept has been followed when designing the 
<span class="em">Bottle post recipes</span>
. Without any navigation, the user can view the immediate app response of user actions when events such as toggling on/off states or receiving notifications happen.

#### Minimalistic design

A minimalistic design has been approached for this project due to a couple of reasons. 
1. To allow and leave room for further implementations.
2. To draw users' attention to the main contents of the app with minimal distractions.
3. To simplify the users' first impression of the app.

Furthermore, the layout is clean and uncluttered, ensuring that the user can interact and navigate throughout the app.

## Agile workflow

This project has been developed using an agile workflow. A full product backlog can be found
[here](https://docs.google.com/spreadsheets/d/1PeogB3eeDqFkOYAEEOrRHGEeLwsbEA2HacY5YU3jUWI/edit?usp=sharing).

![Sprints](static/images/readme/development_process/sprints.jpg "Six columns listing user stories (Backlog, Sprint 3, Sprint 2, Todo, In Progess, Done)")

### Sprints

Here's a detailed 'map' of the sprints in this project. 

**NOTE!** The duration of a typical sprint is usually 1-4 weeks, in this project, the sprints are structured to demonstrate the SCRUM methodology rather than adhering to standard sprint durations.  

<details>
    <summary>
        Sprint 1
    </summary>

### User authentication, basic recipe creation & sensitive content

NOTE! Since this project has been developed during a longer, flexible period outside of normal work hours, I’ve fictively estimated that these features could be implemented in approximately 3 days if done on a regular, full-time schedule.

**Duration:** 3 Days

**Story points:** 7

**Goals:**

- Implement user sign-up and login functionality.
- Create a basic recipe creation form.
- Display the list of created recipes.
- Allow users to toggle a vegan mode to include sensitive viewers.

#### Sprint completion notes

**Story points completed:** 7

**Achievements:**

- Implemented user sign-up and login functionality.
    - Added additional layers such as profile image uploads.
- Created a basic recipe creation form.
    - Implemented a Javascript system that interacts with data inherited from Django models.
- Displayed the list of created recipes.
- Allowed users to toggle a vegan mode to include sensitive viewers.
    - This system will hide all recipes until the Javascript has executed. This, to avoid non-vegan recipes to be shown quickly on page load.  

**Retrospective:** 

- **Result:** Completed all planned story points and integrated some additional features.
- **Challenges:** It took some effort to figure out how to combine the power of Javascript with backend for better user experience.
- **Next sprint:** Use and improve the already implemented systems for the upcoming tasks.  

</details>

<details>
    <summary>
        Sprint 2
    </summary>

### Recipe, search, filtering, viewing, and commenting

NOTE! Since this project has been developed during a longer, flexible period outside of normal work hours, I’ve fictively estimated that these features could be implemented in approximately 3 days if done on a regular, full-time schedule.

**Duration:** 4 Days

**Story points:** 9

**Goals:**

- Recipes can be searched and filtered on the main feed.
- Recipe details can be viewed from the main feed.
- Users are able to comment on recipes.

#### Sprint completion notes

**Story points completed:** 9

**Achievements:**

- Recipes can be searched and filtered on the main feed.
    - Integrated filters for recipe types vegan, vegetarian, fish, and meat. NOTE! If a recipe has both fish and meat in it (unlikely), it will be labled as 'meat'. The systems in place are constructed in such way that this can be corrected in the future without forcing users to provide any details.
- Recipe details can be viewed from the main feed.
    - Added a component that loads recipes as a pop-up component.
- Users are able to comment on recipes.
    - Added a comment section with very basic functionality and marked it with a beta label to inform users that it's not fully developed. 
    - Newly added comments will be simulated to give the user an immediate response, which is expected. Any simulated comments will be removed from the recipe viewer component when the user closes the window. This is because the component needs to be cleared and ready to load other recipes. The comments are written to the database though and should appear after a browser refresh.

**Retrospective:** 

- **Result:** Completed all planned story points and fused new functionality with already implemented systems. Improved already implemented systems for better app continuity.
- **Challenges:** No real challenges, the already implemented systems facilitated this sprint nicely. Although, a direction change was made in how to generate HTML form components for better readability and useability.
- **Next sprint:** Consider a more dynamic system for displaying, editing, and creating recipes. It's worth considering combining these components into a single more comprehensive component. 

</details>

<details>
    <summary>
        Sprint 3
    </summary>

### Reviewing and editing

**Duration:** ...

**Story points:** 10

**Goals:**

- Other users' recipes can be reviewed, with the option to boost or downgrade them.
- Users are able to edit a recipe after it has been posted.
- Recipes can be deleted.

#### Sprint completion notes

**Story points completed:** ...

**Achievements:**

- ...

**Retrospective:** ...

</details>

#### Project diagrams and documentation

The image below is a render from [Excalidraw](https://excalidraw.com/) which allows users to create sketchy diagrams and projects perfect for situations like these. If you want to view the content more closely, you can find this [file](https://github.com/KevinBjarnemark/bottle-post-recipes/blob/main/diagrams.excalidraw) in the root of this project's [GitHub repository](https://github.com/KevinBjarnemark/bottle-post-recipes). It should be as easy as dragging the 
[.excalidraw file](https://github.com/KevinBjarnemark/bottle-post-recipes/blob/main/diagrams.excalidraw) into their web app, after downloading it.

##### Sprint 1

![First sprint](static/images/readme/development_process/diagrams/sprint_1.webp "An Excalidraw project with diagrams for the first sprint.")

##### Sprint 2

![Second sprint](static/images/readme/development_process/diagrams/sprint_2.webp "An Excalidraw project with diagrams for the second sprint.")

## Testing

In this project, I've utilized both manual and automatic testing. Below you can find out more about my testing workflow.

### Manual testing

Manual tests are configured and executed throughout the project development. These tests are also baked into the automatic testing process.  


### Automatic testing

To enable automatic testing, I've configured a custom script that runs before changes are pushed to GitHub. This adds a layer to the development process that ensures that only tested code makes it to the remote repository, which can improve overall code quality and catch errors early. 

##### Here's how it works

Whenever you run **`git push`** in the terminal, the following script runs. This script is stored in the `.git/hooks` directory as a pre-push hook and it is not visible in this repository.

```bash
#!/bin/bash
echo "Running tests before pushing..."

# Activate virtual environment for Python
source venv/bin/activate

# Run pytest for Django tests
pytest
PYTHON_STATUS=$?

# Run Jest for JavaScript tests
npx jest
JS_STATUS=$?

# Check if any tests failed
if [ $PYTHON_STATUS -ne 0 ] || [ $JS_STATUS -ne 0 ]; then
    echo "Tests failed. Push aborted."
    exit 1
else
    echo "All tests passed! Proceeding with push."
    exit 0
fi
```

##### Why automatic testing locally?

In some cases, GitHub actions alone might not be enough for automating testing. For example, when pushing changes to the remote repository, it's often ideal to test those changes first. Since GitHub Actions doesn’t support pre-push testing, **git hooks** can provide a solution.

##### Will this force each developer to configure this individually?

Yes, but since this configuration rather enhances the developer's workflow it's not necessarily a 'catch'. In this project, GitHub Actions are also configured for when the project is deployed, which ensures that only tested changes go live. Even if untested changes makes it to the remote repository, they won't pass the deployment stage. This workflow is therefore a great way to give developers the freedom for a custom setup while sticking to the housing rules! 

##### More reasoning behind this approach 

1. Security

When preventing **`git push`** beforehand, you can for example, conditionally test if vulnerable settings are turned on. In the context of this project, there is a dangerous setting that allows the production database to load locally. Which can be very handy for crucial administrative moves, but it is also a dangerous setting to push to the cloud. Simple security tests like these can in this way eliminate developer mistakes **before** it is sent to the remote repository.

2. Clear commit messages.

Developers can fix test-related problems before they are pushed to the remote repository, which prevents multiple commits for changes that has failed the testing process.

3. Time-saving, simplicity, and performance

Erases the environment setup which is included in the GitHub Actions workflow. This saves time because all the dependencies for the project are already installed locally. 


## Technologies

Explore some of the technologies that have been utilized in the development of this project below. 

### Programming languages and frameworks

<details>
    <summary>
        Python
    </summary>

A dynamically and strongly typed programming language.

</details>

<details>
    <summary>
        JavaScript
    </summary>

Used for adding interactive behavior to the web pages and handling client-side logic.

</details>

<details>
    <summary>
        HTML
    </summary>

The standard markup language used for structuring the content on the web.

</details>

<details>
    <summary>
        CSS
    </summary>

Used for styling the HTML elements. 

</details>

<details>
    <summary>
        Bootstrap
    </summary>

A popular front-end framework for developing responsive and mobile-first websites using HTML, CSS, and Javascript.

</details>

<details>
    <summary>
        Django
    </summary>

A free and open source Python web framework that encourages rapid development.

</details>

### Third party packages

#### NPM Packages 

<details>
    <summary>
        Babel
    </summary>

#### babel/core

A compiler used to transform ES6+ Javascript into a backwards-compatible version. 

#### babel-jest

A Jest transformer that allows Babel to trinspile the code during testing. 

</details>

<details>
    <summary>
        JEST
    </summary>

JEST is a library that allows developers to design and execute tests for JavaScript code, including unit tests, integration tests, and more.

</details>

<details>
    <summary>
        Dj Database Url
    </summary>

A utility that allows you to configure A Django database using a URL to simpify database configuration in different environments.

</details>

#### Python packages

<details>
    <summary>
        PyTest
    </summary>

PyTest is a testing framework that allows developers to write simple and scalable tests in Python.

</details>

<details>
    <summary>
        Django browser reload
    </summary>

When DEBUG is **`True`**, [this](https://pypi.org/project/django-browser-reload/)  package will automatically reload the page when static assets or templates are modified.

</details>

### Deployment


<details>
    <summary>
        Heroku
    </summary>

A platform that enables developers to build, run and operate applications entirely in the cloud.

</details>

## Databases

The app is integrated with **two** PostgreSQL databases, one for development and another one for production. This confguration enables safe data manipulation without touching any real users' data.

### Models

Here's an organized 
[Google Drive folder](https://drive.google.com/drive/folders/1XI6bcvofHK3coOBKf5o2hF7HKXSjMe5f?usp=sharing)
with all models used in this app. 

![Example model](static/images/readme/development_process/initial_model_example.jpg "A spreadsheet of a recipe model.")

## Credits

You can find details about some of the third parties that we've used in the technologies section. Explore the third party sources that hasn't been established elsewhere in this document below. 

### [Google fonts](https://fonts.google.com/)

- [Luckiest Guy](https://fonts.google.com/specimen/Luckiest+Guy)
- [Tilt Neon](https://fonts.google.com/specimen/Tilt+Neon)

## For Developers

If you intend to clone or fork this project, this section is for you. We'll go over how the development environment differs from production, how environment variables are configured, deployment, and more. 

### Production/Development

#### Environment variables

To mimic the Bottle post Recipes setup, you'll need to configure your environments accordingly. It's worth noting that the production variables also needs to be configured on GitHub in order to deploy the project with automatic testing, more on this in the Deployment section.

<details>
    <summary>
        HEROKU_API_KEY
    </summary>

On the Heroku's website, you can find this API Key in your account settings. Make sure to add it to your GitHub repository.

1. Go to **Settings**.
2. Click on **Secrets and variables**
3. Click on **Actions**
4. Add a new secret with the name `HEROKU_API_KEY` and paste the key as the value.


#### NOTE!

This shouldn't be added to your local `.env` file. GitHub needs this API key for deploying with GitHub Actions.

</details>

<details>
    <summary>
        DEVELOPMENT_DATABASE
    </summary>

#### SECURITY NOTE!

Never deploy your app with this set to **`True`**, as that would give users access to your development database! You can access the production database (NOT RECOMMENDED) locally by setting this to **`False`**. It is crucial to note that this variable is your 'database guard' and regardless of its value, it will be **`False`** in production (if configured correctly). There are security warnings in the source code that prevents any developer from editing if statements that rely on this variable.

#### Development 

- **`True`**

#### Production 

- **`False`**

</details>

<details>
    <summary>
        DJANGO_SECRET_KEY
    </summary>

#### Development 

- `YOUR DJANGO SECRET KEY`

#### Production 

- `YOUR DJANGO SECRET KEY`

</details>

<details>
    <summary>
        DJANGO_DEBUG
    </summary>

#### SECURITY NOTE!

Never set this to **`True`** in production in any circumstances!

#### Development 

- **`True`**

#### Production 

- **`False`**

</details>

<details>
    <summary>
        DATABASE_URL
    </summary>

#### Development 

- `YOUR PRODUCTION DATABASE URL`

#### Production 

- `YOUR PRODUCTION DATABASE URL`

</details>

<details>
    <summary>
        DEVELOPMENT_DATABASE_URL
    </summary>

#### Development 

- `YOUR DEVELOPMENT DATABASE URL`

#### Production 

- **`NONE OR UNSET`**

**Note**

This project is using the dj-database-url package, you can follow 
[this](https://pypi.org/project/dj-database-url/) 
link if you're unsure how to format your database URL.

</details>

<details>
    <summary>
        CLOUDINARY_URL
    </summary>

#### Development 

- `YOUR CLOUDINARY URL`

#### Production 

- **`NONE OR UNSET`**

**Note**

This is only used in production. Locally, static files are 'uploaded' into the media folder. 

</details>

### Deployment and Github Actions

Here's a guide on how to deploy this project with GitHub Actions. Heroku is a service that allows seamless integration with GitHub and it has been used throughout this app's development. As already emphasized, the deployment process is in harmony with the automatic testing workflow. Again, GitHub Actions has been utilized to deploy this project, the script for deploying with automatic testing is located at `.github/workflows/deploy`. 

When you want to push changes to the GitHub repository, simply run **`git push origin main`**. If you've followed my previous suggestions (in the `Testing` section), your changes will be tested before being pushed to the cloud.

#### But how do I deploy?

The script will only fire the GitHub Action testing when the project is pushed with a tag. Therefore, you'll need to configure a tag before pushing. This setup allows cloud version control without deploying on each push.

#### Simplified instruction

Example:

- To push changes to the live repository without deploying, simply run **`git push origin main`**.

- if you want to deploy your first version of the project, first, run **`git push origin main`**, then run **`git tag v0.1`** followed by **`git push origin v0.1`**.

#### NOTE!

When deploying, the testing will be done in the GitHub Action environment! You'll have to make sure this environment mimics your development environment. **TIP!** Copy and paste your `.env` variables into Github Actions.

1. Go to **Settings**.
2. Click on **Secrets and variables**
3. Click on **Actions**
4. Add your development secrets here.
