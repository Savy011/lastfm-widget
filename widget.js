class LastFmWidget extends HTMLElement {
	#USERNAME = '<enter your last.fm username here>';
	#API_KEY = '<enter your last.fm api key here>';

	#API_URL = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks';

	constructor() {
		super();
		this.getRecentTrack();
		this.render();
	}

	getRecentTrack() {
		const apiUrl = `${this.#API_URL}?user=${this.#USERNAME}&api_key=${this.API_KEY}&format=json`;
		const res = fetch(apiUrl).then(r => r.json())

		console.log(res)
	}

	connectedCallback() {
		console.log("I'm connected...")
	}

	render() {
		this.textContent = 'Last.fm Widget';

		const shadow = this.attachShadow({ mode: 'open' });

		shadow.innerHTML = `
		<style>
			span {
				font-family: 'monospace';
				font-size: 24px;
				background-color: #0055b7;
				color: #99ee99;
				padding: 0.25rem .5rem;
			}
		</style>

		<span>leefymoon</span>
		`
	}
}

window.customElements.define('last-fm-widget', LastFmWidget)

