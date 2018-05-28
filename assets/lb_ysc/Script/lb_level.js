
var common = require('lb_common');
cc.Class({
    extends: cc.Component,

    properties: {
        select_level_bar:{//场景分类选择面板
            default: null,
            type: cc.Node,
        },
        level_bar:{//场景关卡
            default: null,
            type: cc.Node,
        },
        total_star:{//总星星
            default: null,
            type: cc.Node,
        },
        selectLevels:{
            default: null,
            type: cc.Node,
        },
        levels:{
            default: null,
            type: cc.Node,
        }
    },


    onLoad () {
        
    },
    start () {
        //加载资源
        this.loadRes();
    },
    loadRes(){
        cc.loader.loadRes('lb_ysc/prefab/lb_item',(err, prefab)=> {
            this.itemPrefab = prefab;
            cc.loader.loadRes('lb_ysc/prefab/lb_item2',(err, prefab)=> {
                this.item2Prefab = prefab;
                cc.loader.loadRes('lb_ysc/prefab/lb_list',(err, prefab)=> {
                    this.listPrefab = prefab;
                    this.loadSceneDate();
                });
            });
        });
        
        
    },


    //读取场景数据
    loadSceneDate(){
        if(common.sm.isGameTb){
            this.selectLevels.active = false;
            this.levels.active = true;
        }
        this.level_page = [];
        this.levelPack();
        
    },

    //levels打包
    levelPack(){
        this.pageCount = Math.ceil(common.levels.length/12);//计算有多少item
        var bar_width = Math.ceil(this.pageCount/2) * cc.winSize.width;//计算bar长度
        this.select_level_bar.width = bar_width;
        cc.loader.loadRes('lb_ysc/prefab/lb_list2',(err, prefab)=> {
            var list2 = cc.instantiate(prefab);
            list2.width = bar_width;
            this.select_level_bar.addChild(list2);

            this.load_item_count = 0;
            this.createLevelBarItem(list2);
            this.levelDate();
        });
    },

    //levelDate读取
    levelDate(){
        this.page_all = Math.ceil(common.levels.length/6);//计算有多少item
        //this.level_bar.width = this.page_all * cc.winSize.width;
        this.page_load_index = 0;
        this.load_count = 0;//已经加载统计
        this.createLevelVessel();
    },


    //创建场景节点
    createItem(bar){ 
        this.load_count++;
        var item = cc.instantiate(this.itemPrefab);
        bar.addChild(item);
        item.on(cc.Node.EventType.TOUCH_START,function(){
            this.touch_star = 0;
            this.isTouch = true;
        },this);
        item.on(cc.Node.EventType.TOUCH_END,function(e){
            var index = e.target.getSiblingIndex() + 1;
            if(common.sm.ud.levels[index-1].active){
                common.sm.loadLevel(index);
            }
        },this);
        if(this.load_count == common.levels.length){//表示加载完毕
            this.loadUserData();
        }
    },
    update (dt) {
        if(this.isTouch){
            this.touch_star++;
        }
    },
    
    //创建levels打包
    createLevelBarItem(bar,itemdate){ 
        this.load_item_count++;

        if(this.load_item_count == this.pageCount){
            var start = ((this.load_item_count-1)*12)+1;
            var end = common.levels.length;
        }else{
            var end = (this.load_item_count*12);
            var start = end-12+1;
        }
        var star_count = (end - start + 1)*3;
        var item = cc.instantiate(this.item2Prefab);
        var star = item.getChildByName('star').getChildByName('star_count').getComponent(cc.Label);
        var Skinpop_BG = item.getChildByName('Skinpop_BG');
        var img = Skinpop_BG.getChildByName('level_img');//图片
        var mask = img.getChildByName('mask');//遮罩
        var id = img.getChildByName('id').getComponent(cc.Label);
        star.string = 0 + '/' + star_count;
        id.string = start + '-' + end;
        bar.addChild(item);
        item.on(cc.Node.EventType.TOUCH_START,function(){
            this.touch_star = 0;
            this.isTouch = true;
        },this);
        item.on(cc.Node.EventType.TOUCH_END,this.goToLevels,this);
        if(this.pageCount == this.load_item_count){
            return;
        }else{
            this.createLevelBarItem(bar);
        }
    },

    //创建level容器
    createLevelVessel(){
        var list = cc.instantiate(this.listPrefab);
        //list.width = cc.winSize.width;
        // list.x = this.page_load_index*cc.winSize.width;
        this.level_page.push(list);
        this.level_bar.addChild(list);

        this.page_load_index ++;
        if(this.page_all == this.page_load_index){
            var count = common.levels.length - this.load_count;
        }else{
            var count = 6;
        }
        for(var i=0; i<count; i++){
            this.createItem(list);
        }
        if(this.page_all == this.page_load_index){
            return;
        }else{
        
            this.createLevelVessel();
            
        }
    },
    //读取用户数据
    loadUserData(){
        var data = common.sm.ud;
        this.allLevelCombine();
        if(data){
            this.total_star.getComponent(cc.Label).string = this.getStarCount();
            if(this.alllevels){
                data.levels.forEach((element,index)=>{
                    this.loadItem(this.alllevels[index],element);
                });
                //遍历集合
                var bar = this.select_level_bar.children[0].children;
                if(bar){
                    bar.forEach((e,index)=>{
                        var i = index+1;
                        if(i == bar.length){
                            var start = ((i-1)*12);
                            var end = common.levels.length;
                        }else{
                            var end = (i*12);
                            var start = end-12;
                        }
                        var cur = data.levels.slice(start,end);
                        var Skinpop_BG = e.getChildByName('Skinpop_BG');
                        var img = Skinpop_BG.getChildByName('level_img');//图片
                        var mask = img.getChildByName('mask');//遮罩
                        var pass = img.getChildByName('pass');//通过
                        var star = e.getChildByName('star').getChildByName('star_count').getComponent(cc.Label);//星星数量
                        var star_count = 0;
                        var all_star_count = 0;
                        var isPass = false;
                        var isMsak = false;
                        var count = 0;
                        cur.forEach((k,j)=>{
                            star_count += k.star;
                            if(k.active){
                                isMsak = true;
                            }
                            if(k.pass){
                                count++;
                            }
                            if(count == cur.length){
                                isPass = true;
                            }
                            all_star_count += 3;
                        });
                        star.string = star_count + '/' + all_star_count;
                        mask.active = !isMsak;
                        pass.active = isPass;
                    });
                }
            }
        }
        
    },
    //把所有LEVEL合并为一个数组
    allLevelCombine(){
        this.alllevels = [];
        var bars = this.level_bar.children;
        bars.forEach(element => {
            var list = element.children;
            list.forEach(element => {
                this.alllevels.push(element);
            });
        });
    },
    //为每个item读取数据
    loadItem(item,data){
        var Skinpop_BG = item.getChildByName('Skinpop_BG');
        var img = Skinpop_BG.getChildByName('level_img');//图片
        var mask = img.getChildByName('mask');//遮罩
        var pass = img.getChildByName('pass');//通过
        var id = img.getChildByName('id').getComponent(cc.Label);//id
        var star1 = item.getChildByName('star_bg1').getChildByName('star');//星星
        var star2 = item.getChildByName('star_bg2').getChildByName('star');//星星
        var star3 = item.getChildByName('star_bg3').getChildByName('star');//星星
        mask.active = !data.active;
        pass.active = data.pass;
        id.string = data.id<10?('0'+data.id):data.id;
        if(data.star >= 1){
            star1.active = true;
        }
        if(data.star >= 2){
            star2.active = true;
        }
        if(data.star >= 3){
            star3.active = true;
        }
    },
    //计算获得的总星星数
    getStarCount(){
        var star = 0;
        common.sm.ud.levels.forEach(e=>{
            star += e.star;
        });
        return star;
    },
    //调到当前集合下
    goToLevels(e){
        console.log(e);
        this.isTouch = false;
        if(this.touch_star < 30){
            this.selectLevels.active = false;
            this.levels.active = true;
            var index = e.target.getSiblingIndex() + 1;
            var page = (index*12-12)/6;
            //调到当前页
           // this.level_bar.x = page*cc.winSize.width;
            
        }
    },
    //返回关卡分组
    back(e){
        common.sm.isGameTb = false;
        cc.director.loadScene('lb_select');      
    }
});