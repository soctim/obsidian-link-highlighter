import {LinkHighlighterSettings} from "./settings";
import {
    DEFAULT_THEME_BACKGROUND_COLOR_VAR_NAME,
    DEFAULT_THEME_TEXT_COLOR_VAR_NAME,
    INNER_BACKGROUND_COLOR_VAR_NAME,
    INNER_TEXT_COLOR_VAR_NAME,
    OUTER_BACKGROUND_COLOR_VAR_NAME,
    OUTER_TEXT_COLOR_VAR_NAME
} from "./constants";


export class Colorizer {
    settings: LinkHighlighterSettings

    constructor(settings: LinkHighlighterSettings) {
        this.settings = settings
    }

    setBackgroundColor(value: string) {
        document.body.style.setProperty(INNER_BACKGROUND_COLOR_VAR_NAME, value);
    }

    setTextColor(value: string) {
        document.body.style.setProperty(INNER_TEXT_COLOR_VAR_NAME, value);
    }

    setupColors() {
        let backgroundColor;
        let textColor;

        if (this.settings.useCustomColors) {
            backgroundColor = this.settings.customBackgroundColor;
            textColor = this.settings.customTextColor;
        } else {
            backgroundColor = window.getComputedStyle(document.body).getPropertyValue(OUTER_BACKGROUND_COLOR_VAR_NAME)
            textColor = window.getComputedStyle(document.body).getPropertyValue(OUTER_TEXT_COLOR_VAR_NAME)
        }

        (backgroundColor !== '')
            ? document.body.style.setProperty(INNER_BACKGROUND_COLOR_VAR_NAME, backgroundColor)
            : document.body.style.setProperty(INNER_BACKGROUND_COLOR_VAR_NAME, varWrap(DEFAULT_THEME_BACKGROUND_COLOR_VAR_NAME));

        (textColor !== '')
            ? document.body.style.setProperty(INNER_TEXT_COLOR_VAR_NAME, textColor)
            : document.body.style.setProperty(INNER_TEXT_COLOR_VAR_NAME, varWrap(DEFAULT_THEME_TEXT_COLOR_VAR_NAME));
    }
}

function varWrap(value: string) {
    return `var(${value})`
}