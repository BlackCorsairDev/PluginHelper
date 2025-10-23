(function () {
    if (typeof $ === 'undefined') { console.error('PluginHelper requires jQuery'); return; }

    if (window.PluginHelper) { return; }

    class PluginHelper {
		
        constructor(o = {}) {
            this.isA = false; this.upt = null; this.uq = [];
            this.activeTasks = new Set(); // Track active task IDs to prevent duplicates while processing

            this.pbS = {
                id: 'pluginHelperProgressBar', class: 'theme_btn',
                css: {
                    position: 'fixed', top: 0, left: 0, width: '0%', height: '5px', zIndex: 9999,
                    backgroundColor: '#007bff', transition: 'width 0.2s ease-in-out', opacity: 1
                }
            };

            this.pb = {
                s: () => {
                    $(`#${this.pbS.id}`).remove(); const $pb = $('<div>', this.pbS);
                    $('body').append($pb); $pb.css('width', '0%'); 
                },
                u: (percent) => {
                    const $pb = $(`#${this.pbS.id}`);
                    if ($pb.length) {
                        $pb.css('width', `${Math.min(Math.max(percent, 0), 100)}%`);
                    }
                },
                r: () => {
                    const $pb = $(`#${this.pbS.id}`);
                    if ($pb.length) {
                        $pb.css({ width: '100%', opacity: 0 }); setTimeout(() => { $pb.remove(); }, 300);
                    }
                }
            };

            this.df = {
                u: null, p: null, a: 'action', t: 'POST', l: [], dt: 'json', c: false,
                ct: false, pd: false, b: () => {}, s: (r) => { },
                e: (jqXHR, textStatus, errorThrown) => { callError(errorThrown); }
            };

            this.stt = $.extend(true, {}, this.df, o);

            if (this.stt.p && !this.stt.u) {
                this.stt.u = `addons/${this.stt.p.addons}/system/${this.stt.a}.php`;
            }
			
            if (o.pbS) {
                this.pbS = $.extend(true, {}, this.pbS, o.pbS);
            }
        }

        stringifyWithoutBlobs(d) {
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

        generateTaskId(p) {
            const dataString = this.stringifyWithoutBlobs(p.d || {});
            return btoa(`${p.url || this.stt.u}:${dataString}`);
        }

        isTaskDuplicate(taskId) {
            return this.activeTasks.has(taskId);
        }

        enqU(ut, p) {
            if (typeof p !== 'object' || p === null) {
                callError('Invalid p; expected an object'); return this;
            }

            const taskId = this.generateTaskId(p);
            
            if (this.isTaskDuplicate(taskId)) {
                console.warn('Upload task is already active:', taskId);
                return this;
            }

            this.uq.push({ ut, p, taskId });
            this.pQ(); return this;
        }

        pQ() {
            if (this.isA || this.uq.length === 0) { return; }
            
            const task = this.uq.shift();
            if (!task) return;

            this.activeTasks.add(task.taskId);
            this.isA = true;
            
            if (task.ut === 'upload') { this._performUpload(task); } 
        }
		
        cUp() {
            this.isA = false; clearTimeout(this.upt); this.upt = null; 
            this.pb.r(); this.pQ();
        }
		
        actionMenu(type, data = {}) {
            var cMenu = `<div data="" value="" data-av="" class="avset bmenu avitem" style="display: flex; align-items: center; justify-content: center;" onclick="${data.call}(this);"><img style="border-radius:50%;" class="list_flag" src="${data.icon}"/><span style="padding: 0 3px;">${data.txt}</span></div>`;
            $(`.av${type}`).append(cMenu);
        }
		
        appInputMenuPre(ic, cb) {
            $('#main_input .input_table').prepend(`<div id="sub_item" class="fa input_item lpad10 main_item base_main" onclick="${cb}"><img height="24px" src="addons/${this.stt.p.addons}/files/${ic}"></div>`);
        }
		
        leftMenuIcon(ic, cb, txt) {
            $('#left_menu_content').append(`<div title="${txt}" onclick="${cb}" class="bhover left_menu_item"><div class="left_menu_icon"><img class="left_menu_img left_menu_icon leftmenui" style="width: 25px;" src="addons/${this.stt.p.addons}/files/${ic}"/></div></div>`);
            $('.left_menu_img').css( {'border-radius': '50%', 'position': 'absolute',  'top': '55%', 'left': '50%', 'transform': 'translate(-50%, -65%)'});
        }
		
        appInputMenu(ic, cb) {
             appInputMenu(`addons/${this.stt.p.addons}/files/${ic}`, `${cb}`);
        }
		
        userlistMenu(type, data = {}) {
            var cMenu = `<div title="${data.txt}" class="panel_option" onclick="${data.call}();"><img style="height:20px; border-radius:50%;" src="${data.icon}"/></div>`;
            $('#right_panel_bar').append(cMenu);
        }
        
        // Mock functions (these would need to be implemented based on your actual requirements)
        emptyZone(message) {
            return `<div class="empty-zone">${message}</div>`;
        }
		
        compileTemplate(htmlString) {
            try {
                const templateContent = htmlString.trim();
                let compiled = templateContent
                  // Replace <%= key %> with ${data.key || ''}
                  .replace(/<%=(.*?)%>/g, (match, key) => `\${data.${key.trim()} || ''}`)
                  // Handle <% if (condition) %> ... <% endif %>
                  .replace(/<%\s*if\s*\((.*?)\)\s*%>([\s\S]*?)<%\s*endif\s*%>/g, (match, condition, content) => {
                    return `\${${condition.trim()} ? \`${content.trim()}\` : ''}`;
                  })
                  // Handle <% for (item in items) %> ... <% endfor %>
                  .replace(/<%\s*for\s*\((.*?)\s*in\s*(.*?)\)\s*%>([\s\S]*?)<%\s*endfor\s*%>/g, (match, item, items, content) => {
                    return `\${(data.${items.trim()} || []).map((${item.trim()}) => \`${content.trim()}\`).join('')}`;
                  })
                  // Handle stray <% code %> for other expressions
                  .replace(/<%(.*?)%>/g, (match, code) => `\${${code.trim()} ? ${code.trim()} : ''}`);
                // Return a function that evaluates the template with provided data
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
                let s = `<div class="vpad10 no_rtl bclear ${data.menu}">`;
                if (data.state > 1) {
                    s += `<div data-pag="${data.id}" class="pagarrow pag_btn pagdown">
                            <i class="fa-solid fa-chevron-left"></i></div>
                            <div data-pag="${data.id}" class="pagarrow pag_btn pagup"><i class="fa-solid fa-chevron-right"></i></div>
                        </div>`;
                }
                return `<div id="pagbox${data.id}" data-max="${data.state}" data-cur="1" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
            }
			
            if (template === 'dot') {
                let s = `<div class="vpad10 no_rtl bclear ${data.menu}">`;
                if (data.state > 1) {
                    for (let i = 1; i <= data.state; i++) {
                        const sel = (i === 1) ? 'pagselected' : '';
                        s += `<div data-pag="${data.id}" data-item="${i}" class="pagdot ${sel} pag_btn"></div>`;
                    }
                    s += `</div>`;
                }
                return `<div id="pagbox${data.id}" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
            }
			
            if (template === 'list') {
                let s = `<div class="vpad10 no_rtl bclear ${data.menu}">`;
                if (data.state > 1) {
                    for (let i = 1; i <= data.state; i++) {
                        const sel = (i === 1) ? 'pagselected' : '';
                        s += `<div data-pag="${data.id}" data-item="${i}" class="paglist ${sel} pag_btn">${i}</div>`;
                    }
                    s += `</div>`;
                }
                return `<div id="pagbox${data.id}" class="pagelement">${data.content}<div class="clear"></div>${s}</div>`;
            }
			
            if (template === 'load') {
                let s = `<div class="vpad10 no_rtl bclear ${data.menu}">`;
                if (data.state > 1) {
                     s =  `<div class="pagload${data.id} vpad10 no_rtl bclear ${data.menu}">
                        <button data-pag="${data.id}"class="reg_button pag_btn pagload">${this.stt.l.load_more}</button>
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
                 setTimeout(() => {
                      if (p.f) { p.f(t); }
                }, 300)
            });
            return this;
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
		
        get( p = {} ) {
            return this.send({
                u : p.u,t : 'GET',d : p.d,s : (r) => {
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                }, e : () => {
                    
                },
            });
        }
		
        getJson( p = {} ) {
            return this.send({
                u : `addons/${this.stt.p.addons}/files/${p.u}.json`,
                t : 'GET', s : (r) => {
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                }, e : () => {
                    
                },
            });
        }
		
        getBox( p = {} ) {
            return this.send({
                u : p.u || this.stt.u,
                d : { 
                    box: p.v || 1, t: p.t || '', action: 'box'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { 
                    showModal(p.bc || r.box, p.sz || 420); 
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                },
            });
        }
		
        getEmptyBox( p = {} ) {
            return this.send({
                u : p.u || this.stt.u,
                d : { 
                    box: p.v || 1, t: p.t || '', action: 'box'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { 
                    showEmptyModal(p.bc || r.box, p.sz || 420); 
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                },
            });
        }
		
        getBoxOver( p = {} ) {
            return this.send({
                u : p.u || this.stt.u,
                d : { 
                    box: p.v || 1, t: p.t || '', action: 'box'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { 
                    overModal(p.bc || r.box, p.sz || 420); 
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                },
            });
        }
		
        getEmptyBoxOver( p = {} ) {
            return this.send({
                u : p.u || this.stt.u,
                d : { 
                    box: p.v || 1, t: p.t || '', action: 'box'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { 
                    showEmptyOver(p.bc || r.box, p.sz || 420); 
                    if (p.s) { p.s(r); } else { this.stt.s(r); }
                },
            });
        }
		
        load( p = {} ) {
            return this.send({
                u : p.u || this.stt.u, 
                d : { 
                    load: p.v || 1, t: p.t || '', action: 'load'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { if (p.s) { p.s(r); } else { this.stt.s(r); }},
            });
        }
		
        reload( p = {} ) {
            return this.send({
                u : p.u || this.stt.u, 
                d : { 
                    reload: p.v || 1, t: p.t || '', action: 'reload'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { if (p.s) { p.s(r); } else { this.stt.s(r); }},
            });
        }
		
        add( p = {} ) {
            return this.send({
                u : p.u || this.stt.u, 
                d : { 
                    add: JSON.stringify(p.v) || {}, action: 'add'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.stt.s(r); }},
            });
        }
		
        edit( p = {} ) {
            return this.send({
                u : p.u || this.stt.u, 
                d : { 
                    edit: JSON.stringify(p.v) || {}, action: 'edit'
                },
                b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.stt.s(r); }},
            });
        }
		
		set( p = {} ) {
            return this.send({
				u : p.u || this.stt.u, 
				d : { 
					set: p.v || '', t: p.t || '', action: 'set'
				},
				b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
				s : (r) => { callSuccess(system.saved); if (p.s) { p.s(r); } else { this.stt.s(r); }},
			});
        }
		
        unset( p = {} ) {
            return this.send({
				u : p.u || this.stt.u, 
				d : { 
					unset: p.v || '', t: p.t || '', action: 'unset'
				},
				b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
				s : (r) => { callSuccess(system.actionComplete); if (p.s) { p.s(r); } else { this.stt.s(r); }},
			});
        }
		
        destroy( p = {} ) {
            return this.send({
				u : p.u || this.stt.u, 
				d : { 
					destroy: p.v || {}, action: 'destroy'
				},
				b : () => { if (p.b) { p.b(); } else { this.stt.b(); } },
				s : (r) => { callSuccess(system.actionComplete); if (p.s) { p.s(r); } else { this.stt.s(r); }},
			});
        }
		
        send( p = {} ) {
            if (this.isA) {return this;} this.isA = true;
            $.ajax({
                url: p.u || this.stt.u, type: p.t || this.stt.t, cache: p.c || this.stt.c,
                dataType: p.dt || this.stt.dt, data: p.d  || null,
                beforeSend: () => { if (p.b) { p.b(); } else { this.stt.b(); } },
                success: (r) => {
                   this.isA = false; if (p.s) { p.s(r); } else { this.stt.s(r); }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    this.isA = false;
                    if (p.e) { p.e(jqXHR, textStatus, errorThrown); } else {
                        this.stt.e(jqXHR, textStatus, errorThrown);
                    }
                }
            });

            return this;
        }

       createFormData(p) {
		    const formData = new FormData();
            for (const k in p) {
				if (p.hasOwnProperty(k)) {
					formData.append(k, p[k]);
				}
			}
			return formData;
        }
		
        performAjaxUpload(formData, task) {
            const { p, taskId } = task;

            $.ajax({
                url: p.u || this.stt.u, type: p.t || this.stt.t, cache: p.c || this.stt.c, contentType: false,processData: false, dataType: this.stt.dt,
                data: formData,
                beforeSend: () => {
                    this.pb.s();
                    if (p.b) { p.b(); } else {
                        this.stt.b();
                    }
                },
                xhr: () => {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener( 'progress',
                        (evt) => {
                            if (evt.lengthComputable) {
                                const percentComplete = (evt.loaded / evt.total) * 100;
                                this.pb.u(percentComplete);
                            } else { this.pb.u(50); }
                        }, false
                    ); return xhr;
                },
                success: (r) => {
                    this.activeTasks.delete(taskId);
                    this.cUp();
                    if (p.s) { p.s(r); } else {
                        this.stt.s(r);
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    this.activeTasks.delete(taskId);
                    this.cUp();
                    if (p.e) { p.e(jqXHR, textStatus, errorThrown); } else {
                        this.stt.e(jqXHR, textStatus, errorThrown);
                    }
                }
            });
        }

       async _performUpload(task) {
		 	const { p, taskId } = task;
			if (typeof p !== 'object' || p === null ) {
				this.activeTasks.delete(taskId);
				this.cUp();
				const error = 'Invalid parameters; expected an object with valid data';
				if (p.e) { p.e(null, 'error', error); } else { this.stt.e(null, 'error', error); }
				return;
			}
			const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
			
			const formData = this.createFormData(p.d);
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
					this.activeTasks.delete(taskId);
					this.cUp();
					if (p.e) { p.e(null, 'error', err); } else { this.stt.e(null, 'error', err); }
					return;
				} finally {
					if (videoUrl) { URL.revokeObjectURL(videoUrl); }
				}
			}
			formData.append('token', utk);
			this.performAjaxUpload(formData, task);
		}

        upload(p = {}) {
            return this.enqU('upload', p);
        }
		
        reloadCss(f) {
	         $('head').append('<link rel="stylesheet" href="'+f+'?v='+Math.random()+'" type="text/css" />');
        }

        cancelUploads() {
            this.uq = [];
            this.activeTasks.clear();
            if (this.isA) { this.isA = false; this.pb.r(); } return this;
        }
    }

    window.PluginHelper = PluginHelper;
})();


(function($) { $.Observe = {}; }(jQuery)); (function($, ns) { var get = function(origin, target) { if(!target) { target = origin; origin = window.document; } var result = []; $(target).each(function() { var selector = []; var prev = $(this); for(var current = prev.parent(); current.length && !prev.is(origin); current = current.parent()) { var tag = prev.get(0).tagName.toLowerCase(); selector.push(tag + ':eq(' + current.children(tag).index(prev) + ')'); prev = current; } if(!current.length && !prev.is(origin)) { return; } result.push('> ' + selector.reverse().join(' > ')); }); return result.join(', '); }; var capture = function(origin, target) { if(!target) { target = origin; origin = window.document; } var result = []; $(target).each(function() { var textIndex = -1; var realTarget = this; if(this instanceof Text) { realTarget = this.parentNode; var children = realTarget.childNodes; for(var i = 0; i < children.length; i++) { if(children[i] === this) { textIndex = i; break; } } } var path = get(origin, realTarget); var same = $(origin).is(realTarget); result.push(function(origin) { var target = same ? origin : $(origin).find(path); return textIndex === -1 ? target : target.contents()[textIndex]; }); }); return function(origin) { origin = origin || window.document; return result.reduce(function(acc, fn) { return acc.add(fn(origin)); }, $([])); }; }; ns.path = { get: get, capture: capture }; }(jQuery, jQuery.Observe)); (function($, ns) { var Branch = function(root) { this.original = $(root); this.root = this.original.clone(false, true); }; Branch.prototype.find = function(selector) { var path = ns.path.capture(this.original, selector); return path(this.root); }; ns.Branch = Branch; }(jQuery, jQuery.Observe)); (function($, ns) { var toObject = function(array, fn) { var result = {}; array.forEach(function(name) { var pair = fn(name); if(pair) { result[pair[0]] = pair[1]; } }); return result; }; var OBSERVER_OPTIONS = toObject([ 'childList', 'attributes', 'characterData', 'subtree', 'attributeOldValue', 'characterDataOldValue', 'attributeFilter' ], function(name) { return [name.toLowerCase(), name]; }); var ALL = toObject(Object.keys(OBSERVER_OPTIONS), function(name) { if(name !== 'attributefilter') { return [OBSERVER_OPTIONS[name], true]; } }); var EXTENDED_OPTIONS = toObject([ 'added', 'removed' ], function(name) { return [name.toLowerCase(), name]; }); var EMPTY = $([]); var parseOptions = function(options) { if(typeof options === 'object') { return options; } options = options.split(/\s+/); var result = {}; options.forEach(function(opt) { opt = opt.toLowerCase(); if(!OBSERVER_OPTIONS[opt] && !EXTENDED_OPTIONS[opt]) { throw new Error('Unknown option ' + opt); } result[OBSERVER_OPTIONS[opt] || EXTENDED_OPTIONS[opt]] = true; }); return result; }; var objectToString = function(obj) { return '[' + Object.keys(obj).sort().reduce(function(acc, key) { var valueStr = (obj[key] && typeof obj[key] === 'object') ? objectToString(obj[key]) : obj[key]; return acc + '[' + JSON.stringify(key) + ':' + valueStr + ']'; }, '') + ']'; }; var MutationObserver = window.MutationObserver || window.WebKitMutationObserver; var Pattern = function(target, options, selector, handler) { this._originalOptions = $.extend({}, options); options = $.extend({}, options); this.attributeFilter = options.attributeFilter; delete options.attributeFilter; if(selector) { options.subtree = true; } if(options.childList) { options.added = true; options.removed = true; } if(options.added || options.removed) { options.childList = true; } this.target = $(target); this.options = options; this.selector = selector; this.handler = handler; }; Pattern.prototype.is = function(options, selector, handler) { return objectToString(this._originalOptions) === objectToString(options) && this.selector === selector && this.handler === handler; }; Pattern.prototype.match = function(record) { var self = this; var options = this.options; var type = record.type; if(!this.options[type]) { return EMPTY; } if(this.selector) { switch(type) { case 'attributes': if(!this._matchAttributeFilter(record)) { break; } case 'characterData': return this._matchAttributesAndCharacterData(record); case 'childList': if(record.addedNodes && record.addedNodes.length && options.added) { var result = this._matchAddedNodes(record); if(result.length) { return result; } } if(record.removedNodes && record.removedNodes.length && options.removed) { return this._matchRemovedNodes(record); } } } else { var recordTarget = record.target instanceof Text ? $(record.target).parent() : $(record.target); if(!options.subtree && recordTarget.get(0) !== this.target.get(0)) { return EMPTY; } switch(type) { case 'attributes': if(!this._matchAttributeFilter(record)) { break; } case 'characterData': return this.target; case 'childList': if((record.addedNodes && record.addedNodes.length && options.added) || (record.removedNodes && record.removedNodes.length && options.removed)) { return this.target; } } } return EMPTY; }; Pattern.prototype._matchAttributesAndCharacterData = function(record) { return this._matchSelector(this.target, [record.target]); }; Pattern.prototype._matchAddedNodes = function(record) { return this._matchSelector(this.target, record.addedNodes); }; Pattern.prototype._matchRemovedNodes = function(record) { var branch = new ns.Branch(this.target); var nodes = Array.prototype.slice.call(record.removedNodes).map(function(node) { return node.cloneNode(true); }); if(record.previousSibling) { branch.find(record.previousSibling).after(nodes); } else if(record.nextSibling) { branch.find(record.nextSibling).before(nodes); } else { branch.find(record.target).empty().append(nodes); } return this._matchSelector(branch.root, nodes).length ? $(record.target) : EMPTY; }; Pattern.prototype._matchSelector = function(origin, element) { var match = origin.find(this.selector); element = Array.prototype.slice.call(element); match = match.filter(function() { var self = this; return element.some(function(node) { if(node instanceof Text) return node.parentNode === self; else return node === self || $(node).has(self).length; }); }); return match; }; Pattern.prototype._matchAttributeFilter = function(record) { if(this.attributeFilter && this.attributeFilter.length) { return this.attributeFilter.indexOf(record.attributeName) >= 0; } return true; }; var Observer = function(target) { this.patterns = []; this._target = target; this._observer = null; }; Observer.prototype.observe = function(options, selector, handler) { var self = this; if(!this._observer) { this._observer = new MutationObserver(function(records) { records.forEach(function(record) { self.patterns.forEach(function(pattern) { var match = pattern.match(record); if(match.length) { match.each(function() { pattern.handler.call(this, record); }); } }); }); }); } else { this._observer.disconnect(); } this.patterns.push(new Pattern(this._target, options, selector, handler)); this._observer.observe(this._target, this._collapseOptions()); }; Observer.prototype.disconnect = function(options, selector, handler) { var self = this; if(this._observer) { this.patterns.filter(function(pattern) { return pattern.is(options, selector, handler); }).forEach(function(pattern) { var index = self.patterns.indexOf(pattern); self.patterns.splice(index, 1); }); if(!this.patterns.length) { this._observer.disconnect(); } } }; Observer.prototype.disconnectAll = function() { if(this._observer) { this.patterns = []; this._observer.disconnect(); } }; Observer.prototype.pause = function() { if(this._observer) { this._observer.disconnect(); } }; Observer.prototype.resume = function() { if(this._observer) { this._observer.observe(this._target, this._collapseOptions()); } }; Observer.prototype._collapseOptions = function() { var result = {}; this.patterns.forEach(function(pattern) { var restrictiveFilter = result.attributes && result.attributeFilter; if((restrictiveFilter || !result.attributes) && pattern.attributeFilter) { var attributeFilter = (result.attributeFilter || []).concat(pattern.attributeFilter); var existing = {}; var unique = []; attributeFilter.forEach(function(attr) { if(!existing[attr]) { unique.push(attr); existing[attr] = 1; } }); result.attributeFilter = unique; } else if(restrictiveFilter && pattern.options.attributes && !pattern.attributeFilter) { delete result.attributeFilter; } $.extend(result, pattern.options); }); Object.keys(EXTENDED_OPTIONS).forEach(function(name) { delete result[EXTENDED_OPTIONS[name]]; }); return result; }; var DOMEventObserver = function(target) { this.patterns = []; this._paused = false; this._target = target; this._events = {}; this._handler = this._handler.bind(this); }; DOMEventObserver.prototype.NS = '.jQueryObserve'; DOMEventObserver.prototype.observe = function(options, selector, handler) { var pattern = new Pattern(this._target, options, selector, handler); var target = $(this._target); if(pattern.options.childList) { this._addEvent('DOMNodeInserted'); this._addEvent('DOMNodeRemoved'); } if(pattern.options.attributes) { this._addEvent('DOMAttrModified'); } if(pattern.options.characterData) { this._addEvent('DOMCharacerDataModified'); } this.patterns.push(pattern); }; DOMEventObserver.prototype.disconnect = function(options, selector, handler) { var target = $(this._target); var self = this; this.patterns.filter(function(pattern) { return pattern.is(options, selector, handler); }).forEach(function(pattern) { var index = self.patterns.indexOf(pattern); self.patterns.splice(index, 1); }); var eventsInUse = this.patterns.reduce(function(acc, pattern) { if(pattern.options.childList) { acc.DOMNodeInserted = true; acc.DOMNodeRemoved = true; } if(pattern.options.attributes) { acc.DOMAttrModified = true; } if(pattern.options.characterData) { acc.DOMCharacerDataModified = true; } return acc; }, {}); Object.keys(this._events).forEach(function(type) { if(eventsInUse[type]) { return; } delete self._events[type]; target.off(type + self.NS, self._handler); }); }; DOMEventObserver.prototype.disconnectAll = function() { var target = $(this._target); for(var name in this._events) { target.off(name + this.NS, this._handler); } this._events = {}; this.patterns = []; }; DOMEventObserver.prototype.pause = function() { this._paused = true; }; DOMEventObserver.prototype.resume = function() { this._paused = false; }; DOMEventObserver.prototype._handler = function(e) { if(this._paused) { return; } var record = { type: null, target: null, addedNodes: null, removedNodes: null, previousSibling: null, nextSibling: null, attributeName: null, attributeNamespace: null, oldValue: null }; switch(e.type) { case 'DOMAttrModified': record.type = 'attributes'; record.target = e.target; record.attributeName = e.attrName; record.oldValue = e.prevValue; break; case 'DOMCharacerDataModified': record.type = 'characterData'; record.target = $(e.target).parent().get(0); record.attributeName = e.attrName; record.oldValue = e.prevValue; break; case 'DOMNodeInserted': record.type = 'childList'; record.target = e.relatedNode; record.addedNodes = [e.target]; record.removedNodes = []; break; case 'DOMNodeRemoved': record.type = 'childList'; record.target = e.relatedNode; record.addedNodes = []; record.removedNodes = [e.target]; break; } for(var i = 0; i < this.patterns.length; i++) { var pattern = this.patterns[i]; var match = pattern.match(record); if(match.length) { match.each(function() { pattern.handler.call(this, record); }); } } }; DOMEventObserver.prototype._addEvent = function(type) { if(!this._events[type]) { $(this._target).on(type + this.NS, this._handler); this._events[type] = true; } }; ns.Pattern = Pattern; ns.MutationObserver = Observer; ns.DOMEventObserver = DOMEventObserver; $.fn.observe = function(options, selector, handler) { if(!selector) { handler = options; options = ALL; } else if(!handler) { handler = selector; selector = null; } return this.each(function() { var self = $(this); var observer = self.data('observer'); if(!observer) { if(MutationObserver) { observer = new Observer(this); } else { observer = new DOMEventObserver(this); } self.data('observer', observer); } options = parseOptions(options); observer.observe(options, selector, handler); }); }; $.fn.disconnect = function(options, selector, handler) { if(!options) { } else if(!selector) { handler = options; options = ALL; } else if(!handler) { handler = selector; selector = null; } return this.each(function() { var self = $(this); var observer = self.data('observer'); if(!observer) { return; } if(!options) { observer.disconnectAll(); self.removeData('observer'); return; } options = parseOptions(options); observer.disconnect(options, selector, handler); }); }; }(jQuery, jQuery.Observe)); 
