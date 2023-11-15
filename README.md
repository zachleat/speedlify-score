# speedlify-score Web Component

* [I added Lighthouse Scores to my Site’s Footer and You Can Too](https://www.zachleat.com/web/lighthouse-in-footer/)
* Related blog post: [Use Speedlify to Continuously Measure Site Performance](https://www.zachleat.com/web/speedlify/)

## Demo

* [`<speedlify-score>` Demo](https://zachleat.github.io/speedlify-score/demo.html) using [speedlify.dev instance](https://www.speedlify.dev/)

## Usage

### Installation

```
npm install speedlify-score
```

### Include Sources

Include `speedlify-score.js` in your page (preferably concatenated in via a build script).

### Use Markup

Use `<speedlify-score>` in your markup.

Required attributes:

* `speedlify-url`: **Required**. The URL to your Speedlify instance.
* `hash`: **Preferred** but technically optional. A hash representing the active URL.
	* Look this up via your Speedlify instance’s `/api/urls.json` file. [Full instructions available at this blog post](https://www.zachleat.com/web/lighthouse-in-footer/#adding-this-to-your-eleventy-site!).
* `url`: Optional. Not used if `hash` is supplied. This is the raw URL of the page you’d like to see the score for. Defaults to the current page.

#### Examples

```html
<!-- Preferred -->
<speedlify-score speedlify-url="https://www.speedlify.dev/" hash="bbfa43c1">
```

```html
<!-- Slower method, but doesn’t require hash -->
<speedlify-score speedlify-url="https://www.speedlify.dev/" url="https://www.11ty.dev/">
```

#### Use Attributes to customize output

* If no attributes are used, it `score` is implicit and default.
* If some attributes are in play, you must explicitly add `score`.
* `requests`
* `weight`
* `rank`
* `rank-change` (difference between old and new rank)

## Changelog

* `v1.0.0`: First release
* `v2.0.0`: Changes default render behavior (only shows Lighthouse scores by default, summary and weight are not). Adds feature to use attributes to customize output if you want to opt-in to more.
* `v3.0.0`: Removes `flex-wrap: wrap` for top level component.
* `v4.0.0`: Using Shadow DOM, removes need for external stylesheet.