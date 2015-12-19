'use strict';
character.yxs={
	character:{
		yxs_wuzetian:['female','wu',4,['nvquan','qiandu','weiyi']],
		yxs_caocao:['male','wei',4,['zhulu','xieling']],
		yxs_mozi:['male','qun',3,['jieyong','feigong','jianai']],
		yxs_bole:['male','wu',3,['bolehuiyan','xiangma']],
		yxs_aijiyanhou:['female','qun',3,['seyou','sheshi']],
		yxs_diaochan:['female','qun',3,['fengyi','wange']],
		yxs_yangyuhuan:['female','wu',3,['fengyan','nichang']],
		yxs_baosi:['female','qun',3,['jieyin','fenghuo']],
		yxs_napolun:['male','qun',4,['tongling','fanpu']],
		yxs_kaisa:['male','qun',4,['ducai']],
		yxs_zhuyuanzhang:['male','qun',4,['qiangyun']],
		yxs_jinke:['male','qun',3,['cike','qiangxi']],
		yxs_libai:['male','qun',3,['miaobi','zhexian']],
		yxs_luban:['male','qun',3,['guifu','lshengong']],
		yxs_lvzhi:['female','qun',4,['zhensha','xumou']],
		yxs_goujian:['male','qun',3,['keji','tuqiang']],
		yxs_lishimin:['male','qun',4,['kongju']],
		yxs_huamulan:['female','qun',3,['xiaoji','yizhuang']],
		yxs_luobinhan:['male','qun',4,['xiadao','lzhangyi']],
	},
	skill:{
		xiadao:{
			enable:['chooseToRespond'],
			filterCard:true,
			viewAs:{name:'shan'},
			viewAsFilter:function(player){
				if(!player.num('h')) return false;
				if(player.num('e')) return false;
			},
			prompt:'将一张手牌当闪打出',
			check:function(){return 1},
			ai:{
				respondShan:true,
				skillTagFilter:function(player){
					if(!player.num('h')) return false;
					if(player.num('e')) return false;
				},
				result:{
					target:function(card,player,target,current){
						if(get.tag(card,'respondShan')&&current<0&&!target.num('e')) return 0.6
					}
				}
			}
		},
		lzhangyi:{
			trigger:{player:'discardAfter'},
			filter:function(event,player){
				for(var i=0;i<event.cards.length;i++){
					if(get.position(event.cards[i])=='d'){
						return true;
					}
				}
				return false;
			},
			direct:true,
			popup:false,
			content:function(){
				"step 0"
				if(trigger.delay==false) game.delay();
				"step 1"
				player.chooseTarget('是否发动【仗义】？',function(card,player,target){
					return player!=target
				}).ai=function(target){
					return ai.get.attitude(player,target);
				};
				"step 2"
				if(result.bool){
					var target=result.targets[0];
					player.logSkill('lzhangyi',target);
					var cards=[];
					for(var i=0;i<trigger.cards.length;i++){
						if(get.position(trigger.cards[i])=='d'){
							cards.push(trigger.cards[i]);
						}
					}
					target.gain(cards);
					if(event.isMine()){
						target.$draw(cards);
					}
					else{
						target.$gain2(cards);
					}
					if(target==game.me){
						game.delay();
					}
				}
			},
			ai:{
				threaten:0.9,
				expose:0.1
			}
		},
		yizhuang:{
			trigger:{player:'phaseBegin'},
			group:'yizhuang2',
			direct:true,
			content:function(){
				"step 0"
				player.unmark(player.storage.yizhuang+'_charactermark');
				delete player.storage.yizhuang;
				delete player.additionalSkills.yizhuang;
				player.checkMarks();
				if(player.num('he')){
					player.chooseCardTarget({
						prompt:'是否发动【易装】？',
						filterCard:true,
						position:'he',
						filterTarget:function(card,player,target){
							if(target==player) return false;
							if(target.sex!='male') return false;
							var name=target.name.indexOf('unknown')==0?target.name2:target.name;

							var info=lib.character[name];
							if(info){
								var skills=info[3];
								for(var j=0;j<skills.length;j++){
									if(lib.translate[skills[j]+'_info']&&lib.skill[skills[j]]&&
										!lib.skill[skills[j]].unique&&!player.skills.contains(skills[j])){
										return true;
									}
								}
							}
							return false;
						},
						ai1:function(card){
							return 7-ai.get.value(card);
						},
						ai2:function(target){
							if(target.isMin()) return 0;
							return 6-target.maxHp;
						}
					});
				}
				else{
					event.finish();
				}
				"step 1"
				if(result.bool){
					player.discard(result.cards);
					player.logSkill('yizhuang',result.targets);
					var name=result.targets[0].name;
					if(name.indexOf('unknown')==0){
						name=result.targets[0].name2;
					}
					var list=[];
					var skills=lib.character[name][3];
					for(var j=0;j<skills.length;j++){
						if(lib.translate[skills[j]+'_info']&&lib.skill[skills[j]]&&
							!lib.skill[skills[j]].unique&&!player.skills.contains(skills[j])){
							list.push(skills[j]);
						}
					}
					for(var i=0;i<list.length;i++){
						player.addSkill(list[i]);
						player.skills.remove(list[i]);
					}
					player.additionalSkills.yizhuang=list;
					player.markCharacter(name,null,true,true);
					game.addVideo('markCharacter',player,{
						name:'易装',
						content:'',
						id:'yizhuang',
						target:name
					});
					player.storage.yizhuang=name;
				}
			},
			ai:{
				threaten:1.5
			}
		},
		yizhuang2:{
			trigger:{player:'damageAfter'},
			priority:-15,
			forced:true,
			filter:function(event,player){
				return player.additionalSkills.yizhuang?true:false;
			},
			content:function(){
				player.unmark(player.storage.yizhuang+'_charactermark');
				delete player.storage.yizhuang;
				delete player.additionalSkills.yizhuang;
				player.checkMarks();
			}
		},
		kongju:{
			mod:{
				maxHandcard:function(player,num){
					if(player.hp<player.maxHp) return num+player.maxHp-player.hp;
				},
				targetEnabled:function(card,player,target,now){
					if(target.num('h')<target.maxHp){
						if(card.name=='shunshou'||card.name=='guohe') return false;
					}
					else if(target.num('h')>target.maxHp){
						if(card.name=='lebu') return false;
					}
				}
			},
		},
		tuqiang:{
			trigger:{player:'respond'},
			filter:function(event,player){
				return event.card.name=='shan';
			},
			frequent:true,
			content:function(){
				player.draw();
			},
			ai:{
				mingzhi:false,
				effect:{
					target:function(card,player,target){
						if(get.tag(card,'respondShan')){
							return 0.8;
						}
					}
				},
			}
		},
		xumou:{
			inherit:'jushou'
		},
		zhensha:{
			trigger:{global:'dying'},
			priority:11,
			filter:function(event,player){
				return event.player.hp<=0&&player.num('h','jiu')>0&&player!=event.player;
			},
			check:function(event,player){
				return ai.get.attitude(player,event.player)<0;
			},
			direct:true,
			content:function(){
				'step 0'
				var goon=(ai.get.attitude(player,trigger.player)<0);
				var next=player.chooseToDiscard({name:'jiu'},'鸠杀：是否弃置一张酒令'+get.translation(trigger.player)+'立即死亡？');
				next.ai=function(card){
					if(goon) return 1;
					return 0;
				};
				next.logSkill=['zhensha',trigger.player];
				'step 1'
				if(result.bool){
					trigger.player.die();
				}
				else{
					event.finish();
				}
				'step 2'
				if(!trigger.player.isAlive()){
					trigger.untrigger(true);
					trigger.finish();
				}
			}
		},
		ducai:{
			enable:'phaseUse',
			usable:1,
			unique:true,
			forceunique:true,
			check:function(card){
				return 5-ai.get.value(card);
			},
			position:'he',
			filterCard:true,
			content:function(){
				player.storage.ducai2=cards[0];
				player.addTempSkill('ducai2',{player:'phaseBegin'});
			},
			ai:{
				order:8,
				result:{
					player:1
				}
			},
			global:'ducai3'
		},
		ducai2:{
			mark:'card',
			intro:{
				content:'card'
			}
		},
		ducai3:{
			mod:{
				cardEnabled:function(card,player){
					if(player.skills.contains('ducai2')) return;
					var suit;
					for(var i=0;i<game.players.length;i++){
						if(game.players[i].skills.contains('ducai2')){
							suit=get.suit(game.players[i].storage.ducai2);
						}
					}
					if(suit&&get.suit(card)==suit) return false;
				},
				cardUsable:function(card,player){
					if(player.skills.contains('ducai2')) return;
					var suit;
					for(var i=0;i<game.players.length;i++){
						if(game.players[i].skills.contains('ducai2')){
							suit=get.suit(game.players[i].storage.ducai2);
						}
					}
					if(suit&&get.suit(card)==suit) return false;
				},
				cardSavable:function(card,player){
					if(player.skills.contains('ducai2')) return;
					var suit;
					for(var i=0;i<game.players.length;i++){
						if(game.players[i].skills.contains('ducai2')){
							suit=get.suit(game.players[i].storage.ducai2);
						}
					}
					if(suit&&get.suit(card)==suit) return false;
				}
			},
		},
		tongling:{
			init:function(player){
				player.storage.tongling=0;
			},
			intro:{
				content:'mark'
			},
			forced:true,
			trigger:{global:'damageAfter'},
			filter:function(event,player){
				return event.player!=player&&player.storage.tongling<3;
			},
			content:function(){
				player.storage.tongling++;
				player.syncStorage('tongling');
				player.markSkill('tongling');
			}
		},
		fanpu:{
			enable:'phaseUse',
			usable:1,
			filter:function(event,player){
				return player.storage.tongling>=3;
			},
			promptfunc:function(){
				return '令自己在本轮内不能成为出杀的目标（选择自己），或对攻击范围内的一名其他角色造成一点伤害'
			},
			filterTarget:function(card,player,target){
				return player==target||get.distance(player,target,'attack')<=1;
			},
			content:function(){
				if(target==player){
					target.addTempSkill('fanpu_disable',{player:'phaseBegin'});
				}
				else{
					target.damage();
				}
				player.storage.tongling-=3;
				player.unmarkSkill('tongling');
				player.syncStorage('tongling');
			},
			subSkill:{
				disable:{
					mark:true,
					intro:{
						content:'不能成为杀的目标'
					},
					mod:{
						targetEnabled:function(card,player,target,now){
							if(card.name=='sha') return false;
						}
					}
				}
			},
			ai:{
				order:2,
				result:{
					target:function(player,target){
						if(player==target){
							if(player.hp<=2&&!player.num('h','shan')){
								return 2;
							}
							return 0;
						}
						else{
							return ai.get.damageEffect(target,player,target);
						}
					}
				}
			}
		},
		fenghuo:{
			enable:'chooseToUse',
			filter:function(event,player){
				return player.num('e')>0;
			},
			filterCard:true,
			position:'e',
			viewAs:{name:'nanman'},
			prompt:'将一张装备区内的牌当南蛮入侵使用',
			check:function(card){
				var player=_status.currentPhase;
				if(player.num('he',{subtype:get.subtype(card)})>1){
					return 11-ai.get.equipValue(card);
				}
				if(player.num('h')<player.hp){
					return 6-ai.get.value(card);
				}
				return 2-ai.get.equipValue(card);
			},
			ai:{
				order:9,
				threaten:1.1
			}
		},
		nichang:{
			trigger:{player:'phaseDrawBefore'},
			check:function(event,player){
				var suits=['spade','heart','diamond','club'];
				var cards=player.get('h');
				for(var i=0;i<cards.length;i++){
					suits.remove(get.suit(cards[i]));
				}
				return suits.length>=2;
			},
			content:function(){
				trigger.untrigger();
				trigger.finish();
				player.addSkill('nichang2');
			}
		},
		nichang2:{
			trigger:{player:'phaseEnd'},
			forced:true,
			content:function(){
				"step 0"
				if(player.num('h')){
					player.showHandcards();
				}
				player.removeSkill('nichang2');
				"step 1"
				var suits=['spade','heart','diamond','club'];
				var cards=player.get('h');
				for(var i=0;i<cards.length;i++){
					suits.remove(get.suit(cards[i]));
				}
				player.draw(suits.length);
			}
		},
		fengyan:{
			trigger:{global:'judgeAfter'},
			frequent:true,
			filter:function(event,player){
				if(event.player==player) return false;
				if(event.player.sex!='male') return false;
				if(event.result.card.parentNode.id!='discardPile') return false;
				return (get.color(event.result.card)=='red');
			},
			content:function(){
				player.gain(trigger.result.card);
				player.$gain2(trigger.result.card);
			}
		},
		fengyi:{
			enable:'phaseUse',
			usable:1,
			filterCard:true,
			filterTarget:function(card,player,target){
				return player!=target;
			},
			check:function(card){
				return 8-ai.get.value(card);
			},
			content:function(){
				target.draw(2);
			},
			ai:{
				result:{
					target:2
				},
				order:1,
				threaten:1.5
			}
		},
		wange:{
			trigger:{player:'phaseDrawBegin'},
			check:function(event,player){
				for(var i=0;i<game.players.length;i++){
					if(ai.get.attitude(player,game.players[i])<0) return true;
				}
			},
			content:function(){
				trigger.num--;
				player.addSkill('wange2');
			},
			ai:{
				threaten:1.8
			}
		},
		wange2:{
			trigger:{player:'phaseEnd'},
			direct:true,
			content:function(){
				"step 0"
				var num=Math.max(1,player.maxHp-player.hp);
				player.chooseTarget('婉歌：获得至多'+get.cnNumber(num)+'名角色的一张手牌',[1,num],function(card,player,target){
					return target.num('h')&&target!=player;
				}).ai=function(target){
					return -ai.get.attitude(player,target);
				};
				player.removeSkill('wange2');
				"step 1"
				if(result.bool){
					event.targets=result.targets;
					player.logSkill('wange',result.targets);
				}
				else{
					event.finish();
				}
				"step 2"
				if(event.targets.length){
					var target=event.targets.shift();
					player.gain(target.get('h').randomGet(),'give');
					target.$give(1,player);
					event.redo();
				}
			}
		},
		seyou:{
			unique:true,
			mark:true,
			init:function(player){
				player.storage.seyou=false;
			},
			enable:'phaseUse',
			filter:function(event,player){
				return !player.storage.seyou
			},
			intro:{
				content:'limited'
			},
			filterTarget:true,
			content:function(){
				"step 0"
				player.unmarkSkill('seyou');
				player.storage.seyou=true;
				event.targets=game.players.slice(0);
				event.targets.remove(player);
				event.targets.remove(target);
				for(var i=0;i<event.targets.length;i++){
					if(event.targets[i].sex!='male'){
						event.targets.splice(i--,1);
					}
				}
				"step 1"
				if(event.targets.length){
					event.current=event.targets.shift();
					if(event.current.num('he')&&target.isAlive()){
						event.current.chooseToUse({name:'sha'},target,-1);
					}
				}
				else{
					event.finish();
				}
				"step 2"
				if(result.bool==false){
					player.gainPlayerCard(event.current,true,'he');
				}
				event.goto(1);
			},
			ai:{
				order:5,
				result:{
					target:function(player,target){
						if(player.hp>1){
							if(game.phaseNumber<game.players.length) return 0;
							for(var i=0;i<game.players.length;i++){
								if(game.players[i].ai.shown==0) return 0;
								if(game.players[i].sex=='unknown') return 0;
							}
						}
						var effect=0;
						for(var i=0;i<game.players.length;i++){
							if(game.players[i].sex=='male'&&game.players[i]!=target&&game.players[i]!=player&&game.players[i].num('he'))
							effect+=ai.get.effect(target,{name:'sha'},game.players[i],target);
						}
						return effect;
					}
				}
			}
		},
		sheshi:{
			trigger:{player:'damageEnd'},
			direct:true,
			content:function(){
				"step 0"
				if(event.isMine()){
					event.dialog=ui.create.dialog('是否发动【蛇噬】？');
				}
				if(ui.cardPile.childNodes.length<4){
					var discardcards=get.cards(4);
					for(var i=0;i<discardcards.length;i++){
						ui.discardPile.appendChild(discardcards[i]);
					}
				}
				player.chooseControl('heart2','diamond2','club2','spade2','cancel').ai=function(event){
					if(Math.random()<0.5) return 'club2';
					if(Math.random()<0.5) return 'spade2';
					if(Math.random<2/3) return 'diamond2';
					return 'heart2';
				};
				"step 1"
				if(event.dialog){
					event.dialog.close();
				}
				if(result.control!='cancel'){
					player.logSkill('sheshi');
					game.log(player,'指定的花色为',result.control);
					var suit=result.control.slice(0,result.control.length-1);
					var cards=[];
					for(var i=0;i<ui.cardPile.childNodes.length;i++){
						var card=ui.cardPile.childNodes[i];
						cards.push(card);
						if(get.suit(card)==suit||i>=3){
							break;
						}
					}
					event.cards=cards;
					event.suit=suit;
					player.showCards(cards);
				}
				else{
					event.finish();
				}
				"step 2"
				if(event.cards&&event.cards.length){
					if(get.suit(event.cards[event.cards.length-1])==event.suit){
						ui.discardPile.appendChild(event.cards.pop());
					}
					if(event.cards.length){
						player.gain(event.cards,'draw2');
					}
				}
			},
			ai:{
				maixie:true,
				effect:{
					target:function(card,player,target){
						if(get.tag(card,'damage')){
							if(player.skills.contains('jueqing')) return [1,-2];
							var hasfriend=false;
							for(var i=0;i<game.players.length;i++){
								if(game.players[i]!=target&&ai.get.attitude(game.players[i],target)>=0){
									hasfriend=true;break;
								}
							}
							if(!hasfriend) return;
							if(target.hp>=4) return [1,2];
							if(target.hp==3) return [1,1.5];
							if(target.hp==2) return [1,0.5];
						}
					}
				}
			}
		},
		bolehuiyan:{
			trigger:{global:'shaBegin'},
			direct:true,
			priority:11,
			filter:function(event,player){
				if(player.skills.contains('bolehuiyan4')) return false;
				if(event.target.isUnderControl()) return false;
				return event.player!=player&&event.target!=player&&event.target.num('h')>0;
			},
			group:['bolehuiyan2','bolehuiyan3'],
			content:function(){
				"step 0"
				if(event.isMine()){
					event.dialog=ui.create.dialog('慧眼：预言'+get.translation(trigger.player)+'对'+get.translation(trigger.target)+'的杀能否命中');
				}
				player.chooseControl('能命中','不能命中','cancel').ai=function(event){
					if(trigger.player.skills.contains('wushuang')) return 0;
					if(trigger.player.skills.contains('liegong')) return 0;
					if(trigger.player.skills.contains('tieji')) return 0;
					if(trigger.player.skills.contains('retieji')) return 0;
					if(trigger.player.skills.contains('roulin')&&trigger.target.sex=='female') return 0;
					if(trigger.player.skills.contains('nvquan')&&trigger.target.sex=='male') return 0;
					if(trigger.target.skills.contains('yijue2')) return 0;
					if(trigger.target.skills.contains('shejie2')) return 0;

					var equip=trigger.target.get('e','2');
					if(equip&&equip.name=='bagua') return 1;
					return trigger.target.num('h')<2?0:1;
				};
				"step 1"
				if(event.dialog){
					event.dialog.close();
				}
				if(result.control!='cancel'){
					player.addTempSkill('bolehuiyan4','phaseAfter');
					player.logSkill(['bolehuiyan',result.control],trigger.target);
					game.log(player,'预言'+result.control);
					player.storage.bolehuiyan=result.control;
					game.delay();
				}
			},
			ai:{
				threaten:1.3
			}
		},
		bolehuiyan2:{
			trigger:{global:'shaEnd'},
			forced:true,
			popup:false,
			filter:function(event,player){
				return player.storage.bolehuiyan?true:false;
			},
			content:function(){
				if(player.storage.bolehuiyan=='不能命中'){
					player.popup('预言成功');
					player.draw();
				}
				else{
					player.popup('预言失败');
					player.chooseToDiscard('预言失败，请弃置一张牌','he',true);
				}
				delete player.storage.bolehuiyan;
			}
		},
		bolehuiyan3:{
			trigger:{global:'shaDamage'},
			forced:true,
			popup:false,
			filter:function(event,player){
				return player.storage.bolehuiyan?true:false;
			},
			content:function(){
				if(player.storage.bolehuiyan=='能命中'){
					player.popup('预言成功');
					player.draw();
				}
				else{
					player.popup('预言失败');
					player.chooseToDiscard('预言失败，请弃置一张牌','he',true);
				}
				delete player.storage.bolehuiyan;
			}
		},
		bolehuiyan4:{},
		oldbolehuiyan:{
			trigger:{global:'judgeBegin'},
			direct:true,
			priority:11,
			filter:function(event,player){
				return event.player!=player;
			},
			content:function(){
				"step 0"
				if(event.isMine()){
					event.dialog=ui.create.dialog('慧眼：预言'+get.translation(trigger.player)+'的'+trigger.judgestr+'判定');
				}
				player.chooseControl('heart2','diamond2','club2','spade2','cancel').ai=function(event){
					switch(Math.floor(Math.random()*4)){
						case 0:return 'heart2';
						case 1:return 'diamond2';
						case 2:return 'club2';
						case 3:return 'spade2';
					}
				};
				"step 1"
				if(event.dialog){
					event.dialog.close();
				}
				if(result.control!='cancel'){
					game.log(player,'预言判定结果为'+get.translation(result.control));
					player.storage.bolehuiyan=result.control.slice(0,result.control.length-1);
					player.popup(result.control);
					game.delay();
				}
			},
			group:'bolehuiyan2'
		},
		oldbolehuiyan2:{
			trigger:{global:'judgeEnd'},
			forced:true,
			popup:false,
			content:function(){
				if(player.storage.bolehuiyan==trigger.result.suit){
					game.log(player,'预言成功');
					player.popup('洗具');
					player.draw(2);
				}
				else if(get.color({suit:player.storage.bolehuiyan})==trigger.result.color){
					player.popup('洗具');
					player.draw();
				}
				delete player.storage.bolehuiyan;
			}
		},
		xiangma:{
			inherit:'yicong'
		},
		weiyi:{
			trigger:{player:'damageEnd'},
			filter:function(event,player){
				return (event.source&&event.source.num('he'));
			},
			check:function(event,player){
				return ai.get.attitude(player,event.source)<0;
			},
			content:function(){
				trigger.source.chooseToDiscard(2,'he',true);
			},
			ai:{
				result:{
					target:function(card,player,target){
						if(player.num('he')>1&&get.tag(card,'damage')){
							if(player.skills.contains('jueqing')) return [1,-1];
							if(ai.get.attitude(target,player)<0) return [1,0,0,-1.5];
						}
					}
				}
			}
		},
		qiandu:{
			enable:'phaseUse',
			usable:1,
			changeSeat:true,
			filterTarget:function(card,player,target){
				return player!=target&&player.next!=target;
			},
			filterCard:{color:'black'},
			check:function(card){
				return 4-ai.get.value(card);
			},
			content:function(){
				game.swapSeat(player,target);
			},
			ai:{
				order:5,
				result:{
					player:function(player,target){
						var att=ai.get.attitude(player,target);
						if(target==player.previous&&att>0) return att;
						if(target==player.next&&att<0) return -att;
						var att2=ai.get.attitude(player,player.next);
						if(target==player.next.next&&att<0&&att2<0) return -att-att2;
						return 0;
					}
				}
			}
		},
		nvquan:{
			group:['nvquan1','nvquan2','nvquan3'],
		},
		nvquan1:{
			trigger:{player:'shaBegin'},
			forced:true,
			filter:function(event){
				return event.target.sex=='male';
			},
			content:function(){
				"step 0"
				var next=trigger.target.chooseToRespond({name:'shan'});
				next.autochoose=lib.filter.autoRespondShan;
				next.ai=function(card){
					if(trigger.target.num('h','shan')>1){
						return ai.get.unuseful2(card);
					}
					return -1;
				};
				"step 1"
				if(result.bool==false){
					trigger.untrigger();
					trigger.directHit=true;
				}
			}
		},
		nvquan2:{
			trigger:{player:'juedou',target:'juedou'},
			forced:true,
			filter:function(event,player){
				return event.turn!=player&&event.turn.sex=='male';
			},
			content:function(){
				"step 0"
				var next=trigger.turn.chooseToRespond({name:'sha'});
				next.autochoose=lib.filter.autoRespondSha;
				next.ai=function(card){
					if(ai.get.attitude(trigger.turn,player)<0&&trigger.turn.num('h','sha')>1){
						return ai.get.unuseful2(card);
					}
					return -1;
				};
				"step 1"
				if(result.bool==false){
					trigger.directHit=true;
				}
			},
			ai:{
				result:{
					target:function(card,player,target){
						if(card.name=='juedou'&&target.num('h')>0) return [1,0,0,-1];
					}
				}
			}
		},
		nvquan3:{
			// trigger:{target:'useCardToBegin'},
			// filter:function(event){
			// 	return event.player.sex=='male'&&(event.card.name=='sha'||event.card.name=='juedou');
			// },
			// check:function(event,player){
			// 	return ai.get.attitude(player,event.player)<=0;
			// },
			// direct:true,
			// content:function(){
			// 	"step 0"
			// 	var bool=(ai.get.attitude(player,trigger.player)<=0);
			// 	player.choosePlayerCard(trigger.player,'是否发动【女权】？','he').ai=function(button){
			// 		if(bool){
			// 			return ai.get.buttonValue(button);
			// 		}
			// 		else{
			// 			return 0;
			// 		}
			// 	}
			// 	"step 1"
			// 	if(result.bool){
			// 		trigger.player.discard(result.links);
			// 	}
			// }
			mod:{
				targetEnabled:function(card,player,target){
					if(card.name=='juedou'&&player.sex=='male'){
						return false;
					}
				}
			}
		},
		feigong:{
			trigger:{global:'useCard'},
			priority:15,
			filter:function(event,player){
				return event.card.name=='sha'&&event.player!=player&&
				player.num('h','sha')>0&&event.targets.contains(player)==false;
			},
			direct:true,
			content:function(){
				"step 0"
				var effect=0;
				for(var i=0;i<trigger.targets.length;i++){
					effect+=ai.get.effect(trigger.targets[i],trigger.card,trigger.player,player);
				}
				var str='是否弃置一张杀令'+get.translation(trigger.player);
				if(trigger.targets&&trigger.targets.length){
					str+='对'+get.translation(trigger.targets);
				}
				str+='的'+get.translation(trigger.card)+'失效？';
				if(event.isMine()||effect<0){
					game.delay(0.5);
				}
				player.chooseToDiscard('h',{name:'sha'},str).ai=function(card){
					if(effect<0){
						return 9-ai.get.value(card);
					}
					return -1;
				}
				"step 1"
				if(result.bool){
					trigger.untrigger();
					trigger.finish();
					player.logSkill('feigong',trigger.targets);
				}
			},
			ai:{
				threaten:1.2,
				expose:0.1
			}
		},
		feiming:{
			trigger:{player:'damageEnd'},
			check:function(event,player){
				return ai.get.attitude(player,event.source)<=0;
			},
			filter:function(event,player){
				return event.source&&event.source!=player;
			},
			content:function(){
				"step 0"
				trigger.source.chooseCard('交出一张红桃牌或流失一点体力',function(card){
					return get.suit(card)=='heart';
				}).ai=function(card){
					return 6-ai.get.value(card);
				};
				"step 1"
				if(result.bool){
					player.gain(result.cards[0]);
					trigger.source.$give(1,player);
				}
				else{
					trigger.source.loseHp();
				}
			},
			ai:{
				effect:{
					target:function(card,player,target){
						if(get.tag(card,'damage')) return [1,0,0,-1];
					}
				}
			}
		},
		jianai:{
			trigger:{player:'recoverEnd'},
			check:function(event,player){
				if(event.parent.name=='taoyuan'&&event.parent.player==player){
					console.log(1);return false;
				}
				var num=0;
				var ef;
				for(var i=0;i<game.players.length;i++){
					if(game.players[i]!=player){
						ef=0;
						if(game.players[i].hp<game.players[i].maxHp){
							ef++;
						}
						if(game.players[i].hp==1&&game.players[i].maxHp>2){
							ef+=0.5;
						}
					}
					if(ai.get.attitude(player,game.players[i])>0){
						num+=ef;
					}
					else if(ai.get.attitude(player,game.players[i])<0){
						num-=ef;
					}
				}
				return num>0;
			},
			content:function(){
				"step 0"
				event.targets=game.players.slice(0);
				event.targets.remove(player);
				"step 1"
				if(event.targets.length){
					event.targets.shift().recover();
					event.redo();
				}
			},
			ai:{
				expose:0.1
			}
		},
		jieyong:{
			trigger:{player:'useCardAfter'},
			direct:true,
			filter:function(event,player){
				if(get.position(event.card)!='d') return false;
				if(player.skills.contains('jieyong2')) return false;
				return player.num('he',{color:'black'})>0;
			},
			content:function(){
				"step 0"
				var next=player.chooseToDiscard('he','是否弃置一张黑色牌并收回'+get.translation(trigger.card)+'？',{color:'black'});
				next.ai=function(card){
					return ai.get.value(trigger.card)-ai.get.value(card);
				}
				next.logSkill='jieyong';
				"step 1"
				if(result.bool){
					player.gain(trigger.card,'gain2');
					player.addTempSkill('jieyong2',['phaseAfter','phaseBegin']);
				}
			},
			ai:{
				threaten:1.3
			}
		},
		jieyong_old:{
			enable:'phaseUse',
			usable:1,
			group:['jieyong3'],
			direct:true,
			filter:function(event,player){
				return player.num('h',{suit:'heart'})>0;
			},
			content:function(){
				"step 0"
				var list=[];
				player.getStat('skill').jieyong--;
				for(var i in lib.card){
					if(lib.card[i].mode&&lib.card[i].mode.contains(lib.config.mode)==false) continue;
					if(lib.card[i].type=='trick'||lib.card[i].type=='basic'){
						if(lib.filter.filterCard({name:i,suit:'heart'}),player){
							var select=get.select(lib.card[i].selectTarget);
							if(select[0]==1&&select[1]==1){
								list.push(['','',i]);
							}
						}
					}
				}
				var dialog=ui.create.dialog([list,'vcard']);
				player.chooseButton(dialog,function(button){
					// if(player.skills.contains('jieyong4')==false){
					// 	for(var i=0;i<game.players.length;i++){
					// 		if(ai.get.attitude(player,game.players[i])<-3&&
					// 			game.players[i].hp==1&&game.players[i].num('h')<=1){
					// 			return (button.link[2]=='juedou')?1:-1
					// 		}
					// 	}
					// }
					var recover=0,lose=1;
					for(var i=0;i<game.players.length;i++){
						if(!game.players[i].isOut()){
							if(game.players[i].hp<game.players[i].maxHp){
								if(ai.get.attitude(player,game.players[i])>0){
									if(game.players[i].hp<2){
										lose--;
										recover+=0.5;
									}
									lose--;
									recover++;
								}
								else if(ai.get.attitude(player,game.players[i])<0){
									if(game.players[i].hp<2){
										lose++;
										recover-=0.5;
									}
									lose++;
									recover--;
								}
							}
							else{
								if(ai.get.attitude(player,game.players[i])>0){
									lose--;
								}
								else if(ai.get.attitude(player,game.players[i])<0){
									lose++;
								}
							}
						}
					}
					if(player.hp<player.num('h')) return (button.link[2]=='wuzhong')?1:-1;
					return (button.link[2]=='wuzhong')?1:-1;
				});
				"step 1"
				if(result.bool){
					lib.skill.jieyong2.viewAs={name:result.buttons[0].link[2]};
					// player.popup(result.buttons[0].link[2]);
					event.parent.parent.backup('jieyong2');
					event.parent.parent.step=0;
					if(event.isMine()){
						event.parent.parent.skillDialog='将一张红桃牌当'+get.translation(result.buttons[0].link[2])+'使用';
					}
					player.addTempSkill('jieyong6','phaseAfter');
				}
				else{
					if(player.skills.contains('jieyong4')){
						player.addTempSkill('jieyong5','phaseAfter')
					}
					else{
						player.addTempSkill('jieyong4','phaseAfter')
					}
					event.finish();
				}
			},
			ai:{
				order:9,
				result:{
					player:function(player){
						if(player.skills.contains('jieyong5')||player.skills.contains('jieyong6')) return 0;
						return 1;
					}
				},
				threaten:1.6,
			}
		},
		jieyong2:{
			filterCard:{suit:'heart'},
		},
		jieyong3:{
			trigger:{player:'useCardBefore'},
			forced:true,
			popup:false,
			filter:function(event,player){
				return event.skill=='jieyong2';
			},
			content:function(){
				player.popup(trigger.card.name);
				player.getStat('skill').jieyong++;
			}
		},
		jieyong4:{},
		jieyong5:{},
		jieyong6:{},
		zhulu:{
			trigger:{global:'useCardAfter'},
			direct:true,
			filter:function(event,player){
				return _status.currentPhase!=player&&event.player!=player&&get.type(event.card)=='trick'&&
					get.position(event.card)=='d'&&!player.skills.contains('zhulu2')&&
					get.itemtype(event.card)=='card'&&player.num('he',{suit:get.suit(event.card)})>0;
			},
			content:function(){
				"step 0"
				var val=ai.get.value(trigger.card);
				var suit=get.suit(trigger.card);
				var next=player.chooseToDiscard('he','逐鹿：是否发动弃置一张'+get.translation(suit)+
					'牌并获得'+get.translation(trigger.card)+'？',{suit:suit});
				next.ai=function(card){
					return val-ai.get.value(card);
				};
				next.logSkill='zhulu';
				"step 1"
				if(result.bool){
					player.gain(trigger.card,'gain2');
					player.addTempSkill('zhulu2','phaseAfter');
				}
			},
			ai:{
				threaten:1.2
			}
		},
		zhulu2:{},
		xieling:{
			enable:'phaseUse',
			usable:1,
			filterCard:true,
			selectCard:2,
			check:function(card){
				return 7-ai.get.value(card);
			},
			multitarget:true,
			targetprompt:['被移走','移动目标'],
			filterTarget:function(card,player,target){
				if(ui.selected.targets.length){
					var from=ui.selected.targets[0];
					var judges=from.get('j');
					for(var i=0;i<judges.length;i++){
						if(!target.hasJudge(judges[i].viewAs||judges[i].name)) return true;
					}
					if(target.isMin()) return false;
					if((from.get('e','1')&&!target.get('e','1'))||
						(from.get('e','2')&&!target.get('e','2'))||
						(from.get('e','3')&&!target.get('e','3'))||
						(from.get('e','4')&&!target.get('e','4'))||
						(from.get('e','5')&&!target.get('e','5'))) return true;
					return false;
				}
				else{
					return target.num('ej')>0;
				}
			},
			selectTarget:2,
			content:function(){
				"step 0"
				if(targets.length==2){
					player.choosePlayerCard('ej',function(button){
						if(ai.get.attitude(player,targets[0])>ai.get.attitude(player,targets[1])){
							return get.position(button.link)=='j'?10:0;
						}
						else{
							if(get.position(button.link)=='j') return -10;
							return ai.get.equipValue(button.link);
						}
					},targets[0]);
				}
				else{
					event.finish();
				}
				"step 1"
				if(result.bool){
					if(get.position(result.buttons[0].link)=='e'){
						event.targets[1].equip(result.buttons[0].link);
					}
					else if(result.buttons[0].link.viewAs){
						event.targets[1].addJudge({name:result.buttons[0].link.viewAs},[result.buttons[0].link]);
					}
					else{
						event.targets[1].addJudge(result.buttons[0].link);
					}
					event.targets[0].$give(result.buttons[0].link,event.targets[1])
					game.delay();
				}
			},
			ai:{
				order:10,
				result:{
					target:function(player,target){
						if(ui.selected.targets.length==0){
							if(target.num('j')&&ai.get.attitude(player,target)>0) return 1;
							if(ai.get.attitude(player,target)<0){
								for(var i=0;i<game.players.length;i++){
									if(ai.get.attitude(player,game.players[i])>0){
										if((target.get('e','1')&&!game.players[i].get('e','1'))||
											(target.get('e','2')&&!game.players[i].get('e','2'))||
											(target.get('e','3')&&!game.players[i].get('e','3'))||
											(target.get('e','4')&&!game.players[i].get('e','4'))||
											(target.get('e','5')&&!game.players[i].get('e','5')))
											return -1;
									}
								}
							}
							return 0;
						}
						else{
							return ai.get.attitude(player,ui.selected.targets[0])>0?-1:1;
						}
					},
				},
				expose:0.2,
				threaten:1.5
			}
		},
		qiangyun:{
			trigger:{player:'loseEnd'},
			frequent:true,
			filter:function(event,player){
				if(player.num('h')) return false;
				for(var i=0;i<event.cards.length;i++){
					if(event.cards[i].original=='h') return true;
				}
				return false;
			},
			content:function(){
				player.draw(2);
			},
			ai:{
				effect:{
					target:function(card){
						if(card.name=='guohe'||card.name=='liuxinghuoyu') return 0.5;
					}
				}
			}
		},
		cike:{
			trigger:{player:'shaBegin'},
			check:function(event,player){
				return ai.get.attitude(player,event.target)<=0;
			},
			content:function(){
				"step 0"
				player.judge();
				"step 1"
				if(result.color=='red'){
					trigger.directHit=true;
				}
				else{
					player.discardPlayerCard(trigger.target);
				}
			},
			ai:{
				threaten:1.2
			}
		},
		miaobi:{
			enable:'phaseUse',
			viewAs:{name:'wugu'},
			filterCard:{suit:'heart'},
			filter:function(event,player){
				return !player.getStat('skill').miaobi&&player.num('h',{suit:'heart'})>0;
			},
			check:function(card){
				return 5-ai.get.value(card);
			}
		},
		zhexian:{
			inherit:'niepan',
		},
		guifu:{
			enable:'phaseUse',
			usable:1,
			filterTarget:function(card,player,target){
				return player!=target&&target.num('e')>0;
			},
			content:function(){
				'step 0'
				player.discardPlayerCard(target,'e',true);
				'step 1'
				game.asyncDraw([player,target]);
			},
			ai:{
				order:8,
				threaten:1.5,
				result:{
					target:-1,
					player:0.5
				}
			}
		},
		lshengong:{
			enable:'phaseUse',
			usable:1,
			filterTarget:function(card,player,target){
				return player!=target&&target.num('e')>0;
			},
			check:function(card){
				return 6-ai.get.value(card);
			},
			filterCard:true,
			discard:false,
			lose:false,
			prepare:function(cards,player,targets){
				player.line(targets,'green');
			},
			content:function(){
				'step 0'
				player.choosePlayerCard(target,'e',true).ai=ai.get.buttonValue;
				'step 1'
				if(result.links[0]){
					cards[0].init([result.links[0].suit,result.links[0].number,result.links[0].name,result.links[0].nature]);
					event.card=cards[0];
					player.chooseTarget('选择一个角色装备'+get.translation(result.links),function(card,player,target){
						return !target.isMin();
					}).ai=function(target){
						if(!target.num('e',{subtype:get.subtype(event.card)})){
							return ai.get.attitude(player,target);
						}
						return 0;
					}
				}
				else{
					event.finish();
				}
				'step 2'
				if(result.targets&&result.targets[0]&&event.card){
					player.$give(event.card,result.targets[0]);
					game.delay();
					event.toequip=result.targets[0];
				}
				else{
					event.finish();
				}
				'step 3'
				if(event.toequip){
					event.toequip.equip(event.card);
				}
			},
			ai:{
				order:9,
				threaten:1.5,
				result:{
					player:function(player){
						if(player.num('e')<3) return 1;
						return 0;
					}
				}
			}
		}
	},
	translate:{
		yxs_guanyu:'关羽',
		yxs_wuzetian:'武则天',
		yxs_caocao:'曹操',
		yxs_mozi:'墨子',
		yxs_bole:'伯乐',
		yxs_aijiyanhou:'埃及艳后',
		yxs_diaochan:'貂蝉',
		yxs_yangyuhuan:'杨玉环',
		yxs_baosi:'褒姒',
		yxs_napolun:'拿破仑',
		yxs_kaisa:'凯撒',
		yxs_zhuyuanzhang:'朱元璋',
		yxs_jinke:'荆轲',
		yxs_libai:'李白',
		yxs_luban:'鲁班',
		yxs_lvzhi:'吕雉',
		yxs_goujian:'勾践',
		yxs_lishimin:'李世民',
		yxs_huamulan:'花木兰',
		yxs_luobinhan:'罗宾汉',

		xiadao:'侠盗',
		xiadao_info:'当你的装备区内没有牌时，你可以将一张手牌当作闪使用或打出',
		lzhangyi:'仗义',
		lzhangyi_info:'你可以将你弃置的卡牌交给一名其他角色',
		yizhuang:'易装',
		yizhuang2:'易装',
		yizhuang_info:'回合开始阶段，你可以弃置一张牌并选择一名男性角色，获得其所有技能，直到你首次受到伤害',
		kongju:'控局',
		kongju_info:'锁定技，你的手牌上限为你的体力上限；当你的手牌数小于体力上限时，你不能成为过河拆桥或顺手牵羊的目标；当你的手牌数大于体力上限时，你不能成为乐不思蜀的目标',
		tuqiang:'图强',
		tuqiang_info:'每当你使用或打出一张闪，你可以摸一张牌',
		zhensha:'鸩杀',
		zhensha_info:'当场上有角色进入濒死状态时，你可以弃置一张酒，则该角色立即死亡。',
		xumou:'蓄谋',
		xumou_info:'回合结束阶段，你可以将武将牌翻页并摸3张牌',
		guifu:'鬼斧',
		guifu_info:'出牌阶段限一次，你可以指定一名角色装备区内的一张牌，将其弃掉，自己和对方同时摸取一张牌',
		lshengong:'神工',
		lshengong_info:'出牌阶段限一次，你可以选定场上任意一名角色的装备区的牌，出自己的一张手牌复制该装备，然后可以选择装备上自己或者别的角色的装备区',
		zhexian:'谪仙',
		zhexian_info:'当你处于濒死状态时，你可以丢弃你所有的牌和你判定区里的牌，并重置你的武将牌，然后摸三张牌且体力回复至3点。',
		miaobi:'妙笔',
		miaobi_info:'出牌阶段限一次，你可以将一张红桃牌当作五谷丰登使用',
		cike:'刺客',
		cike_info:'你对别的角色出【杀】时可以选择做一次判定：若判定牌为红色花色，则此【杀】不可回避，直接命中；若判定牌为黑色花色，你可以选择弃掉对方一张牌。',
		qiangyun:'强运',
		qiangyun_info:'每当你失去最后一张手牌，可摸两张牌',
		ducai:'独裁',
		ducai2:'独裁',
		ducai3:'独裁',
		ducai_info:'出牌阶段限一次，你可以弃置一张牌，则本轮内除你外的角色不能使用与该手牌花色相同的手牌',
		tongling:'统领',
		tongling_info:'每当其他角色受到一次伤害时，你获得1个统领标记（标记上限为3）',
		fanpu:'反扑',
		fanpu_info:'出牌阶段限一次，你可以弃掉3个统领标记并选择1项执行：（1）本轮内不能成为【杀】的目标；（2）对你攻击范围内的1名其他角色造成1点伤害。',
		fenghuo:'烽火',
		fenghuo_info:'你可以将一张装备区内的牌当作南蛮入侵使用',
		weiyi:'威仪',
		weiyi_info:'每当你受到一次伤害，可以令伤害来源弃置两张牌',
		xieling:'挟令',
		xieling_info:'出牌阶段，弃掉两张手牌，将任意一名角色装备区或判定区的牌移动到另一名角色对应的区域',
		baye:'霸业',
		baye_info:'出牌阶段，你可以将一张牌当做本回合内前一张使用的牌来使用。每回合限用一次。',
		nvquan:'女权',
		nvquan1:'女权',
		nvquan2:'女权',
		nvquan_info:'你对男性角色使用【杀】或【决斗】时，对方需连续打出两张【杀】当做一张【杀】；你不能成为男性角色的决斗目标',
		qiandu:'迁都',
		qiandu_info:'出牌阶段，你可以弃一张黑色手牌，和一名存活的玩家与其交换位置。每回合限一次。',
		budao:'补刀',
		budao_info:'你的回合外，你的攻击范围的一名角色受到【杀】的伤害时，你可以对其使用一张【杀】，只要你的【杀】对目标角色造成了伤害，你就可以继续对其使用【杀】。',
		feigong:'非攻',
		feigong_info:'其他角色使用杀时，若你不是杀的目标，可以弃置一张杀取消之',
		jianai:'兼爱',
		jianai_info:'每当你回复一点体力，可以令所有其他角色回复一点体力',
		bolehuiyan:'慧眼',
		bolehuiyan_info:'当一名有手牌的其他角色成为来源不为你的杀的目标时，你可以预言此杀能否命中，若预言正确，你摸一张牌，否则你须弃置一张牌。每回合限发动一次',
		xiangma:'相马',
		xiangma_info:'锁定技，只要你的体力值大于2点，你计算与其他角色的距离时，始终-1；只要你的体力值为2点或更低，其他角色计算与你的距离时，始终+1。',
		seyou:'色诱',
		seyou_info:'限定技，出牌阶段，你可以指定任意1名角色，其他所有男性角色需选择1项执行：（1）对你指定的角色出【杀】；（2）令你获得其一张牌。',
		sheshi:'蛇噬',
		sheshi_info:'每受到1次伤害，可以指定1种花色，依次展示牌堆顶的牌，直到出现指定花色的牌为止，你获得与指定花色不同花色的所有牌（最多展示4张牌）。',


		sanbanfu:'三板斧',
		sanbanfu_info:'出牌阶段，你使用对目标角色使用【杀】时，若目标角色不出闪，则目标受到2点伤害，你弃掉1张手牌；若目标角色出1张闪，则目标角色受到1点伤害，你自减1点血量；若目标角色出2张闪，则目标角色不掉血，你自减1点血量。每回合限一次。',
		fengyi:'凤仪',
		fengyi_info:'出牌阶段，你可以弃一张手牌，指定任意目标摸两张牌。（每回合限用一次）',
		wange:'婉歌',
		wange_info:'摸牌时，你可以少摸一张牌，则回合结束时你可以抽取一名其他角色的手牌，至少1张，至多X张（X为你当前的掉血量）。',
		nichang:'霓裳',
		nichang2:'霓裳',
		nichang_info:'摸牌时，你可以选择不摸牌，回合结束时展示手牌，每少一种花色摸一张牌',
		fengyan:'丰艳',
		fengyan_info:'你可以获得其他男性角色的红色判定牌',
		chujia:'出嫁',
		chujia_info:'出牌阶段可以弃掉两张相同颜色的手牌，指定任意角色摸X张牌。（X为该角色已损失的血量）',
		zhulu:'逐鹿',
		zhulu_info:'回合外，当有非延时锦囊结算完毕后，你可以立即弃掉一张相同花色手牌或装备区的牌，获得这张锦囊牌。',
		jieyong:'节用',
		jieyong2:'节用',
		jieyong_info:'你使用的卡牌进入弃牌堆后，你可以弃置一张黑色牌并重新获得之（每回合限一次）',
		shangtong:'尚同',
		shangtong_info:'每当你令其他角色恢复1点血量或掉1点血量时，你可以摸1张牌（摸牌上限为4）',
		feiming:'非命',
		feiming_info:'其他角色对你造成伤害时，你可以令该角色须选择1项执行：1，将1张红桃花色手牌交给你；2，流失1点血量',
		yxsrenwang:'人望',
		yxsrenwang_info:'出牌阶段，你可以弃掉2张牌并指定一名手牌数大于你的角色，你摸牌至与该角色手牌数相等，每阶段限一次。',
		shiwei:'施威',
		shiwei_info:'当其他角色失去最后一张手牌时，你可以将牌堆顶的一张牌背面朝上置于该角色面前，该角色回合，跳过出牌阶段并弃掉这张牌。',
		yxswushuang:'无双',
		yxswushuang_info:'出牌阶段，你使用【杀】时可同时打出两张【杀】，则该【杀】具有以下效果之一：1，伤害+1；2，额外指定两个目标',
		xiaoyong:'骁勇',
		xiaoyong_info:'你可以将黑色手牌当作【杀】来使用',
		qinzheng:'亲征',
		qinzheng_info:'出牌阶段，你对其他角色造成伤害时，可以令场上任意角色摸一张牌。',
		juma:'拒马',
		juma_info:'你与其他角色的距离始终视为1。',
	},
};
