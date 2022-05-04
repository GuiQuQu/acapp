class AcGamePlayGround
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="ac_game_playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        this.hide();
        this.start();
    }

    get_random_color()
    {
        let colors = ["blue","red","orange","pink","green","yellow"];
        return colors[Math.floor(Math.random()* colors.length)];
    }

    start()
    {
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize()
    {
        //把窗口大小放缩到当前窗口大小,并且保证长宽比为16：9
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
        // 在拖动窗口的时候,界面上的元素都需要随着窗口大小变化而变化，因此需要一个基准,选择height作为单位1,然后游戏内的元素都是用相对距离
    }

    show(mode)
    {
        let outer = this;
        this.$playground.show();
        this.mode = mode;
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.noticeboard = new NoticeBoard(this);
        this.player_count = 0;
        this.state = "waiting"  // waiting -> fighting -> over
        // 绝对 to 相对
        this.players.push(new Player(
            this,
            this.width/2 / this.scale ,
            this.height/ 2 / this.scale ,
            this.height / this.scale * 0.05 ,
            "white",
            this.height / this.scale * 0.2,
            "me",
            this.root.settings.username,
            this.root.settings.photo,
        ));
        //添加其他玩家
        if (mode === "single-mode")
        {
            for (let i=0;i<5;i++)
            {
                this.players.push(new Player(
                    this,
                    this.width / 2 / this.scale,
                    this.height / 2 / this.scale, 
                    this.height / this.scale * 0.05,
                    this.get_random_color(),
                    this.height / this.scale * 0.2,
                    "robot"
                ));
            }
        }
        else if (mode === "multi-mode")
        {
            this.chat_field = new ChatField(this);
            //声明了该类(MultiPlayerSocket)之后,会为我们创建WebSocket连接
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            // socket链接创建成功之后的回调函数
            this.mps.ws.onopen = function ()
            {
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
            };
        }
    }

    hide()
    {
        this.$playground.hide();
    }

}
