export class AcGame
{
    constructor(id,acwingos)
    {
        //如果在acwing里打开,就会传这个参数,提供了一些接口,也可以判断是在那里执行的
        this.acwingos = acwingos;
        this.id =id;
        //$()表示这个是一个html元素，JQuery可通过'#'+id来找到对应id的html元素
        this.settings = new Settings(this);
        this.$ac_game = $('#'+this.id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayGround(this);
    }
}
