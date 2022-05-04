class ChatField
{

    constructor(playground)
    {
        this.playground = playground;

        this.$history = $(`<div class ="ac_game_chat_field_history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac_game_chat_field_input">`);

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.func_id = null;
        this.start();
    }

    start ()
    {
        this.add_listening_events();
    }

    update ()
    {

    }
    
    add_listening_events()
    {
        let outer = this;
        this.$input.keydown(function(e){
            if (e.which === 27)
            {
                outer.hide_input();
                return false;
            }
            else if (e.which === 13)
            {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text)
                {
                    outer.$input.val("");
                    outer.add_message(username,text);
                    outer.playground.mps.send_message(username,text);
                }
                return false; // 表示回车按键不向上传递
            }
        });
    }

    add_message(username,text)
    {
        this.show_history();
        let message = `[${username}]:${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
        
        //console.log(this.$history.length);
        //this.$history[this.$history.length-1].scrollIntoView(false);
    }

    render_message(message){
        return `<div>${message}<div>`
    }

    show_history()
    {
        //console.log("show history")
        //需要实现的逻辑是
        //每次打开input,显示history,esc input,history不消失,等待3秒消失
        //但是当打开新的input的时候history需要刷新倒计时
        this.$history.fadeIn();
        let outer = this;
        //如果当前有正在进行的倒计时,清空这个函数id,然后绑定新的倒计时
        if (this.func_id)
            clearTimeout(this.func_id);
        //设置新的函数id
        this.func_id = setTimeout(function(){
            //执行完操作之后清空函数id
            outer.$history.fadeOut();
            outer.func_id = null;
        },3000);
    }
    show_input()
    {
        this.$input.show();
        this.show_history();
        this.$input.focus();
    }

    hide_input()
    {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
