import { Config } from "./Config";
import { ResourceController } from "./ResourceLoader";
import * as dat from "dat.gui";
// eslint-disable-next-line @typescript-eslint/no-var-requires

export class Main {
    container: PIXI.Container;
    form!: HTMLElement;
    all: any[] = [];
    targetAnim?: PIXI.spine.Spine;
    gui!: dat.GUI;
    lastAnim?: string;
    loopedAnim?: boolean;
    currentSkin?: string;
    app: PIXI.Application;
    currentBGColor = 0;
    loadingText!: PIXI.Text;

    constructor(app: PIXI.Application) {
        this.app = app;
        // this.setUpGUI();

        this.container = new PIXI.Container();
        this.loadingText = new PIXI.Text(
            "Spine is loading, please wait...",
            new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 50,
            })
        );
        this.container.addChild(this.loadingText);
        this.init();
        this.resize();
    }

    setUpGUI = () => {
        this.gui = new dat.GUI({
            name: "Spine Sandbox",
            closed: false,
            closeOnTop: true,
        });

        this.gui.addColor(this.app.renderer, "backgroundColor");
    };

    showGUI = () => {
        const folder1 = this.gui.addFolder("Spine Params");
        folder1.open();
        const animScale = folder1.add(
            this.targetAnim!.scale,
            "x",
            0.1,
            3,
            0.01
        );
        animScale.name("Animation Scale");
        animScale.onChange((value: number) => {
            this.targetAnim!.scale.set(value);
        });

        const animSpeed = folder1.add(
            this.targetAnim!.state,
            "timeScale",
            0.1,
            3,
            0.01
        );
        animSpeed.name("Animation Speed");
        animSpeed.onChange((value: number) => {
            this.targetAnim!.state.timeScale = value;
        });

        const setDefaultSpineParams = {
            add: () => {
                animScale.setValue(1);
                animSpeed.setValue(1);
            },
        };

        const setDefaultButton = folder1.add(setDefaultSpineParams, "add");
        setDefaultButton.name("Set Defaut");

        const animationsArray =
            this.targetAnim!.state.data.skeletonData.animations.map(
                (a) => a.name
            );

        const skinsArray = this.targetAnim!.skeleton.data.skins.map(
            (a) => a.name
        );

        const animationParams = {
            animsArray: animationsArray,
            loop: false,
            skins: skinsArray,
            defaultSkin: true,
        };

        const folder2 = this.gui.addFolder("Set Animation");
        folder2.open();
        const chooseAnim = folder2.add(
            animationParams,
            "animsArray",
            animationsArray
        );
        chooseAnim.name("Choose Animation");
        chooseAnim.setValue("");

        chooseAnim.onChange((value: string) => {
            this.targetAnim!.state.setAnimation(
                0,
                value,
                this.loopedAnim || false
            );
            this.lastAnim = value;
        });

        const loopedAnim = folder2.add(animationParams, "loop");
        loopedAnim.name("Loop");

        loopedAnim.onChange((value: boolean) => {
            if (this.lastAnim) {
                this.targetAnim!.state.setAnimation(0, this.lastAnim, value);
            }
            this.loopedAnim = value;
        });

        console.log(animationsArray);

        const folder3 = this.gui.addFolder("Set Skin");
        folder3.open();
        const chooseSkin = folder3.add(animationParams, "skins", skinsArray);
        chooseSkin.name("Choose Skin");

        chooseSkin.onChange((value: string) => {
            this.targetAnim!.skeleton.setSkinByName(value);
            this.targetAnim!.skeleton.setSlotsToSetupPose();
        });

        const destroyAnim = {
            add: () => {
                const aerusure = confirm(
                    "Are you sure? Spine animation will be removed."
                );
                if (aerusure) this.destroySpine();
            },
        };

        const destroyAnimButton = this.gui.add(destroyAnim, "add");
        destroyAnimButton.name("Destroy Animation");
    };

    init = () => {
        console.log("App initialized");

        document.addEventListener("loadFile", this.loadSpine);
    };

    validateResources = (): void | never => {
        throw new Error();
    };

    buttonCb = async () => {
        const getTargetFileFromArray = (key: string) => {
            const result: Array<{ file: File; data: any }> = [];

            this.all.forEach((asset: { file: File; data: ProgressEvent }) => {
                const name = asset.file.name.split(".").pop();

                if (name === key) result.push(asset);
            });

            return result;
        };

        const atlasData = getTargetFileFromArray("atlas")[0];
        // console.log(atlasData);
        const atlasLoaderOption = { xhrType: "text" };

        PIXI.Loader.shared.add(
            atlasData.file.name,
            atlasData.data,
            atlasLoaderOption
        );

        const imageData = getTargetFileFromArray("png");
        imageData.forEach((atlasPage) => {
            PIXI.Loader.shared.add(atlasPage.file.name, atlasPage.data);
        });

        await new Promise((resolve) => {
            PIXI.Loader.shared.load(resolve);
        });

        const imageArr: { [key: string]: PIXI.BaseTexture } = {};

        imageData.forEach((res) => {
            imageArr[res.file.name] = ResourceController.getResource(
                res.file.name
            ).texture.baseTexture;
        });

        console.log(imageArr);

        const spineData = getTargetFileFromArray("json")[0];
        const spineLoaderOptions = {
            metadata: {
                atlasRawData: ResourceController.getResource(
                    atlasData.file.name
                ).data,
                images: imageArr,
            },
        };

        console.log(
            ResourceController.getResource(atlasData.file.name).data.split(
                /\r\n|\r|\n/
            )
        );

        PIXI.Loader.shared.add("main.json", spineData.data, spineLoaderOptions);

        PIXI.Loader.shared.load(() => {
            this.createSpineAnimation();
            this.loadingText.visible = false;
        });
    };

    changeStageState = (show: boolean) => {
        if (show) {
            this.app.renderer.view.style.display = "";
            document.getElementById("frominput")!.style.display = "none";
            this.setUpGUI();
            this.loadingText.visible = true;
        } else {
            this.app.renderer.view.style.display = "none";
            document.getElementById("frominput")!.style.display = "flex";
        }
    };

    loadSpine = async () => {
        console.log("loadSpine");

        const input: HTMLInputElement | null = document.getElementById(
            "fileinput"
        ) as HTMLInputElement;

        let files: FileList;
        const fr = new FileReader();

        if (typeof window.FileReader !== "function") {
            throw new Error(
                "The file API isn't supported on this browser yet."
            );
        }

        if (!input) {
            throw new Error("Um, couldn't find the fileinput element.");
        } else if (!input.files) {
            throw new Error(
                "This browser doesn't seem to support the `files` property of file inputs."
            );
        } else if (!input.files[0]) {
            console.error("Please select a file before clicking 'Load'");
        } else {
            const required = ["atlas", "json", "png"];

            files = input.files;

            for (const file of files) {
                required.splice(
                    required.indexOf(file.name.split(".").pop()!),
                    1
                );
            }

            if (required.length !== 0) {
                console.error(
                    `Please select ALL spine files. NOT FOUND {${required}}`
                );
                return;
            }

            this.changeStageState(true);

            const loadFile = (file: File) => {
                return new Promise<void>((resolve) => {
                    fr.onload = (data: any) => {
                        this.all.push({
                            file,
                            data: data.currentTarget.result,
                        });

                        fr.onload = () => {};
                        resolve();
                    };
                    fr.readAsDataURL(file);
                });
            };

            for (const file of files) {
                await loadFile(file);
            }
            console.log(files);
            this.buttonCb();
        }
    };

    createSpineAnimation = () => {
        this.targetAnim = ResourceController.getSpine("main.json");
        this.container.addChild(this.targetAnim);

        this.resize();

        this.showGUI();
    };

    destroySpine = () => {
        this.targetAnim?.destroy({
            children: true,
            texture: true,
            baseTexture: true,
        });

        this.targetAnim = undefined;

        this.lastAnim = undefined;
        this.loopedAnim = undefined;
        this.currentSkin = undefined;

        const loader = ResourceController.loader;

        for (const res of Object.keys(loader.resources)) {
            delete loader.resources[res];
        }

        this.all.length = 0;

        PIXI.utils.BaseTextureCache = {};
        PIXI.utils.TextureCache = {};

        PIXI.utils.clearTextureCache();

        loader.reset();
        loader.destroy();

        this.gui.destroy();

        this.changeStageState(false);
        (document.getElementById("frominput")! as HTMLFormElement).reset();
    };

    resize = () => {
        if (this.targetAnim) {
            this.targetAnim.position.set(
                Config.project_width / 2,
                Config.project_height / 2
            );
        }
    };
}
