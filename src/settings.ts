import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

const DEFAULT_BACKGROUND_COLOR = 'var(--text-muted)';
const DEFAULT_COLOR = 'var(--interactive-accent)';
const EXAMPLE_BUTTON_CLASSNAME = 'link-highlighter-example';

export class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    backgroundColorValue = DEFAULT_BACKGROUND_COLOR;
    colorValue = DEFAULT_COLOR

    defaultButtonValues: string = `{
        background-color: ${this.backgroundColorValue}!important;
        color: var(--meow-meow)!important;
    }`

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let {containerEl} = this;

        let meowmeow = '--meow-meow';

        document.body.style.setProperty(meowmeow, 'green');

        let stylesheet = document.styleSheets[0]

        let ruleindex = stylesheet.insertRule(`.${EXAMPLE_BUTTON_CLASSNAME} ${this.defaultButtonValues}`)
        console.log(stylesheet.rules[ruleindex])
        // stylesheet.rules.item().

        containerEl.empty();
        containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

        new Setting(containerEl)
            .setName('Background Color (hex code)')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue('')
                .onChange(async (value) => {
                    console.log(value)
                    document.body.style.setProperty(meowmeow, value);
                    // this.plugin.settings.mySetting = value;
                    // await this.plugin.saveSettings();
                }));

        new Setting(containerEl).setName('Element highlighting example').addButton(btn =>
            btn
                .setClass(EXAMPLE_BUTTON_CLASSNAME)
                .setButtonText('Zаshtshееshtshауоushtshееkhsуа')
                .setDisabled(true)
        )

        // new Setting(containerEl).setName('Abother One').addButton(btn =>
        //     btn
        //         .setButtonText('change css').onClick(() => {
        //         this.test2 = this.test1
        //         document.styleSheets[0].insertRule(`.${this.testClass} { background-color: orange!important }`)
        //     })
        // )
        // containerEl.createDiv({ text: 'ExampleDiv'}, (el) => el.classList.add(this.testClass))
    }
}