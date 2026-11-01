/* =====================================================================
 * 诗词地图 · 诗人生平游历路线（据通行生平资料简绘）
 * ---------------------------------------------------------------------
 * 每位诗人一条路线，stops 按时间顺序：
 *   { e: 地名库条目id } 或 { lat, lng, name: 地名 }（无库条目时直接给坐标）
 *   year: 年份（"约""前后"等用文字标注）  label: 事件一句
 * 大诗人的路线较细，次要诗人 2~4 站勾勒行迹；存疑处在 label 中注明。
 * ===================================================================== */
(function (root, factory) {
  var d = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = d;
  root.SHICI_ROUTES = d;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return [
    { id: 'wangbo', name: '王勃', dynasty: '唐', desc: '初唐四杰之首，六岁能文，未冠而仕，惜天不假年。', stops: [
      { lat: 35.59, lng: 110.71, name: '绛州龙门（河津）', year: '650', label: '生于绛州龙门，隋大儒王通之孙' },
      { e: 'changan', year: '666', label: '对策高第，授朝散郎，沛王府修撰' },
      { e: 'chengdu', year: '669', label: '因《檄英王鸡》被逐，入蜀漫游，蜀州送别之作多系于此前后' },
      { e: 'tengwangge', year: '675', label: '省父交趾途中过洪州，即席作《滕王阁序》并诗，满座惊服' },
      { lat: 21.03, lng: 105.85, name: '交趾（越南北宁）', year: '676', label: '赴交趾省父，渡海溺惊而卒，年二十七' } ] },
    { id: 'luobinwang', name: '骆宾王', dynasty: '唐', desc: '初唐四杰之一，七岁咏鹅，兵败后不知所终。', stops: [
      { e: 'yiwu', year: '约619', label: '婺州义乌人，七岁作《咏鹅》' },
      { e: 'changan', year: '约660', label: '入京为道王府属，后从军西域、宦游蜀中' },
      { e: 'guangling', year: '684', label: '随徐敬业扬州起兵讨武曌，作《讨武曌檄》，兵败遁去，不知所终' } ] },
    { id: 'hezhizhang', name: '贺知章', dynasty: '唐', desc: '自号四明狂客，八十六岁告老还乡，玄宗率百官送行。', stops: [
      { e: 'yongxing', year: '659', label: '越州永兴（今萧山）人' },
      { e: 'changan', year: '695', label: '进士及第，官至秘书监，呼李白"谪仙人"' },
      { e: 'shanyin', year: '744', label: '请为道士还乡，御赐镜湖剡川一曲，同年卒' } ] },
    { id: 'chenziang', name: '陈子昂', dynasty: '唐', desc: '唐音开创者，摔碎价值百万的胡琴以振诗名。', stops: [
      { e: 'shehong', year: '661', label: '梓州射洪人，富家子，任侠尚气' },
      { e: 'changan', year: '682', label: '两上京师应举，买琴碎琴，一日名满京华' },
      { e: 'youzhou', year: '696', label: '随武攸宜征契丹，进言不用，登蓟北楼歌《登幽州台》' },
      { e: 'shehong', year: '698', label: '辞官归乡侍父，后被县令段简构陷，瘐死狱中' } ] },
    { id: 'wangzhihuan', name: '王之涣', dynasty: '唐', desc: '盛唐边塞名家，存诗仅六首而首首传诵。', stops: [
      { lat: 35.62, lng: 111.22, name: '绛州新绛', year: '688', label: '祖籍晋阳，迁居绛州（今山西新绛）' },
      { e: 'youzhou', year: '约720', label: '早年游历河北，远望蓟门' },
      { e: 'guanque', year: '约722', label: '游蒲州，登鹳雀楼（一说蒲州说为后人附会，姑系于此）' },
      { e: 'liangzhou', year: '约726', label: '《凉州词》传唱天下；是否亲历河西，史无明文，存疑' } ] },
    { id: 'wanghan', name: '王翰', dynasty: '唐', desc: '并州豪侠，恃才不羁，《凉州词》为唐人绝唱。', stops: [
      { lat: 37.87, lng: 112.55, name: '并州晋阳（太原）', year: '687', label: '并州晋阳人，家资富赡，枥多名马' },
      { e: 'liangzhou', year: '约710', label: '《凉州词》咏边塞宴饮（亲历与否存疑）' },
      { e: 'changan', year: '约727', label: '被贬道州司马，赴任途中卒' } ] },
    { id: 'menghaoran', name: '孟浩然', dynasty: '唐', desc: '襄阳处士，布衣终老而名满天下。', stops: [
      { e: 'xiangyang', year: '689', label: '襄州襄阳人，涧南园旧居' },
      { e: 'changan', year: '728', label: '赴京应试不第，"微云淡河汉"惊四座，仍放还襄阳' },
      { e: 'jiandejiang', year: '730', label: '漫游吴越三年，舟宿建德江' },
      { e: 'xiangyang', year: '740', label: '王昌龄来访，食鲜疾发而卒，归葬凤林关' } ] },
    { id: 'wangwan', name: '王湾', dynasty: '唐', desc: '洛阳书生，"海日生残夜"一联开盛唐气象。', stops: [
      { e: 'luoyang', year: '693', label: '洛阳人，开元初进士' },
      { e: 'beigushan', year: '712', label: '往来吴楚间，泊北固山下，次韵题诗' },
      { e: 'luoyang', year: '725', label: '参与丽正书院编次四库书' } ] },
    { id: 'cuihao', name: '崔颢', dynasty: '唐', desc: '汴州才子，一首七律压倒诗仙。', stops: [
      { e: 'kaifeng', year: '约704', label: '汴州（开封）人' },
      { e: 'changan', year: '723', label: '进士及第，早年诗浮艳，后历边塞而风骨凛然' },
      { e: 'huanghelou', year: '约730', label: '游武昌登黄鹤楼题诗，李白搁笔（年代无确考）' } ] },
    { id: 'wangchangling', name: '王昌龄', dynasty: '唐', desc: '七绝圣手，一生两遭贬谪，死于乱世兵火。', stops: [
      { e: 'changan', year: '698', label: '京兆长安人（一说太原），早年曾游西北边塞' },
      { e: 'changan', year: '727', label: '与常建同榜进士，任秘书省校书郎' },
      { e: 'furongzj', year: '742', label: '任江宁丞，送辛渐北归，赋别于润州芙蓉楼' },
      { e: 'longbiao', year: '748', label: '贬龙标尉，李白闻之寄诗远慰' },
      { e: 'bozhou', year: '757', label: '离乱中还乡，道经亳州，为刺史闾丘晓所杀' } ] },
    { id: 'libai', name: '李白', dynasty: '唐', desc: '谪仙人，五岳寻仙不辞远，一生好入名山游。', stops: [
      { e: 'jiangyou', year: '701', label: '生于绵州昌隆（今江油青莲乡；一说生于西域碎叶城，见辨）' },
      { e: 'chengdu', year: '724', label: '二十四岁"仗剑去国，辞亲远游"，别蜀中' },
      { e: 'emeishan', year: '725', label: '秋出蜀，峨眉山月伴行' },
      { e: 'yuzhou', year: '725', label: '夜发清溪，下渝州' },
      { e: 'jingmenshan', year: '725', label: '渡荆门，山随平野尽' },
      { e: 'dongting', year: '726', label: '游洞庭，登庐山' },
      { e: 'jinling', year: '726', label: '东下金陵，揽六朝胜迹' },
      { e: 'guangling', year: '726', label: '烟花三月，与孟浩然再会扬州' },
      { e: 'anlu', year: '727', label: '娶故相许圉师孙女，酒隐安陆十年' },
      { e: 'xuanzhou', year: '753', label: '漫游宣城，登谢朓北楼' },
      { e: 'qiupu', year: '754', label: '作《秋浦歌》十七首' },
      { e: 'taohuatan', year: '754', label: '汪伦踏歌相送，桃花潭留名' },
      { e: 'baidicheng', year: '759', label: '流放夜郎至白帝城遇赦，"轻舟已过万重山"' },
      { e: 'dangtu', year: '762', label: '依当涂县令李阳冰，病逝，葬当涂青山' } ] },
    { id: 'wangwei', name: '王维', dynasty: '唐', desc: '诗佛，亦官亦隐，晚年长斋绣佛，退朝之后焚香独坐。', stops: [
      { e: 'pushi', year: '701', label: '祖籍祁县，生于蒲州（今永济），"九月九日忆山东兄弟"之"山东"即指此' },
      { e: 'changan', year: '721', label: '状元及第，任太乐丞' },
      { e: 'liangzhou', year: '737', label: '以监察御史出塞宣慰河西，"大漠孤烟直"成千古绝唱' },
      { e: 'wangchuan', year: '741', label: '购辋川别业，与裴迪浮舟往来，弹琴赋诗啸咏终日；761年卒，葬辋川' } ] },
    { id: 'dufu', name: '杜甫', dynasty: '唐', desc: '诗圣，一饭未尝忘君，颠沛而诗史自铸。', stops: [
      { e: 'gongxian', year: '712', label: '生于河南巩县瑶湾' },
      { e: 'changan', year: '746', label: '困守长安十年，"朝扣富儿门，暮随肥马尘"' },
      { e: 'qinzhou', year: '759', label: '弃官携家西行，流寓秦州' },
      { e: 'chengdu', year: '760', label: '卜居浣花溪畔草堂，五年得稍安' },
      { e: 'kuizhou', year: '766', label: '寓夔州近两年，作《秋兴》八首、《登高》' },
      { e: 'jingzhou_jl', year: '768', label: '出峡，留江陵' },
      { e: 'yueyanglou', year: '768', label: '暮年登岳阳楼，凭轩涕流' },
      { e: 'tanzhou', year: '769', label: '漂泊潭州，逢李龟年' },
      { e: 'dongting', year: '770', label: '贫病交加，卒于湘江舟中，年五十九' } ] },
    { id: 'canshen', name: '岑参', dynasty: '唐', desc: '两度出塞的边塞诗人，笔下自有雪山瀚海。', stops: [
      { lat: 32.99, lng: 112.53, name: '南阳', year: '715', label: '南阳人，后迁居江陵' },
      { e: 'changan', year: '744', label: '进士及第' },
      { e: 'anxi', year: '749', label: '首次出塞，入安西高仙芝幕' },
      { e: 'luntai_tang', year: '754', label: '再入北庭封常清幕，轮台咏雪送武判官' },
      { e: 'jiazhou', year: '768', label: '出为嘉州刺史，世称"岑嘉州"' },
      { e: 'chengdu', year: '770', label: '罢官东归，客死成都旅舍' } ] },
    { id: 'zhangzhihe', name: '张志和', dynasty: '唐', desc: '烟波钓徒，弃官浮家泛宅，愿为一舟一蓑终老江湖。', stops: [
      { lat: 29.10, lng: 119.65, name: '婺州金华', year: '约732', label: '婺州金华人，十六岁明经及第' },
      { e: 'huzhou', year: '约772', label: '坐事贬官后不复仕，扁舟垂纶，西塞山前作《渔歌子》五首' } ] },
    { id: 'weiyingwu', name: '韦应物', dynasty: '唐', desc: '由玄宗侍卫而为山水名家，人称韦苏州。', stops: [
      { e: 'changan', year: '737', label: '京兆杜陵人，十五岁为玄宗三卫郎侍卫' },
      { e: 'chuzhou', year: '783', label: '出为滁州刺史，闲咏西涧' },
      { e: 'gusu', year: '786', label: '出为苏州刺史，约卒于任上，诗称"韦苏州体"' } ] },
    { id: 'hanyu', name: '韩愈', dynasty: '唐', desc: '文起八代之衰，道济天下之溺。', stops: [
      { e: 'mengzhou', year: '768', label: '河阳（今孟州）人，三岁而孤，由兄嫂抚养' },
      { e: 'changan', year: '792', label: '登进士第，倡古文运动，文雄百代' },
      { e: 'chaozhou', year: '819', label: '谏迎佛骨，贬潮州刺史，驱鳄兴学，山水尽姓韩' } ] },
    { id: 'liuzongyuan', name: '柳宗元', dynasty: '唐', desc: '永贞革新志士，永州十年文章柳州四年德政。', stops: [
      { e: 'changan', year: '773', label: '生于长安，祖籍河东（今永济）' },
      { e: 'yongzhou', year: '805', label: '贬永州司马，作《永州八记》《江雪》' },
      { e: 'liuzhou', year: '815', label: '改贬柳州刺史，释奴凿井种柳，政声卓著' },
      { e: 'liuzhou', year: '819', label: '病逝柳州任上，年四十七' } ] },
    { id: 'cuihu', name: '崔护', dynasty: '唐', desc: '官至节度使而以一诗传世。', stops: [
      { lat: 38.23, lng: 115.52, name: '博陵安平', year: '约779', label: '博陵（今河北安平）人' },
      { e: 'changan', year: '约796', label: '下第清明游长安城南，桃花人面；后举进士，官至岭南节度使' } ] },
    { id: 'lihe', name: '李贺', dynasty: '唐', desc: '诗鬼，呕心沥血，二十七岁而天。', stops: [
      { lat: 34.52, lng: 111.79, name: '河南府昌谷（宜阳）', year: '791', label: '河南府福昌县昌谷人，唐宗室郑王之后' },
      { e: 'changan', year: '807', label: '携诗谒韩愈，后任奉礼郎，三年冷官而去' },
      { lat: 34.52, lng: 111.79, name: '河南府昌谷（宜阳）', year: '811', label: '辞官归昌谷，呕心作诗，817年病卒，年二十七' } ] },
    { id: 'wty', name: '温庭筠', dynasty: '唐', desc: '花间鼻祖，才思敏捷而数举不第。', stops: [
      { lat: 37.36, lng: 112.33, name: '太原祁县', year: '约812', label: '太原祁人，寄家江东' },
      { e: 'changan', year: '约840', label: '屡试不第，出入京洛，恃才傲物' },
      { e: 'shangshan', year: '约845', label: '东下客居，晓度商山，"鸡声茅店月"传千年行旅' } ] },
    { id: 'liyi', name: '李益', dynasty: '唐', desc: '从军十八年的边塞诗人，每作一篇教坊乐人以赂求取。', stops: [
      { e: 'liangzhou', year: '748', label: '凉州姑臧（武威）人，生于边陲' },
      { e: 'changan', year: '769', label: '登进士第，郁郁不得志' },
      { e: 'shouxiang', year: '781', label: '北游河朔从军，夜上受降城闻笛' } ] },
    { id: 'dumu', name: '杜牧', dynasty: '唐', desc: '宰相之孙，风流俊赏，注《孙子》而知兵。', stops: [
      { e: 'changan', year: '803', label: '京兆杜氏，宰相杜佑之孙' },
      { e: 'guangling', year: '833', label: '入牛僧孺淮南幕为掌书记，十年一觉扬州梦' },
      { e: 'huangzhou', year: '844', label: '出刺黄州，江边拾折戟咏赤壁' },
      { e: 'chizhou', year: '846', label: '转刺池州，修明政事（清明诗归属存辨）' },
      { e: 'huzhou', year: '850', label: '出刺湖州' },
      { e: 'changan', year: '851', label: '还朝任中书舍人，次年病卒' } ] },
    { id: 'lishangyin', name: '李商隐', dynasty: '唐', desc: '情圣诗人，一生牛李党争夹缝中沉沦。', stops: [
      { e: 'kaifengx', year: '约813', label: '自称祖籍荥阳，生于获嘉官舍' },
      { e: 'changan', year: '837', label: '登进士第，娶王茂元女，陷牛李党争' },
      { e: 'guilin', year: '847', label: '随郑亚赴桂管幕' },
      { e: 'santai', year: '851', label: '入东川节度使柳仲郢梓州幕' },
      { e: 'bishan', year: '852', label: '往来巴蜀，夜雨寄北' },
      { e: 'zhoukou_zz', year: '858', label: '罢幕还郑州，抑郁而卒，年约四十六' } ] },
    { id: 'liuyuxi', name: '刘禹锡', dynasty: '唐', desc: '诗豪，二十三年弃置身而愈挫愈奋。', stops: [
      { e: 'luoyang', year: '772', label: '洛阳人（嘉兴说并存），系出中山刘氏' },
      { e: 'changan', year: '793', label: '与柳宗元同榜进士' },
      { e: 'langzhou', year: '805', label: '永贞革新败，贬朗州司马十年' },
      { e: 'hezhou', year: '824', label: '徙和州刺史，"玄都观里桃千树"再遭外放' },
      { e: 'gusu', year: '826', label: '转苏州刺史，与白居易定交' },
      { e: 'luoyang', year: '836', label: '以太子宾客分司东都，与白居易唱和终老' } ] },
    { id: 'baijuyi', name: '白居易', dynasty: '唐', desc: '诗魔，篇篇求老妪能解，兼济与独善各半生。', stops: [
      { lat: 34.40, lng: 113.74, name: '新郑', year: '772', label: '生于郑州新郑东郭宅' },
      { e: 'changan', year: '800', label: '进士及第，"慈恩塔下题名处，十七人中最少年"' },
      { e: 'xunyang', year: '815', label: '贬江州司马，浔阳江头闻琵琶' },
      { e: 'lushan', year: '817', label: '游庐山草堂，四月登大林寺见桃花' },
      { e: 'linan', year: '822', label: '出刺杭州，浚湖筑堤，离任时把西湖带走一半诗意' },
      { e: 'gusu', year: '825', label: '出刺苏州，开山塘河七里' },
      { e: 'luoyang', year: '829', label: '定居洛阳履道里，晚年号香山居士，846年卒，葬龙门' } ] },
    { id: 'weizhuang', name: '韦庄', dynasty: '五代', desc: '乱离诗人入蜀为相，花间派领袖。', stops: [
      { e: 'duling', year: '836', label: '京兆杜陵人，韦应物四世孙' },
      { e: 'changan', year: '894', label: '五十九岁进士及第，前半生颠沛黄巢乱中' },
      { e: 'chengdu', year: '903', label: '入蜀辅王建称帝，官至宰相，卒于成都' } ] },
    { id: 'liyu', name: '李煜', dynasty: '五代', desc: '南唐后主，亡国之君而词中之帝。', stops: [
      { e: 'jinling', year: '937', label: '生于金陵，南唐中主李璟第六子' },
      { e: 'jinling', year: '961', label: '继位，诗词书画无一不精' },
      { e: 'kaifeng', year: '975', label: '汴京城破被俘，封违命侯' },
      { e: 'kaifeng', year: '978', label: '七夕作《虞美人》被赐死，"千古词帝"魂断汴梁' } ] },
    { id: 'liuyong', name: '柳永', dynasty: '宋', desc: '奉旨填词的白衣卿相，凡有井水处皆能歌柳词。', stops: [
      { e: 'chongan', year: '约984', label: '福建崇安（今武夷山）人' },
      { e: 'linan', year: '约1005', label: '浪游杭州，作《望海潮》谒孙何，相传金主因之兴南牧之志' },
      { e: 'kaifeng', year: '约1010', label: '屡试不第，自称"奉旨填词柳三变"，流连坊曲' },
      { e: 'tongjiang', year: '约1034', label: '及第后赴睦州任所，舟过桐江严陵滩，作满江红' },
      { e: 'jingkou', year: '1053', label: '晚年进士及第，官至屯田员外郎，卒于润州（镇江）' } ] },
    { id: 'fanzhongyan', name: '范仲淹', dynasty: '宋', desc: '先天下之忧而忧的军政文全才。', stops: [
      { e: 'gusu', year: '989', label: '苏州吴县人，两岁而孤，随母改适朱氏' },
      { e: 'yanzhou_yz', year: '1040', label: '知延州御西夏，"军中有一范，西贼闻之惊破胆"' },
      { e: 'xuzhou', year: '1052', label: '赴颍州途中卒于徐州，谥文正' } ] },
    { id: 'ouyangxiu', name: '欧阳修', dynasty: '宋', desc: '一代文宗，奖掖后进，颍州西湖终老。', stops: [
      { lat: 27.22, lng: 115.65, name: '吉州永丰', year: '1007', label: '吉州永丰人，四岁丧父，画荻教子' },
      { e: 'kaifeng', year: '1030', label: '进士及第，倡诗文革新，主盟文坛三十年' },
      { e: 'yingzhou_yf', year: '1049', label: '知颍州，乐西湖之胜，作《采桑子》十三首' },
      { e: 'yingzhou_yf', year: '1072', label: '致仕归颍州，终老于此' } ] },
    { id: 'wanganshi', name: '王安石', dynasty: '宋', desc: '拗相公，天变不足畏，祖宗不足法，人言不足恤。', stops: [
      { e: 'linchuan', year: '1021', label: '抚州临川人' },
      { lat: 29.87, lng: 121.55, name: '鄞县（宁波）', year: '1047', label: '知鄞县，试行青苗水利' },
      { e: 'kaifeng', year: '1069', label: '拜参知政事，主持熙宁变法' },
      { e: 'jinling', year: '1076', label: '罢相退居江宁半山园，十年后病逝，谥文' } ] },
    { id: 'sushi', name: '苏轼', dynasty: '宋', desc: '坡仙，一蓑烟雨任平生，问汝平生功业，黄州惠州儋州。', stops: [
      { e: 'meishan', year: '1037', label: '生于眉山纱縠行' },
      { e: 'kaifeng', year: '1057', label: '进士及第，名动京师' },
      { e: 'linan', year: '1071', label: '通判杭州，两年遍咏湖山' },
      { e: 'mizhou', year: '1074', label: '知密州，修超然台，中秋怀弟' },
      { e: 'xuzhou', year: '1077', label: '知徐州，抗洪保城' },
      { e: 'huzhou', year: '1079', label: '知湖州，谢表获罪，乌台诗案系狱' },
      { e: 'huangzhou', year: '1080', label: '贬黄州团练副使，躬耕东坡，两赋一词' },
      { e: 'linan', year: '1089', label: '再知杭州，浚西湖筑苏堤' },
      { e: 'huizhou', year: '1094', label: '再贬惠州，"不辞长作岭南人"' },
      { e: 'danzhou', year: '1097', label: '远谪儋州，教化海南' },
      { e: 'changzhou', year: '1101', label: '遇赦北归，卒于常州，年六十六' } ] },
    { id: 'liqingzhao', name: '李清照', dynasty: '宋', desc: '千古第一才女，婉约词宗，晚景凄凉而金石气节不改。', stops: [
      { e: 'jinan', year: '1084', label: '生于济南章丘明水' },
      { e: 'kaifeng', year: '1101', label: '嫁太学生赵明诚，赌书泼茶' },
      { e: 'qingzhou', year: '1107', label: '屏居青州乡里十年，金石书画自娱' },
      { e: 'linan', year: '1132', label: '南渡流寓临安，金石书画散亡殆尽' },
      { lat: 29.10, lng: 119.65, name: '金华', year: '1135', label: '避乱金华，双溪舴艋舟载不动许多愁' },
      { e: 'linan', year: '约1155', label: '卒于临安，年七十余' } ] },
    { id: 'yuefei', name: '岳飞', dynasty: '宋', desc: '精忠报国，还我河山，风波亭上千古恨。', stops: [
      { e: 'tangyin', year: '1103', label: '相州汤阴人，佃户出身' },
      { e: 'ezhou', year: '1134', label: '屯军鄂州，收复襄汉六郡，十年之功在此' },
      { e: 'linan', year: '1142', label: '十二道金牌召回，以"莫须有"遇害于大理寺风波亭' } ] },
    { id: 'luyou', name: '陆游', dynasty: '宋', desc: '放翁，六十年间万首诗，铁马冰河入梦来。', stops: [
      { e: 'shanyin', year: '1125', label: '越州山阴人，生于淮上官舟' },
      { e: 'linan', year: '1154', label: '锁厅试第一，却因名列秦桧孙前遭黜' },
      { e: 'dazhanguan', year: '1172', label: '从军南郑，铁马秋风大散关，平生最忆' },
      { e: 'chengdu', year: '1173', label: '宦游蜀中八年，自号放翁' },
      { e: 'shanyin', year: '1190', label: '退居山阴三山别业二十年，18100余首诗存世，1210年卒，绝笔《示儿》' } ] },
    { id: 'xinqiji', name: '辛弃疾', dynasty: '宋', desc: '词中之龙，五十骑入五万军中生擒叛将。', stops: [
      { e: 'jinan', year: '1140', label: '生于济南历城，时北方已陷金' },
      { e: 'linan', year: '1162', label: '率义军南归奉表，始仕宋廷' },
      { e: 'jinling', year: '1172', label: '通判建康，登赏心亭' },
      { e: 'huangshaling', year: '1182', label: '罢官闲居带湖十年，夜行黄沙道' },
      { e: 'jingkou', year: '1204', label: '知镇江府，登北固亭作《永遇乐》，次年抱憾卒于铅山' } ] },
    { id: 'jiangkui', name: '姜夔', dynasty: '宋', desc: '白石道人，终身布衣，自度曲十七首冠绝南宋。', stops: [
      { e: 'poyang', year: '约1155', label: '饶州鄱阳人' },
      { e: 'guangling', year: '1176', label: '自汉东过扬州，感黍离之悲，自度《扬州慢》' },
      { e: 'linan', year: '约1190', label: '移居杭州，依张鉴十年，卒葬钱塘' } ] },
    { id: 'wentianxiang', name: '文天祥', dynasty: '宋', desc: '状元宰相，人生自古谁无死，留取丹心照汗青。', stops: [
      { e: 'luling', year: '1236', label: '吉州庐陵人' },
      { e: 'linan', year: '1256', label: '二十岁状元及第' },
      { e: 'jingkou', year: '1276', label: '出使元营被拘，自镇江脱险泛海南归' },
      { e: 'haifeng', year: '1278', label: '五坡岭兵败被执，吞脑子（冰片）不死' },
      { e: 'lingdingyang', year: '1279', label: '被押过零丁洋，作诗拒降张世杰' },
      { e: 'youzhou', year: '1283', label: '囚大都三年不屈，柴市从容就义，衣带诏"孔曰成仁，孟曰取义"' } ] },
    { id: 'nalan', name: '纳兰性德', dynasty: '清', desc: '清词第一人，相门翩翩佳公子，三十岁而夭。', stops: [
      { e: 'jingshi', year: '1655', label: '生于京师大学士明珠府' },
      { e: 'shanhaiguan', year: '1682', label: '扈从东巡出榆关，千帐灯下作《长相思》' },
      { e: 'jingshi', year: '1685', label: '病逝于京师，葬皂甲屯' } ] },
    /* ================= 扩编路线 ================= */
    { id: 'zhangruoxu', name: '张若虚', dynasty: '唐', desc: '吴中四士之一，孤篇横绝，竟为大家。', stops: [
      { e: 'guangling', year: '约660', label: '扬州人，兖州兵曹，春江月夜之咏千载无和者' } ] },
    { id: 'zuyong', name: '祖咏', dynasty: '唐', desc: '洛阳才子，试帖诗只写四句的傲骨书生。', stops: [
      { e: 'luoyang', year: '699', label: '洛阳人，少有诗名，与王维友善' },
      { e: 'changan', year: '712', label: '应试作《终南望余雪》，意尽而止，主司不取' },
      { lat: 33.87, lng: 112.90, name: '汝水', year: '约730', label: '遭谪后渔樵汝水之滨，隐居以终' } ] },
    { id: 'liuchangqing', name: '刘长卿', dynasty: '唐', desc: '自称"五言长城"，两遭贬谪的刚直诗人。', stops: [
      { lat: 38.44, lng: 116.10, name: '河间', year: '约726', label: '河间（今属河北）人，居长安应举十年不第' },
      { e: 'changan', year: '733', label: '登进士第，性刚多忤权门' },
      { lat: 21.53, lng: 111.02, name: '南巴（电白）', year: '760', label: '被诬贬南巴尉，岭海飘零' },
      { lat: 31.69, lng: 113.38, name: '随州', year: '780', label: '官终随州刺史，世称"刘随州"' } ] },
    { id: 'xuhun', name: '许浑', dynasty: '唐', desc: '丁卯句法名重一时，"山雨欲来风满楼"。', stops: [
      { lat: 31.99, lng: 119.58, name: '润州丹阳', year: '约791', label: '润州丹阳（今属镇江）人，居丁卯桥村舍' },
      { e: 'changan', year: '828', label: '登进士第，宦游关中，登咸阳城楼' },
      { lat: 31.99, lng: 119.58, name: '润州丹阳', year: '约850', label: '抱病退归丁卯桥，辑诗《丁卯集》' } ] },
    { id: 'zhanghu', name: '张祜', dynasty: '唐', desc: '终身布衣的狂士，"故国三千里"传唱宫中。', stops: [
      { lat: 37.06, lng: 115.67, name: '清河', year: '约785', label: '清河张氏，狂侠狷介，浪迹而诗名动公卿' },
      { e: 'gusu', year: '约820', label: '浪迹江南，寓居姑苏' },
      { e: 'jingkou', year: '约832', label: '夜泊润州金陵渡，题诗小山楼' } ] },
    { id: 'qinguan', name: '秦观', dynasty: '宋', desc: '婉约派一代词宗，古之伤心人。', stops: [
      { lat: 32.78, lng: 119.45, name: '高邮', year: '1049', label: '扬州高邮人' },
      { e: 'kaifeng', year: '1085', label: '登进士第，为"苏门四学士"之首' },
      { lat: 28.45, lng: 119.92, name: '处州（丽水）', year: '1094', label: '坐党籍贬处州酒税' },
      { e: 'chenzhou', year: '1096', label: '削秩徙郴州，编管之身，作踏莎行' },
      { lat: 20.91, lng: 110.09, name: '雷州', year: '1099', label: '移编管横州、雷州，愈贬愈南' },
      { lat: 23.37, lng: 110.90, name: '藤州', year: '1100', label: '北归至藤州，索水欲饮，水至笑视之而卒' } ] },
    { id: 'hechu', name: '贺铸', dynasty: '宋', desc: '侠气与柔情并存的"贺梅子"，词学兼善苏轼晏欧。', stops: [
      { lat: 35.40, lng: 114.06, name: '卫州（卫辉）', year: '1052', label: '生于卫州，自言唐谏议大夫贺知章后裔' },
      { e: 'hengtang', year: '约1108', label: '退居吴下，卜筑苏州横塘，一川烟草满城风絮' },
      { e: 'changzhou', year: '1125', label: '卒于常州僧舍，自号庆湖遗老' } ] },
    { id: 'zhoubangyan', name: '周邦彦', dynasty: '宋', desc: '大晟词人领袖，词家之冠，格律派开山。', stops: [
      { e: 'linan', year: '1056', label: '杭州钱塘人' },
      { e: 'kaifeng', year: '1087', label: '入京为太学生，献《汴都赋》万言，神宗擢为太学正' },
      { lat: 31.65, lng: 119.34, name: '溧水', year: '1095', label: '知溧水县，"有意乎当时之吏治"' },
      { lat: 34.41, lng: 115.65, name: '南京（商丘）', year: '1121', label: '提举南京鸿庆宫，卒于商丘，年六十六' } ] },
    { id: 'zhangxiaoxiang', name: '张孝祥', dynasty: '宋', desc: '状元词人，上承东坡下启稼轩的豪放派桥梁。', stops: [
      { e: 'hezhou', year: '1132', label: '历阳乌江（今和县）人' },
      { e: 'linan', year: '1154', label: '二十三岁状元及第，压秦桧孙秦埚一头' },
      { e: 'guilin', year: '1161', label: '知静江府（桂林），广南西路经略安抚使' },
      { lat: 31.33, lng: 118.38, name: '芜湖', year: '1170', label: '罢官北归，卒于芜湖，年三十八' } ] },
    { id: 'zhangyfh', name: '张养浩', dynasty: '元', desc: '散曲大家，为赈灾散尽家产、累死任上的清官。', stops: [
      { e: 'jinan', year: '1270', label: '济南人，云庄闲居八年，七聘不出' },
      { e: 'tongguan', year: '1329', label: '关中大旱，散家财登车就道，道出潼关作《山坡羊》' },
      { e: 'changan', year: '1329', label: '莅陕四月，未尝家居，赈灾积劳卒于任上' } ] },
    { id: 'yuanhaowen', name: '元好问', dynasty: '金', desc: '金元文宗，"问世间情为何物"传唱八百年。', stops: [
      { lat: 38.42, lng: 112.73, name: '秀容（忻州）', year: '1190', label: '太原秀容人，七岁能诗，号神童' },
      { e: 'taiyuan', year: '1205', label: '赴试并州，汾水上葬雁筑丘，作《雁丘词》' },
      { lat: 33.05, lng: 111.85, name: '内乡', year: '1227', label: '知内乡县，兴学劝农，政声卓著' },
      { lat: 38.09, lng: 114.38, name: '获鹿', year: '1257', label: '金亡不仕，以修史自任，卒于获鹿寓舍' } ] },
    { id: 'tangyin_ty', name: '唐寅', dynasty: '明', desc: '江南第一风流才子，诗书画三绝的桃花庵主。', stops: [
      { e: 'gusu', year: '1470', label: '生于苏州吴趋坊，商贾之家' },
      { e: 'jinling', year: '1498', label: '应天府乡试第一（解元）' },
      { e: 'taohuawu', year: '1505', label: '会试泄题案革黜，归筑桃花庵，卖画为生，1524年卒' } ] },
    { id: 'gongzizhen', name: '龚自珍', dynasty: '清', desc: '改良主义先驱，"三百年来第一流"的思想家诗人。', stops: [
      { e: 'linan', year: '1792', label: '生于杭州马坡巷，段玉裁外孙' },
      { e: 'jingshi', year: '1818', label: '中举后仕京二十年，最熟朝章国故' },
      { e: 'jingkou', year: '1839', label: '辞官南归，己亥道出镇江，撰青词惊风雷' },
      { lat: 31.99, lng: 119.58, name: '丹阳', year: '1841', label: '执教云阳书院，暴卒于丹阳，年五十' } ] }
  ];
});
