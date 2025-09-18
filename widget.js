class LastFmWidget extends HTMLElement {
  #USERNAME = '<enter your last.fm username here>';
  #API_KEY = '<enter your last.fm api key here>';

  #API_URL = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks';
  #FALLBACK_IMG = 'https://lastfm.freetls.fastly.net/i/u/64s/c6f59c1e5e7240a4c0d427abd71f3dbb.jpg';

  #shadow;
  #track_info = {};
  #controller;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'closed' });
    this.#render();
  }

  #setStyles() {
    const styles = `
      :host {
	--widget-height: 174px;
	--bg-color: #0055b7;
	--text-color: #99ee99;
	--error-color: red;
      }

      p {
	font-family: monospace;
	font-size: 24px;
	color: var(--text-color);
	line-height: 1.5;
	margin: 0;
      }

      .wrapper {
	height: var(--widget-height);
	background-color: var(--bg-color);
	display: flex; 
	align-items: center;
	justify-content: center;
	padding: 8px;
	gap: 0 8px;
      }

      img {
	display: block;
	max-width: 100%;
	height: var(--widget-height);
	width: var(--widget-height);
      }

      .track-info {
	display: flex;
	flex-flow: column;
	justify-content: center;
      }

      .error { color: var(--error-color); }

      .loading::after {
	content: '';
	animation: loading 2s infinite;
      }

      @keyframes loading {
	25%  { content: '';    }
	50%  { content: '.';   }
	75%  { content: '..';  }
	100% { content: '...'; }
      }
    `;

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);

    return sheet;
  }

  async #getRecentTrack() {
    try {
      this.#controller = new AbortController();
      const signal = this.#controller.signal;

      const apiUrl = `${this.#API_URL}&user=${this.#USERNAME}&api_key=${this.#API_KEY}&format=json`;
      const res = await fetch(apiUrl, { signal })

      if (!res.ok) {
	throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json()
      const track = json?.recenttracks?.track?.[0];

      if (!track) {
	throw new Error("No Recent Track Found...")
      }

      const image = track.image?.find(i => i.size === 'large');
      const cover = image?.['#text'] || this.#FALLBACK_IMG;

      return {
	artist: track.artist?.['#text'] || 'Unkown Artist', 
	name: track.name || 'Unkown Artist', 
	album: track.album?.['#text'] || 'Unkown Artist', 
	cover
      };
    } catch (e) {
      console.error(e)
      return { error: 'some error occurred while fetching last played track.'};
    }
  }

  async connectedCallback() {
    const sheet = this.#setStyles();
    this.#shadow.adoptedStyleSheets = [sheet];

    this.#track_info = await this.#getRecentTrack();

    this.#render();
  }

  async disconnectedCallback() {
    this.#controller?.abort();
  }

  #render() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper")

    if (this.#track_info.hasOwnProperty('name')) {
      const { name, artist, album, cover } = this.#track_info;
    
      const divTrackInfo = document.createElement("div");
      const img = document.createElement("img");
      const pName = document.createElement("p");
      const pArtist = document.createElement("p");
      const pAlbum = document.createElement("p");

      divTrackInfo.classList.add("track-info")

      img.setAttribute("src", cover);
      img.setAttribute("alt", `${name} by ${artist}`)

      pName.textContent = name;
      pArtist.textContent = artist;
      pAlbum.textContent = album;

      divTrackInfo.append(pName, pArtist, pAlbum);
      
      wrapper.append(img, divTrackInfo)
    } else if (this.#track_info.hasOwnProperty('error')) {
      const pError = document.createElement("p");

      pError.classList.add("error")
      pError.textContent = this.#track_info.error;

      wrapper.appendChild(pError);
    } else {
      const pLoading = document.createElement("p");

      pLoading.classList.add("loading")
      pLoading.textContent = "loading";

      wrapper.appendChild(pLoading);
    }

    this.#shadow.innerHTML = '';
    this.#shadow.appendChild(wrapper);
  }
}

window.customElements.define('last-fm-widget', LastFmWidget)

