const hadankySiteV1 = "hadanky-site-v1"
const assets = [
    "/",
    "/main.js",
    "/game.html",
    "/index.html",
    "/info.html",
    "/data/images/bears.jpg",
    "/data/images/camaro.jpg",
    "/data/images/candle.jpg",
    "/data/images/eagle.jpg",
    "/data/images/flamingos.jpg",
    "/data/images/hummingbird.jpg",
    "/data/images/nemo.jpg",
    "/data/images/octopus.jpg",
    "/data/images/seal.jpg",
    "/data/images/tajmahal.jpg",
    "/data/tasks.json",
    "/styles/style.css",
    "/styles/print.css"
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(hadankySiteV1).then(cache => {
            cache.addAll(assets).then(r => console.log(r))
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})