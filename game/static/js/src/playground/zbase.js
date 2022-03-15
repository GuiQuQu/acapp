class AcGamePlayGround
{
    constructor(root)
    {
        this.root =root;
        this.$playground = $(`<div class="ac_game_playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        //this.hide();
        console.log(this.$playground.width());
        console.log(this.$playground.height());
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.start();

    }

    start()
    {

    }

    show()
    {
        this.$playground.show();
    }

    hide()
    {
        this.$playground.hide();
    }

}
