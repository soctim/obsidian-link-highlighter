import {App, addIcon, Notice, parseLinktext, Plugin, PluginSettingTab, Setting} from 'obsidian';
import { SampleSettingTab} from "./settings";

const PLUGIN_CSS_CLASS_NAME = 'highlight-related-link'

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}

export default class MyPlugin extends Plugin {
    coloredElements: any[] = [];
    enabled: boolean = true;
    settings: MyPluginSettings;

    async onload() {

    	// TODO: move icon to separate file?
        addIcon('highlighter', '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="highlighter" class="svg-inline--fa fa-highlighter fa-w-17" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 544 512"><path fill="currentColor" d="M0 479.98L99.92 512l35.45-35.45-67.04-67.04L0 479.98zm124.61-240.01a36.592 36.592 0 0 0-10.79 38.1l13.05 42.83-50.93 50.94 96.23 96.23 50.86-50.86 42.74 13.08c13.73 4.2 28.65-.01 38.15-10.78l35.55-41.64-173.34-173.34-41.52 35.44zm403.31-160.7l-63.2-63.2c-20.49-20.49-53.38-21.52-75.12-2.35L190.55 183.68l169.77 169.78L530.27 154.4c19.18-21.74 18.15-54.63-2.35-75.13z"/></svg>')

        this.addRibbonIcon('highlighter', 'Switch Links Highlight', () => {
            if (this.enabled) {
                new Notice('Highlighter disabled.');
                this.enabled = false
				this.cleanLinkHighlighter()
            } else {
                new Notice('Highlighter enabled!');
                this.enabled = true
				this.checkEnabled()
            }
        });

        this.app.metadataCache.on('changed', () => {
            console.error('changed')
            this.checkEnabled()
        })

        this.app.workspace.on('file-open', () => {
            console.error('file-open')
            this.checkEnabled()
        })
        //
        // this.app.workspace.on('layout-change', () => {
        //     console.error('layout-change')
        //     this.checkEnabled()
        // })

        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

	onunload() {
		this.cleanLinkHighlighter()
	}

    checkEnabled() {
        if (this.enabled) {
            this.cleanLinkHighlighter()
            this.findLinks()
        }
    }

    findLinks() {
        let activeFile = this.app.workspace.getActiveFile();
        // console.log('activeFile', activeFile)
        if (activeFile) {
            let fileCache = this.app.metadataCache.getFileCache(activeFile)
            // console.log('fileCache', fileCache)
            if (fileCache && fileCache.links) {
                fileCache.links.forEach((link) => {
                    let linkpath = this.app.metadataCache.getFirstLinkpathDest(parseLinktext(link.link).path, '/');
                    if (linkpath && linkpath.path) {
                        let el = document.querySelectorAll(`[data-path="${linkpath.path}"]`)
                        if (el.length > 0) {
                            this.coloredElements.push(el[0])
                            el[0].classList.add(PLUGIN_CSS_CLASS_NAME)
                        }
                    }
                })
            }
        }
    }

    cleanLinkHighlighter() {
        this.coloredElements.forEach((el) => el.classList.remove(PLUGIN_CSS_CLASS_NAME))
        this.coloredElements = []
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}