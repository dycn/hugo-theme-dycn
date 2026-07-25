# hugo-theme-dycn

A minimal personal homepage theme for [Hugo](https://gohugo.io/) with an ink-reveal
canvas background, Ken Burns animation, mouse parallax, dark/light toggle, a blog
list with tag filter + pagination, an about panel, and a contact popup.

The theme ships with **runtime language switching** (EN / 中) handled on the
client side — no page reload required.

![screenshot](images/screenshot.png)

## Features

- Ink-reveal hero canvas (day/night scenes, mouse-driven stamps)
- Ken Burns background + mouse parallax
- Dark / light theme toggle (persisted in `localStorage`)
- EN / ZH runtime language toggle (persisted in `localStorage`)
- Blog list with tag filter and pagination
- About slide-in panel + contact popup with WeChat QR modal
- Responsive layout, Bootstrap Icons

## Installation

From your site root:

```bash
git submodule add https://github.com/dycn/hugo-theme-dycn.git themes/dycn
```

Then in `hugo.toml`:

```toml
theme = "dycn"
```

## Configuration

See [`exampleSite/hugo.toml`](exampleSite/hugo.toml) for a full, runnable
example. Key parameters:

| Parameter            | Description                              | Default |
| -------------------- | ---------------------------------------- | ------- |
| `name`               | Display name in hero                     | —       |
| `avatar`             | Avatar URL                               | —       |
| `backgroundImage`    | Hero background URL                      | —       |
| `defaultTheme`       | `dark` or `light`                        | `dark`  |
| `defaultLang`        | `en` or `zh` (initial language)          | `en`    |
| `pageSize`           | Blog list page size                      | `5`     |
| `fontCDN`            | Font stylesheet URL                      | —       |
| `fontFamily`         | CSS `font-family` value                  | —       |
| `[[params.links]]`   | Navigation entries (`icon`, `nameKey`, `url`) | —   |
| `[[params.contacts]]`| Contact entries (`icon`, `label`, `value`)    | —   |

### i18n

Translations live in [`data/i18n.toml`](data/i18n.toml) with `[en]` and `[zh]`
sections. The whole table is injected into the page and switched at runtime by
the `#langToggle` button. To customise, drop your own `data/i18n.toml` in your
project root — it will override the theme's copy.

Available keys: `signature`, `blog`, `about`, `github`, `blogTitle`,
`aboutTitle`, `aboutContent`, `contact`, `contactTitle`, `backHome`,
`notFound`.

## Run the example site

```bash
cd hugo-theme-dycn
hugo server -s exampleSite --themesDir ../..
```

Then visit http://localhost:1313/.

## License

[MIT](LICENSE) © dycn
