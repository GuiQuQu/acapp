let AC_GAME_OBJECT = []; //全局数组保存游戏内的每一个对象，他们都需要在每一帧刷新

class AcGameObject
{
    constructor()
    {
        AC_GAME_OBJECT.push(this);
        this.has_called_start =false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔,单位毫秒
        //因为可能不同浏览器的刷新频率不同，每次刷新都执行update的话，
        //不同浏览器实际的刷新频率就不一样，因此需要使用时间来衡量
        this.uuid = this.create_uuid();
    }
    //uuid 来表示这个物品的唯一的id,这样在多人联机对战的时候就可以通过uuid确认这个谁发的消息,
    //这里保证uuid唯一的逻辑是随机8位数,重复的概率很低
    create_uuid(){
        let res ="";
        for (let i =0;i<8;i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }
    start()  //只会在第一帧执行
    {

    }
    late_update() //在每一帧的最后执行一次,相当于所有物品都已经update之后,在这之后执行
    {

    }
    update()  //每一帧都会执行一次
    {
        //console.log('update...')
    }

    on_destroy()  //删掉物体前执行,例如给对手加分等操作
    {

    }
    destroy()  //删掉该物体
    {
        this.on_destroy();
        for (let i=0;i<AC_GAME_OBJECT.length;i++)
        {//js里最好用3个等号，表示全等
            if (AC_GAME_OBJECT[i] === this){
                AC_GAME_OBJECT.splice(i,1); //从下标i开始，删除一个
                break;
            }
        }

    }
}

let last_timestamp = 0;
let AC_GAME_ANIMATION = function(timestamp){
    //timestamp 当前时间戳
    //console.log(AC_GAME_OBJECT.length);
    for (let i = 0;i < AC_GAME_OBJECT.length ; i ++)
    {
        let obj = AC_GAME_OBJECT[i];
        if (!obj.has_called_start){
            obj.start();
            obj.has_called_start= true;
        }
        else
        {
            obj.timedelta = timestamp -last_timestamp;
            obj.update();
        }
    }
    for (let i = 0;i<AC_GAME_OBJECT.length;i++){
        AC_GAME_OBJECT[i].late_update();
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION); //通过递归保证循环执行
}

requestAnimationFrame(AC_GAME_ANIMATION); //js提供的一个函数，传入一个函数进去，它会在下一帧执行

