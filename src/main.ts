import {addIcon, Notice, parseLinktext, Plugin} from 'obsidian';
import {
    DEFAULT_SETTINGS,
    HighlighterSettingTab,
    LinkHighlighterSettings,
} from "./settings";
import {Colorizer} from "./colorizer";
import {PLUGIN_CSS_CLASS_NAME} from "./constants";
import { debounce } from './utils';

export default class LinkHighlighterPlugin extends Plugin {
    coloredElements: any[] = [];
    enabled: boolean = true;
    settings: LinkHighlighterSettings;
    colorizer: Colorizer;

    async onload() {
        await this.loadSettings().then(() => {
            this.colorizer = new Colorizer(this.settings);
            this.colorizer.setupColors();
        })

        this.addRibbonIcon('highlighter', 'Toggle Link Highlighter', () => {
            if (this.enabled) {
                new Notice('Link Highlighter disabled.');
                this.cleanLinkHighlighter()
            } else {
                new Notice('Link Highlighter enabled!');
                this.cleanLinkHighlighter()
                this.findLinks()
            }
            this.enabled = !this.enabled
        });

        const debouncer = debounce(() => this.checkHighlightingEnabled(), 60)

        this.registerEvent(this.app.metadataCache.on('changed', debouncer))
        this.registerEvent(this.app.workspace.on('file-open', debouncer))
        this.registerEvent(this.app.workspace.on('layout-change', () => checkFilesContainer()))
        
        function checkFilesContainer() {
            const filesContainer = document.getElementsByClassName('nav-files-container')[0]
            if (filesContainer) {
                filesContainer.addEventListener('scroll', debouncer)
            }
        }

        this.app.workspace.on('css-change', () => this.colorizer.setupColors())
        this.addSettingTab(new HighlighterSettingTab(this.app, this));
    }

    onunload() {
        this.cleanLinkHighlighter()
        this.app.metadataCache.off('changed', () => {})
        this.app.workspace.off('file-open', () => {})
        this.app.workspace.off('css-change', () => {})
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    checkHighlightingEnabled() {
        if (this.enabled) {
            this.cleanLinkHighlighter()
            this.findLinks()
        }
    }

    findLinks() {
        let activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            let fileCache = this.app.metadataCache.getFileCache(activeFile)
            if (fileCache && fileCache.links) {
                fileCache.links.forEach((link) => {
                    let linkpath = this.app.metadataCache.getFirstLinkpathDest(parseLinktext(link.link).path, '/');
                    if (linkpath && linkpath.path) {
                        let els = document.querySelectorAll(`[data-path="${linkpath.path}"]`)
                        if (els.length > 0) {
                            this.coloredElements.push(els[0])
                            els[0].classList.add(PLUGIN_CSS_CLASS_NAME)
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
}