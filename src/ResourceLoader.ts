import { IResourceDictionary } from "pixi.js";

class Loader {
    loader = PIXI.Loader.shared;

    public get resources(): IResourceDictionary {
        return this.loader.resources;
    }

    getResource = (key: string): PIXI.LoaderResource => {
        const resource = this.resources[key];

        if (!resource)
            throw new Error(`There is no resource with name - {${key}}`);

        return resource;
    };

    getSpineData = (key: string): PIXI.spine.core.SkeletonData => {
        const resource = this.getResource(key);

        if (resource instanceof PIXI.Texture) {
            throw new Error(`Resource with name {${key}} is not a spine!`);
        }

        const spineData = resource.spineData;

        if (!spineData) {
            if (resource.data) {
                // return resource.data;
                throw new Error(
                    `Spine with name {${key}} not for version 3.8 or it\`s not a spine!`
                );
            } else {
                throw new Error(
                    `There is no spineData in resource - {${key}}!`
                );
            }
        }

        return spineData;
    };

    getSpine = (key: string): PIXI.spine.Spine => {
        const spineData = this.getSpineData(key);
        return new PIXI.spine.Spine(spineData);
    };

    addResources = (ANIMATIONS: any) => {
        // this.loader.add(
        //     asset.key,
        //     `${SessionConfig.ASSETS_ADDRESS}${assetList.defaultPath}${asset.path}`
        // );
    };

    loadResources = () => {
        return new Promise<void>((resolve) => {
            this.loader.load(() => {
                resolve();
            });
        });
    };
}

export const ResourceController = new Loader();
