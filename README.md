# US Open Data: Open Redistricting

A website and toolset documentation for moving the redistricting process into public view. Produced by [Stamen Design](http://stamen.com/) for [US Open Data](https://usopendata.org/) in 2016.

## How it works

The [Open Redistricting website](#) offers a simple interface for uploading current and proposed district maps (in [`.geojson` format](http://geojson.org/)), annotating and revising them, and supporting public feedback. It is basically a [GitHub](https://github.com/) / [Git](https://git-scm.com/) client, designed to leverage the benefits of those tools without requiring users to familiarize themselves with them.

Open Redistricting repurposes core GitHub/Git features for the context of drawing legislative district maps as follows:

| GitHub/Git           | Open Redistrcting   |
| -------------------- | ------------------- |
| Repository           | Project             |
| Pull Request/Branch  | Proposal            |
| Branch commit        | Proposal iteration  |


## Resources

- The [Open Redistricting website](#) is available for use by legislative redistricting staff and interested members of the public.
- The [workflow documentation](./workflow.md) outlines the GitHub/Git workflow facilitated by the website, without use of the website itself. Users may wish to roll their own implementation of the Open Redistricting tool to their own specifications, following these guidelines.
