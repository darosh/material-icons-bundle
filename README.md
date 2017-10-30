# Material Icons Bundle

_Material Design SVG icons as ES modules_

## Browse Icons

Visit [Icon Browser](https://darosh.github.io/material-icons-bundle/) featuring:

- Visually similar icons (per pixel compare)
- Simple bundle copy/paste editor
- Various view, filtering and grouping options
- Instant search

## Install

```bash
$ yarn add gitub:darosh/material-icons-bundle
```

## Usage

```javascript
export {
  signal_cellular_connected_no_internet_0_bar,
  keyboard_arrow_left,
  keyboard_arrow_right,
  keyboard_arrow_up
} from 'material-icons-bundle'
```

will produce object like:

```javascript
{
  signal_cellular_connected_no_internet_0_bar: '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"></path>...',
  keyboard_arrow_left: 'M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z',
  ...
}
```

where most of values are `<path>` `d` attribute data. Some data starting with `<` are svg inner elements, such icons are tagged as `multi-shape` in the [browser](https://darosh.github.io/material-icons-bundle/).

Icon aliases points to same `*.js` file for minimal build. 

Tree-shaking [rollup.js](https://rollupjs.org/#tree-shaking) or [webpack](https://webpack.js.org/guides/tree-shaking/) recommended.

## Sources

- Google icons [material.io/icons](https://material.io/icons/) from [google/material-design-icons](https://github.com/google/material-design-icons/)
- Community icons [materialdesignicons.com](https://materialdesignicons.com/) from [Templarian/MaterialDesign-SVG](https://github.com/Templarian/MaterialDesign-SVG) and [API](https://github.com/Templarian/MaterialDesign-Site/blob/master/src/content/api.md)

Sources are merged comparing rendered pixel with some additional auto tagging.
