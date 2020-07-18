# speedlify-score Web Component

* [I added Lighthouse Scores to my Site’s Footer and You Can Too](https://www.zachleat.com/web/lighthouse-in-footer/)
* Related blog post: [Use Speedlify to Continuously Measure Site Performance](https://www.zachleat.com/web/speedlify/)
* [Speedlify Demo](https://www.speedlify.dev/zachleat.com/)

## Usage

### Installation

```
npm install speedlify-score
```

### Include Sources

Include the following in your page:

* `speedlify-score.js`
* `speedlify-score.css`

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
