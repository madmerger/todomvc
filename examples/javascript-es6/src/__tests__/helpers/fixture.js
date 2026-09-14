import fs from "fs";
import path from "path";

export const loadFixture = () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

    document.body.innerHTML = body[1];
    return document.body;
};

export const keyboardEvent = (type, keyCode) => {
    const event = new KeyboardEvent(type, { bubbles: true });
    Object.defineProperty(event, "keyCode", { value: keyCode });
    return event;
};
