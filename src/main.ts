import { Application, Assets, Container, Sprite } from 'pixi.js';
import "./style.css";
import { threshold } from './shader/someFilter';
(async () =>
{
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });

    document.body.appendChild(app.canvas);

    const container = new Container();

    app.stage.addChild(container);

    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    const bunny = new Sprite(texture);

    bunny.filters = [threshold];
    container.addChild(bunny);

    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    app.ticker.add((time) =>
    {

        threshold.resources.timeUniforms.uniforms.uTime += 0.01 * time.deltaTime;
        console.log(threshold.resources.timeUniforms.uniforms.uTime);
        
    });
})();
