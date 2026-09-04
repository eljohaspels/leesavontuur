# Mijn Leesavontuur

Een kleine, vrolijke leestracker voor kinderen. Leestijd, punten, levels en badges worden alleen in de browser bewaard met `localStorage`.

## Lokaal bekijken

Er zijn geen dependencies of buildstappen. Open `index.html` direct in een browser, of start vanuit deze map een eenvoudige lokale webserver:

```bash
python -m http.server 8000
```

Open daarna [http://localhost:8000](http://localhost:8000).

## Publiceren met GitHub Pages

1. Push de vier bestanden naar de standaardbranch van de GitHub-repository.
2. Open in GitHub **Settings → Pages**.
3. Kies bij **Build and deployment** voor **Deploy from a branch**.
4. Selecteer de standaardbranch en de map **/(root)** en klik op **Save**.

Na enkele minuten staat de site op `https://eljohaspels.github.io/leesavontuur/`.

## Gegevens

Alle leessessies blijven op hetzelfde apparaat in de browser bewaard. Via **Voor ouders** onderaan de pagina kan de geschiedenis als JSON worden geëxporteerd, teruggezet of volledig gewist.
