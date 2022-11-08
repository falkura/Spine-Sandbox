import "pixi-spine";
import "pixi.js";
import packageInfo from "../package.json";
import { App } from "./App";

function init() {
    document.getElementById("root")!.onmousedown = () => {
        return false;
    };

    const game_name = "Spine Sandbox";
    const full_game_name = `${game_name} v${packageInfo.version}`;

    console.log(full_game_name);

    document.title = full_game_name;

    new App();
}

if (document.readyState !== "loading") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
