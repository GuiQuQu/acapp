export class AcGame
{
    constructor(id)
    {
        this.id =id;
        //$()表示这个是一个html元素，JQuery可通过'#'+id来找到对应id的html元素
        this.$ac_game = $('#'+this.id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayGround(this);
    }
}
