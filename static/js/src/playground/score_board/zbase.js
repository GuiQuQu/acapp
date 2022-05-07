class ScoreBoard extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null; //win or lose
        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png"
        this.lose_img= new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    }
    start(){
    }
    add_listening_events(){
        let outer = this;
        //console.log(this.playground.game_map);
        let $canvas = this.playground.game_map.$canvas;
        $canvas.on("click",function(){
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win(){
        if (this.state === "win")
            return  false;
        let outer = this;
        this.state = "win";
        setTimeout(function(){
            // console.log("enter win add listening events");
            outer.add_listening_events();
        },1000);
    }
    lose(){
        let outer = this;
        this.state = "lose";
        setTimeout(function(){
            outer.add_listening_events();
        },1000);
    }
    late_update(){
        this.render();
    }
    render(){
        let len = this.playground.height / 2;
        if (this.state === "win"){
            //左上角坐标(x1,y1,长,宽)
            //this.ctx.drawImage(this.win_img,this.playground.width / 2 - len / 2,this.playground.height - len / 2,len,len);
            this.ctx.drawImage(this.win_img,this.playground.width/2-len/2,this.playground.height/2-len/2,len,len);
        }   
        else if (this.state === "lose"){
            this.ctx.drawImage(this.lose_img,this.playground.width/2-len/2,this.playground.height/2-len/2,len,len);
        }
    }
}