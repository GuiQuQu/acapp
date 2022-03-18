class GameMap extends AcGameObject //继承自基类
{
    constructor(playground)
    {
        super(); //调用基类构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); //画布渲染工具
        this.ctx =this.$canvas[0].getContext("2d"); //在canvas的Context里面操作,2d画布
        this.ctx.canvas.width =this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        this.playground.$playground.append(this.$canvas);
        console.log("GameMap");
    }

    start()
    {
    }

    update()
    {
        this.render();
    }

    render()
    {
        //console.log("render...")
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}
