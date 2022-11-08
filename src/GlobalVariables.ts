import { Config } from "./Config";
import { Subject } from "./Observer";

class GlobalVariablesClass extends Subject {
    app_width = Config.project_width;
    app_height = Config.project_height;

    is_mobile = false;
    is_landscape = true;
    localAddress = "";

    constructor() {
        super();
    }
}

export const Global_Vars = new GlobalVariablesClass();
