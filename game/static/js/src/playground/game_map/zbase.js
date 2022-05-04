class GameMap extends AcGameObject //继承自基类
{
    constructor(playground)
    {
        super(); //调用基类构造函数
        this.playground = playground;
        // 添加tabindex之后,能够让canvas监听输入信息
        this.$canvas = $(`<canvas tabindex=0></canvas>`); //画布渲染工具
        this.ctx =this.$canvas[0].getContext("2d"); //在canvas的Context里面操作,2d画布
        this.ctx.canvas.width =this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        this.playground.$playground.append(this.$canvas);
        //console.log("GameMap");
    }

    start()
    {
        this.$canvas.focus();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        //每次改变完大小之后,屏幕会出现渐变的闪的效果,需要把这个效果处理掉
        this.ctx.fillStyle = "rgba(0,0,0,1)"; //强行涂一层不透明的蒙版,用黑的盖掉掉原来透明渐变的
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
    update()
    {
        this.render();
    }

    render()
    {
        //console.log("render...")
        //增加透明度为0.2,这样渲染的时候就会慢慢变成黑色，涂多了就是黑色了，有一个渐变的过程
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}
