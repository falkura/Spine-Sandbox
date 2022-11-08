import { Config } from "./Config";
import { Global_Vars } from "./GlobalVariables";
import { Main } from "./Main";
import { ResourceController } from "./ResourceLoader";

export class App {
    readonly canvas: HTMLCanvasElement;
    readonly app: PIXI.Application;
    main!: Main;

    constructor() {
        Global_Vars.is_mobile = PIXI.utils.isMobile.any;
        this.canvas = document.getElementById("root") as HTMLCanvasElement;

        Global_Vars.localAddress =
            `${window.location.origin}${window.location.pathname}`.replace(
                "index.html",
                ""
            );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).rc = ResourceController;

        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.marginTop = "0";
        this.canvas.style.marginLeft = "0";

        this.app = this.getPixiApp();
        this.app.renderer.view.style.display = "none";

        this.main = new Main(this.app);

        this.app.stage.addChildAt(this.main.container, 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).main = this.main;
        (window as any).gv = Global_Vars;

        window.onresize = this.on_resize;
        window.onorientationchange = this.on_resize;

        this.on_resize();
    }

    getPixiApp = () => {
        PIXI.settings.ROUND_PIXELS = true;
        PIXI.settings.SORTABLE_CHILDREN = true;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        return new PIXI.Application({
            width: Config.project_width,
            height: Config.project_height,
            view: this.canvas,
            sharedLoader: true,
            sharedTicker: true,
            // transparent: true,
        });
    };

    on_resize = () => {
        const multiplier = window.innerHeight / Global_Vars.app_height;
        const target_width = window.innerWidth / multiplier;

        this.app.renderer.resize(target_width, Global_Vars.app_height);

        if (window.innerWidth < window.innerHeight) {
            Global_Vars.is_landscape = false;
        } else {
            Global_Vars.is_landscape = true;
        }

        Config.project_width = this.app.view.width;
        Config.project_height = this.app.view.height;

        Global_Vars.notify_all();

        if (this.main) {
            this.main.resize();
        }
    };
}
