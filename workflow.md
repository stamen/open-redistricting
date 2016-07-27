# Open Redistricting Workflow

## Setup

### 1. Set up a GitHub account.

If you already have a GitHub account you'd like to use for sharing your district maps, use that account and skip to step #2. Otherwise, you can create a new GitHub account, following these steps.

1. Ensure you have a valid email account that has not yet been used to set up a GitHub account.
2. Visit [GitHub.com](https://github.com/) and create a new account.
3. Choose a free account -- we're working in the open here, and GitHub requires you to pay only for private repositories.
4. After verifying your email address, you can start a new project; this takes us to Step 2 below.

### 2. Download the GitHub Desktop client.

Advanced users with technical proficiency can skip this and remain on the command line if they choose. For those who prefer to use a less technical interface than the command line, download the GitHub Desktop client from [here](https://desktop.github.com/). The rest of this document will detail use of GitHub Desktop and [GitHub.com](https://github.com/) rather than command line `git`.

### 3. Initialize a git repository for your project.

1. Visit [GitHub.com](https://github.com/) and log in.
2. If you have not yet created any repositories with this account, click the "Start a project" button; if you already have repos on GitHub then click the "New repository" button.
3. Call it whatever you like, and give it a suitable description. Leave it public -- again, we're working in the open.
4. Check the box to initialize the repo with a **README** file.
5. Leave the defaults for **.gitignore** and **license**.
6. Click the "Create Repository" button.
7. You're now viewing your repo. You can add more information about your redistricting effort to `README.md` by clicking the `README.md` link on this page, and then the edit button (at upper-right, a pencil icon). Be sure to click "Commit changes" at the bottom of the page when you're done.
8. Go back to your repo's home page (e.g. `https://github.com/<username>/<reponame>/`) and click the green "Clone or download" button, and choose "Open in Desktop". GitHub Desktop (which we downloaded and installed in Step 2 above) will open, and our repo's files will be saved in the location you specify.

We now have a working repository in place. We'll use this to store proposals in a public place, where constituents and other interested parties can comment on proposals and suggest modifications. This public input can then be folded into subsequent iterations, leading ideally to a more democratic end result.

### 4. Create (and validate) your district map as a geojson file(s).

Create your district map with the tool of your choice, and export it as a `.geojson` file.

_TODO: examples of using ESRI/other industry-standard tools to output geojson_

Note: if you've made any changes by hand, you might want to validate the `.geojson` file with a tool like [MapBox's GeoJSON Hint](https://www.mapbox.com/geojsonhint/) or [GeoJSONLint](http://geojsonlint.com/). Invalid GeoJSON will prevent the next steps from working correctly.

### 5. Commit your geojson file(s).

1. Copy your `.geojson` file into the folder to which you saved your repository files in step 3.8.
2. Switch back over to GitHub client, and select View > Uncommitted Changes to see your new file.
3. In the Summary field, add a descriptive commit message. For example, you might write _"Initial commit of district map"_. Then, click the "Commit to master" button. This commits your change locally, but we still have to synchronize that commit with the server.
4. Click the "Sync" or "Publish" button at upper-right; GitHub Desktop has just "pushed" your local changes up to the server (GitHub.com), where anyone following along can now view and comment on them.

### 6. Visit your progress at its public home.

#### Viewing your committed district map
Now that you've "synced" or "pushed" your changes, they are visible to the public online. Switch back over to your browser and visit your repo homepage (e.g. `https://github.com/<username>/<reponame>/`). (You may need to refresh your browser.)

You will see the `.geojson` file(s) you added; click their names to view them online. The button at upper-right with a page icon (shows _"Display the rich diff"_ on hover) will, when clicked, display your `.geojson` file as an inline map.

![GitHub map view](https://cloud.githubusercontent.com/assets/1127259/17072663/ddc024aa-501e-11e6-8378-552070c41a79.png "GitHub map view")

We're live! The public can now view your district map in its current form.


## Adding revisions

### 1. Make a new branch.

On GitHub and its underlying version control engine, [Git](https://git-scm.com/), you can make substantial changes to your project on a separate _branch_, collect feedback and iterate, and then _merge_ back into your main branch, called `master`.

Let's create a new branch to keep track of the changes we're about to make.

1. In GitHub Desktop, click the "Add a branch" button in the top toolbar or select File > New Branch. Name your branch something descriptive but succinct. Dashes are the preferred word separator. If you are, for example, proposing changes to District 11 in 2020's redistricting, you might name your branch `district-11-update-2020`.
	- **_Note:_** You can branch off of branches, but we only have the `master` branch right now. So the "From" dropdown offers only "master", and this is the choice we want.
2. Edit your map with the tool of your choice, and export it as a `.geojson` file.
3. Copy the `.geojson` file into the folder to which you saved your repository files in **Setup** step 3.8. Don't change the name; just overwrite the file that you added previously.
	- **_Note:_** Even though you're overwriting the file, we can easily _revert_ to the previous version -- nothing is lost! This is the magic of systems like GitHub and its underlying version control engine Git. If you need to do this, right-click the filename in GitHub Desktop and select "Discard Changes...", or select Repository > Discard Changes to Selected Files....
4. Back in GitHub Desktop, let's commit our change and push it to GitHub. As before, write a descriptive commit message, then click the Commit button below (note this time it reads "Commit to _&lt;your-branch-name&gt;_" instead of "Commit to master", since we're currently working on a branch). Then click the "Publish" button at upper-right to push your commit to the server.

### View your changes and interact with your district map.

1. Switch back over to your browser and go again to your repo homepage. You'll see a prominent banner on the page with the name of the branch you just pushed; click the green "Compare & pull request" button to see your fine work.
2. You are now on the **Open a pull request** page. You can see the file to which you committed changes listed below the pull request UI (we'll come back to this); click the button with a page icon (shows _"Display the rich diff"_ on hover) to view your changes rendered on a map.
3. Toggle between the "Revision Slider" and "Highlight" tabs below the map for two different ways of viewing the changes.
4. When you are ready to submit your proposed changes, enter a descriptive comment in the "Leave a comment" field and click the green "Create pull request" button. Your proposal is now ready for public feedback.

![GitHub geodiff: Highlight View](https://cloud.githubusercontent.com/assets/1127259/17067888/c851ad8a-5002-11e6-8c07-5a68af64b29d.png "GitHub geodiff: Highlight View")

![GitHub geodiff: Revision Slider](https://cloud.githubusercontent.com/assets/1127259/17067889/c8677386-5002-11e6-8d28-f53ac66352ac.png "GitHub geodiff: Revision Slider")

#### Pro Tip: Viewing differences between an arbitrary pair of map changes
You may never need this feature if you always follow the above flow. However, if at any point in the future you want to compare the state of the map from one point in time (an arbitrary commit) to another, you can do so with the following steps:

1. Visit your repo homepage and click the "N commits" tab toward the top of the page to view a list of commits (changes) pushed to the server. Commits are ordered with the most recent at the top.
2. Get the `SHA` (a unique identifier) for the two commits you wish to compare by clicking the button with a clipboard icon to the right of the commit (shows "Copy the full SHA" on hover). Paste them somewhere for use in the next step.
3. Go back to your repo homepage and click the "New pull request" button" toward the top.
4. On the Compare page, there are two dropdowns for selecting the two commits you want to compare. The older commit goes on the left side (open the dropdown, paste the `SHA`, and select the matching commit from the dropdown below). The page will refresh with a preliminary comparison (between the older commit and the current state of the repo). Repeat with the right dropdown and the newer commit `SHA`.
5. You'll end up on a page that shows a comparison ("diff") between the two commits, with a URL like `https://github.com/<username>/<reponame>/compare/<olderSHA>...<newerSHA>`. [Here's an example](https://github.com/stamen/usopendata/compare/75a473679827728d856234ecd6c4510bd679042d...ddc176316332c9e12040bdfa41bfc41eed84a0cb).
6. Finally, click the button with a page icon (shows _"Display the rich diff"_ on hover), just like we did above, to view changes on a map.

### Notify constituents and collect feedback

Now that you have publicly submitted your proposed changes, it's time to solicit feedback from constituents and other parties. All proposals are available as "Pull requests" from the tab at the top of any page in your repo. Visitors to your proposal can leave comments directly on that page. Note that visitors must have a GitHub account in order to comment.

Unfortunately, GitHub does not offer a single page on which visitors can both comment and see the changes on a map. Comments are left on the "Pull request" home page (e.g. `https://github.com/<username>/<reponame>/pull/<pullRequestId>`), and the map view can be accessed by clicking "Files changed" and then the rich diff button (with a page icon) to the right of the page.

Any member of the public can also submit their own proposed changes by forking your repository and submitting their own pull requests, but that process is outside the scope of this document.

### Iterate based on feedback

Pull requests are not static. They can accumulate comments, and can also accumulate (and combine) revisions. If you need to make changes to your proposal, perhaps based on public feedback, you can simply commit changes to the branch created for the pull request.

1. In the GitHub Desktop client, ensure you are on the branch for the pull request (proposal) you wish to iterate. Use the dropdown at the top of the window to select the branch, or select Repository > Show Branches.
2. Make changes to your map, export as a `.geojson` file, and copy it into your repo folder as in **Adding revisions, 1. Make a new branch**. Then, commit the change and sync/push it to the server as before.
3. You can quickly jump to the updated Pull request page by clicking the pull request button at upper-left of the GitHub Desktop client window. Now you'll see your revision listed on the "Pull request" page, and the map will also update to reflect the new iteration.

### Finalize your changes

Once you have collected sufficient feedback and have iterated your proposal to the point you feel it is ready for reintegration into the overall district map, you can merge your branch back into the `master` branch.

- **_Note:_** this step is optional. Depending on your workflow, you may opt to use this repo as a place to maintain multiple proposals, and feedback on each, as separate branches; the `.geojson` files in each branch can be used as necessary without ever merging them back into the `master` branch.




## Useful tools

- [GitHub Desktop client](https://desktop.github.com/)
- [MapBox's GeoJSON Hint](https://www.mapbox.com/geojsonhint/): GeoJSON validator
- [GeoJSON.io](http://geojson.io/): GeoJSON web viewer
- TODO: add tools for generating district maps
- TODO: add tools for generating geojson from other formats

