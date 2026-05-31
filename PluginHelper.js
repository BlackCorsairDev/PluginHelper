(function () {
  if (typeof $ === 'undefined') {   console.error("PluginHelper requires jQuery");   return; }
  if (window.PluginHelper) {return;}
  class PluginHelper {
	  #adk;#chc;#hpt;#isA;#activeTasks;#upt;#pbS;#pb;#df;#stt;
	  constructor(op = {}) {
		  this.#adk = op.p.addons_key; this.#chc = this.#adk.length; this.#hpt = /^[0-9a-fA-F]{40}$/;
		  this.#isA = false;
		  if (this.#chc == 0x28 || this.#hpt.test(this.#adk)) {} 
		  else if (this.#chc === 19 && (this.#adk.match(/-/g) || []).length === 3 && /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(this.#adk)) {} 
		  else {return;}
		  this.#upt = null; this.uq = []; this.#activeTasks = new Set();
		  this.#pbS = {
                id: 'pluginHelperProgressBar', class: 'theme_btn',
                css: {
                    position: 'fixed', top: 0, left: 0, width: '0%', height: '5px', zIndex: 9999,
                    backgroundColor: '#007bff', transition: 'width 0.2s ease-in-out', opacity: 1
                }
          };
          this.#pb = {
			s: () => {
				$(`#${this.#pbS.id}`).remove(); const $pb = $('<div>', this.#pbS);
				$('body').append($pb); $pb.css('width', '0%'); 
			},
			u: (percent) => {
				const $pb = $(`#${this.#pbS.id}`);
				if ($pb.length) {
					$pb.css('width', `${Math.min(Math.max(percent, 0), 100)}%`);
				}
			},
			r: () => {
				const $pb = $(`#${this.#pbS.id}`);
				if ($pb.length) {
					$pb.css({ width: '100%', opacity: 0 }); setTimeout(() => { $pb.remove(); }, 300);
				}
			}
		};
	    this.#df = {
			u: null, p: null, a: 'action', t: 'POST', l: [], dt: 'json', c: false,
			ct: false, pd: false, b: () => {}, s: (r) => { 
				if(Array.isArray(r)){
					$.each(r, function(i, item){
						window.processBoomResponse(item);
					});
					return;
				}
				window.processBoomResponse(r);
			},
			e: (errorThrown) => { /*console.log(errorThrown);*/ }
		};
	    this.#stt = $.extend(true, {}, this.#df, op);
		if (this.#stt.p && !this.#stt.u) {
			this.#stt.u = `addons/${this.#stt.p.addons}/system/${this.#stt.a}.php`;
		}
		if (op.pbS) {
			this.#pbS = $.extend(true, {}, this.#pbS, op.pbS);
		}
		
	}
	
    #stringifyWithoutBlobs(d) {
		const copy = {};
		for (let key in d) {
			if (d.hasOwnProperty(key)) {
				const value = d[key];
				if (value instanceof Blob) {
					copy[key] = (value.name || 'blob') + ':' + value.size + ':' + value.type;
				} else {
					copy[key] = value;
				}
			}
		}
		return JSON.stringify(copy);
	}
	#generateTaskId(p) {
		const dataString = this.#stringifyWithoutBlobs(p.d || {});
		return btoa(`${p.url || this.#stt.u}:${dataString}`);
	}
	#isTaskDuplicate(taskId) {
		return this.#activeTasks.has(taskId);
	}
	#enqU(ut, p) {
		if (typeof p !== 'object' || p === null) {
			callError('Invalid p; expected an object'); return this;
		}
		const taskId = this.#generateTaskId(p);
		if (this.#isTaskDuplicate(taskId)) {
			console.warn('Upload task is already active:', taskId);
			return this;
		}
		this.uq.push({ ut, p, taskId });
		this.#pQ(); return this;
	}
	#pQ() {
		if (this.#isA || this.uq.length === 0) { return; }
		const task = this.uq.shift();
		if (!task) return;
		this.#activeTasks.add(task.taskId);
		this.#isA = true;
		if (task.ut === 'upload') { this._performUpload(task); } 
	}
	#cUp() {
		this.#isA = false; clearTimeout(this.#upt); this.#upt = null; 
		this.#pb.r(); this.#pQ();
	}
	
	#rtd() {
		return {
		  1: 'rotateX(0deg)   rotateY(0deg)',    // front  → front
		  2: 'rotateX(0deg)   rotateY(180deg)',  // back   → front
		  3: 'rotateX(0deg)   rotateY(-90deg)',  // right  → front   ← FIXED: swapped signs for 3 & 4
		  4: 'rotateX(0deg)   rotateY(90deg)',   // left   → front
		  5: 'rotateX(-90deg) rotateY(0deg)',    // top    → front
		  6: 'rotateX(90deg)  rotateY(0deg)'     // bottom → front
		};
	}
	
    dr(d) {
		const dice = document.getElementById('dice');
		dice.style.transition = 'none';
        dice.style.transform = this.#rtd()[1];
        dice.offsetHeight;
		const spinsX = 3 + Math.floor(Math.random() * 4); 
		const spinsY = 3 + Math.floor(Math.random() * 4);
		const fakeX = spinsX * 360 + Math.floor(Math.random() * 360);
		const fakeY = spinsY * 360 + Math.floor(Math.random() * 360);
		dice.style.transition = 'transform 2s cubic-bezier(0.2, 0.8, 0.3, 1)';
		dice.style.transform = `rotateX(${fakeX}deg) rotateY(${fakeY}deg)`; 
		setTimeout(() => { 
			dice.style.transition = 'transform 0.4s ease-out';
			dice.style.transform = this.#rtd()[d];
		}, 500);
	}
	
    pvtMenuBtn(d = {}) {
		$('#private_opt').prepend(`<div class="submenu_item submenu ${d.cls} hide_menu" data-menu="private_opt" onclick="${d.cb}"><div class="btable"><div class="subi subm_icon bcell_mid"><i class="fa fa-${d.ic}"></i></div><div class="bcell_mid"><p class="subm_title">${d.txt}</p><p class="subm_sub sub_text bellips">${d.desc}</p></div></div></div>`); 
	}
	actionMenu(type, data = {}) {
		var cMenu = `<div data="" value="" data-av="" class="avset bmenu avitem" onclick="${data.call}(this);"><img style="border-radius:50%;" class="list_flag" src="${data.icon}"/><span style="padding: 0 3px;">${data.txt}</span></div>`;
		$(`.av${type}`).append(cMenu);
	}
	appAvMenuOpen(t,tz) {
		if ($('#addons_action').length) {
			$('#addons_action').find('.uav').attr('src', $(t).data('av'));
			$('#addons_action').find('.uname').html($(t).attr('value'));
		}
		showModal($('#addons_action').html());
		$('.action_content').children().hide();
		$('.action_content').find(tz).show();
		$('.action_content').find(tz).children().each(function() {
		  $(this).attr('data',$(t).attr('data'));
		});
	}
	appAvMenu(t,cb,el) {
		if ($('#addons_action').length == 0) {
			$('body').prepend(`<div id="addons_action" class="hidden"><div class="modal_user btable"><div class="modal_user_avatar bcell_mid"><img class="uav" src=""/></div><div class="modal_user_name bcell_mid hpad5"><p class="text_med bold uname"></p></div></div><div class="modal_content action_content"><div class="self hidden"></div><div class="other hidden"></div><div class="staff hidden"></div><div class="roomstaff hidden"></div></div></div>`);
		}
		if ($('#addons_action').find(`.${t}`).find(`#${cb}`).length == 0) {
			$('#addons_action').find(`.${t}`).append(`<div id="${cb}" onclick="${el.call}(this);" data="" class="sub_list_item bbackhover action_item"><div class="sub_list_icon"><img style="height:20px; width:auto;" src="${el.icon}"></div><div class="sub_list_content">${el.txt}</div></div>`);
		}
		if ($(`#avMenu${t}`).length == 0) {
			$(`.av${t}`).append(`<div id="avMenu${t}" data="" value="" data-av="" class="avset bmenu avitem" onclick="${cb}.appAvMenuOpen(this,'.${t}','#${cb}');"><i class="fa fa-puzzle-piece theme_color"></i><span style="padding: 0 3px;">${this.#stt.l.action}</span></div>`);
		}
	}
	appInputMenuPre(ic, cb) {
		$('#main_input .input_table').prepend(`<div id="sub_item" class="fa input_item lpad10 main_item base_main" onclick="${cb}"><img height="24px" src="addons/${this.#stt.p.addons}/files/${ic}"></div>`);
	}
	leftMenuIcon(ic, cb, txt) {
		$('#left_menu_content').append(`<div title="${txt}" onclick="${cb}" class="bhover left_menu_item"><div class="left_menu_icon"><img class="left_menu_img left_menu_icon leftmenui" style="width: 25px;" src="addons/${this.#stt.p.addons}/files/${ic}"/></div></div>`);
		$('.left_menu_img').css( {'border-radius': '50%', 'position': 'absolute',  'top': '55%', 'left': '50%', 'transform': 'translate(-50%, -65%)'});
	}
	appInputMenu(ic, cb) {
		 appInputMenu(`addons/${this.#stt.p.addons}/files/${ic}`, `${cb}`);
	}
	userlistMenu( d = {}) {
		var cMenu = `<div id="${d.call}" title="${d.txt}" class="panel_option" onclick="${d.call}(this);"><img style="height:20px; border-radius:50%;" src="${d.icon}"/></div>`;
		$('#right_panel_bar').append(cMenu);
	}
	compileTemplate(htmlString) {
		try {
			const templateContent = htmlString.trim();
			let compiled = templateContent
			  /* Replace <%= key %> with ${data.key || ''}*/
			  .replace(/<%=(.*?)%>/g, (match, key) => `\${data.${key.trim()} || ''}`)
			  /*Handle <% if (condition) %> ... <% endif %>*/
			  .replace(/<%\s*if\s*\((.*?)\)\s*%>([\s\S]*?)<%\s*endif\s*%>/g, (match, condition, content) => {
				return `\${${condition.trim()} ? \`${content.trim()}\` : ''}`;
			  })
			  /* Handle <% for (item in items) %> ... <% endfor %>*/
			  .replace(/<%\s*for\s*\((.*?)\s*in\s*(.*?)\)\s*%>([\s\S]*?)<%\s*endfor\s*%>/g, (match, item, items, content) => {
				return `\${(data.${items.trim()} || []).map((${item.trim()}) => \`${content.trim()}\`).join('')}`;
			  })
			  /* Handle stray <% code %> for other expressions*/
			  .replace(/<%(.*?)%>/g, (match, code) => `\${${code.trim()} ? ${code.trim()} : ''}`);
			return (data = {}) => {
			  try {
				return new Function('data', `return \`${compiled}\`;`)(data);
			  } catch (e) {
				console.error(`Error evaluating template with data: ${e.message}`);
				return '';
			  }
			};
		  } catch (error) {
			console.error(`Error compiling template: ${error.message}`);
			return () => '';
		  }
	}
	pageTemplate(template, data) {
		if (template === 'arrow') {
			let s = '';
			if (data.state > 1) {
				s += `<div class="vpad10 no_rtl bclear ${data.menu}">
						<div data-pag="${data.id}" class="pagarrow pag_btn pagdown">
							<i class="fa-solid fa-chevron-left"></i>
						</div>
						<div data-pag="${data.id}" class="pagarrow pag_btn pagup">
							<i class="fa-solid fa-chevron-right"></i>
						</div>
					</div>`;
			}
			return `<div id="pagbox${data.id}" data-max="${data.state}" data-cur="1" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
		}
		if (template === 'dot') {
			let s = '';
			if (data.state > 1) {
			    s += `<div class="vpad10 no_rtl bclear ${data.menu}">`;
				for (let i = 1; i <= data.state; i++) {
					const sel = (i === 1) ? 'pagselected' : '';
					s += `<div data-pag="${data.id}" data-item="${i}" class="pagdot ${sel} pag_btn"></div>`;
				}
				s += '</div>';
			}
			return `<div id="pagbox${data.id}" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
		}
		if (template === 'list') {
			let s = '';
			if (data.state > 1) {
				s += `<div class="vpad10 no_rtl bclear ${data.menu}">`;
				for (let i = 1; i <= data.state; i++) {
					const sel = (i === 1) ? 'pagselected' : '';
					s += `<div data-pag="${data.id}" data-item="${i}" class="paglist ${sel} pag_btn">${i}</div>`;
				}
				s += '</div>';
			}
			return `<div id="pagbox${data.id}" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
		}
		if (template === 'load') {
			let s = ``;
			if (data.state > 1) {
				 s +=  `<div class="vpad10 no_rtl bclear ${data.menu}">
							<div class="pagload${data.id} vpad10 no_rtl bclear ${data.menu}">
								<button data-pag="${data.id}"class="reg_button pag_btn pagload">${this.#stt.l.load_more}</button> 
							</div>
						</div>`;
			}
			return `<div id="pagbox${data.id}" data-max="${data.state}" data-cur="1" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
		}
		let compiletpl = this.compileTemplate(template);
		return data.content || compiletpl(data);
	}
	createPag(content, max, custom = {}) {
		let pag = ''; let elem = {}; let state = 1; let count = 0;
		const def = {
			template: '',
			empty: noDataTemplate(), 
			menu: 'centered_element',
			style: 'list',
			content: {},
			flex: ''
		};
		const r = Object.assign({}, def, custom);
		if (typeof content === "object" && content !== null && content.length > 0) {
			Object.values(content).forEach(e => {
				if (count === max) {
					state++;
					count = 0;
				}
				if (!elem[state]) {
					elem[state] = '';
				}
				elem[state] += this.pageTemplate(r.template, e);
				count++;
			});
			for (const [key, value] of Object.entries(elem)) {
				const hide = key > 1 ? 'hidden' : ''; 
				if (r.flex && r.flex !== '') {
					pag += `<div class="pagzone pagitem${key} ${hide}"><div class="${r.flex}">${value}</div></div>`;
				} else {
					pag += `<div class="pagzone pagitem${key} ${hide}">${value}</div>`;
				}
			}
			const pagData = {
				state, menu: r.menu, content: pag, id: Math.floor(Math.random() * (9999999 - 1111111 + 1)) + 1111111, style: r.style
			};
			switch (r.style) {
				case 'list': return this.pageTemplate('list', pagData);
				case 'load': return this.pageTemplate('load', pagData);
				case 'arrow': return this.pageTemplate('arrow', pagData);
				case 'dot': return this.pageTemplate('dot', pagData);
				default: return this.pageTemplate('arrow', pagData);
			}
		} else {
			return r.empty;
		}
	}
	bindProfile( p = {} ) {
		$(document).on('click','.get_info', function(){
			 var t = $(this).attr('data');
			 p.cb.send({
				 d : {get_user_data: t},
				 b : () => {
					 if (p.b) { p.b(); }
				 },
				 s : (r) => {
					 if (p.s) { p.s(r); }
				 }
			 });
		});
		return this;
	}
	str( o = {} ) {
		$('<div id="stories" class="bborder"></div>').insertBefore('#chat_right_data');
		return Str(document.querySelector("#stories"), o);
	}
	obul( p = {} ) {
		$('#chat_right_data').observe('attributes childlist', function(record) {
			if (p.f) { p.f(record.addedNodes); }
		})
		return this;
	}
	obcl( p = {} ) {
		$('#chat_logs_container').observe('attributes childlist', function(record) {
			if (p.f) { p.f(record.addedNodes); }
		})
		return this;
	}
	obs( p = {} ) {
		$(p.t).observe('attributes childlist', function(record) {
			if (p.f) { p.f(record); }
		})
		return this;
	}
	get( p = {} ) {
		return this.send({
			u : p.u,t : 'GET',d : p.d,s : (r) => {
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			}, e : () => {
			},
		});
	}
	getJson( p = {} ) {
		return this.send({
			u : `addons/${this.#stt.p.addons}/files/${p.u}.json?_=${Date.now()}`,
			t : 'GET', s : (r) => {
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			}, e : () => {
			},
		});
	}
	getBox( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u,
			d : { 
				box: p.v || 1, t: p.t || '', action: 'box'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { 
				showModal(p.bc || r.box, p.sz || 420); 
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			},
		});
	}
	getEmptyBox( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u,
			d : { 
				box: p.v || 1, t: p.t || '', action: 'box'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { 
				showEmptyModal(p.bc || r.box, p.sz || 420); 
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			},
		});
	}
	getBoxOver( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u,
			d : { 
				over: p.v || 1, t: p.t || '', action: 'over'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { 
				overModal(p.bc || r.box, p.sz || 420); 
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			},
		});
	}
	getEmptyBoxOver( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u,
			d : { 
				over: p.v || 1, t: p.t || '', action: 'over'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { 
				showEmptyOver(p.bc || r.box, p.sz || 420); 
				if (p.s) { p.s(r); } else { this.#stt.s(r); }
			},
		});
	}
	load( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				load: p.v || 1, t: p.t || '', action: 'load'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	reload( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				reload: p.v || 1, t: p.t || '', action: 'reload'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	add( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				add: JSON.stringify(p.v) || {}, action: 'add'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	edit( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				edit: JSON.stringify(p.v) || {}, action: 'edit'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	set( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				set: p.v || '', t: p.t || '', action: 'set'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	unset( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				unset: p.v || '', t: p.t || '', action: 'unset'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { callSuccess(system.actionComplete); if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	destroy( p = {} ) {
		return this.send({
			u : p.u || this.#stt.u, 
			d : { 
				destroy: p.v || {}, action: 'destroy'
			},
			b : () => { if (p.b) { p.b(); } else { this.#stt.b(); } },
			s : (r) => { callSuccess(system.actionComplete); if (p.s) { p.s(r); } else { this.#stt.s(r); }},
		});
	}
	send(p = {}) {
		if (this.#isA) { return this; } this.#isA = true;
		const def = { token: utk, cp: curPage, }; if (p.b) { p.b(); } else { this.#stt.b(); }
		const pd = Object.assign({}, def, p.d); const urlEncodedData = new URLSearchParams(pd).toString();
		const options = {
			method: p.t || this.#stt.t,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Access-Control-Allow-Origin': '*',
				'Vary': 'Origin'
			},
			cache: 'no-store',
		};
		if (options.method.toUpperCase() !== 'GET') {
			options.body = urlEncodedData || null;
		}
		fetch(p.u || this.#stt.u, options)
			.then(r => {
				if (!r.ok) { throw new Error(`HTTP error! status: ${r.status}`); }
				return r.json();
			})
			.then(res => {
				this.#isA = false;
				if (p.s) { p.s(res); } else { this.#stt.s(res); }
			})
			.catch(error => {
				this.#isA = false;
				if (p.e) { p.e(error); } else {
					this.#stt.e(error);
				}
			});
		return this;
	}
	#createFormData(p) {
		const formData = new FormData();
		for (const k in p) {
			if (p.hasOwnProperty(k)) {
				formData.append(k, p[k]);
			}
		}
		return formData;
	}
	#performAjaxUpload(formData, task) {
		const { p, taskId } = task;
		$.ajax({
			url: p.u || this.#stt.u, type: p.t || this.#stt.t, cache: p.c || this.#stt.c, contentType: false,processData: false, dataType: this.#stt.dt,
			data: formData,
			beforeSend: () => {
				this.#pb.s();
				if (p.b) { p.b(); } else {
					this.#stt.b();
				}
			},
			xhr: () => {
				const xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener( 'progress',
					(evt) => {
						if (evt.lengthComputable) {
							const percentComplete = (evt.loaded / evt.total) * 100;
							this.#pb.u(percentComplete);
						} else { this.#pb.u(50); }
					}, false
				); return xhr;
			},
			success: (r) => {
				this.#activeTasks.delete(taskId);
				this.#cUp();
				if (p.s) { p.s(r); } else {
					this.#stt.s(r);
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				this.#activeTasks.delete(taskId);
				this.#cUp();
				if (p.e) { p.e(jqXHR, textStatus, errorThrown); } else {
					this.#stt.e(jqXHR, textStatus, errorThrown);
				}
			}
		});
	}
	async _performUpload(task) {
		const { p, taskId } = task;
		if (typeof p !== 'object' || p === null ) {
			this.#activeTasks.delete(taskId);
			this.#cUp();
			const error = 'Invalid parameters; expected an object with valid data';
			if (p.e) { p.e(null, 'error', error); } else { this.#stt.e(null, 'error', error); }
			return;
		}
		const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
		const formData = this.#createFormData(p.d);
		if (p.d.text instanceof Blob) {
			 formData.delete('text');
			 formData.append('text', p.d.text, `${uniqueId}.png`);
		}
		if (p.d.video instanceof Blob) {
			let videoUrl;
			try {
				videoUrl = URL.createObjectURL(p.d.video);
				const video = document.createElement('video');
				video.src = videoUrl;
				video.muted = true;
				const thumbBlob = await new Promise((resolve, reject) => {
					video.onloadedmetadata = () => {
						const seekTime = Math.min(2, video.duration / 2);
						video.currentTime = seekTime;
					};
					video.onseeked = () => {
						const canvas = document.createElement('canvas');
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;
						const ctx = canvas.getContext('2d');
						ctx.drawImage(video, 0, 0);
						canvas.toBlob((blob) => {
							resolve(blob);
						}, 'image/png');
					};
					video.onerror = () => reject('Video load failed');
					video.load();
				});
				formData.append('image', thumbBlob, `${uniqueId}.png`);
			} catch (err) {
				callError(`Error in video upload: ${err}`);
				this.#activeTasks.delete(taskId);
				this.#cUp();
				if (p.e) { p.e(null, 'error', err); } else { this.#stt.e(null, 'error', err); }
				return;
			} finally {
				if (videoUrl) { URL.revokeObjectURL(videoUrl); }
			}
		}
		formData.append('token', utk);
		this.#performAjaxUpload(formData, task);
	}
	upload(p = {}) {
		return this.#enqU('upload', p);
	}
	reloadCss(f) {
		 $('head').append('<link rel="stylesheet" href="'+f+'?v='+Math.random()+'" type="text/css" />');
	}
}
  window.PluginHelper = PluginHelper;
})();
 (function($) { $.fn.colorPick = function(config) { return new $.colorPick(this, config || {}); }; $.colorPick = function(element, options) { options = options || {}; this.options = $.extend({}, $.fn.colorPick.defaults, options); if (options.str) { this.options.str = $.extend({}, $.fn.colorPick.defaults.str, options.str); } $.fn.colorPick.defaults = this.options; elm = $(element); return this.init(); }; $.fn.colorPick.defaults = { 'lang_color': '', 'lang_reset': '', 'lang_save': '', 'lang_custom': '', }; $.colorPick.prototype = { init: function() { var self = this; $('.pm_color_settings').each(function() { var square = $(this); var id = square.attr('id'); var z = square.attr('zone'); var m = square.attr('mode'); var c = ''; if (m == 1) { c = self.colorGet(z); self.colorSet(z, c); } if (m == 2) { c = self.bgGet(z); self.bgSet(z, c); } self.set(this, '#' + id, m, c); $('.delete_btn').click(function(event) { setPvColReload(); return false; }); square.click(function(event) { self.show(); var picker = new ui.ColorPicker; picker.el.appendTo('#picker'); picker.on('change', function(color) { $(square).attr('data-color', color); $('#my_new_color').val(color); c = $('#my_new_color').val(); if (m == 1) { self.colorSet(z, c); } if (m == 2) { self.bgSet(z, c); } }); $('.custom_col_btn').click(function(event) { c = $('#my_new_color').val(); self.set(square, z, m, c); return false; }); $('.reset_btn').click(function(event) { self.set(square, z, m, ''); return false; }); $('.pm_color_selector').click(function(event) { c = self.bgGet(event.target); self.set(square, z, m, c); return false; }); return false; }); }); return this; }, show: function() { overModal('<div class="pad_box"><div class="pm_edit_color"><div class="user_color" data="bgif_28_uid_1"><div class="reg_menu_container tmargin10"><div class="reg_menu"><ul><li class="reg_menu_item rselected" data="color_tab" data-z="reg_color">' + $.fn.colorPick.defaults.lang_color + '</li> <li class="reg_menu_item" data="color_tab" data-z="sett_color">' + $.fn.colorPick.defaults.lang_custom + '</li></ul></div></div><div id="color_tab"> <div id="reg_color" class="reg_zone vpad5"></div><div id="sett_color" class="reg_zone vpad5 hide_zone"></div></div></div> <div class="clear"></div></div></div>'); for (let i = 1; i < 33; i++) { $("#reg_color").append('<div class="pm_color_selector color_switch pboxcolor' + i + '" color="bcback' + i + ' "></div>'); } $("#reg_color").append('<div class="clear"></div><div class="tpad10"><button class="reset_btn theme_btn small_button ">' + $.fn.colorPick.defaults.lang_reset + '</button></div>'); $("#sett_color").append('<div class="boom_form"><input type="hidden" id="my_new_color"><div id="picker"></div><div class="tpad10"><button class="custom_col_btn theme_btn small_button ">' + $.fn.colorPick.defaults.lang_save + '</button> <button class="reset_btn theme_btn small_button ">' + $.fn.colorPick.defaults.lang_reset + '</button></div>'); }, set: function(el, z, m, c) { this.bgSet(el, c); $(el).attr('data-color', c); let tc = $(el).attr('data-target'); $('#'+tc).val(c); if (m == 1) { this.colorSet(z, c); } if (m == 2) { this.bgSet(z, c); } hideOver(); }, storeItem: function(item, data) { window.localStorage.setItem(item, data); }, getStoreItem: function(item) { return window.localStorage.getItem(item); }, removeStoreItem: function(name) { window.localStorage.removeItem(item); }, colorSet: function(t, c) { return $(t).css({ 'color': c }); }, bgSet: function(t, c) { return $(t).css({ 'background-color': c }); }, bgGet: function(t) { return $(t).css('background-color'); }, colorGet: function(t) { return $(t).css('color'); }, randomInteger: function(max) { return Math.floor(Math.random() * (max + 1)); }, randomRgbColor: function() { let r = this.randomInteger(255); let g = this.randomInteger(255); let b = this.randomInteger(255); return [r, g, b]; }, randomColor: function() { let [r, g, b] = this.randomRgbColor(); let hr = r.toString(16).padStart(2, '0'); let hg = g.toString(16).padStart(2, '0'); let hb = b.toString(16).padStart(2, '0'); return "#" + hr + hg + hb; }, }; $(document).ready(function() {}); }(jQuery));
var ui = {}; ;(function(exports){ exports.Emitter = Emitter; function Emitter() { this.callbacks = {}; }; Emitter.prototype.on = function(event, fn){ (this.callbacks[event] = this.callbacks[event] || []) .push(fn); return this; }; Emitter.prototype.once = function(event, fn){ var self = this; function on() { self.off(event, on); fn.apply(this, arguments); } this.on(event, on); return this; }; Emitter.prototype.off = function(event, fn){ var callbacks = this.callbacks[event]; if (!callbacks) return this; if (1 == arguments.length) { delete this.callbacks[event]; return this; } var i = callbacks.indexOf(fn); callbacks.splice(i, 1); return this; }; Emitter.prototype.emit = function(event){ var args = [].slice.call(arguments, 1) , callbacks = this.callbacks[event]; if (callbacks) { for (var i = 0, len = callbacks.length; i < len; ++i) { callbacks[i].apply(this, args) } } return this; }; })(ui); ;(function(exports, html){ exports.ColorPicker = ColorPicker; function rgb(r,g,b) { return 'rgb(' + r + ', ' + g + ', ' + b + ')'; } function rgba(r,g,b,a) { return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'; } function localPos(e) { var offset = $(e.target).offset(); return { x: e.pageX - offset.left , y: e.pageY - offset.top }; } function ColorPicker() { ui.Emitter.call(this); this._colorPos = {}; this.el = $(html); this.main = this.el.find('.main').get(0); this.spectrum = this.el.find('.spectrum').get(0); $(this.main).bind('selectstart', function(e){ e.preventDefault() }); $(this.spectrum).bind('selectstart', function(e){ e.preventDefault() }); this.hue(rgb(255, 0, 0)); this.spectrumEvents(); this.mainEvents(); this.w = 180; this.h = 180; this.render(); } ColorPicker.prototype = new ui.Emitter; ColorPicker.prototype.size = function(n){ return this .width(n) .height(n); }; ColorPicker.prototype.width = function(n){ this.w = n; this.render(); return this; }; ColorPicker.prototype.height = function(n){ this.h = n; this.render(); return this; }; ColorPicker.prototype.spectrumEvents = function(){ var self = this , canvas = $(this.spectrum) , down; function update(e) { var offsetY = localPos(e).y , color = self.hueAt(offsetY - 4); self.hue(color.toString()); self.emit('change', color); self._huePos = offsetY; self.render(); } canvas.mousedown(function(e){ e.preventDefault(); down = true; update(e); }); canvas.mousemove(function(e){ if (down) update(e); }); canvas.mouseup(function(){ down = false; }); }; ColorPicker.prototype.mainEvents = function(){ var self = this , canvas = $(this.main) , down; function update(e) { var color; self._colorPos = localPos(e); color = self.colorAt(self._colorPos.x, self._colorPos.y); self.color(color.toString()); self.emit('change', color); self.render(); } canvas.mousedown(function(e){ down = true; update(e); }); canvas.mousemove(function(e){ if (down) update(e); }); canvas.mouseup(function(){ down = false; }); }; ColorPicker.prototype.colorAt = function(x, y){ var data = this.main.getContext('2d').getImageData(x, y, 1, 1).data; return { r: data[0] , g: data[1] , b: data[2] , toString: function(){ return rgb(this.r, this.g, this.b); } }; }; ColorPicker.prototype.hueAt = function(y){ var data = this.spectrum.getContext('2d').getImageData(0, y, 1, 1).data; return { r: data[0] , g: data[1] , b: data[2] , toString: function(){ return rgb(this.r, this.g, this.b); } }; }; ColorPicker.prototype.color = function(color){ if (0 == arguments.length) return this._color; this._color = color; return this; }; ColorPicker.prototype.hue = function(color){ if (0 == arguments.length) return this._hue; this._hue = color; return this; }; ColorPicker.prototype.render = function(options){ options = options || {}; this.renderMain(options); this.renderSpectrum(options); }; ColorPicker.prototype.renderSpectrum = function(options){ var el = this.el , canvas = this.spectrum , ctx = canvas.getContext('2d') , pos = this._huePos , w = this.w * .12 , h = this.h; canvas.width = w; canvas.height = h; var grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, rgb(255, 0, 0)); grad.addColorStop(.15, rgb(255, 0, 255)); grad.addColorStop(.33, rgb(0, 0, 255)); grad.addColorStop(.49, rgb(0, 255, 255)); grad.addColorStop(.67, rgb(0, 255, 0)); grad.addColorStop(.84, rgb(255, 255, 0)); grad.addColorStop(1, rgb(255, 0, 0)); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h); if (!pos) return; ctx.fillStyle = rgba(0,0,0, .3); ctx.fillRect(0, pos, w, 1); ctx.fillStyle = rgba(255,255,255, .3); ctx.fillRect(0, pos + 1, w, 1); }; ColorPicker.prototype.renderMain = function(options){ var el = this.el , canvas = this.main , ctx = canvas.getContext('2d') , w = this.w , h = this.h , x = (this._colorPos.x || w) + .5 , y = (this._colorPos.y || 0) + .5; canvas.width = w; canvas.height = h; var grad = ctx.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, rgb(255, 255, 255)); grad.addColorStop(1, this._hue); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h); grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, rgba(255, 255, 255, 0)); grad.addColorStop(1, rgba(0, 0, 0, 1)); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h); var rad = 10; ctx.save(); ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(0,0,0,.5); ctx.arc(x, y, rad / 2, 0, Math.PI * 2, false); ctx.stroke(); ctx.strokeStyle = rgba(255,255,255,.5); ctx.arc(x, y, rad / 2 - 1, 0, Math.PI * 2, false); ctx.stroke(); ctx.beginPath(); ctx.restore(); }; })(ui, "<div class=\"color-picker\">\n  <canvas class=\"main\"></canvas>\n  <canvas class=\"spectrum\"></canvas>\n</div>"); 
(function($) { $.Observe = {}; }(jQuery)); (function($, ns) { var get = function(origin, target) { if(!target) { target = origin; origin = window.document; } var result = []; $(target).each(function() { var selector = []; var prev = $(this); for(var current = prev.parent(); current.length && !prev.is(origin); current = current.parent()) { var tag = prev.get(0).tagName.toLowerCase(); selector.push(tag + ':eq(' + current.children(tag).index(prev) + ')'); prev = current; } if(!current.length && !prev.is(origin)) { return; } result.push('> ' + selector.reverse().join(' > ')); }); return result.join(', '); }; var capture = function(origin, target) { if(!target) { target = origin; origin = window.document; } var result = []; $(target).each(function() { var textIndex = -1; var realTarget = this; if(this instanceof Text) { realTarget = this.parentNode; var children = realTarget.childNodes; for(var i = 0; i < children.length; i++) { if(children[i] === this) { textIndex = i; break; } } } var path = get(origin, realTarget); var same = $(origin).is(realTarget); result.push(function(origin) { var target = same ? origin : $(origin).find(path); return textIndex === -1 ? target : target.contents()[textIndex]; }); }); return function(origin) { origin = origin || window.document; return result.reduce(function(acc, fn) { return acc.add(fn(origin)); }, $([])); }; }; ns.path = { get: get, capture: capture }; }(jQuery, jQuery.Observe)); (function($, ns) { var Branch = function(root) { this.original = $(root); this.root = this.original.clone(false, true); }; Branch.prototype.find = function(selector) { var path = ns.path.capture(this.original, selector); return path(this.root); }; ns.Branch = Branch; }(jQuery, jQuery.Observe)); (function($, ns) { var toObject = function(array, fn) { var result = {}; array.forEach(function(name) { var pair = fn(name); if(pair) { result[pair[0]] = pair[1]; } }); return result; }; var OBSERVER_OPTIONS = toObject([ 'childList', 'attributes', 'characterData', 'subtree', 'attributeOldValue', 'characterDataOldValue', 'attributeFilter' ], function(name) { return [name.toLowerCase(), name]; }); var ALL = toObject(Object.keys(OBSERVER_OPTIONS), function(name) { if(name !== 'attributefilter') { return [OBSERVER_OPTIONS[name], true]; } }); var EXTENDED_OPTIONS = toObject([ 'added', 'removed' ], function(name) { return [name.toLowerCase(), name]; }); var EMPTY = $([]); var parseOptions = function(options) { if(typeof options === 'object') { return options; } options = options.split(/\s+/); var result = {}; options.forEach(function(opt) { opt = opt.toLowerCase(); if(!OBSERVER_OPTIONS[opt] && !EXTENDED_OPTIONS[opt]) { throw new Error('Unknown option ' + opt); } result[OBSERVER_OPTIONS[opt] || EXTENDED_OPTIONS[opt]] = true; }); return result; }; var objectToString = function(obj) { return '[' + Object.keys(obj).sort().reduce(function(acc, key) { var valueStr = (obj[key] && typeof obj[key] === 'object') ? objectToString(obj[key]) : obj[key]; return acc + '[' + JSON.stringify(key) + ':' + valueStr + ']'; }, '') + ']'; }; var MutationObserver = window.MutationObserver || window.WebKitMutationObserver; var Pattern = function(target, options, selector, handler) { this._originalOptions = $.extend({}, options); options = $.extend({}, options); this.attributeFilter = options.attributeFilter; delete options.attributeFilter; if(selector) { options.subtree = true; } if(options.childList) { options.added = true; options.removed = true; } if(options.added || options.removed) { options.childList = true; } this.target = $(target); this.options = options; this.selector = selector; this.handler = handler; }; Pattern.prototype.is = function(options, selector, handler) { return objectToString(this._originalOptions) === objectToString(options) && this.selector === selector && this.handler === handler; }; Pattern.prototype.match = function(record) { var self = this; var options = this.options; var type = record.type; if(!this.options[type]) { return EMPTY; } if(this.selector) { switch(type) { case 'attributes': if(!this._matchAttributeFilter(record)) { break; } case 'characterData': return this._matchAttributesAndCharacterData(record); case 'childList': if(record.addedNodes && record.addedNodes.length && options.added) { var result = this._matchAddedNodes(record); if(result.length) { return result; } } if(record.removedNodes && record.removedNodes.length && options.removed) { return this._matchRemovedNodes(record); } } } else { var recordTarget = record.target instanceof Text ? $(record.target).parent() : $(record.target); if(!options.subtree && recordTarget.get(0) !== this.target.get(0)) { return EMPTY; } switch(type) { case 'attributes': if(!this._matchAttributeFilter(record)) { break; } case 'characterData': return this.target; case 'childList': if((record.addedNodes && record.addedNodes.length && options.added) || (record.removedNodes && record.removedNodes.length && options.removed)) { return this.target; } } } return EMPTY; }; Pattern.prototype._matchAttributesAndCharacterData = function(record) { return this._matchSelector(this.target, [record.target]); }; Pattern.prototype._matchAddedNodes = function(record) { return this._matchSelector(this.target, record.addedNodes); }; Pattern.prototype._matchRemovedNodes = function(record) { var branch = new ns.Branch(this.target); var nodes = Array.prototype.slice.call(record.removedNodes).map(function(node) { return node.cloneNode(true); }); if(record.previousSibling) { branch.find(record.previousSibling).after(nodes); } else if(record.nextSibling) { branch.find(record.nextSibling).before(nodes); } else { branch.find(record.target).empty().append(nodes); } return this._matchSelector(branch.root, nodes).length ? $(record.target) : EMPTY; }; Pattern.prototype._matchSelector = function(origin, element) { var match = origin.find(this.selector); element = Array.prototype.slice.call(element); match = match.filter(function() { var self = this; return element.some(function(node) { if(node instanceof Text) return node.parentNode === self; else return node === self || $(node).has(self).length; }); }); return match; }; Pattern.prototype._matchAttributeFilter = function(record) { if(this.attributeFilter && this.attributeFilter.length) { return this.attributeFilter.indexOf(record.attributeName) >= 0; } return true; }; var Observer = function(target) { this.patterns = []; this._target = target; this._observer = null; }; Observer.prototype.observe = function(options, selector, handler) { var self = this; if(!this._observer) { this._observer = new MutationObserver(function(records) { records.forEach(function(record) { self.patterns.forEach(function(pattern) { var match = pattern.match(record); if(match.length) { match.each(function() { pattern.handler.call(this, record); }); } }); }); }); } else { this._observer.disconnect(); } this.patterns.push(new Pattern(this._target, options, selector, handler)); this._observer.observe(this._target, this._collapseOptions()); }; Observer.prototype.disconnect = function(options, selector, handler) { var self = this; if(this._observer) { this.patterns.filter(function(pattern) { return pattern.is(options, selector, handler); }).forEach(function(pattern) { var index = self.patterns.indexOf(pattern); self.patterns.splice(index, 1); }); if(!this.patterns.length) { this._observer.disconnect(); } } }; Observer.prototype.disconnectAll = function() { if(this._observer) { this.patterns = []; this._observer.disconnect(); } }; Observer.prototype.pause = function() { if(this._observer) { this._observer.disconnect(); } }; Observer.prototype.resume = function() { if(this._observer) { this._observer.observe(this._target, this._collapseOptions()); } }; Observer.prototype._collapseOptions = function() { var result = {}; this.patterns.forEach(function(pattern) { var restrictiveFilter = result.attributes && result.attributeFilter; if((restrictiveFilter || !result.attributes) && pattern.attributeFilter) { var attributeFilter = (result.attributeFilter || []).concat(pattern.attributeFilter); var existing = {}; var unique = []; attributeFilter.forEach(function(attr) { if(!existing[attr]) { unique.push(attr); existing[attr] = 1; } }); result.attributeFilter = unique; } else if(restrictiveFilter && pattern.options.attributes && !pattern.attributeFilter) { delete result.attributeFilter; } $.extend(result, pattern.options); }); Object.keys(EXTENDED_OPTIONS).forEach(function(name) { delete result[EXTENDED_OPTIONS[name]]; }); return result; }; var DOMEventObserver = function(target) { this.patterns = []; this._paused = false; this._target = target; this._events = {}; this._handler = this._handler.bind(this); }; DOMEventObserver.prototype.NS = '.jQueryObserve'; DOMEventObserver.prototype.observe = function(options, selector, handler) { var pattern = new Pattern(this._target, options, selector, handler); var target = $(this._target); if(pattern.options.childList) { this._addEvent('DOMNodeInserted'); this._addEvent('DOMNodeRemoved'); } if(pattern.options.attributes) { this._addEvent('DOMAttrModified'); } if(pattern.options.characterData) { this._addEvent('DOMCharacerDataModified'); } this.patterns.push(pattern); }; DOMEventObserver.prototype.disconnect = function(options, selector, handler) { var target = $(this._target); var self = this; this.patterns.filter(function(pattern) { return pattern.is(options, selector, handler); }).forEach(function(pattern) { var index = self.patterns.indexOf(pattern); self.patterns.splice(index, 1); }); var eventsInUse = this.patterns.reduce(function(acc, pattern) { if(pattern.options.childList) { acc.DOMNodeInserted = true; acc.DOMNodeRemoved = true; } if(pattern.options.attributes) { acc.DOMAttrModified = true; } if(pattern.options.characterData) { acc.DOMCharacerDataModified = true; } return acc; }, {}); Object.keys(this._events).forEach(function(type) { if(eventsInUse[type]) { return; } delete self._events[type]; target.off(type + self.NS, self._handler); }); }; DOMEventObserver.prototype.disconnectAll = function() { var target = $(this._target); for(var name in this._events) { target.off(name + this.NS, this._handler); } this._events = {}; this.patterns = []; }; DOMEventObserver.prototype.pause = function() { this._paused = true; }; DOMEventObserver.prototype.resume = function() { this._paused = false; }; DOMEventObserver.prototype._handler = function(e) { if(this._paused) { return; } var record = { type: null, target: null, addedNodes: null, removedNodes: null, previousSibling: null, nextSibling: null, attributeName: null, attributeNamespace: null, oldValue: null }; switch(e.type) { case 'DOMAttrModified': record.type = 'attributes'; record.target = e.target; record.attributeName = e.attrName; record.oldValue = e.prevValue; break; case 'DOMCharacerDataModified': record.type = 'characterData'; record.target = $(e.target).parent().get(0); record.attributeName = e.attrName; record.oldValue = e.prevValue; break; case 'DOMNodeInserted': record.type = 'childList'; record.target = e.relatedNode; record.addedNodes = [e.target]; record.removedNodes = []; break; case 'DOMNodeRemoved': record.type = 'childList'; record.target = e.relatedNode; record.addedNodes = []; record.removedNodes = [e.target]; break; } for(var i = 0; i < this.patterns.length; i++) { var pattern = this.patterns[i]; var match = pattern.match(record); if(match.length) { match.each(function() { pattern.handler.call(this, record); }); } } }; DOMEventObserver.prototype._addEvent = function(type) { if(!this._events[type]) { $(this._target).on(type + this.NS, this._handler); this._events[type] = true; } }; ns.Pattern = Pattern; ns.MutationObserver = Observer; ns.DOMEventObserver = DOMEventObserver; $.fn.observe = function(options, selector, handler) { if(!selector) { handler = options; options = ALL; } else if(!handler) { handler = selector; selector = null; } return this.each(function() { var self = $(this); var observer = self.data('observer'); if(!observer) { if(MutationObserver) { observer = new Observer(this); } else { observer = new DOMEventObserver(this); } self.data('observer', observer); } options = parseOptions(options); observer.observe(options, selector, handler); }); }; $.fn.disconnect = function(options, selector, handler) { if(!options) { } else if(!selector) { handler = options; options = ALL; } else if(!handler) { handler = selector; selector = null; } return this.each(function() { var self = $(this); var observer = self.data('observer'); if(!observer) { return; } if(!options) { observer.disconnectAll(); self.removeData('observer'); return; } options = parseOptions(options); observer.disconnect(options, selector, handler); }); }; }(jQuery, jQuery.Observe)); 
(() => { "use strict"; var e = { 156: (e, t, n) => { t.y = void 0; var o = n(185), a = n(410), i = n(369); t.y = function(e, t) { e.id || e.setAttribute("id", (0, o.generateId)()); var n = e.id, l = (0, a.loadOptions)(t), r = l.option, c = l.callback, u = l.template, s = l.language, d = r("stories") || [], v = {}, m = function(e, t) { try { if (r("localStorage") && (0, o.hasWindow)()) { var a = "zuck-".concat(n, "-").concat(e); window.localStorage[a] = JSON.stringify(t) } } catch (e) {} }, f = function(e) { if (r("localStorage") && (0, o.hasWindow)()) { let t = "zuck-".concat(n, "-").concat(e); return window.localStorage[t] ? JSON.parse(window.localStorage[t]) : void 0 } }; v.seenItems = f("seenItems") || {}; var p = function(e, t, n) { var o = null == t ? void 0 : t[1], a = null == t ? void 0 : t[0]; if (!o || !a) return !1; var i = v.currentVideoElement; if (i && i.pause(), "video" === o.getAttribute("data-type")) { var l = o.querySelector("video"); if (!l) return v.currentVideoElement = void 0, !1; var r = function() { var e = l.duration, t = a.querySelector(".progress"); + l.dataset.length && (e = +l.dataset.length), e && t && (t.style.animationDuration = "".concat(e, "s")) }; r(), l.addEventListener("loadedmetadata", r), v.currentVideoElement = l, l.play(); try { h(l, e) } catch (e) { console.warn("Could not unmute video", n) } } else v.currentVideoElement = void 0 }, y = function(e) { return d.findIndex((function(t) { return t.id === e })) }, g = function() { var e = v.currentVideoElement; if (e) try { e.pause() } catch (e) {} }, h = function(e, t) { e.muted = !1, e.volume = 1, e.removeAttribute("muted"), e.play(), e.paused && (e.muted = !0, e.play()), t && (null == t || t.classList.remove("paused")) }, w = function(e, t) { var a = (null == e ? void 0 : e.getAttribute("data-id")) || "", i = y(a), l = document.querySelectorAll("#".concat(n, ' [data-id="').concat(a, '"] .items > li')), u = []; if (!r("reactive") || t) { l.forEach((function(e) { let t = e.firstElementChild, n = null == t ? void 0 : t.firstElementChild, a = null == t ? void 0 : t.parentElement, i = { id: (null == t ? void 0 : t.getAttribute("data-id")) || (null == a ? void 0 : a.getAttribute("data-id")), src: null == t ? void 0 : t.getAttribute("href"), length: (0, o.safeNum)(null == t ? void 0 : t.getAttribute("data-length")), type: null == t ? void 0 : t.getAttribute("data-type"), time: (null == t ? void 0 : t.getAttribute("data-time")) || (null == a ? void 0 : a.getAttribute("data-time")), link: (null == t ? void 0 : t.getAttribute("data-link")) || "", linkText: null == t ? void 0 : t.getAttribute("data-linkText"), preview: null == n ? void 0 : n.getAttribute("src"), seen: null == a ? void 0 : a.classList.contains("seen") }, l = null == t ? void 0 : t.attributes, r = ["data-id", "href", "data-length", "data-type", "data-time", "data-link", "data-linkText"]; if (l) for (var c = 0; c < l.length; c++) - 1 === r.indexOf(l[c].nodeName) && (i[l[c].nodeName.replace("data-", "")] = null == l ? void 0 : l[c].nodeValue); u.push(i) })), d[i].items = u; var s = c("onDataUpdate"); s && s(d, (function() {})) } }, S = function(e) { let t, n, a = (null == e ? void 0 : e.getAttribute("data-id")) || "", i = y(a), l = !1; v.seenItems[a] && (l = !0); try { var r = {}; - 1 !== i && (r = d[i]), r.id = a, r.photo = null == e ? void 0 : e.getAttribute("data-photo"), r.name = null === (t = null == e ? void 0 : e.querySelector(".name")) || void 0 === t ? void 0 : t.innerText, r.link = null === (n = null == e ? void 0 : e.querySelector(".item-link")) || void 0 === n ? void 0 : n.getAttribute("href"), r.lastUpdated = (0, o.safeNum)((null == e ? void 0 : e.getAttribute("data-last-updated")) || (null == e ? void 0 : e.getAttribute("data-time"))), r.seen = l, r.items || (r.items = []), -1 === i ? d.push(r) : d[i] = r } catch (e) { d[i] = { items: [] } } e && (e.onclick = function(e) { e.preventDefault(), T.show(a) }); var u = c("onDataUpdate"); u && u(d, (function() {})) }, k = function(t, a) { var i, l, c, s, d = t.id || "", f = document.querySelector("#".concat(n, ' [data-id="').concat(d, '"]')), p = t.items, y = null, g = void 0; if ((null == p ? void 0 : p[0]) && (g = (null === (i = null == p ? void 0 : p[0]) || void 0 === i ? void 0 : i.preview) || ""), !0 === v.seenItems[d] && (t.seen = !0), t && (t.currentPreview = g), f) y = f; else { var h = document.createElement("div"); h.innerHTML = u("timelineItem")(t), y = h.firstElementChild }!1 === t.seen && (v.seenItems[d] = !1, m("seenItems", v.seenItems)), null == y || y.setAttribute("data-id", d), t.photo && (null == y || y.setAttribute("data-photo", t.photo)), null == y || y.setAttribute("data-time", null === (l = t.time) || void 0 === l ? void 0 : l.toString()), t.lastUpdated ? null == y || y.setAttribute("data-last-updated", null === (c = t.lastUpdated) || void 0 === c ? void 0 : c.toString()) : null == y || y.setAttribute("data-last-updated", null === (s = t.time) || void 0 === s ? void 0 : s.toString()), S(y), f || r("reactive") || (a ? e.appendChild(y) : (0, o.prepend)(e, y)), null == p || p.forEach((function(e) { x(d, e, a) })), a || N() }, b = k, L = function() { T.next() }, E = function(e) { let t, o = document.querySelector("#".concat(n, ' > [data-id="').concat(e, '"]')); null === (t = null == o ? void 0 : o.parentNode) || void 0 === t || t.removeChild(o) }, x = function(e, t, a) { var i = document.querySelector("#".concat(n, ' > [data-id="').concat(e, '"]')); if (!r("reactive")) { var l = document.createElement("li"), c = null == i ? void 0 : i.querySelectorAll(".items")[0]; t.id && (l.className = t.seen ? "seen" : "", l.setAttribute("data-id", t.id)), l.innerHTML = u("timelineStoryItem")(t), a ? null == c || c.appendChild(l) : (0, o.prepend)(c, l) } w(i) }, q = function(e, t) { var o, a = document.querySelector("#".concat(n, ' > [data-id="').concat(e, '"] [data-id="').concat(t, '"]')); r("reactive") || (null === (o = null == a ? void 0 : a.parentNode) || void 0 === o || o.removeChild(a), d.forEach((function(n) { n.id === e && (n.items = n.items.filter((function(e) { return e.id !== t }))) }))) }, I = function(e, t) { var n = v.currentStory, a = y(v.currentStory), i = d[a].currentItem, l = document.querySelector('#zuck-modal .story-viewer[data-story-id="'.concat(n, '"]')), u = "previous" === e ? -1 : 1; if (!l) return !1; var s = l.querySelectorAll('[data-index="'.concat(i, '"]')), m = s[0], f = s[1], g = i + u, h = l.querySelectorAll('[data-index="'.concat(g, '"]')), w = h[0], S = h[1]; if (l && w && S) { var k = c("onNavigateItem"); (k = c(k ? "onNavigateItem" : "onNextItem"))(n, S.getAttribute("data-story-id"), (function() { "previous" === e ? (null == m || m.classList.remove("seen"), null == f || f.classList.remove("seen")) : (null == m || m.classList.add("seen"), null == f || f.classList.add("seen")), null == m || m.classList.remove("active"), null == f || f.classList.remove("active"), null == w || w.classList.remove("seen"), null == w || w.classList.add("active"), null == S || S.classList.remove("seen"), null == S || S.classList.add("active"), l.querySelectorAll(".time").forEach((function(e) { e.innerText = (0, o.timeAgo)(Number(S.getAttribute("data-time")), r("language")) })), d[a].currentItem = d[a].currentItem + u; var n = S.querySelector("video"); n && (n.currentTime = 0), p(l, h, t) })) } else l && "previous" !== e && T.next(); return !0 }, A = I, N = function() { document.querySelectorAll("#".concat(n, " .story.seen")).forEach((function(e) { let t = null == e ? void 0 : e.getAttribute("data-id"), n = y(t); if (t) { var o = d[n], a = null == e ? void 0 : e.parentNode; !r("reactive") && a && a.removeChild(e), b(o, !0) } })) }, z = function() { if (e && e.querySelector(".story") && e.querySelectorAll(".story").forEach((function(e) { S(e), w(e) })), r("backNative") && (0, o.hasWindow)() && (window.location.hash === "#!".concat(n) && (window.location.hash = ""), window.addEventListener("popstate", (function() { window.location.hash !== "#!".concat(n) && (window.location.hash = "") }), !1)), !r("reactive")) { let t = f("seenItems"); t && Object.entries(t).forEach((function(e) { var n = e[1]; n && d[n] && (d[n].seen = !!t[n]) })) } r("stories").forEach((function(e) { k(e, !0) })), N(); var a = r("avatars") ? "user-icon" : "story-preview", i = r("list") ? "list" : "carousel", l = r("rtl") ? "rtl" : ""; return e.className += " stories ".concat(a, " ").concat(i, " ").concat("".concat(r("skin")).toLowerCase(), " ").concat(l), { id: n, option: r, callback: c, template: u, language: s, navigateItem: A, saveLocalData: m, getLocalData: f, data: d, internalData: v, add: k, update: b, next: L, remove: E, addItem: x, removeItem: q, nextItem: I, findStoryIndex: y, updateStorySeenPosition: N, playVideoItem: p, pauseVideoItem: g, unmuteVideoItem: h } }(), T = (0, i.modal)(z); return z }, t.default = t.y }, 369: (e, t, n) => { t.__esModule = !0, t.modal = void 0; let o = n(185); t.modal = function(e) { let t = e.id, n = document.querySelector("#zuck-modal"); n || e.hasModal || (e.hasModal = !0, (n = document.createElement("div")).id = "zuck-modal", e.option("cubeEffect") && (n.className = "with-cube"), n.innerHTML = '<div id="zuck-modal-content"></div>', n.style.display = "none", n.setAttribute("tabIndex", "1"), n.onkeyup = function(e) { let t = e.keyCode; 27 === t ? n.modal.close() : 13 !== t && 32 !== t || n.modal.next() }, e.option("openEffect") && (null == n || n.classList.add("with-effects")), e.option("rtl") && (null == n || n.classList.add("rtl")), (0, o.onTransitionEnd)(n, (function() { var e = document.querySelector("#zuck-modal-content"); (null == n ? void 0 : n.classList.contains("closed")) && (e && (e.innerHTML = ""), n.style.display = "none", n.classList.remove("closed"), n.classList.remove("animated")) })), document.body.appendChild(n)); var a = function(t, n, o, a) { var i; if (!(void 0 === n || n && isNaN(n))) { var l = n > 0 ? 1 : -1, r = (null === (i = document.querySelector("#zuck-modal")) || void 0 === i ? void 0 : i.offsetWidth) || 1, c = Math.abs(n) / r * 90 * l; if (e.option("cubeEffect")) { var u = 0 === c ? "scale(0.95)" : "scale(0.930,0.930)", s = document.querySelector("#zuck-modal-content"); if (s && (s.style.transform = u), c < -90 || c > 90) return !1 } var d = e.option("cubeEffect") ? "rotateY(".concat(c, "deg)") : "translate3d(".concat(n, "px, 0, 0)"); t && (a && (t.style.transitionTimingFunction = a), t.style.transitionDuration = "".concat(o, "ms"), t.style.transform = d) } }, i = function(e, t) { var n = document, o = e; try { t ? (n.fullscreenElement || n.webkitFullscreenElement || n.mozFullScreenElement || n.msFullscreenElement) && (n.exitFullscreen ? n.exitFullscreen().catch((function() {})) : n.mozCancelFullScreen && n.mozCancelFullScreen().catch((function() {}))) : o.requestFullscreen ? o.requestFullscreen() : o.msRequestFullscreen ? o.msRequestFullscreen() : o.mozRequestFullScreen ? o.mozRequestFullScreen() : o.webkitRequestFullscreen && o.webkitRequestFullscreen() } catch (e) { console.warn("[Zuck.js] Can't access fullscreen") } }, l = function(n) { let i = document.querySelector("#zuck-modal"), l = document.querySelector("#zuck-modal-slider-".concat(t)), u = "", s = "", d = 0, v = { previous: document.querySelector("#zuck-modal .story-viewer.previous"), next: document.querySelector("#zuck-modal .story-viewer.next"), viewing: document.querySelector("#zuck-modal .story-viewer.viewing") }; if ((!v.previous && !n || !v.next && n) && !e.option("rtl")) return !1; n ? (u = "next", s = "previous") : (u = "previous", s = "next"); e.option("cubeEffect") ? "previous" === u ? d = (0, o.safeNum)(null == i ? void 0 : i.slideWidth) : "next" === u && (d = -1 * (0, o.safeNum)(null == i ? void 0 : i.slideWidth)) : d = -1 * (0, o.findPos)(v[u])[0], a(l, d, 600, null), setTimeout((function() { let t, n, i, d, m, f, p, y, g, h; if (e.option("rtl")) { var w = u; u = s, s = w } if ("" !== u && v[u] && "" !== s) { var S = null === (t = v[u]) || void 0 === t ? void 0 : t.getAttribute("data-story-id"); e.internalData.currentStory = S; var k = document.querySelector("#zuck-modal .story-viewer.".concat(s)); k && (null === (n = null == k ? void 0 : k.parentNode) || void 0 === n || n.removeChild(k)), v.viewing && (null === (i = v.viewing) || void 0 === i || i.classList.add("stopped"), null === (d = v.viewing) || void 0 === d || d.classList.add(s), null === (m = v.viewing) || void 0 === m || m.classList.remove("viewing")), v[u] && (null === (f = v[u]) || void 0 === f || f.classList.remove("stopped"), null === (p = v[u]) || void 0 === p || p.classList.remove(u), null === (y = v[u]) || void 0 === y || y.classList.add("viewing")); var b = c(u); b && r(b, u); var L = e.internalData.currentStory, E = e.findStoryIndex(L), x = document.querySelector('#zuck-modal [data-story-id="'.concat(L, '"]')), q = void 0; if (x) { var I = null === (g = null == (q = x.querySelectorAll("[data-index].active")) ? void 0 : q[0]) || void 0 === g ? void 0 : g.firstElementChild; e.data[E].currentItem = (0, o.safeNum)(null === (h = null == q ? void 0 : q[0]) || void 0 === h ? void 0 : h.getAttribute("data-index")), (null == q ? void 0 : q[0]) && (q[0].innerHTML = e.template("viewerItemPointerProgress")(I.style.cssText), (0, o.onAnimationEnd)(I, (function() { e.nextItem() }))) } if (a(l, 0, 0, null), q) { var A = document.querySelector('#zuck-modal .story-viewer[data-story-id="'.concat(S, '"]')); e.playVideoItem(A, q) } e.callback("onView")(e.internalData.currentStory) } }), 650) }, r = function(a, i, l) { var r = document.querySelector("#zuck-modal-slider-".concat(t)), c = a.items; a.time = c && (null == c ? void 0 : c[0].time); var u = "", s = "", d = a.id, v = document.createElement("div"), m = a.currentItem || 0; if (document.querySelector('#zuck-modal .story-viewer[data-story-id="'.concat(d, '"]'))) return !1; v.className = "slides", c.forEach((function(t, n) { m > n && (a.items[n].seen = !0, t.seen = !0), s += e.template("viewerItemPointer")(n, m, t), u += e.template("viewerItemBody")(n, m, t) })), v.innerHTML = u; var f = v.querySelector("video"), p = function(e) { e.muted ? null == g || g.classList.add("muted") : null == g || g.classList.remove("muted") }; f && (f.onwaiting = function() { f.paused && (null == g || g.classList.add("paused"), null == g || g.classList.add("loading")) }, f.onplay = function() { p(f), null == g || g.classList.remove("stopped"), null == g || g.classList.remove("paused"), null == g || g.classList.remove("loading") }, f.onload = f.onplaying = f.oncanplay = function() { p(f), null == g || g.classList.remove("loading") }, f.onvolumechange = function() { p(f) }); var y = document.createElement("div"); y.innerHTML = e.template("viewerItem")(a, c[m]); var g = y.firstElementChild, h = g.querySelector(".slides-pointers .wrap"); g.className = "story-viewer muted ".concat(i, " ").concat(l ? "" : "stopped", " ").concat(e.option("backButton") ? "with-back-button" : ""), d && g.setAttribute("data-story-id", d), h && (h.innerHTML = s), g.querySelectorAll(".close, .back").forEach((function(e) { e.onclick = function(e) { e.preventDefault(), n.modal.close() } })), g.appendChild(v), "viewing" === i && e.playVideoItem(g, g.querySelectorAll('[data-index="'.concat(m, '"].active')), void 0), g.querySelectorAll(".slides-pointers [data-index] > .progress").forEach((function(t) { (0, o.onAnimationEnd)(t, (function() { e.nextItem(void 0) })) })), r && ("previous" === i ? (0, o.prepend)(r, g) : r.appendChild(g)) }, c = function(n) { var o = e.internalData.currentStory; if (o && "" !== n) { var a = document.querySelector("#".concat(t, ' [data-id="').concat(o, '"]')), i = "previous" === n ? a.previousElementSibling : a.nextElementSibling; if (i) { var l = i.getAttribute("data-id"), r = e.findStoryIndex(l); return e.data[r] || !1 } } return !1 }; return n.modal = { show: function(n) { var u = document.querySelector("#zuck-modal"); e.callback("onOpen")(n, (function() { var s = document.querySelector("#zuck-modal-content"); if (s.innerHTML = '<div id="zuck-modal-slider-'.concat(t, '" class="slider"></div>'), s && n) { var d = e.findStoryIndex(n), v = e.data[d], m = v.currentItem || 0; ! function(t) { var n = document.querySelector("#zuck-modal"), i = null, r = null, c = null, u = null, s = void 0, d = void 0, v = function(a) { var l = document.querySelector("#zuck-modal .viewing"), v = document.querySelector("#zuck-modal .story-viewer"); if ("A" !== a.target.nodeName) { var p = a.touches ? a.touches[0] : a, y = (0, o.findPos)(document.querySelector("#zuck-modal .story-viewer.viewing")); n && (n.slideWidth = null == v ? void 0 : v.offsetWidth, n.slideHeight = null == v ? void 0 : v.offsetHeight), i = { x: y[0], y: y[1] }; var g = p.clientX, h = p.clientY; r = { x: g, y: h, time: Date.now(), valid: !0 }, h < 80 || h > (0, o.safeNum)(null == n ? void 0 : n.slideHeight) - 80 ? r.valid = !1 : (a.preventDefault(), c = void 0, u = {}, null == t || t.addEventListener("mousemove", m), null == t || t.addEventListener("mouseup", f), null == t || t.addEventListener("mouseleave", f), null == t || t.addEventListener("touchmove", m), null == t || t.addEventListener("touchend", f), l && (null == l || l.classList.add("paused")), e.pauseVideoItem(), s = setTimeout((function() { l && (null == l || l.classList.add("longPress")) }), 600), d = setTimeout((function() { clearInterval(d), d = void 0 }), 250)) } }, m = function(e) { var n = e.touches ? e.touches[0] : e, l = n.clientX, s = n.clientY; r && r.valid && (u = { x: l - r.x, y: s - r.y }, void 0 === c && (c = !!(c || Math.abs(u.x) < Math.abs(u.y))), !c && r && (e.preventDefault(), a(t, (0, o.safeNum)(null == i ? void 0 : i.x) + (0, o.safeNum)(null == u ? void 0 : u.x), 0, null))) }, f = function(v) { var p = document.querySelector("#zuck-modal .viewing"), y = r, g = r ? Date.now() - r.time : void 0, h = Number(g) < 300 && Math.abs((0, o.safeNum)(null == u ? void 0 : u.x)) > 25 || Math.abs((0, o.safeNum)(null == u ? void 0 : u.x)) > (0, o.safeNum)(null == n ? void 0 : n.slideWidth) / 3, w = (0, o.safeNum)(null == u ? void 0 : u.x) < 0, S = w ? document.querySelector("#zuck-modal .story-viewer.next") : document.querySelector("#zuck-modal .story-viewer.previous"), k = w && !S || !w && !S; if (r && !r.valid); else { u && (c || (h && !k ? l(w) : a(t, (0, o.safeNum)(null == i ? void 0 : i.x), 300)), r = void 0, null == t || t.removeEventListener("mousemove", m), null == t || t.removeEventListener("mouseup", f), null == t || t.removeEventListener("mouseleave", f), null == t || t.removeEventListener("touchmove", m), null == t || t.removeEventListener("touchend", f)); var b = e.internalData.currentVideoElement; if (s && clearInterval(s), p && (e.playVideoItem(p, p.querySelectorAll(".active"), void 0), null == p || p.classList.remove("longPress"), null == p || p.classList.remove("paused")), d) { clearInterval(d), d = void 0; var L = function() { w || ((0, o.safeNum)(null == y ? void 0 : y.x) > document.body.offsetWidth / 3 || !e.option("previousTap") ? e.option("rtl") ? e.navigateItem("previous", v) : e.navigateItem("next", v) : e.option("rtl") ? e.navigateItem("next", v) : e.navigateItem("previous", v)) }, E = document.querySelector("#zuck-modal .viewing"); if (!E || !b) return L(), !1; (null == E ? void 0 : E.classList.contains("muted")) ? (e.unmuteVideoItem(b, E), L()) : L() } } }; null == t || t.addEventListener("touchstart", v), null == t || t.addEventListener("mousedown", v) }(document.querySelector("#zuck-modal-slider-".concat(t))), e.internalData.currentStory = n, v.currentItem = m, e.option("backNative") && (0, o.hasWindow)() && (window.location.hash = "#!".concat(t)); var f = c("previous"); f && r(f, "previous"), r(v, "viewing", !0); var p = c("next"); p && r(p, "next"), e.option("autoFullScreen") && (null == u || u.classList.add("fullscreen")); var y = function() { (null == u ? void 0 : u.classList.contains("fullscreen")) && e.option("autoFullScreen") && document.body.offsetWidth <= 1024 && i(u), null == u || u.focus() }, g = document.querySelector("#zuck-modal .story-viewer"); if (e.option("openEffect") && u) { var h = document.querySelector("#".concat(t, ' [data-id="').concat(n, '"] .item-preview')), w = (0, o.findPos)(h); u.style.marginLeft = "".concat(w[0] + (0, o.safeNum)(null == h ? void 0 : h.offsetWidth) / 2, "px"), u.style.marginTop = "".concat(w[1] + (0, o.safeNum)(null == h ? void 0 : h.offsetHeight) / 2, "px"), u.style.display = "block", u.slideWidth = (null == g ? void 0 : g.offsetWidth) || 0, setTimeout((function() { null == u || u.classList.add("animated") }), 10), setTimeout((function() { y() }), 300) } else u && (u.style.display = "block", u.slideWidth = (null == g ? void 0 : g.offsetWidth) || 0), y(); e.callback("onView")(n) } })) }, next: function() { e.callback("onEnd")(e.internalData.currentStory, (function() { let o = e.internalData.currentStory, a = e.findStoryIndex(o), i = document.querySelector("#".concat(t, ' [data-id="').concat(o, '"]')); i && (null == i || i.classList.add("seen"), e.data[a].seen = !0, e.internalData.seenItems[o] = !0, e.saveLocalData("seenItems", e.internalData.seenItems), e.updateStorySeenPosition()), document.querySelector("#zuck-modal .story-viewer.next") ? e.option("rtl") ? l(!1) : l(!0) : n.modal.close() })) }, close: function() { let t = document.querySelector("#zuck-modal"), n = document.querySelector("#zuck-modal-content"); e.callback("onClose")(e.internalData.currentStory, (function() { e.option("backNative") && (0, o.hasWindow)() && (window.location.hash = ""), i(t, !0), t && (e.option("openEffect") ? t.classList.add("closed") : (n && (n.innerHTML = ""), t.style.display = "none")) })) } }, n.modal } }, 410: (e, t, n) => { t.__esModule = !0, t.loadOptions = t.option = t.optionsDefault = void 0; var o = n(185); t.optionsDefault = function(e) { return { rtl: !1, skin: "snapgram", avatars: !0, stories: [], backButton: !0, backNative: !1, paginationArrows: !1, previousTap: !0, autoFullScreen: !1, openEffect: !0, cubeEffect: !1, list: !1, localStorage: !0, callbacks: { onOpen: function(e, t) { t() }, onView: function(e, t) { null == t || t() }, onEnd: function(e, t) { t() }, onClose: function(e, t) { t() }, onNextItem: function(e, t, n) { n() }, onNavigateItem: function(e, t, n) { n() }, onDataUpdate: function(e, t) { t() } }, template: { timelineItem: function(t) { return ` <div class="story"> <a class="item-link" ${t.link ? `href="${t.link}"` : ''}> <span class="item-preview post_input_container"> <span class="user_item_avatar ${t.seen ? 'default_btn seen' : 'theme_btn'}"> <img class="avav acav lazy" src="default_images/misc/holder.png" data-src="${e('avatars') || !t.currentPreview ? t.photo : t.currentPreview}" /> </span> <img class="coverimg ${t.seen ? 'seen' : ''} lazy" loading="eager" src="default_images/misc/holder.png" data-src="${t.currentPreview}" /> </span> <span class="info"> <strong class="name">${t.name}</strong> </span> </a> <ul class="items"></ul> </div> `; }, timelineStoryItem: function(e) { let t = ["id", "seen", "src", "link", "linkText", "loop", "time", "type", "length", "preview"], n = ""; for (var o in e) - 1 === t.indexOf(o) && void 0 !== e[o] && !1 !== e[o] && (n += " data-".concat(o, '="').concat(e[o], '"')); return t.forEach((function(t) { void 0 !== e[t] && !1 !== e[t] && (n += " data-".concat(t, '="').concat(e[t], '"')) })), '<a href="'.concat(e.src, '" ').concat(n, '>\n                <img loading="auto" class="lazy" src="default_images/misc/holder.png" data-src="').concat(e.preview, '" />\n              </a>') }, viewerItem: function(t, n) { return ` <div class="story-viewer"> <div class="head"> <div class="left"> ${e('backButton') ? '<a class="back menui">&lsaquo;</a>' : ''} <span class="item-preview theme_btn"> <img loading="eager" class="profilePhoto" src="${t.photo}" /> </span> <div class="info"> <strong class="name">${t.name}</strong> <span class="time">${o.timeAgo(t.time, e('language')) || ''}</span> </div> </div> <div class="right"> <span class="time">${o.timeAgo(n.time, e('language')) || ''}</span> <span class="loading"></span> <a class="close menui" tabIndex="2">&times;</a> </div> </div> <div class="slides-pointers"> <div class="wrap"></div> </div> ${e('paginationArrows') ? ` <div class="slides-pagination"> <span class="previous">&lsaquo;</span> <span class="next">&rsaquo;</span> </div> ` : ''} </div> `; }, viewerItemPointerProgress: function(e) { return `<span class="progress" style="${e}"></span>`; }, viewerItemPointer: function(t, n, a) { return ` <span class="${n === t ? 'active' : ''} ${a.seen === true ? 'seen' : ''}" data-index="${t}" data-item-id="${a.id}"> ${e('template').viewerItemPointerProgress(`animation-duration: ${(0, o.safeNum)(a.length) || 3}s`)} </span> `; }, viewerItemBody: function(t, n, o) { return ` <div class="item ${o.seen === true ? 'seen' : ''} ${n === t ? 'active' : ''}" data-time="${o.time}" data-type="${o.type}" data-index="${t}" data-item-id="${o.id}"> ${ o.type === 'video' ? ` <video class="media" data-length="${o.length}" ${o.loop ? 'loop' : ''} muted webkit-playsinline playsinline preload="auto" src="${o.src}" ${o.type}> </video> <b class="tip muted">${e('language').unmute}</b> ` : ` <img loading="auto" class="media" src="${o.src}" ${o.type} /> ` } ${ o.link && o.type !=='text'? ` <p class="tip link" rel="noopener" > ${o.linkText || e('language').visitLink} </p> ` : '' } </div> `; } }, language: { unmute: "Touch to unmute", keyboardTip: "Press space to see next", visitLink: "Visit link", time: { ago: "ago", hour: "hour ago", hours: "hours ago", minute: "minute ago", minutes: "minutes ago", fromnow: "from now", seconds: "seconds ago", yesterday: "yesterday", tomorrow: "tomorrow", days: "days ago" } } } }; t.option = function(e, n) { var o = function(n) { return void 0 !== (null == e ? void 0 : e[n]) ? null == e ? void 0 : e[n] : (0, t.optionsDefault)(o)[n] }; return o(n) }; t.loadOptions = function(e) { return { option: function(n) { return (0, t.option)(e, n) }, callback: function(n) { var o = (0, t.option)(e, "callbacks"); return void 0 !== o[n] ? o[n] : (0, t.option)(void 0, "callbacks")[n] }, template: function(n) { var o = (0, t.option)(e, "template"); return void 0 !== o[n] ? o[n] : (0, t.option)(void 0, "template")[n] }, language: function(n) { var o = (0, t.option)(e, "language"); return void 0 !== o[n] ? o[n] : (0, t.option)(void 0, "language")[n] } } } }, 185: (e, t) => { t.__esModule = !0, t.timeAgo = t.findPos = t.generateId = t.prepend = t.onTransitionEnd = t.onAnimationEnd = t.safeNum = t.hasWindow = void 0; t.hasWindow = function() { return "undefined" != typeof window }; t.safeNum = function(e) { return e ? Number(e) : 0 }; t.onAnimationEnd = function(e, t) { e.addEventListener("animationend", t) }; t.onTransitionEnd = function(e, t) { e.transitionEndEvent || (e.transitionEndEvent = !0, e.addEventListener("transitionend", t)) }; t.prepend = function(e, t) { t && e && ((null == e ? void 0 : e.firstChild) ? e.insertBefore(t, null == e ? void 0 : e.firstChild) : e.appendChild(t)) }; t.generateId = function() { return "stories-" + Math.random().toString(36).substr(2, 9) }; t.findPos = function(e, t, n, o) { var a = 0, i = 0; if (e) { if (e.offsetParent) do { if (a += e.offsetLeft, i += e.offsetTop, e === o) break } while (e = e.offsetParent); t && (i -= t), n && (a -= n) } return [a, i] }; t.timeAgo = function(e, n) { var o = (null == n ? void 0 : n.time) || void 0, a = e instanceof Date ? e.getTime() : 1e3 * (0, t.safeNum)(e), i = new Date(a), l = i.getTime(), r = ((new Date).getTime() - l) / 1e3, c = [ [60, " ".concat((null == o ? void 0 : o.seconds) || ""), 1], [120, "1 ".concat((null == o ? void 0 : o.minute) || ""), ""], [3600, " ".concat((null == o ? void 0 : o.minutes) || ""), 60], [7200, "1 ".concat((null == o ? void 0 : o.hour) || ""), ""], [86400, " ".concat((null == o ? void 0 : o.hours) || ""), 3600], [172800, " ".concat((null == o ? void 0 : o.yesterday) || ""), ""], [604800, " ".concat((null == o ? void 0 : o.days) || ""), 86400] ], u = 1; r < 0 && (r = Math.abs(r), u = 2); var s = !1; if (c.forEach((function(e) { let t = e[0]; r < t && !s && ("string" == typeof e[2] ? s = e[u] : null !== e && (s = Math.floor(r / e[2]) + e[1])) })), s) return s; var d = i.getDate(), v = i.getMonth(), m = i.getFullYear(); return "".concat(d, "/").concat(v + 1, "/").concat(m) } } }, t = {}; var n = function n(o) { var a = t[o]; if (void 0 !== a) return a.exports; var i = t[o] = { exports: {} }; return e[o](i, i.exports, n), i.exports }(156); this.Str = n.default })(); 
jQuery(function($){   if (!String.prototype.repeat) { String.prototype.repeat = function(count) { 'use strict'; if (this == null) { throw new TypeError('can\'t convert ' + this + ' to object'); } var str = '' + this; count = +count; if (count != count) { count = 0; } if (count < 0) { throw new RangeError('repeat count must be non-negative'); } if (count == Infinity) { throw new RangeError('repeat count must be less than infinity'); } count = Math.floor(count); if (str.length == 0 || count == 0) { return ''; }  if (str.length * count >= 1 << 28) { throw new RangeError('repeat count must not overflow maximum string size'); } var rpt = ''; for (var i = 0; i < count; i++) { rpt += str; } return rpt; } }   if (!String.prototype.padStart) { String.prototype.padStart = function padStart(targetLength,padString) { targetLength = targetLength>>0; padString = String((typeof padString !== 'undefined' ? padString : ' ')); if (this.length > targetLength) { return String(this); } else { targetLength = targetLength-this.length; if (targetLength > padString.length) { padString += padString.repeat(targetLength/padString.length); } return padString.slice(0,targetLength) + String(this); } }; }  $.fn.flipper = function(action, options) { var $flipper = $(this); var action = action || 'init'; var settings = $.extend({  reverse: $flipper.data('reverse') || false, datetime: $flipper.data('datetime') || 'now', template: $flipper.data('template') || 'HH:ii:ss', labels: $flipper.data('labels') || 'Hours|Minutes|Seconds', preload: true }, options );  console.log(settings.reverse);  if(action === 'init'){ if($flipper.hasClass('flipper-initialized')){ console.warn('Flipper already initialized.'); return; } $flipper.addClass( "flipper-initialized" );  var templateParts = settings.template.split('|'); var labelsArray = settings.labels.split('|'); var n;  templateParts.forEach(function(part, index){ if(index > 0){ $flipper.append('<div class="flipper-group flipper-delimiter">:</div>'); } $flipper.append('<div class="flipper-group flipper-' + part + '"></div>'); var $part = $flipper.find('.flipper-group.flipper-' + part); if(typeof labelsArray[index] !== 'undefined'){ $part.append('<label>' + labelsArray[index] + '</label>'); } if(part === 'd' || part === 'H' || part === 'i' || part === 's'){ var rev = settings.reverse ? 'reverse' : ''; $part.append('<div class="flipper-digit ' + rev + '"></div>'); } if(part === 'dd' || part === 'ddd' || part === 'HH' || part === 'ii' || part === 'ss'){ var rev = settings.reverse ? 'reverse' : ''; $part.append('<div class="flipper-digit ' + rev + '"></div>'); $part.append('<div class="flipper-delimiter"></div>'); $part.append('<div class="flipper-digit ' + rev + '"></div>'); if(part === 'ddd'){ $part.append('<div class="flipper-delimiter"></div>'); $part.append('<div class="flipper-digit ' + rev + '"></div>'); } } if(part === 'd'){ for(n = 0; n <= 31; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); } } if(part === 'H'){ for(n = 0; n <= 23; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); } } if(part === 'i' || part === 's'){ for(n = 0; n <= 59; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); } } if(part === 'dd' || part === 'ddd'){ for(n = 0; n <= 9; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); if(part === 'ddd'){ $part.find('.flipper-digit:eq(2)').append('<div class="digit-face">' + n + '</div>'); } } } if(part === 'HH'){ for(n = 0; n <= 2; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); } for(n = 0; n <= 9; n++){ $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); } } if(part === 'ii' || part === 'ss'){ for(n = 0; n <= 5; n++){ $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>'); } for(n = 0; n <= 9; n++){ $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>'); } } });  if(settings.preload){ setFlipperDate($flipper, settings.datetime, false); }  setInterval(function(){ setFlipperDate($flipper, settings.datetime, true); }, 1000);  upsizeToParent($flipper); $(window).on("resize", function(){ upsizeToParent($flipper); }); }  var flipTime = 400; var $body = $('body');  function flipDigit($digit){ if(!$digit.closest('.flipper').is('.flipper-initialized')){ return; } if($digit.hasClass('r')){ setTimeout(function(){ flipDigit($digit); }, flipTime + 1); return; } $digit.addClass('r');  var $currentTop = $digit.find('.digit-top'); var $currentTop2 = $digit.find('.digit-top2'); var $currentBottom = $digit.find('.digit-bottom'); var $activeDigit = $digit.find('.digit-face.active'); var $firstDigit = $digit.find('.digit-face:first'); var $prevDigit = $activeDigit.prev('.digit-face'); var $nextDigit = $activeDigit.next('.digit-face'); var $lastDigit = $digit.find('.digit-face:last'); if($digit.hasClass('reverse')){ var $next = $prevDigit.length ? $prevDigit : $lastDigit; } else { var $next = $nextDigit.length ? $nextDigit : $firstDigit; } var current = parseInt($currentTop.html()); var next = $next.html(); $digit.find('.digit-next').html(next); $digit.find('.digit-face').removeClass('active'); $next.addClass('active'); $currentTop.addClass('r'); $currentTop2.addClass('r'); $currentBottom.addClass('r'); if(next.toString() === $digit.attr('data-value')){ $digit.removeAttr('data-value'); } setTimeout(function(){ $currentTop.html(next).hide(); $currentTop2.html(next); setTimeout(function(){ $currentBottom.html(next).removeClass('r'); $currentTop.removeClass('r').show(); $currentTop2.html(next).removeClass('r'); $digit.removeClass('r'); }, flipTime/2); }, flipTime/2); }  function upsizeToParent($flipper) { var parentWidth; var flipperWidth; var maxFontSize = 1000; var fontSize = maxFontSize; var i = 0; var minFontSize = 0; $flipper.css('font-size', fontSize + 'px'); while(i < 20){ i++; parentWidth = $flipper.innerWidth(); $flipper.css('width', '9999px'); flipperWidth = 0; $flipper.find('.flipper-group').each(function(){ var w = parseFloat($(this).outerWidth()); flipperWidth += w; }); if((parentWidth - flipperWidth) < 10 && (parentWidth - flipperWidth) > 0){ $flipper.css('width', ''); return; } if(flipperWidth > parentWidth){ maxFontSize = fontSize < maxFontSize ? fontSize: maxFontSize; } else { minFontSize = fontSize > minFontSize ? fontSize : minFontSize; } fontSize = (maxFontSize + minFontSize) / 2; $flipper.css('width', ''); $flipper.css('font-size', fontSize + 'px'); } }  function setDigitValue(digitIndex, value){ var $flipper = $('.flipper'); var $digit = $flipper.find('.flipper-digit:eq(' + digitIndex + ')'); var currentValue = getDigitValue($digit); if(currentValue.toString() === value.toString()){ return; } $digit.attr('data-value', value); }  setInterval(function(){ var $flipper = $('.flipper'); $flipper.find('.flipper-digit[data-value]').each(function(){ var $digit = $(this); if($digit.find('.active').html() === $digit.attr('data-value')){ return; } if(!$digit.is('.r')){ flipDigit($digit); } }); }, flipTime / 4);  function formatFlipperDate(dateStr) { var a=dateStr.split(" "); var d=a[0].split("-"); var t=a[1].split(":"); var date = new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]); return date; }  function addAppearance($flipper){ $flipper.find('.flipper-digit').each(function(){ var $digit = $(this); var value = $digit.find('.digit-face.active').html(); $digit.find('.digit-top').remove(); $digit.find('.digit-top2').remove(); $digit.find('.digit-bottom').remove(); $digit.find('.digit-next').remove(); $digit.prepend('<div class="digit-top">' + value + '</div>'); $digit.prepend('<div class="digit-top2">' + value + '</div>'); $digit.prepend('<div class="digit-bottom">' + value + '</div>'); $digit.prepend('<div class="digit-next"></div>'); }); }  function setFlipperDate($flipper, dateString, animate){ var animate = animate || false; if(!$flipper.is(':visible')){ $flipper.addClass('flipper-invisible'); return; } if($flipper.hasClass('flipper-invisible')){ $flipper.removeClass('flipper-invisible'); upsizeToParent($flipper); setFlipperDate($flipper, settings.datetime, false); } var now = Date.now(); if(dateString === 'now'){ var now = new Date(); var seconds = now.getSeconds(); var minutes = now.getMinutes(); var hours = now.getHours(); var days = now.getDate(); } else { var timestamp = Date.parse(formatFlipperDate(dateString)); var remainder = (timestamp - now) / 1000; var days = Math.floor(remainder / 60 / 60 / 24); remainder -= days * 60 * 60 * 24; var hours = Math.floor(remainder / 60 / 60); remainder -= hours * 60 * 60; var minutes = Math.floor(remainder / 60); remainder -= minutes * 60; var seconds = Math.floor(remainder); }  var days_str = days.toString().padStart(3, '0'); var hours_str = hours.toString().padStart(2, '0'); var minutes_str = minutes.toString().padStart(2, '0'); var seconds_str = seconds.toString().padStart(2, '0');  if(animate){  $flipper.find('.flipper-d').find('.flipper-digit:eq(0)').attr('data-value', days); $flipper.find('.flipper-H').find('.flipper-digit:eq(0)').attr('data-value', hours); $flipper.find('.flipper-i').find('.flipper-digit:eq(0)').attr('data-value', minutes); $flipper.find('.flipper-s').find('.flipper-digit:eq(0)').attr('data-value', seconds);  $flipper.find('.flipper-dd').find('.flipper-digit:eq(0)').attr('data-value', days_str[1]); $flipper.find('.flipper-dd').find('.flipper-digit:eq(1)').attr('data-value', days_str[2]); $flipper.find('.flipper-HH').find('.flipper-digit:eq(0)').attr('data-value', hours_str[0]); $flipper.find('.flipper-HH').find('.flipper-digit:eq(1)').attr('data-value', hours_str[1]); $flipper.find('.flipper-ii').find('.flipper-digit:eq(0)').attr('data-value', minutes_str[0]); $flipper.find('.flipper-ii').find('.flipper-digit:eq(1)').attr('data-value', minutes_str[1]); $flipper.find('.flipper-ss').find('.flipper-digit:eq(0)').attr('data-value', seconds_str[0]); $flipper.find('.flipper-ss').find('.flipper-digit:eq(1)').attr('data-value', seconds_str[1]);   $flipper.find('.flipper-ddd').find('.flipper-digit:eq(0)').attr('data-value', days_str[0]); $flipper.find('.flipper-ddd').find('.flipper-digit:eq(1)').attr('data-value', days_str[1]); $flipper.find('.flipper-ddd').find('.flipper-digit:eq(2)').attr('data-value', days_str[2]); } else { $flipper.find('.flipper-group .flipper-digit').removeAttr('data-value'); $flipper.find('.digit-face.active').removeClass('active');   $flipper.find('.flipper-d .flipper-digit:eq(0) .digit-face:contains(' + days + ')').addClass('active'); $flipper.find('.flipper-H .flipper-digit:eq(0) .digit-face:contains(' + hours + ')').addClass('active'); $flipper.find('.flipper-i .flipper-digit:eq(0) .digit-face:contains(' + minutes + ')').addClass('active'); $flipper.find('.flipper-s .flipper-digit:eq(0) .digit-face:contains(' + seconds + ')').addClass('active');   $flipper.find('.flipper-dd .flipper-digit:eq(0) .digit-face:contains(' + days_str[1] + ')').addClass('active'); $flipper.find('.flipper-dd .flipper-digit:eq(1) .digit-face:contains(' + days_str[2] + ')').addClass('active'); $flipper.find('.flipper-HH .flipper-digit:eq(0) .digit-face:contains(' + hours_str[0] + ')').addClass('active'); $flipper.find('.flipper-HH .flipper-digit:eq(1) .digit-face:contains(' + hours_str[1] + ')').addClass('active'); $flipper.find('.flipper-ii .flipper-digit:eq(0) .digit-face:contains(' + minutes_str[0] + ')').addClass('active'); $flipper.find('.flipper-ii .flipper-digit:eq(1) .digit-face:contains(' + minutes_str[1] + ')').addClass('active'); $flipper.find('.flipper-ss .flipper-digit:eq(0) .digit-face:contains(' + seconds_str[0] + ')').addClass('active'); $flipper.find('.flipper-ss .flipper-digit:eq(1) .digit-face:contains(' + seconds_str[1] + ')').addClass('active');   $flipper.find('.flipper-ddd .flipper-digit:eq(0) .digit-face:contains(' + days_str[0] + ')').addClass('active'); $flipper.find('.flipper-ddd .flipper-digit:eq(1) .digit-face:contains(' + days_str[1] + ')').addClass('active'); $flipper.find('.flipper-ddd .flipper-digit:eq(2) .digit-face:contains(' + days_str[2] + ')').addClass('active'); addAppearance($flipper); }  } };  }); 
