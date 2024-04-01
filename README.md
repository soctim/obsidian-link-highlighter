# Link Highlighter Plugin

This plugin for [Obsidian](https://obsidian.md/) adds highlighting for links of the currently active file.

Can be switched using the icon in the ribbon menu. 


## Demo (old)
![demo.gif](https://github.com/soctim/obsidian-link-highlighter/blob/master/src/resources/screenshots/demo.gif)

### Customization

Default colors will follow currently selected theme:
- `--text-muted` for background color
- `--interactive-accent` for text color

You can change the colors by:
- using plugin settings.
- overriding your `obsidian.css` file.

```css
/* obsidian-link-highlighter */
/* https://github.com/soctim/obsidian-link-highlighter */
body {
    --plugin-link-highlighter-background-color: var(--text-muted);
    --plugin-link-highlighter-text-color: var(--interactive-accent);
}
```
