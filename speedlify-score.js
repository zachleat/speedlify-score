class SpeedlifyUrlStore {
	constructor() {
		this.fetches = {};
		this.responses = {};
		this.urls = {};
	}

	static normalizeUrl(speedlifyUrl, path) {
		let host = `${speedlifyUrl}${speedlifyUrl.endsWith("/") ? "" : "/"}`
		return host + (path.startsWith("/") ? path.substr(1) : path);
	}

	async fetch(speedlifyUrl, url) {
		if(this.urls[speedlifyUrl]) {
			return this.urls[speedlifyUrl][url] ? this.urls[speedlifyUrl][url].hash : false;
		}

		if(!this.fetches[speedlifyUrl]) {
			this.fetches[speedlifyUrl] = fetch(SpeedlifyUrlStore.normalizeUrl(speedlifyUrl, "api/urls.json"));
		}

		let response = await this.fetches[speedlifyUrl];

		if(!this.responses[speedlifyUrl]) {
			this.responses[speedlifyUrl] = response.json();
		}

		let json = await this.responses[speedlifyUrl];

		this.urls[speedlifyUrl] = json;

		return json[url] ? json[url].hash : false;
	}
}

// Global store
const urlStore = new SpeedlifyUrlStore();

class SpeedlifyScore extends HTMLElement {
	static register(tagName) {
		customElements.define(tagName || "speedlify-score", SpeedlifyScore);
	}

	static css = `
:host {
	display: flex;
	align-items: center;
	gap: 0.375em; /* 6px /16 */
}
.circle {
	font-size: 0.8125em; /* 13px /16 */
	min-width: 2.6em;
	height: 2.6em;
	line-height: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	border: 2px solid #0cce6b;
	color: #088645;
}
.circle-ok {
	color: #ffa400;
	border-color: currentColor;
}
.circle-bad {
	color: #ff4e42;
	border-color: currentColor;
}
.meta {
	display: flex;
	align-items: center;
	gap: 0.625em; /* 10px /16 */
}
.circle + .meta {
	margin-left: 0.25em; /* 4px /16 */
}
.rank:before {
	content: "Rank #";
}
.rank-change:before {
	line-height: 1;
}
.rank-change.up {
	color: green;
}
.rank-change.up:before {
	content: "⬆";
}
.rank-change.down {
	color: red;
}
.rank-change.down:before {
	content: "⬇";
}
`;

	connectedCallback() {
		if (!("replaceSync" in CSSStyleSheet.prototype) || this.shadowRoot) {
			return;
		}

		this.speedlifyUrl = this.getAttribute("speedlify-url");
		this.shorthash = this.getAttribute("hash");
		this.rawData = this.getAttribute("raw-data");
		this.url = this.getAttribute("url") || window.location.href;

		if(!this.rawData && !this.speedlifyUrl) {
			console.log(`Missing \`speedlify-url\` attribute:`, this);
			return;
		}

		// async
		this.init();
	}

	_initTemplate(data) {
		if(this.shadowRoot) {
			return;
		}

		let shadowroot = this.attachShadow({ mode: "open" });
		let sheet = new CSSStyleSheet();
		sheet.replaceSync(SpeedlifyScore.css);
		shadowroot.adoptedStyleSheets = [sheet];

		let template = document.createElement("template");
		template.innerHTML = this.render(data);
		shadowroot.appendChild(template.content.cloneNode(true));
	}

	async init() {
		if(this.rawData) {
			let data = JSON.parse(this.rawData);
			this.setDateAttributes(data);
			this._initTemplate(data);
			return;
		}

		let hash = this.shorthash;
		if(!hash) {
			// It’s much faster if you supply a `hash` attribute!
			hash = await urlStore.fetch(this.speedlifyUrl, this.url);
		}

		if(!hash) {
			console.error( `<speedlify-score> could not find hash for URL (${this.url}):`, this );
			return;
		}

		let data = await this.fetchData(hash);
		this.setDateAttributes(data);

		this._initTemplate(data);
	}

	async fetchData(hash) {
		let response = await fetch(SpeedlifyUrlStore.normalizeUrl(this.speedlifyUrl, `api/${hash}.json`));
		let json = await response.json();

		return json;
	}

	setDateAttributes(data) {
		if(!("Intl" in window) || !Intl.DateTimeFormat || !data.timestamp) {
			return;
		}
		const date = new Intl.DateTimeFormat().format(new Date(data.timestamp));
		this.setAttribute("title", `Results from ${date}`);
	}

	getScoreClass(score) {
		if(score < .5) {
			return "circle circle-bad";
		}
		if(score < .9) {
			return "circle circle-ok";
		}
		return "circle circle-good";
	}

	getScoreTemplate(data) {
		let scores = [];
		scores.push(`<span title="Performance" class="${this.getScoreClass(data.lighthouse.performance)}">${parseInt(data.lighthouse.performance * 100, 10)}</span>`);
		scores.push(`<span title="Accessibility" class="${this.getScoreClass(data.lighthouse.accessibility)}">${parseInt(data.lighthouse.accessibility * 100, 10)}</span>`);
		scores.push(`<span title="Best Practices" class="${this.getScoreClass(data.lighthouse.bestPractices)}">${parseInt(data.lighthouse.bestPractices * 100, 10)}</span>`);
		scores.push(`<span title="SEO" class="${this.getScoreClass(data.lighthouse.seo)}">${parseInt(data.lighthouse.seo * 100, 10)}</span>`);
		return scores.join(" ");
	}

	render(data) {
		let content = [];
		let scoreHtml = this.getScoreTemplate(data);
		if(!this.hasAttribute("requests") && !this.hasAttribute("weight") && !this.hasAttribute("rank") && !this.hasAttribute("rank-change") || this.hasAttribute("score")) {
			content.push(scoreHtml);
		}

		let meta = [];
		let summarySplit = data.weight.summary.split(" • ");
		if(this.hasAttribute("requests")) {
			meta.push(`<span class="requests">${summarySplit[0]}</span>`);
		}
		if(this.hasAttribute("weight")) {
			meta.push(`<span class="weight">${summarySplit[1]}</span>`);
		}
		if(this.hasAttribute("rank")) {
			let rankUrl = this.getAttribute("rank-url");
			meta.push(`<${rankUrl ? `a href="${rankUrl}"` : "span"} class="rank">${data.ranks.cumulative}</${rankUrl ? "a" : "span"}>`);
		}
		if(this.hasAttribute("rank-change") && data.previousRanks) {
			let change = data.previousRanks.cumulative - data.ranks.cumulative;
			meta.push(`<span class="rank-change ${change > 0 ? "up" : (change < 0 ? "down" : "same")}">${change !== 0 ? Math.abs(change) : ""}</span>`);
		}
		if(meta.length) {
			content.push(`<span class="meta">${meta.join("")}</span>`)
		}

		return content.join("");
	}
}

if(("customElements" in window) && ("fetch" in window)) {
	SpeedlifyScore.register();
}