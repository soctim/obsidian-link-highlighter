import {App, PluginSettingTab, Setting} from "obsidian";
import LinkHighlighterPlugin from "./main";
import {Colorizer} from "./colorizer";
import Pickr from "@simonwep/pickr";

export interface LinkHighlighterSettings {
    useCustomColors: boolean,
    customBackgroundColor: string,
    customTextColor: string
    customColorRGB?: string
}

export const DEFAULT_SETTINGS: LinkHighlighterSettings = {
    useCustomColors: false,
    customBackgroundColor: '#ffffff',
    customTextColor: '#000000'
}

export class HighlighterSettingTab extends PluginSettingTab {
    plugin: LinkHighlighterPlugin;
    colorizer: Colorizer;

    constructor(app: App, plugin: LinkHighlighterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.colorizer = new Colorizer(this.plugin.settings)
    }

    display(): void {
        let {containerEl} = this;

        containerEl.empty();
        containerEl.createEl('h2', {text: 'Link Highlighter Settings'});

        new Setting(containerEl)
            .setName('Use Custom Colors')
            .addToggle(component => {
                component
                    .setValue(this.plugin.settings.useCustomColors)
                    .onChange(async (enabled) => {
                        this.plugin.settings.useCustomColors = enabled
                        await this.plugin.saveSettings()

                        if (enabled) {
                            this.colorizer.setTextColor(this.plugin.settings.customTextColor)
                            this.colorizer.setBackgroundColor(this.plugin.settings.customBackgroundColor)
                            toggleInputDisable(false)
                        } else {
                            toggleInputDisable(true)
                            this.colorizer.setupColors()
                        }
                    })
            })

        let backgroundColorSetting = new Setting(containerEl)
            .setName('Custom Background Color')
            .addText(component => component
                .setPlaceholder('Enter HEX color code')
                .setValue(this.plugin.settings.customBackgroundColor)
                .setDisabled(!this.plugin.settings.useCustomColors)
                .onChange(async (value) => {
                    this.colorizer.setBackgroundColor(value);
                    this.plugin.settings.customBackgroundColor = value;
                    await this.plugin.saveSettings();
                }));

        let textColorSetting = new Setting(containerEl)
            .setName('Custom Text Color')
            .addText(text => text
                .setPlaceholder('Enter HEX color code')
                .setValue(this.plugin.settings.customTextColor)
                .onChange(async (value) => {
                    this.colorizer.setTextColor(value);
                    this.plugin.settings.customTextColor = value;
                    await this.plugin.saveSettings();
                }));

        this.initPickr(containerEl, 'IMG_VIEW_BACKGROUND_COLOR_NAME', '#00000000');

        new Setting(containerEl)
            .setName('Element highlighting example')
            .addButton(btn =>
                btn
                    .setClass('link-highlighter-example')
                    .setButtonText('Hello World!')
                    .setDisabled(true)
            )

        function toggleInputDisable(value: boolean) {
            backgroundColorSetting.setDisabled(value)
            textColorSetting.setDisabled(value)
        }
    }

    initPickr(containerEl: HTMLElement, name: string, defaultColor: string): Setting {
        let pickrDefault: string = defaultColor;

        let pickr: Pickr;
        return new Setting(containerEl)
            .setName('Pick the color')
            .then((setting) => {
                pickr = Pickr.create({
                    el: setting.controlEl.createDiv({cls: "picker"}),
                    theme: 'nano',
                    position: "left-middle",
                    lockOpacity: false, // If true, the user won't be able to adjust any opacity.
                    default: pickrDefault, // Default color
                    swatches: [], // Optional color swatches
                    components: {
                        preview: true,
                        hue: true,
                        opacity: true,
                        interaction: {
                            hex: true,
                            rgba: true,
                            hsla: false,
                            input: true,
                            cancel: true,
                            save: true,
                        },
                    }
                })
                    .on('show', (color: Pickr.HSVaColor, instance: Pickr) => { // Pickr got opened
                        // if (!this.plugin.settings.galleryNavbarToggle) pickr?.hide();
                        const {result} = (pickr.getRoot() as any).interaction;
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => result.select())
                        );
                    })
                    .on('save', (color: Pickr.HSVaColor, instance: Pickr) => { // User clicked the save / clear button
                        if (!color) return;
                        instance.hide();
                        const savedColor = color.toHEXA().toString();
                        instance.addSwatch(savedColor);
                        this.setAndSavePickrSetting(savedColor);
                    })
                    .on('cancel', (instance: Pickr) => { // User clicked the cancel button
                        instance.hide();
                    })
            })
            .addExtraButton((btn) => {
                btn.setIcon("reset")
                    .onClick(() => {
                        pickr.setColor(defaultColor);
                        this.setAndSavePickrSetting(defaultColor);
                    })
                    .setTooltip('restore default color');
            });
    }


    setAndSavePickrSetting(savedColor: string): void {
        this.plugin.settings.customColorRGB = savedColor;
        this.plugin.saveSettings();
    }
}